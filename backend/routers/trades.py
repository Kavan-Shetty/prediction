from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import uuid
from database import supabase
from dependencies import get_current_user_id

router = APIRouter(prefix="/api/trades", tags=["trades"])

class TradeRequest(BaseModel):
    market_id: str
    outcome_id: str
    amount: float

class TradeResponse(BaseModel):
    id: str
    market_id: str
    outcome_id: str
    shares_bought: float
    new_balance: float
    message: str

@router.post("", response_model=TradeResponse)
def place_trade(req: TradeRequest, user_id: str = Depends(get_current_user_id)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Trade amount must be positive")
        
    if not supabase:
        # Fallback mock trade
        shares = round(req.amount / 0.50, 2)
        return {
            "id": f"trade-{uuid.uuid4().hex[:6]}",
            "market_id": req.market_id,
            "outcome_id": req.outcome_id,
            "shares_bought": shares,
            "new_balance": 450.0 - req.amount,
            "message": f"Successfully bought {shares} shares (Mock)"
        }
        
    try:
        # 1. Get market to know group_id
        m_res = supabase.table("markets").select("group_id, volume").eq("id", req.market_id).execute()
        if not m_res.data:
            raise HTTPException(status_code=404, detail="Market not found")
        group_id = m_res.data[0]["group_id"]
        current_vol = float(m_res.data[0]["volume"])
        
        # AMM CPMM LOGIC (x * y = k)
        all_outcomes = supabase.table("outcomes").select("id, shares_pool").eq("market_id", req.market_id).execute()
        if not all_outcomes.data:
            raise HTTPException(status_code=404, detail="Market outcomes not found")
            
        target_outcome = next((o for o in all_outcomes.data if o["id"] == req.outcome_id), None)
        if not target_outcome:
            raise HTTPException(status_code=404, detail="Outcome not found")
            
        # Calculate K (constant product)
        k = 1.0
        for o in all_outcomes.data:
            k *= float(o["shares_pool"])
            
        # Distribute the $amount invested into all *other* pools (since the AMM mints paired shares and keeps the rest)
        new_other_pools = {}
        for o in all_outcomes.data:
            if o["id"] != req.outcome_id:
                new_other_pools[o["id"]] = float(o["shares_pool"]) + req.amount
                
        # Calculate new target pool to maintain K
        new_k_partial = 1.0
        for val in new_other_pools.values():
            new_k_partial *= val
            
        new_target_pool = k / new_k_partial
        shares_bought = float(target_outcome["shares_pool"]) - new_target_pool
        
        if shares_bought <= 0:
            raise HTTPException(status_code=400, detail="Trade amount too small or slippage too high")
        shares_bought = round(shares_bought, 2)
        
        # 3. Get user balance in this group
        if user_id != "00000000-0000-0000-0000-000000000000":
            mem_res = supabase.table("group_members").select("balance").eq("group_id", group_id).eq("user_id", user_id).execute()
            if not mem_res.data:
                raise HTTPException(status_code=403, detail="You are not a member of this group")
                
            current_balance = float(mem_res.data[0]["balance"])
            if current_balance < req.amount:
                raise HTTPException(status_code=400, detail="Insufficient balance in this group")
                
            new_balance = current_balance - req.amount
            # Update balance
            supabase.table("group_members").update({"balance": new_balance}).eq("group_id", group_id).eq("user_id", user_id).execute()
        else:
            new_balance = 1000.00 - req.amount
            
        # 4. Insert trade record
        trade_res = supabase.table("trades").insert({
            "market_id": req.market_id,
            "outcome_id": req.outcome_id,
            "user_id": user_id if user_id != "00000000-0000-0000-0000-000000000000" else None,
            "shares": shares_bought,
            "amount_paid": req.amount
        }).execute()
        
        # 5. Update market volume
        supabase.table("markets").update({"volume": current_vol + req.amount}).eq("id", req.market_id).execute()
        
        # 6. Adjust odds and liquidity pools using the AMM invariant
        updated_pools = new_other_pools.copy()
        updated_pools[req.outcome_id] = new_target_pool
        
        # Calculate new exact probabilities (inverse proportionality)
        inv_sum = sum(1.0 / p for p in updated_pools.values())
        
        for o_id, pool_val in updated_pools.items():
            new_price = (1.0 / pool_val) / inv_sum
            supabase.table("outcomes").update({
                "shares_pool": round(pool_val, 4),
                "current_price": round(new_price, 4)
            }).eq("id", o_id).execute()
                
        return {
            "id": trade_res.data[0]["id"] if trade_res.data else str(uuid.uuid4())[:8],
            "market_id": req.market_id,
            "outcome_id": req.outcome_id,
            "shares_bought": shares_bought,
            "new_balance": new_balance,
            "message": f"Successfully bought {shares_bought} shares"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error placing trade: {e}")
        raise HTTPException(status_code=500, detail=str(e))

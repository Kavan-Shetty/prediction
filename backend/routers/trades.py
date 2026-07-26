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
        
        # 2. Get outcome to calculate shares based on price
        o_res = supabase.table("outcomes").select("current_price, shares_pool").eq("id", req.outcome_id).execute()
        if not o_res.data:
            raise HTTPException(status_code=404, detail="Outcome not found")
        price = float(o_res.data[0]["current_price"])
        shares_bought = round(req.amount / max(0.01, price), 2)
        
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
        
        # 6. Slightly adjust price (simple simulation: bought outcome gains 2% price, others drop)
        all_outcomes = supabase.table("outcomes").select("id, current_price").eq("market_id", req.market_id).execute()
        if all_outcomes.data and len(all_outcomes.data) == 2:
            for out in all_outcomes.data:
                p = float(out["current_price"])
                if out["id"] == req.outcome_id:
                    new_p = min(0.99, round(p + 0.02, 2))
                else:
                    new_p = max(0.01, round(p - 0.02, 2))
                supabase.table("outcomes").update({"current_price": new_p}).eq("id", out["id"]).execute()
                
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

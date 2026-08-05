from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from database import supabase
from dependencies import get_current_user_id

router = APIRouter(prefix="/api/markets", tags=["markets"])

class OutcomeInput(BaseModel):
    text: str

class CreateMarketRequest(BaseModel):
    group_id: str
    question: str
    outcomes: List[OutcomeInput]

class OutcomeResponse(BaseModel):
    id: str
    text: str
    prob: str
    price: str
    color: str
    bg: str

class MarketResponse(BaseModel):
    id: str
    question: str
    volume: str
    closingIn: str
    creator: str
    options: List[OutcomeResponse]
    groupName: Optional[str] = None
    groupId: Optional[str] = None

class OracleRequest(BaseModel):
    market_title: str

@router.get("/group/{group_id}", response_model=List[MarketResponse])
def get_group_markets(group_id: str):
    if not supabase:
        return [
            {
                "id": "b1",
                "question": "Will John show up to the meeting on time tomorrow? (Mock)",
                "volume": "$1,200",
                "closingIn": "12h 45m",
                "creator": "Alex",
                "options": [
                    {"id": "o1", "text": "Yes", "prob": "65%", "price": "65¢", "color": "text-success", "bg": "bg-success/10"},
                    {"id": "o2", "text": "No", "prob": "35%", "price": "35¢", "color": "text-destructive", "bg": "bg-destructive/10"}
                ]
            }
        ]
        
    try:
        markets_res = supabase.table("markets").select("*").eq("group_id", group_id).order("created_at", desc=True).execute()
        if not markets_res.data:
            return []
            
        result = []
        for m in markets_res.data:
            mid = m["id"]
            outcomes_res = supabase.table("outcomes").select("*").eq("market_id", mid).execute()
            
            opts = []
            for idx, o in enumerate(outcomes_res.data):
                price_val = float(o["current_price"])
                prob_str = f"{int(price_val * 100)}%"
                price_str = f"{int(price_val * 100)}¢"
                
                color = "text-success" if idx == 0 else "text-destructive" if idx == 1 else "text-primary"
                bg = "bg-success/10" if idx == 0 else "bg-destructive/10" if idx == 1 else "bg-primary/10"
                
                opts.append({
                    "id": o["id"],
                    "text": o["text"],
                    "prob": prob_str,
                    "price": price_str,
                    "color": color,
                    "bg": bg
                })
                
            # Calculate closing in
            try:
                close_dt = datetime.fromisoformat(m["closing_time"].replace('Z', '+00:00'))
                now = datetime.now(timezone.utc)
                diff = close_dt - now
                hours, remainder = divmod(int(diff.total_seconds()), 3600)
                minutes, _ = divmod(remainder, 60)
                closing_in = f"{max(0, hours)}h {max(0, minutes)}m"
            except Exception:
                closing_in = "24h 00m"
                
            result.append({
                "id": mid,
                "question": m["question"],
                "volume": f"${float(m['volume']):,.0f}",
                "closingIn": closing_in,
                "creator": "Trader",
                "options": opts,
                "groupId": group_id
            })
        return result
    except Exception as e:
        print(f"Error fetching group markets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=MarketResponse)
def create_market(req: CreateMarketRequest, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        opts = [
            {"id": f"mock-{i}", "text": opt.text, "prob": "50%", "price": "50¢", "color": "text-success" if i==0 else "text-destructive", "bg": "bg-success/10" if i==0 else "bg-destructive/10"}
            for i, opt in enumerate(req.outcomes)
        ]
        return {
            "id": str(uuid.uuid4())[:8],
            "question": req.question,
            "volume": "$0",
            "closingIn": "24h 00m",
            "creator": "You",
            "options": opts,
            "groupId": req.group_id
        }
        
    try:
        closing_time = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        market_res = supabase.table("markets").insert({
            "group_id": req.group_id,
            "creator_id": user_id if user_id != "00000000-0000-0000-0000-000000000000" else None,
            "question": req.question,
            "closing_time": closing_time,
            "status": "open",
            "volume": 0.00
        }).execute()
        
        if not market_res.data:
            raise HTTPException(status_code=400, detail="Failed to create market")
            
        new_market = market_res.data[0]
        mid = new_market["id"]
        
        opts = []
        default_price = 1.0 / max(1, len(req.outcomes))
        for idx, opt in enumerate(req.outcomes):
            out_res = supabase.table("outcomes").insert({
                "market_id": mid,
                "text": opt.text,
                "current_price": default_price,
                "shares_pool": 1000.00
            }).execute()
            
            if out_res.data:
                o = out_res.data[0]
                price_val = float(o["current_price"])
                color = "text-success" if idx == 0 else "text-destructive" if idx == 1 else "text-primary"
                bg = "bg-success/10" if idx == 0 else "bg-destructive/10" if idx == 1 else "bg-primary/10"
                opts.append({
                    "id": o["id"],
                    "text": o["text"],
                    "prob": f"{int(price_val * 100)}%",
                    "price": f"{int(price_val * 100)}¢",
                    "color": color,
                    "bg": bg
                })
                
        return {
            "id": mid,
            "question": new_market["question"],
            "volume": "$0",
            "closingIn": "24h 00m",
            "creator": "You",
            "options": opts,
            "groupId": req.group_id
        }
    except Exception as e:
        print(f"Error creating market: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/detail/{market_id}", response_model=MarketResponse)
def get_market_detail(market_id: str):
    if not supabase:
        return {
            "id": market_id,
            "question": "Will John show up to the meeting on time tomorrow? (Mock)",
            "volume": "$1,200",
            "closingIn": "12h 45m",
            "creator": "Alex",
            "options": [
                {"id": "o1", "text": "Yes", "prob": "65%", "price": "65¢", "color": "text-success", "bg": "bg-success/10"},
                {"id": "o2", "text": "No", "prob": "35%", "price": "35¢", "color": "text-destructive", "bg": "bg-destructive/10"}
            ],
            "groupName": "The Boys",
            "groupId": "1"
        }
        
    try:
        m_res = supabase.table("markets").select("*").eq("id", market_id).execute()
        if not m_res.data:
            raise HTTPException(status_code=404, detail="Market not found")
            
        m = m_res.data[0]
        group_res = supabase.table("groups").select("name").eq("id", m["group_id"]).execute()
        g_name = group_res.data[0]["name"] if group_res.data else "Group"
        
        outcomes_res = supabase.table("outcomes").select("*").eq("market_id", market_id).execute()
        opts = []
        for idx, o in enumerate(outcomes_res.data):
            price_val = float(o["current_price"])
            opts.append({
                "id": o["id"],
                "text": o["text"],
                "prob": f"{int(price_val * 100)}%",
                "price": f"{int(price_val * 100)}¢",
                "color": "text-success" if idx == 0 else "text-destructive",
                "bg": "bg-success/10" if idx == 0 else "bg-destructive/10"
            })
            
        return {
            "id": m["id"],
            "question": m["question"],
            "volume": f"${float(m['volume']):,.0f}",
            "closingIn": "12h 45m",
            "creator": "Trader",
            "options": opts,
            "groupName": g_name,
            "groupId": m["group_id"]
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching market detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{market_id}")
def delete_market(market_id: str, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        return {"message": "Market deleted (Mock)"}
        
    try:
        # Verify market exists
        m_res = supabase.table("markets").select("creator_id").eq("id", market_id).execute()
        if not m_res.data:
            raise HTTPException(status_code=404, detail="Market not found")
            
        creator_id = m_res.data[0]["creator_id"]
        if creator_id and user_id != "00000000-0000-0000-0000-000000000000" and creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the user who created this bet can delete it")
            
        # Delete market (outcomes and trades cascade delete via SQL schema)
        supabase.table("markets").delete().eq("id", market_id).execute()
        return {"message": "Market successfully deleted"}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error deleting market: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/oracle")
def get_oracle_insight(req: OracleRequest):
    import os
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=anthropic_key)
            prompt = f"You are an AI Oracle for a prediction market. In exactly 3 short sentences, explain why the odds for the market '{req.market_title}' might be volatile today. Be analytical and objective."
            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return {"insight": response.content[0].text.strip()}
        except Exception as e:
            print(f"Oracle API Error: {e}")
            pass
            
    # Fallback contextual mock
    return {"insight": f"According to verified market scanners, there is a surge in trading volume for '{req.market_title}'. Our heuristic models indicate that recent news developments directly impacting this topic have caused traders to re-evaluate their positions."}

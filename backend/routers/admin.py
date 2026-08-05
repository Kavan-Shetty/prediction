from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
import os
import json
import uuid

router = APIRouter(prefix="/admin", tags=["admin"])

PENDING_MARKETS_FILE = os.path.join(os.path.dirname(__file__), '../pending_markets.json')

class ApproveMarketRequest(BaseModel):
    id: str
    marketTitle: str
    resolutionRules: str
    yesPrice: float
    noPrice: float

def load_pending_markets():
    if os.path.exists(PENDING_MARKETS_FILE):
        try:
            with open(PENDING_MARKETS_FILE, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_pending_markets(markets):
    with open(PENDING_MARKETS_FILE, 'w') as f:
        json.dump(markets, f, indent=4)

@router.get("/pending-markets")
def get_pending_markets():
    return load_pending_markets()

@router.post("/approve-market")
def approve_market(req: ApproveMarketRequest):
    markets = load_pending_markets()
    
    market_to_approve = None
    for i, m in enumerate(markets):
        if m['id'] == req.id:
            market_to_approve = markets.pop(i)
            break
            
    if not market_to_approve:
        raise HTTPException(status_code=404, detail="Pending market not found")
        
    # Update with the admin's finalized edits
    market_to_approve['marketTitle'] = req.marketTitle
    market_to_approve['resolutionRules'] = req.resolutionRules
    market_to_approve['yesPrice'] = req.yesPrice
    market_to_approve['noPrice'] = req.noPrice
    market_to_approve['status'] = 'approved'
    
    # Save the updated pending queue (which now excludes this approved item)
    save_pending_markets(markets)
    
    # In a real app, we would push `market_to_approve` to the Golang CLOB / Supabase here
    # For now, we simulate success
    return {"status": "success", "message": "Market approved and sent to CLOB", "market": market_to_approve}

@router.delete("/reject-market/{market_id}")
def reject_market(market_id: str):
    markets = load_pending_markets()
    initial_length = len(markets)
    markets = [m for m in markets if m['id'] != market_id]
    
    if len(markets) == initial_length:
        raise HTTPException(status_code=404, detail="Pending market not found")
        
    save_pending_markets(markets)
    return {"status": "success", "message": "Market rejected and removed from queue"}

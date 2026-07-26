from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import uuid
from database import supabase
from dependencies import get_current_user_id

router = APIRouter(prefix="/api/groups", tags=["groups"])

class CreateGroupRequest(BaseModel):
    name: str

class JoinGroupRequest(BaseModel):
    invite_code: str

class GroupResponse(BaseModel):
    id: str
    name: str
    invite_code: str
    members: int
    open_markets: int
    user_balance: float
    rank: int

@router.get("", response_model=List[GroupResponse])
def list_groups(user_id: str = Depends(get_current_user_id)):
    if not supabase:
        # Fallback mock data if Supabase is offline/not configured
        return [
            {"id": "1", "name": "The Boys (Mock)", "invite_code": "boys-123", "members": 8, "open_markets": 3, "user_balance": 450.0, "rank": 2},
            {"id": "2", "name": "Office Predictions (Mock)", "invite_code": "work-456", "members": 12, "open_markets": 1, "user_balance": -120.0, "rank": 8}
        ]
        
    try:
        # Get groups the user is a member of
        memberships = supabase.table("group_members").select("group_id, balance").eq("user_id", user_id).execute()
        if not memberships.data:
            return []
            
        group_ids = [m["group_id"] for m in memberships.data]
        balance_map = {m["group_id"]: float(m["balance"]) - 1000.0 for m in memberships.data} # balance relative to 1000 start
        
        groups_res = supabase.table("groups").select("*").in_("id", group_ids).execute()
        
        result = []
        for g in groups_res.data:
            gid = g["id"]
            # count members
            mem_count = supabase.table("group_members").select("user_id", count="exact").eq("group_id", gid).execute()
            # count open markets
            market_count = supabase.table("markets").select("id", count="exact").eq("group_id", gid).eq("status", "open").execute()
            
            result.append({
                "id": gid,
                "name": g["name"],
                "invite_code": g["invite_code"],
                "members": mem_count.count or 1,
                "open_markets": market_count.count or 0,
                "user_balance": balance_map.get(gid, 0.0),
                "rank": 1 # Todo: calculate actual rank
            })
        return result
    except Exception as e:
        print(f"Error fetching groups: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=GroupResponse)
def create_group(req: CreateGroupRequest, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        return {"id": str(uuid.uuid4())[:8], "name": req.name, "invite_code": f"join-{uuid.uuid4().hex[:6]}", "members": 1, "open_markets": 0, "user_balance": 0.0, "rank": 1}
        
    try:
        invite_code = f"{req.name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:4]}"
        group_res = supabase.table("groups").insert({
            "name": req.name,
            "invite_code": invite_code,
            "created_by": user_id if user_id != "00000000-0000-0000-0000-000000000000" else None
        }).execute()
        
        if not group_res.data:
            raise HTTPException(status_code=400, detail="Failed to create group")
            
        new_group = group_res.data[0]
        
        # Add creator as member with default 1000 balance
        if user_id != "00000000-0000-0000-0000-000000000000":
            supabase.table("group_members").insert({
                "group_id": new_group["id"],
                "user_id": user_id,
                "balance": 1000.00
            }).execute()
            
        return {
            "id": new_group["id"],
            "name": new_group["name"],
            "invite_code": new_group["invite_code"],
            "members": 1,
            "open_markets": 0,
            "user_balance": 0.0,
            "rank": 1
        }
    except Exception as e:
        print(f"Error creating group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/join", response_model=GroupResponse)
def join_group(req: JoinGroupRequest, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        return {"id": "mock-joined", "name": "Joined Group (Mock)", "invite_code": req.invite_code, "members": 5, "open_markets": 2, "user_balance": 0.0, "rank": 5}
        
    try:
        # Find group by invite code
        code = req.invite_code.split("/")[-1] # handle full URL or just code
        group_res = supabase.table("groups").select("*").eq("invite_code", code).execute()
        if not group_res.data:
            raise HTTPException(status_code=404, detail="Invalid invite code")
            
        group = group_res.data[0]
        gid = group["id"]
        
        if user_id != "00000000-0000-0000-0000-000000000000":
            # Check if already member
            existing = supabase.table("group_members").select("*").eq("group_id", gid).eq("user_id", user_id).execute()
            if not existing.data:
                supabase.table("group_members").insert({
                    "group_id": gid,
                    "user_id": user_id,
                    "balance": 1000.00
                }).execute()
                
        return {
            "id": gid,
            "name": group["name"],
            "invite_code": group["invite_code"],
            "members": 2,
            "open_markets": 0,
            "user_balance": 0.0,
            "rank": 1
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error joining group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

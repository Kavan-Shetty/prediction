import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from database import supabase
from dependencies import get_current_user_id

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/users", tags=["users"])

class UserProfileUpdate(BaseModel):
    username: str
    display_name: str
    bio: str
    avatar_url: str
    banner_url: str
    is_public: bool

class UserProfileResponse(BaseModel):
    id: str
    username: str
    display_name: str
    bio: str
    avatar_url: str
    banner_url: str
    vip_tier: str
    balance: float
    streak: int
    level: int
    xp: int
    is_public: bool
    two_factor_enabled: bool

# Mock database for MVP when Supabase isn't connected
mock_db = {
    "00000000-0000-0000-0000-000000000000": {
        "id": "00000000-0000-0000-0000-000000000000",
        "username": "crypto_whale_99",
        "display_name": "CryptoWhale",
        "bio": "Top 5% tech analyst. I only bet on AI.",
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoWhale",
        "banner_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        "vip_tier": "league",
        "balance": 14500.0,
        "streak": 14,
        "level": 42,
        "xp": 8450,
        "is_public": True,
        "two_factor_enabled": True
    }
}

@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(user_id: str = Depends(get_current_user_id)):
    if not supabase:
        # Return mock user
        user = mock_db.get(user_id)
        if not user:
            return UserProfileResponse(
                id=user_id,
                username="new_trader",
                display_name="Kavan (You)",
                bio="Syndicate Leader",
                avatar_url="",
                banner_url="",
                vip_tier="free",
                balance=450.0,
                streak=3,
                level=1,
                xp=0,
                is_public=True,
                two_factor_enabled=False
            )
        return user
        
    try:
        # Check if profiles table exists and fetch
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            # Auto-create profile if missing
            new_profile = {
                "id": user_id,
                "username": f"user_{user_id[:8]}",
                "display_name": "New Trader",
                "bio": "Ready to predict the future.",
                "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
                "banner_url": "",
                "vip_tier": "free",
                "balance": 450.0,
                "streak": 0,
                "level": 1,
                "xp": 0,
                "is_public": True,
                "two_factor_enabled": False
            }
            supabase.table("profiles").insert(new_profile).execute()
            return new_profile
            
        return res.data[0]
    except Exception as e:
        logger.error(f"Error fetching profile: {e}", exc_info=True)
        # Fallback to mock on db error (e.g. table doesn't exist yet)
        return mock_db.get("00000000-0000-0000-0000-000000000000")

@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(req: UserProfileUpdate, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        # Update mock db
        if user_id in mock_db:
            mock_db[user_id]["username"] = req.username
            mock_db[user_id]["display_name"] = req.display_name
            mock_db[user_id]["bio"] = req.bio
            mock_db[user_id]["avatar_url"] = req.avatar_url
            mock_db[user_id]["banner_url"] = req.banner_url
            mock_db[user_id]["is_public"] = req.is_public
            return mock_db[user_id]
        else:
            raise HTTPException(status_code=404, detail="User not found in mock DB")
            
    try:
        res = supabase.table("profiles").update({
            "username": req.username,
            "display_name": req.display_name,
            "bio": req.bio,
            "avatar_url": req.avatar_url,
            "banner_url": req.banner_url,
            "is_public": req.is_public
        }).eq("id", user_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found to update")
            
        return res.data[0]
    except Exception as e:
        logger.error(f"Error updating profile: {e}", exc_info=True)
        
        # Fallback to update mock DB if Supabase tables aren't set up yet
        if user_id in mock_db:
            mock_db[user_id]["username"] = req.username
            mock_db[user_id]["display_name"] = req.display_name
            mock_db[user_id]["bio"] = req.bio
            mock_db[user_id]["avatar_url"] = req.avatar_url
            mock_db[user_id]["banner_url"] = req.banner_url
            mock_db[user_id]["is_public"] = req.is_public
            return mock_db[user_id]
            
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import Header, HTTPException, Depends
from typing import Optional
from database import supabase

def get_current_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extracts user_id from the Supabase JWT token in the Authorization header.
    If Supabase is not configured or token is missing/invalid, returns a fallback user ID for dev/testing.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback for mock/dev without strict auth
        return "00000000-0000-0000-0000-000000000000"
    
    token = authorization.split(" ")[1]
    if not supabase:
        return "00000000-0000-0000-0000-000000000000"
        
    try:
        user_res = supabase.auth.get_user(token)
        if user_res and user_res.user:
            return user_res.user.id
    except Exception as e:
        print(f"Auth verification error: {e}")
        
    return "00000000-0000-0000-0000-000000000000"

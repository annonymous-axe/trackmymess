"""
Auth endpoints - /me endpoint to get current user info
"""
from fastapi import APIRouter, Depends
from typing import Dict, Any, Optional

from app.core.dependencies import get_current_user, get_tenant_info

router = APIRouter()


@router.get("/me")
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user),
    tenant: Optional[Dict[str, Any]] = Depends(get_tenant_info)
):
    """
    Get current authenticated user and tenant information
    
    Returns user details and associated tenant (if applicable).
    Super admins will have tenant=null.
    
    Requires valid JWT access token in Authorization header.
    
    Returns:
        {
            "user": {
                "id": "user-uuid",
                "email": "user@example.com",
                "full_name": "User Name",
                "role": "ADMIN",
                "tenant_id": "tenant-uuid",
                "is_active": true,
                ...
            },
            "tenant": {
                "id": "tenant-uuid",
                "mess_name": "My Mess",
                "status": "ACTIVE",
                "capacity": 100,
                ...
            } | null
        }
    """
    # Remove sensitive fields from user
    user_data = {k: v for k, v in current_user.items() if k != "password"}
    
    return {
        "user": user_data,
        "tenant": tenant
    }

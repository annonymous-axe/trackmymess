"""
FastAPI dependencies for authentication and authorization
Provides reusable dependencies for routes to enforce auth and tenant context
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Any, Optional
import logging

from app.db.mongo import get_db
from app.core.security import decode_token, verify_token_type, extract_user_id
from app.models.enums import UserRole

logger = logging.getLogger(__name__)

# HTTPBearer security scheme for extracting Bearer tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token
    
    This dependency:
    1. Extracts Bearer token from Authorization header
    2. Decodes and validates the JWT
    3. Checks token type is "access"
    4. Loads user from database
    5. Verifies user is active
    6. Checks if token has been revoked
    
    Args:
        credentials: HTTP Bearer credentials (auto-injected)
        db: MongoDB database instance (auto-injected)
        
    Returns:
        User document as dictionary
        
    Raises:
        HTTPException 401: If token invalid, user not found, or token revoked
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: dict = Depends(get_current_user)):
            return {"user_id": current_user["id"]}
    """
    token = credentials.credentials
    
    # Decode token
    payload = decode_token(token)
    
    # Verify it's an access token (not refresh token)
    verify_token_type(payload, "access")
    
    # Extract user ID
    user_id = extract_user_id(payload)
    
    # Load user from database
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_doc:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    if not user_doc.get("is_active", False):
        logger.warning(f"Inactive user attempted access: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Check if token has been revoked
    revoked = await db.revoked_tokens.find_one({"token": token})
    if revoked:
        logger.warning(f"Revoked token used: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked"
        )
    
    return user_doc


async def get_tenant_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    """
    Get tenant information for the current user
    
    Super admins have no tenant (returns None)
    Regular admins/staff must have an associated tenant
    
    Args:
        current_user: Current authenticated user (auto-injected)
        db: MongoDB database instance (auto-injected)
        
    Returns:
        Tenant document as dictionary, or None for super admins
        
    Raises:
        HTTPException 400: If user has no tenant_id
        HTTPException 404: If tenant not found
        
    Usage:
        @router.get("/tenant-specific")
        async def tenant_route(tenant: dict = Depends(get_tenant_info)):
            return {"tenant_id": tenant["id"]}
    """
    # Super admins have no tenant
    if current_user.get("role") == UserRole.SUPER_ADMIN:
        return None
    
    # Regular users must have a tenant
    tenant_id = current_user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No tenant associated with user"
        )
    
    # Load tenant from database
    tenant_doc = await db.tenants.find_one({"id": tenant_id}, {"_id": 0})
    
    if not tenant_doc:
        logger.error(f"Tenant not found: {tenant_id} for user {current_user.get('id')}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return tenant_doc


async def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Require user to be ADMIN or SUPER_ADMIN
    
    Args:
        current_user: Current authenticated user (auto-injected)
        
    Returns:
        User document
        
    Raises:
        HTTPException 403: If user is not admin
        
    Usage:
        @router.post("/admin-only")
        async def admin_route(user: dict = Depends(require_admin)):
            return {"message": "Admin access granted"}
    """
    user_role = current_user.get("role")
    
    if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
        logger.warning(f"Non-admin user attempted admin access: {current_user.get('id')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


async def require_super_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Require user to be SUPER_ADMIN only
    
    Args:
        current_user: Current authenticated user (auto-injected)
        
    Returns:
        User document
        
    Raises:
        HTTPException 403: If user is not super admin
        
    Usage:
        @router.get("/super-admin-only")
        async def super_admin_route(user: dict = Depends(require_super_admin)):
            return {"message": "Super admin access granted"}
    """
    user_role = current_user.get("role")
    
    if user_role != UserRole.SUPER_ADMIN:
        logger.warning(f"Non-super-admin attempted super admin access: {current_user.get('id')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    
    return current_user

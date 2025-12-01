"""
JWT Security and token handling
Mirrors the auth logic from legacy server.py for token compatibility
"""
import jwt
from fastapi import HTTPException, status
from app.core.config import settings
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload as dictionary
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def verify_token_type(payload: Dict[str, Any], expected_type: str = "access") -> None:
    """
    Verify that the token type matches expected type
    
    Args:
        payload: Decoded JWT payload
        expected_type: Expected token type ("access" or "refresh")
        
    Raises:
        HTTPException: If token type doesn't match
    """
    token_type = payload.get("type")
    if token_type != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type. Expected {expected_type}, got {token_type}"
        )


def extract_user_id(payload: Dict[str, Any]) -> str:
    """
    Extract user ID from JWT payload
    
    Args:
        payload: Decoded JWT payload
        
    Returns:
        User ID string
        
    Raises:
        HTTPException: If user ID not found in payload
    """
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user identifier"
        )
    return user_id

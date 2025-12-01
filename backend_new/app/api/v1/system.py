"""
System and health check endpoints
"""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongo import get_db
from app import __version__

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    Returns basic status information
    """
    return {
        "status": "ok",
        "app": "trackmymess-new",
        "version": __version__
    }


@router.get("/version")
async def version_info():
    """
    Version information endpoint
    """
    return {
        "version": __version__,
        "api_version": "v1"
    }


@router.get("/db-status")
async def database_status(db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Database connection status check
    Tests if we can connect to MongoDB
    """
    try:
        # Ping the database
        await db.command("ping")
        
        # Get collection counts
        collections = await db.list_collection_names()
        
        return {
            "status": "connected",
            "database": db.name,
            "collections_count": len(collections)
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

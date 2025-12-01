"""
MongoDB connection and database dependency
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class MongoDBClient:
    """MongoDB client singleton"""
    
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    def get_client(cls) -> AsyncIOMotorClient:
        """Get or create MongoDB client"""
        if cls.client is None:
            cls.client = AsyncIOMotorClient(settings.MONGO_URL)
            logger.info(f"Connected to MongoDB at {settings.MONGO_URL}")
        return cls.client
    
    @classmethod
    def close_client(cls):
        """Close MongoDB client connection"""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            logger.info("MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to get database instance
    
    Usage in routes:
        @router.get("/example")
        async def example_route(db: AsyncIOMotorDatabase = Depends(get_db)):
            customers = await db.customers.find().to_list(100)
    """
    client = MongoDBClient.get_client()
    return client[settings.DB_NAME]

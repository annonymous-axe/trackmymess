"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.db.mongo import MongoDBClient
from app.api.v1.router import router as v1_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    Handles startup and shutdown events
    """
    # Startup
    logger.info("Starting TrackMyMess API (New Architecture)")
    logger.info(f"MongoDB: {settings.MONGO_URL}")
    logger.info(f"Database: {settings.DB_NAME}")
    
    # Initialize MongoDB connection
    MongoDBClient.get_client()
    
    # Future: Initialize default data (super admin, etc.)
    # await initialize_default_data()
    
    yield
    
    # Shutdown
    logger.info("Shutting down TrackMyMess API")
    MongoDBClient.close_client()


# Create FastAPI application
app = FastAPI(
    title="TrackMyMess API (New)",
    description="Multi-tenant SaaS for mess management - Refactored Architecture",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
# Parse comma-separated origins from settings
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount v1 API router
app.include_router(v1_router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TrackMyMess API - New Architecture",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

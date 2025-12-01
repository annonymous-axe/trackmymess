"""
Configuration management using environment variables
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory
ROOT_DIR = Path(__file__).parent.parent.parent
load_dotenv(ROOT_DIR / '.env')


class Settings:
    """Application settings loaded from environment variables"""
    
    # MongoDB Configuration
    MONGO_URL: str = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.getenv('DB_NAME', 'trackmy_mess_test')
    
    # JWT Configuration
    # Note: Legacy backend uses JWT_SECRET, ensure compatibility
    JWT_SECRET: str = os.getenv('JWT_SECRET', os.getenv('SECRET_KEY', 'supersecretjwtkey123'))
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'supersecretjwtkey123')
    JWT_ALGORITHM: str = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_EXPIRE_MINUTES: int = int(os.getenv('JWT_EXPIRE_MINUTES', '60'))
    JWT_REFRESH_EXPIRE_DAYS: int = int(os.getenv('JWT_REFRESH_EXPIRE_DAYS', '30'))
    
    # CORS Configuration
    CORS_ORIGINS: str = os.getenv('CORS_ORIGINS', '*')
    
    # Email Configuration (for future use)
    SMTP_SERVER: str = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_EMAIL: str | None = os.getenv('SMTP_EMAIL')
    SMTP_PASSWORD: str | None = os.getenv('SMTP_PASSWORD')
    
    # Razorpay Configuration (for future use)
    RAZORPAY_KEY_ID: str = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_xxxxxxxxxxxxx')
    RAZORPAY_KEY_SECRET: str | None = os.getenv('RAZORPAY_KEY_SECRET')
    RAZORPAY_WEBHOOK_SECRET: str | None = os.getenv('RAZORPAY_WEBHOOK_SECRET')


# Create singleton instance
settings = Settings()


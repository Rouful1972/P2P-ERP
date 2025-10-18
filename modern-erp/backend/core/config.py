from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    database_url: str = "postgresql://postgres:postgres123@localhost:5432/pharma_erp"
    
    # Redis settings
    redis_url: str = "redis://localhost:6379"
    
    # Security settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API settings
    api_v1_str: str = "/api"
    
    class Config:
        env_file = ".env"

settings = Settings()

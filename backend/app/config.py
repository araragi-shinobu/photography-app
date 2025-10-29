from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    storage_type: str = "s3"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-west-1"
    aws_bucket_name: Optional[str] = None
    max_upload_size: int = 10485760  # 10MB
    
    class Config:
        env_file = ".env"


settings = Settings()


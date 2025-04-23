from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    ALLOWED_ORIGINS: List[str] = ["https://www.twilio.com", "https://api.twilio.com"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()
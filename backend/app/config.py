import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
# from pydantic import BaseSettings, AnyHttpUrl
from pydantic.v1 import AnyHttpUrl, BaseSettings


env_path = Path('') / '.env'
load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    PROJECT_TITLE: str = "ElineDashboard"
    PROJECT_VERSION: str = "0.1"
    API_URL: str = "api/v1"
    JWT_SECRET: str = "TEST_SECRET_DO_NOT_USE_IN_PROD"
    ALGORITHM: str = "HS256"
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # подключения к базе
    dbusername: str = os.getenv("DB_USERNAME")
    password: str = os.getenv("DB_PASSWORD")
    database: str = os.getenv("DB_DATABASE")
    host: str = os.getenv("DB_HOST")
    port: str = os.getenv("DB_PORT")

    FIRST_SUPERUSER: str = "admin"
    FIRST_SUPERUSER_PW: str = "admin"

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:4200",
        "http://localhost:8001"  # type: ignore
    ]


settings = Settings()

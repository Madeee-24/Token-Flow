"""
Central application settings.

Everything here is loaded from environment variables (via a local .env file
in development). Nothing sensitive is hardcoded — see .env.example for the
full list of variables this app expects.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "TokenFlow API"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    # Defaults to a local SQLite file so the project runs with zero setup.
    # Point this at Postgres in production, e.g.:
    # postgresql+psycopg2://user:password@localhost:5432/tokenflow
    DATABASE_URL: str = "sqlite:///./tokenflow.db"

    # --- Redis (cache + APScheduler job store + rate limiting) ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- JWT auth ---
    JWT_SECRET_KEY: str = "change-me-in-.env"  # noqa: S105 (placeholder default only)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # --- Encryption for stored provider API keys (Fernet, 32 url-safe base64 bytes) ---
    ENCRYPTION_KEY: str = ""

    # --- Provider API keys (used only for the account owner's own calls in
    # the "bring your own environment key" case; user-supplied keys entered
    # through the API Keys page are stored encrypted per-user in the DB) ---
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROK_API_KEY: str = ""

    # --- CORS ---
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
    ]

    # --- Budgets / alerts ---
    DEFAULT_MONTHLY_TOKEN_LIMIT: int = 12_000_000
    ALERT_THRESHOLDS: List[int] = [50, 80, 90, 100]
    ENFORCE_BUDGET: bool = False
    ALERT_SCAN_INTERVAL_MINUTES: int = 5

    # --- Rate limiting ---
    RATE_LIMIT_DEFAULT: str = "100/minute"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

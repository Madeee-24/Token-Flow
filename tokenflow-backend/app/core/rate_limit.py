"""
Simple IP-based rate limiting via slowapi.

Falls back to in-memory storage if Redis isn't reachable, so the app still
boots and rate-limits a single instance during local development.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

try:
    limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL, default_limits=[settings.RATE_LIMIT_DEFAULT])
except Exception:
    limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

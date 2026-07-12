import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.rate_limit import limiter
from app.core.scheduler import start_scheduler, stop_scheduler
from app.db.init_db import init_db
from app.db.session import get_db
from app.models.budget import Budget
from app.models.usage_log import UsageLog
from app.models.user import User
from app.routes import alerts, analytics, auth, budgets, keys, usage

logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("tokenflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Database tables ready")
    try:
        start_scheduler()
    except Exception as exc:  # Redis/job-store issues shouldn't stop the API from serving requests
        logger.warning("Scheduler did not start: %s", exc)
    yield
    stop_scheduler()


app = FastAPI(
    title=settings.APP_NAME,
    description="Tracks LLM API usage, cost, and alerts across OpenAI, Claude, Gemini, and Grok.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded. Please slow down."})


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(keys.router, prefix=settings.API_V1_PREFIX)
app.include_router(usage.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts.router, prefix=settings.API_V1_PREFIX)
app.include_router(budgets.router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["health"])
def root():
    return {"service": settings.APP_NAME, "status": "ok"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}


@app.get("/api/usage", tags=["compat"])
def usage_compat_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    monthly_limit = budget.monthly_token_limit if budget else settings.DEFAULT_MONTHLY_TOKEN_LIMIT

    rows = (
        db.query(
            UsageLog.provider,
            func.coalesce(func.sum(UsageLog.total_tokens), 0).label("tokens_used"),
            func.coalesce(func.sum(UsageLog.cost), 0).label("cost"),
        )
        .filter(UsageLog.user_id == current_user.id)
        .group_by(UsageLog.provider)
        .all()
    )

    providers = []
    for provider_name, tokens_used, cost in rows:
        providers.append(
            {
                "name": (provider_name or "Unknown").title(),
                "tokens_used": int(tokens_used or 0),
                "limit": int(monthly_limit),
                "cost": round(float(cost or 0), 2),
            }
        )

    if not providers:
        providers = [
            {"name": "OpenAI", "tokens_used": 0, "limit": int(monthly_limit), "cost": 0.0},
            {"name": "Claude", "tokens_used": 0, "limit": int(monthly_limit), "cost": 0.0},
            {"name": "Gemini", "tokens_used": 0, "limit": int(monthly_limit), "cost": 0.0},
            {"name": "Grok", "tokens_used": 0, "limit": int(monthly_limit), "cost": 0.0},
        ]

    return {"providers": providers}

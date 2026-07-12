from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.usage_log import UsageLog
from app.models.user import User
from app.schemas.usage import (
    ActivityItemOut,
    CallProviderRequest,
    DailyUsagePoint,
    ModelUsageOut,
    TrackUsageRequest,
    UsageSummaryOut,
)
from app.services import analytics_service, key_service
from app.services.provider.factory import get_provider
from app.services.usage_service import BudgetExceededError, get_usage_percentage, track_usage

router = APIRouter(prefix="/usage", tags=["usage"])


def _trend(db: Session, user_id: str) -> dict:
    """Rough week-over-week trend for tokens/cost/requests, used by the summary cards."""
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import func

    now = datetime.now(timezone.utc)
    this_week_start = now - timedelta(days=7)
    last_week_start = now - timedelta(days=14)

    def totals(start, end):
        row = (
            db.query(
                func.coalesce(func.sum(UsageLog.total_tokens), 0),
                func.coalesce(func.sum(UsageLog.cost), 0),
                func.count(UsageLog.id),
            )
            .filter(UsageLog.user_id == user_id, UsageLog.timestamp >= start, UsageLog.timestamp < end)
            .first()
        )
        return row or (0, 0, 0)

    cur_tokens, cur_cost, cur_requests = totals(this_week_start, now)
    prev_tokens, prev_cost, prev_requests = totals(last_week_start, this_week_start)

    def pct_change(cur, prev):
        if not prev:
            return 0.0
        return round(100 * (cur - prev) / prev, 1)

    return {
        "tokens_trend": pct_change(cur_tokens, prev_tokens),
        "cost_trend": pct_change(cur_cost, prev_cost),
        "requests_trend": pct_change(cur_requests, prev_requests),
    }


@router.get("", response_model=UsageSummaryOut)
def usage_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = db.query(Budget).filter(Budget.user_id == current_user.id).first()
    if budget is None:
        budget = Budget(user_id=current_user.id)
        db.add(budget)
        db.commit()
        db.refresh(budget)

    total_requests = db.query(UsageLog).filter(UsageLog.user_id == current_user.id).count()
    trends = _trend(db, current_user.id)

    return UsageSummaryOut(
        total_tokens=budget.current_token_usage,
        token_limit=budget.monthly_token_limit,
        usage_percentage=get_usage_percentage(budget),
        total_cost=round(budget.current_cost_usage, 2),
        total_requests=total_requests,
        **trends,
    )


@router.get("/daily", response_model=list[DailyUsagePoint])
def usage_daily(
    range: str = "14d",
    provider: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analytics_service.get_daily_usage(db, current_user.id, range, provider)


@router.get("/models", response_model=list[ModelUsageOut])
def usage_models(
    provider: str = "all", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return analytics_service.get_model_usage(db, current_user.id, provider)


@router.get("/activity", response_model=list[ActivityItemOut])
def usage_activity(
    limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return analytics_service.get_recent_activity(db, current_user.id, limit)


@router.post("/log", status_code=status.HTTP_201_CREATED)
def log_usage(
    payload: TrackUsageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually record a usage event (useful for backfilling or non-proxied calls)."""
    try:
        log = track_usage(
            db,
            current_user.id,
            payload.provider,
            payload.model,
            payload.input_tokens,
            payload.output_tokens,
            payload.status,
        )
    except BudgetExceededError as exc:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(exc))

    return {"id": log.id, "total_tokens": log.total_tokens, "cost": log.cost}


@router.post("/call")
async def call_provider(
    payload: CallProviderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Proxies a prompt to the provider behind the given saved API key, then
    tracks the resulting token usage and cost automatically. This is the
    real end-to-end path described in the data flow: add key -> call ->
    track -> (scheduler checks) -> alert.
    """
    record = key_service.get_api_key(db, current_user.id, payload.api_key_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    if not record.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This API key is disabled")

    plaintext = key_service.reveal_plaintext(record)
    provider = get_provider(record.provider, plaintext)

    if payload.model:
        result = await provider.call_api(payload.prompt, payload.model)
    else:
        result = await provider.call_api(payload.prompt)

    try:
        log = track_usage(
            db,
            current_user.id,
            record.provider,
            result.model,
            result.input_tokens,
            result.output_tokens,
            result.status,
        )
    except BudgetExceededError as exc:
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(exc))

    if result.status == "failed":
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=result.error or "Provider call failed")

    return {
        "usage_log_id": log.id,
        "model": result.model,
        "total_tokens": result.total_tokens,
        "cost": log.cost,
    }

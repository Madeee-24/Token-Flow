from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.usage_log import UsageLog


def _range_start(range_key: str) -> datetime:
    days = {"7d": 7, "14d": 14, "30d": 30}.get(range_key, 14)
    return datetime.now(timezone.utc) - timedelta(days=days)


def get_daily_usage(db: Session, user_id: str, range_key: str = "14d", provider: Optional[str] = None):
    query = db.query(
        func.date(UsageLog.timestamp).label("day"),
        func.sum(UsageLog.total_tokens).label("tokens"),
    ).filter(UsageLog.user_id == user_id, UsageLog.timestamp >= _range_start(range_key))

    if provider and provider != "all":
        query = query.filter(UsageLog.provider == provider)

    rows = query.group_by("day").order_by("day").all()
    return [{"date": str(r.day), "tokens": int(r.tokens or 0)} for r in rows]


def get_request_frequency(db: Session, user_id: str, range_key: str = "14d", provider: Optional[str] = None):
    query = db.query(
        func.date(UsageLog.timestamp).label("day"),
        func.count(UsageLog.id).label("requests"),
    ).filter(UsageLog.user_id == user_id, UsageLog.timestamp >= _range_start(range_key))

    if provider and provider != "all":
        query = query.filter(UsageLog.provider == provider)

    rows = query.group_by("day").order_by("day").all()
    return [{"date": str(r.day), "requests": int(r.requests or 0)} for r in rows]


def get_model_usage(db: Session, user_id: str, provider: Optional[str] = None):
    query = db.query(
        UsageLog.model,
        UsageLog.provider,
        func.sum(UsageLog.total_tokens).label("tokens"),
        func.sum(UsageLog.cost).label("cost"),
        func.count(UsageLog.id).label("requests"),
    ).filter(UsageLog.user_id == user_id)

    if provider and provider != "all":
        query = query.filter(UsageLog.provider == provider)

    rows = query.group_by(UsageLog.model, UsageLog.provider).order_by(func.sum(UsageLog.total_tokens).desc()).all()
    return [
        {
            "model": r.model,
            "provider": r.provider.value if hasattr(r.provider, "value") else r.provider,
            "tokens": int(r.tokens or 0),
            "cost": round(float(r.cost or 0), 2),
            "requests": int(r.requests or 0),
        }
        for r in rows
    ]


def get_cost_breakdown(db: Session, user_id: str, provider: Optional[str] = None):
    models = get_model_usage(db, user_id, provider)
    return [{"name": m["model"], "value": m["cost"], "provider": m["provider"]} for m in models]


def get_recent_activity(db: Session, user_id: str, limit: int = 10):
    rows = (
        db.query(UsageLog)
        .filter(UsageLog.user_id == user_id)
        .order_by(UsageLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    now = datetime.now(timezone.utc)
    out = []
    for r in rows:
        ts = r.timestamp if r.timestamp.tzinfo else r.timestamp.replace(tzinfo=timezone.utc)
        minutes = max(int((now - ts).total_seconds() // 60), 0)
        time_label = f"{minutes} min ago" if minutes < 60 else f"{minutes // 60} hr ago"
        out.append({
            "id": r.id,
            "provider": r.provider.value if hasattr(r.provider, "value") else r.provider,
            "model": r.model,
            "tokens": r.total_tokens,
            "cost": round(r.cost, 4),
            "status": r.status,
            "time": time_label,
        })
    return out

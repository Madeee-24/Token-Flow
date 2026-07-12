import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.alert import Alert, AlertThreshold
from app.models.budget import Budget
from app.models.user import User
from app.services.usage_service import get_usage_percentage

logger = logging.getLogger("tokenflow.alerts")


def ensure_default_thresholds(db: Session, user_id: str) -> list[AlertThreshold]:
    existing = db.query(AlertThreshold).filter(AlertThreshold.user_id == user_id).all()
    if existing:
        return existing

    rows = [
        AlertThreshold(user_id=user_id, threshold=t, enabled=True)
        for t in settings.ALERT_THRESHOLDS
    ]
    db.add_all(rows)
    db.commit()
    return rows


def send_email_alert(to_email: str, message: str) -> None:
    """
    Stub — wire up your real email provider (SES, SendGrid, Postmark...) here.
    Kept as a clearly-logged no-op so the alert pipeline is fully testable
    without SMTP credentials.
    """
    logger.info("EMAIL ALERT -> %s: %s", to_email, message)


def _period_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def check_and_trigger_alerts(db: Session, user: User) -> list[Alert]:
    """
    Compares the user's current usage % against their enabled thresholds and
    fires any that have been crossed but not yet triggered this billing
    period. Called by the APScheduler job (see core/scheduler.py) and can
    also be called synchronously right after a usage-tracking call.
    """
    budget = db.query(Budget).filter(Budget.user_id == user.id).first()
    if budget is None:
        return []

    usage_pct = get_usage_percentage(budget)
    thresholds = ensure_default_thresholds(db, user.id)
    period = _period_key()

    already_fired = {
        a.threshold
        for a in db.query(Alert).filter(Alert.user_id == user.id, Alert.period_key == period).all()
    }

    fired: list[Alert] = []
    for t in sorted(thresholds, key=lambda x: x.threshold):
        if not t.enabled or t.threshold in already_fired or usage_pct < t.threshold:
            continue

        message = f"Usage crossed {t.threshold}% of monthly token limit"
        channel = "email" if t.notify_email else "in-app"

        alert = Alert(user_id=user.id, threshold=t.threshold, message=message, channel=channel, period_key=period)
        db.add(alert)
        fired.append(alert)

        if t.notify_email:
            send_email_alert(user.email, message)
        if t.notify_in_app:
            logger.info("IN-APP ALERT -> user %s: %s", user.id, message)

    if fired:
        db.commit()
    return fired

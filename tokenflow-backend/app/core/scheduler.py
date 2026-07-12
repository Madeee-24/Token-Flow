import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from app.services.alert_service import check_and_trigger_alerts

logger = logging.getLogger("tokenflow.scheduler")

scheduler = AsyncIOScheduler()


def scan_all_users_for_alerts() -> None:
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active.is_(True)).all()
        total_fired = 0
        for user in users:
            fired = check_and_trigger_alerts(db, user)
            total_fired += len(fired)
        if total_fired:
            logger.info("Alert scan complete: %s new alert(s) fired", total_fired)
    finally:
        db.close()


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(
        scan_all_users_for_alerts,
        "interval",
        minutes=settings.ALERT_SCAN_INTERVAL_MINUTES,
        id="alert_threshold_scan",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — scanning alert thresholds every %s min", settings.ALERT_SCAN_INTERVAL_MINUTES)


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)

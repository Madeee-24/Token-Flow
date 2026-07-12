from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.alert import Alert, AlertThreshold
from app.models.user import User
from app.schemas.alert import AlertHistoryItem, AlertsOut, ThresholdOut, ThresholdUpdate
from app.services.alert_service import check_and_trigger_alerts, ensure_default_thresholds

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=AlertsOut)
def get_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    thresholds = ensure_default_thresholds(db, current_user.id)
    history = (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.triggered_at.desc())
        .limit(50)
        .all()
    )

    return AlertsOut(
        thresholds=[
            ThresholdOut(
                threshold=t.threshold, enabled=t.enabled, notify_email=t.notify_email, notify_in_app=t.notify_in_app
            )
            for t in sorted(thresholds, key=lambda x: x.threshold)
        ],
        history=[
            AlertHistoryItem(
                id=a.id,
                threshold=a.threshold,
                message=a.message,
                channel=a.channel,
                time=a.triggered_at.strftime("%b %d, %Y · %H:%M"),
            )
            for a in history
        ],
    )


@router.post("", response_model=ThresholdOut)
def update_threshold(
    payload: ThresholdUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    ensure_default_thresholds(db, current_user.id)
    row = (
        db.query(AlertThreshold)
        .filter(AlertThreshold.user_id == current_user.id, AlertThreshold.threshold == payload.threshold)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown threshold")

    if payload.enabled is not None:
        row.enabled = payload.enabled
    if payload.notify_email is not None:
        row.notify_email = payload.notify_email
    if payload.notify_in_app is not None:
        row.notify_in_app = payload.notify_in_app

    db.commit()
    db.refresh(row)
    return ThresholdOut(
        threshold=row.threshold, enabled=row.enabled, notify_email=row.notify_email, notify_in_app=row.notify_in_app
    )


@router.post("/check", status_code=status.HTTP_200_OK)
def run_alert_check(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Manually trigger an alert evaluation for the current user (the scheduler also does this automatically)."""
    fired = check_and_trigger_alerts(db, current_user)
    return {"fired": len(fired)}

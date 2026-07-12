from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.usage import AnalyticsOut
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(
    range: str = "14d",
    provider: str = "all",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return AnalyticsOut(
        daily_usage=analytics_service.get_daily_usage(db, current_user.id, range, provider),
        model_usage=analytics_service.get_model_usage(db, current_user.id, provider),
        cost_breakdown=analytics_service.get_cost_breakdown(db, current_user.id, provider),
        request_frequency=analytics_service.get_request_frequency(db, current_user.id, range, provider),
    )

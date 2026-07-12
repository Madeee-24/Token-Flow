from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.budget import Budget
from app.models.user import User
from app.schemas.alert import BudgetOut, BudgetUpdate
from app.services.usage_service import get_usage_percentage

router = APIRouter(prefix="/budgets", tags=["budgets"])


def _get_or_create(db: Session, user_id: str) -> Budget:
    budget = db.query(Budget).filter(Budget.user_id == user_id).first()
    if budget is None:
        budget = Budget(user_id=user_id)
        db.add(budget)
        db.commit()
        db.refresh(budget)
    return budget


@router.get("", response_model=BudgetOut)
def get_budget(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budget = _get_or_create(db, current_user.id)
    return BudgetOut(
        monthly_token_limit=budget.monthly_token_limit,
        monthly_cost_limit=budget.monthly_cost_limit,
        current_token_usage=budget.current_token_usage,
        current_cost_usage=budget.current_cost_usage,
        usage_percentage=get_usage_percentage(budget),
    )


@router.put("", response_model=BudgetOut)
def update_budget(
    payload: BudgetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    budget = _get_or_create(db, current_user.id)
    if payload.monthly_token_limit is not None:
        budget.monthly_token_limit = payload.monthly_token_limit
    if payload.monthly_cost_limit is not None:
        budget.monthly_cost_limit = payload.monthly_cost_limit
    db.commit()
    db.refresh(budget)
    return BudgetOut(
        monthly_token_limit=budget.monthly_token_limit,
        monthly_cost_limit=budget.monthly_cost_limit,
        current_token_usage=budget.current_token_usage,
        current_cost_usage=budget.current_cost_usage,
        usage_percentage=get_usage_percentage(budget),
    )

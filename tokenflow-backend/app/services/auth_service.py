from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.budget import Budget
from app.models.user import User
from app.core.config import settings


def create_user(db: Session, email: str, password: str) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("An account with this email already exists")

    user = User(email=email, hashed_password=hash_password(password))
    db.add(user)
    db.flush()  # get user.id before creating the budget row

    period_key = datetime.now(timezone.utc).strftime("%Y-%m")
    db.add(Budget(user_id=user.id, monthly_token_limit=settings.DEFAULT_MONTHLY_TOKEN_LIMIT, period_key=period_key))

    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)

    monthly_token_limit: Mapped[int] = mapped_column(Integer, default=12_000_000)
    monthly_cost_limit: Mapped[float] = mapped_column(Float, default=1000.0)

    current_token_usage: Mapped[int] = mapped_column(Integer, default=0)
    current_cost_usage: Mapped[float] = mapped_column(Float, default=0.0)

    period_key: Mapped[str] = mapped_column(String(7), default="")  # "YYYY-MM", reset when the month rolls over
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    owner = relationship("User", back_populates="budget")

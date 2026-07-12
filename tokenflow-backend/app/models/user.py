import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    api_keys = relationship("ApiKey", back_populates="owner", cascade="all, delete-orphan")
    usage_logs = relationship("UsageLog", back_populates="owner", cascade="all, delete-orphan")
    alert_thresholds = relationship("AlertThreshold", back_populates="owner", cascade="all, delete-orphan")
    alert_history = relationship("Alert", cascade="all, delete-orphan")
    budget = relationship("Budget", back_populates="owner", uselist=False, cascade="all, delete-orphan")

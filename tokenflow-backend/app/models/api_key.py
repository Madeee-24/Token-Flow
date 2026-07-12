import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ProviderName(str, enum.Enum):
    openai = "openai"
    claude = "claude"
    gemini = "gemini"
    grok = "grok"


def _uuid() -> str:
    return str(uuid.uuid4())


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    provider: Mapped[ProviderName] = mapped_column(Enum(ProviderName), nullable=False)
    label: Mapped[str] = mapped_column(String(255), nullable=False)

    # Fernet-encrypted ciphertext — the plaintext key is never persisted.
    encrypted_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    # Last 4 chars of the plaintext key, kept only for display (e.g. "••••7fA1").
    key_hint: Mapped[str] = mapped_column(String(8), default="")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_validated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="api_keys")

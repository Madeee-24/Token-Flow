from sqlalchemy.orm import Session

from app.models.api_key import ApiKey, ProviderName
from app.utils.crypto import decrypt_value, encrypt_value, key_hint


def create_api_key(db: Session, user_id: str, provider: ProviderName, label: str, plaintext_key: str) -> ApiKey:
    record = ApiKey(
        user_id=user_id,
        provider=provider,
        label=label,
        encrypted_key=encrypt_value(plaintext_key),
        key_hint=key_hint(plaintext_key),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_api_keys(db: Session, user_id: str) -> list[ApiKey]:
    return db.query(ApiKey).filter(ApiKey.user_id == user_id).order_by(ApiKey.created_at.desc()).all()


def get_api_key(db: Session, user_id: str, key_id: str) -> ApiKey | None:
    return db.query(ApiKey).filter(ApiKey.id == key_id, ApiKey.user_id == user_id).first()


def delete_api_key(db: Session, user_id: str, key_id: str) -> bool:
    record = get_api_key(db, user_id, key_id)
    if record is None:
        return False
    db.delete(record)
    db.commit()
    return True


def reveal_plaintext(record: ApiKey) -> str:
    """Only ever call this right before a provider call — never return it in a response."""
    return decrypt_value(record.encrypted_key)


def masked_display(record: ApiKey) -> str:
    prefix = {
        ProviderName.openai: "sk-",
        ProviderName.claude: "sk-ant-",
        ProviderName.gemini: "AIza",
        ProviderName.grok: "xai-",
    }.get(record.provider, "")
    return f"{prefix}{'•' * 10}{record.key_hint}"

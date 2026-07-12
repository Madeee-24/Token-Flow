import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut
from app.services import key_service
from app.services.provider.factory import get_provider

router = APIRouter(prefix="/keys", tags=["api-keys"])


def _to_out(record) -> ApiKeyOut:
    return ApiKeyOut(
        id=record.id,
        provider=record.provider,
        label=record.label,
        key_masked=key_service.masked_display(record),
        is_active=record.is_active,
        is_validated=record.is_validated,
        created_at=record.created_at.isoformat(),
    )


@router.get("", response_model=list[ApiKeyOut])
def list_keys(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = key_service.list_api_keys(db, current_user.id)
    return [_to_out(r) for r in records]


@router.post("", response_model=ApiKeyOut, status_code=status.HTTP_201_CREATED)
def add_key(payload: ApiKeyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = key_service.create_api_key(db, current_user.id, payload.provider, payload.label, payload.api_key)

    # Best-effort, non-blocking validation against the real provider. Any
    # failure (bad key, network issue, provider down) just leaves the key
    # marked unvalidated rather than blocking the save.
    try:
        provider = get_provider(payload.provider, payload.api_key)
        is_valid = asyncio.run(provider.validate_key())
        record.is_validated = is_valid
        db.commit()
        db.refresh(record)
    except Exception:
        pass

    return _to_out(record)


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_key(key_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = key_service.delete_api_key(db, current_user.id, key_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    return None

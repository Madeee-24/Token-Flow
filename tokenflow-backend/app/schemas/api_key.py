from pydantic import BaseModel, Field

from app.models.api_key import ProviderName


class ApiKeyCreate(BaseModel):
    provider: ProviderName
    label: str = Field(min_length=1, max_length=255)
    api_key: str = Field(min_length=8, description="Plaintext key — encrypted immediately, never stored as-is")


class ApiKeyOut(BaseModel):
    id: str
    provider: ProviderName
    label: str
    key_masked: str
    is_active: bool
    is_validated: bool
    created_at: str

    model_config = {"from_attributes": True}

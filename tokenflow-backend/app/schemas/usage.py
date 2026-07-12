from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class UsageSummaryOut(BaseModel):
    total_tokens: int
    token_limit: int
    usage_percentage: float = Field(alias="usage_percent")
    total_cost: float = Field(alias="cost")
    total_requests: int
    tokens_trend: float
    cost_trend: float
    requests_trend: float

    model_config = ConfigDict(populate_by_name=True)


class DailyUsagePoint(BaseModel):
    date: str
    tokens: int


class ModelUsageOut(BaseModel):
    model: str
    provider: str
    tokens: int
    cost: float
    requests: int


class ActivityItemOut(BaseModel):
    id: str
    provider: str
    model: str
    tokens: int
    cost: float
    status: str
    time: str


class CostBreakdownItem(BaseModel):
    name: str
    value: float
    provider: str


class RequestFrequencyPoint(BaseModel):
    date: str
    requests: int


class AnalyticsOut(BaseModel):
    daily_usage: List[DailyUsagePoint]
    model_usage: List[ModelUsageOut]
    cost_breakdown: List[CostBreakdownItem]
    request_frequency: List[RequestFrequencyPoint]


class TrackUsageRequest(BaseModel):
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    status: str = "success"


class CallProviderRequest(BaseModel):
    api_key_id: str
    prompt: str
    model: Optional[str] = None

from typing import List

from pydantic import BaseModel


class ThresholdOut(BaseModel):
    threshold: int
    enabled: bool
    notify_email: bool
    notify_in_app: bool


class ThresholdUpdate(BaseModel):
    threshold: int
    enabled: bool | None = None
    notify_email: bool | None = None
    notify_in_app: bool | None = None


class AlertHistoryItem(BaseModel):
    id: str
    threshold: int
    message: str
    channel: str
    time: str


class AlertsOut(BaseModel):
    thresholds: List[ThresholdOut]
    history: List[AlertHistoryItem]


class BudgetOut(BaseModel):
    monthly_token_limit: int
    monthly_cost_limit: float
    current_token_usage: int
    current_cost_usage: float
    usage_percentage: float


class BudgetUpdate(BaseModel):
    monthly_token_limit: int | None = None
    monthly_cost_limit: float | None = None

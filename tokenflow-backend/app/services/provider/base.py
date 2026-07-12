"""
Provider plugin architecture.

Every LLM provider (OpenAI, Claude, Gemini, Grok) implements this interface
so the rest of the app (usage tracking, cost calc, alerts) never needs to
know which provider it's talking to.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProviderCallResult:
    """Normalized shape every provider's call_api() returns."""
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    raw_response: dict
    status: str = "success"
    error: str | None = None


class BaseProvider(ABC):
    """
    Subclasses must implement `call_api` and `get_usage`.

    `api_key` is the *decrypted* plaintext key for this call only — it's
    never logged or persisted by the provider classes themselves.
    """

    name: str = "base"

    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    async def call_api(self, prompt: str, model: str) -> ProviderCallResult:
        """Send a prompt to the provider and return normalized usage data."""
        raise NotImplementedError

    @abstractmethod
    async def validate_key(self) -> bool:
        """Best-effort check that the API key is well-formed / accepted by the provider."""
        raise NotImplementedError

    async def get_usage(self) -> dict:
        """
        Some providers expose a native usage/billing API; others don't.
        Default implementation signals "not supported" — TokenFlow's own
        usage_logs table is the source of truth either way.
        """
        return {"supported": False, "message": f"{self.name} does not expose a native usage API"}

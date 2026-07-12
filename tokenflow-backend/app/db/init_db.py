"""
Creates all tables from the ORM models.

For a real production rollout, swap this for Alembic migrations. It's kept
as a simple create_all() here so the project runs immediately after
`pip install -r requirements.txt` with zero extra setup.
"""
from app.db.base import Base
from app.db.session import engine

# Import every model module so they register themselves on Base.metadata
# before create_all() runs.
from app.models import user, api_key, usage_log, alert, budget  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

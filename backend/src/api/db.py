"""Tietokantayhteys ja ORM-mallien yhteinen pohja."""

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from api.config import get_settings


class Base(DeclarativeBase):
    """Kaikkien ORM-mallien pohja. Alembic lukee skeeman tästä."""


@lru_cache
def get_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


def get_session() -> Iterator[Session]:
    """FastAPI-riippuvuus: yksi tietokantaistunto pyyntöä kohden."""
    session_factory = sessionmaker(bind=get_engine())
    with session_factory() as session:
        yield session

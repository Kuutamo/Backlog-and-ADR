"""Sovelluksen asetukset ympäristömuuttujista."""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Asetukset. Oletukset vastaavat docker-compose.yml:n kehitystietokantaa."""

    database_url: str = "postgresql+psycopg://backlog:backlog@localhost:5432/backlog"


@lru_cache
def get_settings() -> Settings:
    return Settings()

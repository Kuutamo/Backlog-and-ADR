"""FastAPI-sovelluksen käynnistyspiste."""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="Backlog and ADR API",
    version="0.1.0",
    description="Backlog-työkalun ja ADR-rekisterin REST-rajapinta.",
)


class Health(BaseModel):
    """Terveystarkistuksen vastaus."""

    status: str


@app.get("/health", response_model=Health, tags=["system"])
def health() -> Health:
    """Kertoo, että sovellus on käynnissä."""
    return Health(status="ok")

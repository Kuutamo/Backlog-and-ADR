"""FastAPI-sovelluksen käynnistyspiste."""

from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from api.adr.router import router as adr_router
from api.backlog.router import router as backlog_router
from api.db import get_session

app = FastAPI(
    title="Backlog and ADR API",
    version="0.1.0",
    description="Backlog-työkalun ja ADR-rekisterin REST-rajapinta.",
)
app.include_router(backlog_router)
app.include_router(adr_router)


class Health(BaseModel):
    """Terveystarkistuksen vastaus."""

    status: str
    database: str


@app.get(
    "/health",
    response_model=Health,
    tags=["system"],
    responses={503: {"description": "Tietokantaan ei saada yhteyttä"}},
)
def health(session: Annotated[Session, Depends(get_session)]) -> Health:
    """Kertoo, että sovellus on käynnissä ja tietokanta vastaa."""
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Tietokantaan ei saada yhteyttä",
        ) from error
    return Health(status="ok", database="ok")

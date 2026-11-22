"""ADR-rekisterin REST-rajapinta."""

from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.adr import repository
from api.adr.models import Adr
from api.adr.schemas import AdrCreate, AdrRead
from api.db import get_session

router = APIRouter(prefix="/adrs", tags=["adr"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=AdrRead, status_code=status.HTTP_201_CREATED)
def create_adr(data: AdrCreate, session: SessionDep) -> Adr:
    """Luo ADR:n vakiopohjalla ja antaa sille seuraavan numeron (A-01)."""
    return repository.create_adr(session, data)


@router.get("", response_model=list[AdrRead])
def list_adrs(session: SessionDep) -> Sequence[Adr]:
    """Listaa ADR:t numerojärjestyksessä."""
    return repository.list_adrs(session)


@router.get("/{number}", response_model=AdrRead, responses={404: {"description": "Ei löydy"}})
def get_adr(number: int, session: SessionDep) -> Adr:
    """Hakee yhden ADR:n numerolla."""
    adr = repository.get_adr(session, number)
    if adr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ADR:ää ei löydy")
    return adr

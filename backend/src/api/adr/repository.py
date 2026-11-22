"""ADR:ien tallennus ja haku."""

from collections.abc import Sequence

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from api.adr.models import Adr
from api.adr.schemas import AdrCreate

# Transaktiokohtaisen lukon avain ADR-numeroinnille (ADR-005). Mielivaltainen,
# mutta pysyvä: sama luku kaikissa prosesseissa.
ADR_NUMBERING_LOCK = 1_001


def create_adr(session: Session, data: AdrCreate) -> Adr:
    """Tallentaa ADR:n seuraavalla vapaalla numerolla (edellinen suurin + 1).

    Lukko pitää numeroinnin yksikäsitteisenä myös rinnakkaisissa pyynnöissä, ja se
    vapautuu automaattisesti transaktion päättyessä.
    """
    session.execute(text("SELECT pg_advisory_xact_lock(:key)"), {"key": ADR_NUMBERING_LOCK})
    next_number = session.scalar(select(func.coalesce(func.max(Adr.number), 0) + 1))
    adr = Adr(number=next_number, **data.model_dump())
    session.add(adr)
    session.commit()
    session.refresh(adr)
    return adr


def list_adrs(session: Session) -> Sequence[Adr]:
    """Palauttaa ADR:t numerojärjestyksessä."""
    return session.scalars(select(Adr).order_by(Adr.number)).all()


def get_adr(session: Session, number: int) -> Adr | None:
    return session.scalar(select(Adr).where(Adr.number == number))

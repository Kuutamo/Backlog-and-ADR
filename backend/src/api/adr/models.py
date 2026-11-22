"""ADR-rekisterin tietomallit."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from api.db import Base

TITLE_MAX_LENGTH = 200


class Adr(Base):
    """Arkkitehtuuripäätös (Architecture Decision Record)."""

    __tablename__ = "adrs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    number: Mapped[int] = mapped_column(Integer, unique=True)
    title: Mapped[str] = mapped_column(String(TITLE_MAX_LENGTH))
    context: Mapped[str] = mapped_column(Text)
    decision: Mapped[str] = mapped_column(Text)
    alternatives: Mapped[str | None] = mapped_column(Text)
    consequences: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.clock_timestamp()
    )

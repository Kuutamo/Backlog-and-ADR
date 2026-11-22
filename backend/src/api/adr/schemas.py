"""ADR-rekisterin rajapinnan syöte- ja vastausmallit."""

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    computed_field,
    field_validator,
)

from api.adr.models import TITLE_MAX_LENGTH

Title = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=TITLE_MAX_LENGTH),
    Field(description="Päätöksen otsikko. Pakollinen."),
]
RequiredText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


def format_identifier(number: int) -> str:
    """Muodostaa näyttömuodon, esim. 1 -> ``ADR-001``."""
    return f"ADR-{number:03d}"


class AdrCreate(BaseModel):
    """Uuden ADR:n tiedot. Numeroa ei anneta: palvelin antaa sen (ADR-005)."""

    title: Title
    context: RequiredText = Field(description="Miksi päätös tarvitaan. Pakollinen.")
    decision: RequiredText = Field(description="Mitä päätettiin. Pakollinen.")
    alternatives: str | None = Field(default=None, description="Harkitut vaihtoehdot.")
    consequences: str | None = Field(default=None, description="Päätöksen seuraukset.")

    @field_validator("alternatives", "consequences")
    @classmethod
    def blank_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AdrRead(BaseModel):
    """Tallennettu ADR."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    number: int
    title: str
    context: str
    decision: str
    alternatives: str | None
    consequences: str | None
    created_at: datetime

    @computed_field  # type: ignore[prop-decorator]
    @property
    def identifier(self) -> str:
        """Näyttömuoto, esim. ``ADR-001``."""
        return format_identifier(self.number)

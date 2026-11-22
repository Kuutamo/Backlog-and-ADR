"""Backlogin rajapinnan syöte- ja vastausmallit."""

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from api.backlog.models import TITLE_MAX_LENGTH

Title = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=TITLE_MAX_LENGTH),
    Field(description="Tarinan otsikko. Pakollinen, välilyönnit reunoilta poistetaan."),
]


class StoryCreate(BaseModel):
    """Uuden tarinan tiedot."""

    title: Title
    description: str | None = Field(default=None, description="Vapaamuotoinen kuvaus.")


class StoryRead(BaseModel):
    """Tallennettu tarina."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    created_at: datetime

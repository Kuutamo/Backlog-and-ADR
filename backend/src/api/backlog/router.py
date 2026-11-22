"""Backlogin REST-rajapinta."""

from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.backlog import repository
from api.backlog.models import Story
from api.backlog.schemas import StoryCreate, StoryRead
from api.db import get_session

router = APIRouter(prefix="/stories", tags=["backlog"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.post("", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
def create_story(data: StoryCreate, session: SessionDep) -> Story:
    """Lisää uuden käyttäjätarinan (B-01)."""
    return repository.create_story(session, data)


@router.get("", response_model=list[StoryRead])
def list_stories(session: SessionDep) -> Sequence[Story]:
    """Listaa tarinat uusimmasta vanhimpaan."""
    return repository.list_stories(session)

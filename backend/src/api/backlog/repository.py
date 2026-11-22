"""Tarinoiden tallennus ja haku."""

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from api.backlog.models import Story
from api.backlog.schemas import StoryCreate


def create_story(session: Session, data: StoryCreate) -> Story:
    story = Story(title=data.title, description=data.description)
    session.add(story)
    session.commit()
    session.refresh(story)
    return story


def list_stories(session: Session) -> Sequence[Story]:
    """Palauttaa tarinat uusimmasta vanhimpaan."""
    return session.scalars(select(Story).order_by(Story.created_at.desc())).all()

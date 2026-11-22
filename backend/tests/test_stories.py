"""B-01: Tuoteomistajana voin lisätä käyttäjätarinan otsikolla ja kuvauksella."""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from api.db import get_session
from api.main import app


def test_create_story_returns_saved_story(client: TestClient) -> None:
    response = client.post(
        "/stories",
        json={"title": "Tarinan lisääminen", "description": "Otsikko ja kuvaus"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Tarinan lisääminen"
    assert body["description"] == "Otsikko ja kuvaus"
    assert body["id"]
    assert body["created_at"]


def test_description_is_optional(client: TestClient) -> None:
    response = client.post("/stories", json={"title": "Pelkkä otsikko"})

    assert response.status_code == 201
    assert response.json()["description"] is None


def test_title_is_trimmed(client: TestClient) -> None:
    response = client.post("/stories", json={"title": "  Väljä otsikko  "})

    assert response.status_code == 201
    assert response.json()["title"] == "Väljä otsikko"


@pytest.mark.parametrize(
    "payload",
    [{}, {"title": ""}, {"title": "   "}, {"title": "x" * 201}],
    ids=["puuttuu", "tyhja", "valilyonnit", "liian-pitka"],
)
def test_title_is_required(client: TestClient, payload: dict[str, str]) -> None:
    """Hyväksymiskriteeri: otsikko on pakollinen."""
    response = client.post("/stories", json=payload)

    assert response.status_code == 422
    assert client.get("/stories").json() == []


def test_stories_are_listed_newest_first(client: TestClient) -> None:
    client.post("/stories", json={"title": "Ensimmäinen"})
    client.post("/stories", json={"title": "Toinen"})

    titles = [story["title"] for story in client.get("/stories").json()]

    assert titles == ["Toinen", "Ensimmäinen"]


def test_story_is_listed_after_reload(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    """Hyväksymiskriteeri: tarina näkyy listassa myös uudelleenlatauksen jälkeen.

    Tarina luodaan yhdellä asiakkaalla, ja se haetaan uudella asiakkaalla ja uudella
    tietokantayhteydellä. Näin varmistetaan, että tarina on tallessa tietokannassa.
    """
    created = client.post("/stories", json={"title": "Pysyvä tarina"}).json()

    def fresh_session() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = fresh_session
    with TestClient(app) as reloaded_client:
        stories = reloaded_client.get("/stories").json()

    assert [story["id"] for story in stories] == [created["id"]]

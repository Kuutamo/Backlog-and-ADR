"""A-01: Arkkitehtina voin luoda ADR:n vakiopohjalla."""

from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from api.adr import repository
from api.adr.schemas import AdrCreate
from api.db import get_session
from api.main import app

VALID_ADR: dict[str, Any] = {
    "title": "Teknologiapino",
    "context": "Tarvitaan backend ja frontend.",
    "decision": "Python ja FastAPI, React ja TypeScript.",
    "alternatives": "Java ja Spring Boot.",
    "consequences": "Kaksi kieltä.",
}


def test_create_adr_with_all_template_fields(client: TestClient) -> None:
    """Hyväksymiskriteeri: kentät otsikko, konteksti, päätös, vaihtoehdot, seuraukset."""
    response = client.post("/adrs", json=VALID_ADR)

    assert response.status_code == 201
    body = response.json()
    for field, value in VALID_ADR.items():
        assert body[field] == value
    assert body["id"]
    assert body["created_at"]


def test_alternatives_and_consequences_are_optional(client: TestClient) -> None:
    payload = {"title": "Lisenssi", "context": "GPLv3 rajoittaa.", "decision": "MIT."}

    response = client.post("/adrs", json=payload)

    assert response.status_code == 201
    assert response.json()["alternatives"] is None
    assert response.json()["consequences"] is None


def test_blank_optional_fields_are_stored_as_empty(client: TestClient) -> None:
    response = client.post("/adrs", json={**VALID_ADR, "alternatives": "   "})

    assert response.status_code == 201
    assert response.json()["alternatives"] is None


@pytest.mark.parametrize("field", ["title", "context", "decision"])
@pytest.mark.parametrize("value", [None, "", "   "], ids=["puuttuu", "tyhja", "valilyonnit"])
def test_title_context_and_decision_are_required(
    client: TestClient, field: str, value: str | None
) -> None:
    payload = {**VALID_ADR}
    if value is None:
        del payload[field]
    else:
        payload[field] = value

    response = client.post("/adrs", json=payload)

    assert response.status_code == 422
    assert client.get("/adrs").json() == []


def test_adrs_get_running_numbers(client: TestClient) -> None:
    """Hyväksymiskriteeri: ADR saa juoksevan numeron."""
    created = [
        client.post("/adrs", json={**VALID_ADR, "title": f"Päätös {i}"}).json() for i in range(3)
    ]

    assert [adr["number"] for adr in created] == [1, 2, 3]
    assert [adr["identifier"] for adr in created] == ["ADR-001", "ADR-002", "ADR-003"]


def test_client_cannot_choose_the_number(client: TestClient) -> None:
    response = client.post("/adrs", json={**VALID_ADR, "number": 42})

    assert response.status_code == 201
    assert response.json()["number"] == 1


def test_concurrent_adrs_get_unique_numbers(session_factory: sessionmaker[Session]) -> None:
    """Yhtä aikaa luodut ADR:t eivät saa samaa numeroa (ADR-005)."""

    def create(i: int) -> int:
        with session_factory() as session:
            data = AdrCreate(title=f"Rinnakkainen {i}", context="K", decision="P")
            return repository.create_adr(session, data).number

    with ThreadPoolExecutor(max_workers=5) as executor:
        numbers = list(executor.map(create, range(10)))

    assert sorted(numbers) == list(range(1, 11))


def test_adrs_are_listed_in_number_order(client: TestClient) -> None:
    for title in ["Ensimmäinen", "Toinen"]:
        client.post("/adrs", json={**VALID_ADR, "title": title})

    titles = [adr["title"] for adr in client.get("/adrs").json()]

    assert titles == ["Ensimmäinen", "Toinen"]


def test_get_adr_by_number(client: TestClient) -> None:
    client.post("/adrs", json=VALID_ADR)

    response = client.get("/adrs/1")

    assert response.status_code == 200
    assert response.json()["title"] == "Teknologiapino"
    assert client.get("/adrs/99").status_code == 404


def test_adr_is_found_after_reload(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    created = client.post("/adrs", json=VALID_ADR).json()

    def fresh_session() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = fresh_session
    with TestClient(app) as reloaded_client:
        adrs = reloaded_client.get("/adrs").json()

    assert [adr["id"] for adr in adrs] == [created["id"]]

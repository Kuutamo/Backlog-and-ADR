# Backlog-and-ADR

Harjoitusprojekti: **backlog-työkalu** tuotteen hallintaan ja **arkkitehtuuripäätösten (ADR) rekisteri**, rakennettuna ammattimaisella kehitysprosessilla Clauden kanssa.

Suunnitelma, backlog ja päätökset elävät Notionissa. Päätökset kirjataan myös repoon kansioon [`docs/adr/`](docs/adr/).

## Teknologiat

Python ja FastAPI (backend), React ja TypeScript (frontend), PostgreSQL, Python-skriptit. Perustelut: [ADR-001](docs/adr/0001-teknologiapino.md).

```
backend/    FastAPI-sovellus, moduulit backlog ja adr
frontend/   React-sovellus (Vite)
scripts/    Python-apuskriptit
docs/adr/   Arkkitehtuuripäätökset
```

## Käynnistys

Vaatimukset: [uv](https://docs.astral.sh/uv/), Node.js 22, Docker.

```bash
make install   # riippuvuudet
make dev       # tietokanta, backend (http://localhost:8000/docs) ja frontend (http://localhost:5173)
make check     # samat tarkistukset kuin CI
```

## Työskentelytapa

1. Tarina valitaan Notionin backlogista ja siirretään tilaan "Työn alla".
2. Haara tarinan tunnisteella: `feature/B-01-lyhyt-kuvaus`.
3. Ensin testit hyväksymiskriteereistä, sitten toteutus.
4. Pull request, jonka CI tarkistaa (ruff, mypy, import-linter, pytest, ESLint, Prettier, Vitest, build).
5. Katselmointi ja squash merge päähaaraan.
6. Tarina merkitään valmiiksi, ja merkittävä valinta kirjataan ADR:ksi.

Commit-viestit [Conventional Commits](https://www.conventionalcommits.org/) -muodossa.

## Lisenssi

[MIT](LICENSE)

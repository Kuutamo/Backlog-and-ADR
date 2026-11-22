# ADR-003: Testaus ja CI

- **Tila:** Ehdotettu
- **Päivämäärä:** 2026-11-22

## Konteksti

Osa koodista syntyy Clauden kanssa, joten automaattisten testien ja katselmoinnin pitää kantaa laadunvarmistus, ei yksittäisen kehittäjän muisti.

## Päätös

| Osa | Testit | Laatutyökalut |
|---|---|---|
| Backend | pytest, FastAPI:n TestClient, Testcontainers (PostgreSQL), import-linter | ruff, mypy (strict) |
| Frontend | Vitest, React Testing Library | ESLint, Prettier, TypeScriptin strict-tila |
| Skriptit | pytest | ruff, mypy (strict) |
| Koko sovellus | Savutesti (`scripts/smoke-test.sh`): tietokanta, backend ja frontend käynnistyvät ja vastaavat. Playwright-päästä-päähän-testit tärkeimmille poluille sprintistä 2 alkaen | |

GitHub Actions ajaa Python- ja frontend-jobit rinnakkain jokaisessa PR:ssä ja niiden jälkeen savutestin. Päähaara on suojattu: merge vaatii vihreän putken ja hyväksytyn katselmoinnin.

## Harkitut vaihtoehdot

Kiinteä kattavuusraja (esim. 80 %): hylätty alkuvaiheessa, koska se ohjaa helposti tyhjiin testeihin. Linjaus on, että uudella logiikalla on testit; kattavuutta seurataan trendinä.

## Seuraukset

Testcontainers vaatii Dockerin sekä kehittäjän koneella että CI:ssä.

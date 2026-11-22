# ADR-001: Teknologiapino

- **Tila:** Hyväksytty
- **Päivämäärä:** 2026-11-22

## Konteksti

Työkalut ovat harjoitusprojekteja, joiden tavoite on oppia Clauden kanssa tehtävää kehitysprosessia ja kehittyä data-arkkitehtuurissa ja datatyökaluissa. Pinossa tarvitaan ajettavia skriptejä ja myöhemmin dataputkia, analytiikkaa ja tekoälyominaisuuksia. Alkuperäinen ehdotus oli Java, Node.js, React ja TypeScript.

## Päätös

- **Backend:** Python ja FastAPI. Pydantic validoi syötteet ajon aikana ja tuottaa OpenAPI-kuvauksen automaattisesti. Tietokantayhteys SQLAlchemylla, migraatiot Alembicilla.
- **Tietokanta:** PostgreSQL, paikallisesti Docker Composella.
- **Frontend:** React ja TypeScript, build ja kehityspalvelin Vitellä. Node.js on vain frontendin työkaluketju, ei palvelin.
- **Skriptit ja data:** Python. Skriptit käyttävät samoja tietomalleja kuin backend, ja myöhemmät dataputket rakennetaan samaan ekosysteemiin.
- **Työkalut:** uv riippuvuuksiin, ruff lint- ja muotoilutöihin, mypy strict-tilassa tyyppitarkistukseen.
- **Rajapintasopimus:** frontendin TypeScript-tyypit generoidaan backendin OpenAPI-kuvauksesta.

## Harkitut vaihtoehdot

- **Java ja Spring Boot:** vastaa parhaiten julkisen sektorin asiakasympäristöjä ja tuo kattavat valmiit osat, mutta kolme kieltä, raskain kehityssykli ja heikoin yhteys datatavoitteeseen.
- **Pelkkä Node.js ja TypeScript:** yksi kieli ja suoraan jaetut tyypit, mutta ajonaikainen validointi vaatii erillisen kirjaston ja datatyökalut jäävät erilleen.
- **Django FastAPI:n sijaan:** valmis admin-näkymä, autentikointi ja ORM, mutta raskaampi ja vahvemmin sidottu omaan tapaansa. Admin-näkymä ei ole tarpeen, koska käyttöliittymä tehdään Reactilla.

## Seuraukset

Kaksi kieltä (Python ja TypeScript) ja yksi data-ekosysteemi. Dynaaminen tyypitys edellyttää, että mypy ajetaan CI:ssä strict-tilassa. Pinossa ei harjoitella asiakastyön Java-pinoa, mikä on tietoinen valinta.

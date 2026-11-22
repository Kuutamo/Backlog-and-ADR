# ADR-002: Repon rakenne ja haaramalli

- **Tila:** Ehdotettu
- **Päivämäärä:** 2026-11-22

## Konteksti

Työkaluilla on paljon yhteistä (listat, tilat, haku, viennit), ja niitä kehittää sama pieni tiimi.

## Päätös

Yksi monorepo ja yksi modulaarinen monoliitti:

```
/backend     FastAPI-sovellus, moduulit backlog ja adr omina paketteinaan
/frontend    yksi React-sovellus, kaksi näkymää
/scripts     Python-skriptit ja niiden testit
/docs/adr    ADR:t Markdownina, kunnes rekisteri on käytössä
pyproject.toml       uv-workspace, joka yhdistää backendin ja skriptit
docker-compose.yml
```

Moduulien rajat valvotaan import-linterillä CI:ssä, jotta ne voi tarvittaessa erottaa omiksi palveluikseen.

**Haaramalli.** Trunk-based development: lyhytikäiset haarat tarinan tunnisteella (esim. `feature/B-01-lisaa-tarina`), pull request ja katselmointi, squash merge päähaaraan. Commit-viestit Conventional Commits -muodossa.

**Päähaaran suojaus ja katselmointi.** Repossa on yksi ylläpitäjä, ja Claude avaa PR:t ylläpitäjän linkitetyn GitHub-tilin kautta. PR:n tekijä on siis aina ylläpitäjä itse, eikä GitHub salli oman PR:n hyväksymistä. Siksi:

- Päähaaran ruleset vaatii PR:n ja vihreät pakolliset tarkistukset (Python, Frontend, Savutesti). Suoraan päähaaraan ei voi pushata, eikä punaista PR:ää voi mergetä.
- Pakollisten hyväksyntöjen määrä on 0. Katselmointi tehdään silti jokaiseen PR:ään: ylläpitäjä lukee muutokset, kommentoi tarvittaessa rivejä ja hyväksyy mergeämällä. Katselmointi on prosessin varassa, ei GitHubin pakottama.
- Kun repoon tulee toinen ihminen, hyväksyntävaatimus nostetaan yhteen.

## Harkitut vaihtoehdot

- Kaksi erillistä repoa ja palvelua: selkeämpi erottelu, mutta kaksinkertainen CI, julkaisu ja ylläpito ilman nykyistä tarvetta.
- Yksi pakollinen hyväksyntä: estäisi kaikki mergeet, koska ylläpitäjä on jokaisen PR:n tekijä.
- Ylläpitäjän ohitusoikeus ruleset-sääntöihin: ohittaisi myös pakolliset tarkistukset, joten suojaus menettäisi merkityksensä.

## Seuraukset

Yksi julkaistava kokonaisuus ja yksi putki. Moduulien rajojen pitäminen on testien ja katselmoinnin vastuulla. Laatu nojaa pakollisiin tarkistuksiin; ihmisen katselmointi on sovittu käytäntö, jota GitHub ei valvo.

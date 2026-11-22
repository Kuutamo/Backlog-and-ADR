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

**Haaramalli.** Trunk-based development: lyhytikäiset haarat tarinan tunnisteella (esim. `feature/B-01-lisaa-tarina`), pull request ja vähintään yksi katselmointi, squash merge päähaaraan. Commit-viestit Conventional Commits -muodossa.

## Harkitut vaihtoehdot

Kaksi erillistä repoa ja palvelua: selkeämpi erottelu, mutta kaksinkertainen CI, julkaisu ja ylläpito ilman nykyistä tarvetta.

## Seuraukset

Yksi julkaistava kokonaisuus ja yksi putki. Moduulien rajojen pitäminen on testien ja katselmoinnin vastuulla.

# Ohjeet Claudelle

- Projektin kieli on suomi: dokumentaatio, ADR:t, commit-viestien kuvaukset ja käyttöliittymätekstit. Koodin nimet englanniksi.
- Backlog ja päätökset ovat Notionissa. Tarkista tarinan hyväksymiskriteerit sieltä ennen toteutusta.
- Työskentelytapa: README:n kohta "Työskentelytapa". Kerro suunnitelma ja odota hyväksyntä ennen muutoksia.
- Ensin testit, sitten toteutus. Aja `make check` ennen PR:ää, jos ympäristö sen sallii.
- Python: mypy strict, ruff, rivinpituus 100. Backlog- ja ADR-moduulit eivät saa importata toisiaan.
- Merkittävä tekninen valinta kirjataan uutena ADR:nä kansioon `docs/adr/` (muoto `NNNN-otsikko.md`).

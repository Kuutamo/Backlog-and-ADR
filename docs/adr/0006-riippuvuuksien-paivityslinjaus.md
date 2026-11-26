# ADR-006: Riippuvuuksien päivityslinjaus

- **Tila:** Hyväksytty
- **Päivämäärä:** 2026-11-22

## Konteksti

Projektissa on kolme riippuvuusekosysteemiä: Python-kirjastot (uv), frontendin npm-paketit ja GitHub Actions. Sprintti 1:n CI-ajoissa löytyi kolme npm-haavoittuvuutta, kaksi kirjastojen vanhentumisvaroitusta ja vanhentuvat Actions-versiot. Päivitykset kasautuvat helposti, ja haavoittuvuudet jäävät huomaamatta, jos niitä ei seurata järjestelmällisesti.

## Päätös

**Toistettavuus**

- `uv.lock` ja `frontend/package-lock.json` ovat versionhallinnassa, ja CI asentaa niistä (`uv sync --locked`, `npm ci`).
- Kun riippuvuuksia muutetaan ympäristössä, jossa paketteja ei voi asentaa, lukitustiedostot päivitetään `lukitus.yml`-workflowlla `deps/`-haarassa.

**Automaattiset päivitykset (Dependabot)**

- Viikoittain maanantaisin kaikille kolmelle ekosysteemille.
- Pienet päivitykset (minor ja patch) niputetaan yhteen PR:ään ekosysteemiä kohden, ja ne mergetään, kun CI on vihreä.
- Suuret versiopäivitykset tulevat omina PR:inään. Niissä luetaan muutosloki ennen mergeä, ja tarvittavat koodimuutokset tehdään samaan PR:ään.
- Ylläpitäjä katselmoi Dependabotin PR:t viikoittain samalla tavalla kuin muutkin PR:t (ADR-002).

**Haavoittuvuudet**

- CI tarkistaa jokaisessa PR:ssä Python-riippuvuudet (`pip-audit`, mikä tahansa tunnettu haavoittuvuus kaataa ajon) ja npm-riippuvuudet (`npm audit`, vakavat ja kriittiset kaatavat ajon).
- Kriittiset ja vakavat haavoittuvuudet korjataan viikon sisällä. Jos korjausta ei ole, haavoittuvuus arvioidaan ja poikkeus perustellaan kirjallisesti tähän ADR:ään tai sen korvaajaan.

**Vanhentumisvaroitukset**

- pytest käsittelee vanhentumisvaroitukset virheinä, joten ne korjataan heti eivätkä kasaannu.

## Harkitut vaihtoehdot

- **Renovate Dependabotin sijaan:** joustavampi, mutta vaatii erillisen sovelluksen asennuksen. Dependabot on GitHubissa valmiina ja riittää tämän kokoiseen projektiin.
- **Kaikki päivitykset omina PR:inään:** täsmällisempi, mutta pienessä projektissa PR:iä tulisi viikoittain kymmeniä.
- **Vain manuaaliset päivitykset:** ei automaattista kuormaa, mutta päivitykset jäisivät käytännössä tekemättä.

## Seuraukset

Päivityksiä tulee viikoittain muutama PR, ja niiden katselmointi on osa ylläpitäjän rutiinia. Tiukka haavoittuvuustarkistus voi kaataa CI:n uuden haavoittuvuustiedon takia ilman koodimuutosta, mikä on tarkoituksellista.

## Poikkeukset

Ei poikkeuksia. Sprintti 1:n kolme npm-haavoittuvuutta (`tinypool` 2 × critical, `@vitest/mocker` moderate) tulivat Vitest 3:sta, ja ne korjattiin päivittämällä Vitest versioon 5 (T-03).

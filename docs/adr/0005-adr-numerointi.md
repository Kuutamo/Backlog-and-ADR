# ADR-005: ADR:ien juokseva numerointi

- **Tila:** Hyväksytty
- **Päivämäärä:** 2026-11-22

## Konteksti

A-01:n mukaan jokainen ADR saa juoksevan numeron (ADR-001, ADR-002 ...). Numeroihin viitataan keskusteluissa ja dokumenteissa, joten sarjassa ei saa olla aukkoja eikä kahta samaa numeroa, myöskään silloin kun kaksi ADR:ää tallennetaan yhtä aikaa.

## Päätös

Numero on **edellinen suurin numero + 1**, ja sen antaa palvelin. Asiakas ei voi valita numeroa.

- Numeron laskenta ja tallennus tehdään samassa transaktiossa PostgreSQL:n transaktiokohtaisen lukon (`pg_advisory_xact_lock`) suojassa. Rinnakkaiset tallennukset odottavat vuoroaan, ja lukko vapautuu transaktion päättyessä.
- Sarakkeella `number` on yksilöllisyysrajoite varmistuksena.
- Näyttömuoto `ADR-001` muodostetaan numerosta rajapinnassa (`identifier`), eikä sitä tallenneta erikseen.

## Harkitut vaihtoehdot

- **Tietokannan sekvenssi tai identity-sarake:** yksinkertaisin ja nopein, mutta epäonnistunut tai peruttu tallennus kuluttaa numeron, jolloin sarjaan jää aukko.
- **Pelkkä yksilöllisyysrajoite ja uusi yritys törmäyksessä:** ei lukkoa, mutta rinnakkaisissa tallennuksissa vaatii uusintayrityslogiikan ja tuottaa virheitä kuormassa.

## Seuraukset

ADR:ien tallennukset sarjoittuvat, mikä on merkityksetöntä tämän kokoisessa järjestelmässä. Ratkaisu on sidottu PostgreSQL:ään. Poistettu ADR jättäisi aukon, mutta ADR:iä ei poisteta: niiden tila muutetaan (A-02).

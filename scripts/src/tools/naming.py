"""Tiedostonimien muodostus vientejä varten (pohja tarinalle A-05)."""

import re
import unicodedata

_REPLACEMENTS = str.maketrans({"ä": "a", "ö": "o", "å": "a", "Ä": "a", "Ö": "o", "Å": "a"})


def slugify(text: str) -> str:
    """Muuttaa tekstin tiedostonimeen sopivaksi: pienet kirjaimet, väliviivat, ei ääkkösiä."""
    normalized = unicodedata.normalize("NFKD", text.translate(_REPLACEMENTS))
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")


def adr_filename(number: int, title: str) -> str:
    """Palauttaa ADR:n Markdown-tiedoston nimen, esim. ``0001-teknologiapino.md``."""
    if number < 1:
        raise ValueError("ADR:n numeron pitää olla vähintään 1")
    slug = slugify(title)
    if not slug:
        raise ValueError("ADR:n otsikosta ei saatu muodostettua tiedostonimeä")
    return f"{number:04d}-{slug}.md"

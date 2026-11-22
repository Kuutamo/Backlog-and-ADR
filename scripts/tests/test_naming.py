import pytest

from tools.naming import adr_filename, slugify


def test_slugify_replaces_finnish_letters_and_spaces() -> None:
    assert slugify("Repon rakenne ja haaramalli") == "repon-rakenne-ja-haaramalli"
    assert slugify("Päätösten jäljitettävyys") == "paatosten-jaljitettavyys"


def test_slugify_removes_punctuation() -> None:
    assert slugify("Testaus & CI!") == "testaus-ci"


def test_adr_filename_pads_number() -> None:
    assert adr_filename(1, "Teknologiapino") == "0001-teknologiapino.md"
    assert adr_filename(42, "Lisenssi") == "0042-lisenssi.md"


@pytest.mark.parametrize(("number", "title"), [(0, "Otsikko"), (1, "!!!")])
def test_adr_filename_rejects_invalid_input(number: int, title: str) -> None:
    with pytest.raises(ValueError):
        adr_filename(number, title)

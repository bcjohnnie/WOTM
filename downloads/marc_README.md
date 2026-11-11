# LSRD-SIS Legal Website of the Month: MARC records

**Status:** judgment calls accepted by the owner (2026-10-22, "fine for now").

## Files

| File | What it holds |
|---|---|
| `wotm_active.mrc` / `.xml` / `.mrk` | **The catalog-ready set:** one record per featured site that still seems active, with an 856 to the live address. |
| `wotm_all.mrc` / `.xml` / `.mrk` | Every featured resource, including sites that are gone. Those link to their Wayback Machine copy, plus a successor or comparable resource where one was accepted. |
| `index.csv` | Record id → the pick(s) it covers, title source, site status, flags. |

`.mrc` is binary MARC21 (ISO 2709, UTF-8, leader/09 `a`). `.xml` is
MARCXML. `.mrk` is MarcEdit's text form, for reading. Check the files with
`python3 scripts/validate_marc.py`.

## What the records are

Minimal-level RDA records for integrating resources (websites and
databases). They are built from the section's own archive text and this
project's verified data. They do not depend on any library's catalog
URLs.

- **Title:** from the owner's 2017 MARC file, the University of Hawaiʻi Law
  Library's catalog record, the University of Tennessee Law mirror of the
  series, or the LSRD listing. LSRD's ALL-CAPS titles are
  converted to title case and flagged in `index.csv`. The listing title is
  kept as a 246.
- **Summary (520):** the LSRD-SIS description, verbatim, credited
  "LSRD-SIS Legal Website of the Month".
- **Subjects:** LCSH and FAST from the University of Hawaiʻi Law Library's
  records and the 2017 MARC file, included only where they can be coded
  faithfully. Where neither gives any, the Colorado Law record's LCSH/FAST
  headings are copied verbatim (84 records), with a 500 naming the source. The project's navigation topics and jurisdictions appear as
  uncontrolled terms (653).
- **OCLC numbers (035):** where known, so a library can overlay the WorldCat
  master record for full cataloguing. 237 of 338 records carry exactly one
  (`validate_marc.py` fails on two numbers in a record, or one number on two
  records):
  - 127 come from a catalogue record (UH Law Library, the 2017 MARC file);
  - 32 were found by web search and confirmed by the project owner
    (2026-10-25);
  - 78 come from the Colorado Law record that the LSRD entry itself links
    (2026-10-26), copied verbatim, and only where no other source gave a
    number. A Colorado record is used only if it carries the old record
    number LSRD linked and its title matches the pick; LSRD linked the
    wrong record for 4 picks.

  `index.csv` gives each record's numbers (`oclc_035`) and their source
  (`oclc_source`).
- **Form (655):** Library of Congress Genre/Form Terms, each with its
  id.loc.gov URI. Site types LCGFT has no term for go in 653.
- **Links (856):** every link is one of the compiled archive's published
  links, so each was verified to point to what it claims, automatically or
  by the project owner. `validate_marc.py` fails on any other link.
  - 40 is the site's verified current address or, if it has none, its
    verified archived copy.
  - 42 is an accepted successor, a comparable current resource, or a page
    about the resource (labelled "not the resource itself"). 785 names the
    successor.
  - A record is in `wotm_active` only if the site has a verified current
    address.
- **Dates:** the section's year headings are not reliable before 2009, so
  the record gives the archive listing year plus, where known, the window in
  which the pick first appeared on the archive page.
- **One record per resource:** sites featured twice are merged into one
  record that notes both picks.

## Machine cataloguing (November 2026)

At the owner's request, the records were built out with machine-assigned
data. Every field added this way is disclosed in the record itself, in a 500
beginning "Machine-assigned by Claude (Anthropic), November 2026: …", which
lists the fields added. The encoding level stays minimal (leader/17 `7`): no
cataloger has reviewed these values.

| Field | What was added | How it was checked |
|---|---|---|
| 710 / 700 | the issuing body, with `$e issuing body` and its LC authority URI in `$0` | exact authorised form in the LC Name Authority File (id.loc.gov). A few came from a near-match: the one heading that holds every word of the proposed form plus only generic words such as "School" or "Library". These are listed in `../data/cataloging/verified.csv` (`match`). |
| 650 / 651 / 610 | LCSH, only for records that had no subject headings | every part of each heading exists in LCSH or the NAF, coded from LC's own record type (topic, place, form). `$0` is given when LC holds the whole heading. Not checked: whether a subdivision is authorised under that main heading. |
| 043 | geographic area codes | each code exists in the MARC Code List for Geographic Areas |
| 008/15-17, 35-37 | country of publication, language | the MARC country and language code lists |
| 008/28 | government publication | not checkable; a judgment |
| 264 $a | place of publication, in brackets as supplied | not checkable; replaces "[Place of publication not identified]" only |
| 506 | free or restricted access | not checkable; a judgment from the site |

Proposals that failed a check were dropped, never guessed: see
`../data/cataloging/dropped.csv`. Copied headings found to be wrong are
removed through `../data/marc/subject_exclusions.csv`.

## Cataloging agency

003 and 040 are deliberately blank (owner decision, 2026-10-22). Importing
systems typically add their own. If LSRD-SIS obtains a MARC organization
code, rebuild with `--org-code CODE`.

## Before sharing

The judgment calls (the flagged titles, `../data/marc/title_fixes.csv`,
`../data/marc/duplicate_groups.csv`, `../data/marc/link_roles.csv`,
`../data/marc/oclc_choices.csv`) were
accepted by the owner on 2026-10-22 as "fine for now". Edit those files and
rebuild to change any of them.

Rebuild: `python3 scripts/make_board_archive.py`, then
`python3 scripts/make_marc.py --with-hawaii [--org-code CODE]`, then
`python3 scripts/validate_marc.py`, then `python3 scripts/make_board_archive.py`
(copies the MARC into llm-assisted) and `python3 scripts/make_streamlined.py`. The MARC reads its links and OCLC numbers
from the compiled archive, so build the archive first. Use of the UH data was cleared on 2026-10-22.

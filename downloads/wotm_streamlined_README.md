# LLM-assisted archive: Legal Website of the Month

**This layer includes LLM assistance.** It holds the work Claude (Anthropic)
produced in the project: subject assignments, normalised titles, date
estimates, notes, the MARC records with their machine-assigned cataloguing,
and the streamlined file. Together with `../compiled/`, it is the full archive.

It is kept apart from the compiled archive so it can be cut: every file joins
to `../compiled/wotm_compiled.csv` on `Entry ID`, and the compiled archive
never reads anything here.

| File | What it is | Made by |
|---|---|---|
| `claude_cataloging_subjects.csv` | subject topics, jurisdiction, place, resource type (with LCGFT URIs where a term exists) | Claude, from catalogue LCSH or the LSRD description; vocabulary still draft |
| `claude_cataloging_titles.csv` | normalised titles (ALL-CAPS conversions and corrections) | Claude |
| `claude_cataloging_marc/` | generated MARC records (`.mrc`, `.xml`, `.mrk`) and their index | Claude |
| `claude_analysis_dates.csv` | sequence and estimated month, with range and method | Claude |
| `claude_analysis_notes.csv` | notes on errors in LSRD entries; picks that are the same resource | Claude |
| `owner_annotations_access.csv` | free / paid, when featured and now (where recorded) | the project owner |
| `wotm_streamlined.csv` / `.xlsx` | **the link collection:** one row per pick, 26 columns (below). The workbook has filters, a frozen header and clickable links. | `scripts/make_streamlined.py`, from the compiled archive, the files above and the MARC records |

## `wotm_streamlined.csv` / `.xlsx`

A sheet meant to carry the series' core value, the curated links, with enough
metadata to browse and use them. The MARC records in `claude_cataloging_marc/`
are the catalogue-record version of the same picks.

| Column | What it is | Filled (of 344) |
|---|---|---|
| Entry ID | the project's key for the pick | 344 |
| Title | the LSRD title, converted from ALL CAPS | 344 |
| Description | the LSRD description, verbatim (2006-10 has none in the LSRD archive) | 343 |
| Topic, Other topics | the project's browse topics (`claude_cataloging_subjects.csv`, owner re-filings applied) | 344, 212 |
| Jurisdiction, Place | federal, state, foreign, international…; a named country or state | 344, 47 |
| Resource type | portal, database, statutes and codes, digital archive… | 344 |
| Subject headings (LCSH) | the LCSH of the pick's MARC record, headings separated by ` \| `, subdivisions by ` -- ` | 337 |
| Subject headings from | where those headings came from: the UH Law Library record (113), the Colorado Law record (87), the 2017 LSRD MARC file (3), or **machine-assigned** by Claude and checked against id.loc.gov (134) | 337 |
| Publisher / issuing body | the MARC 710/700 (machine-assigned, LC authorised forms), else the UTK record's creator | 312 |
| Access | `Free` or `Subscription`: the owner's note where there is one, else the MARC 506 (a judgment from the site) | 337 |
| LSRD date | the year heading as published; it runs several years early before 2009 | 344 |
| Estimated posting date | the project's best estimate (month), from `claude_analysis_dates.csv` | 344 |
| Status, Status checked | the original resource's status and the date it was checked | 344, 324 |
| Link | the one best verified link | 343 |
| Link is | `same` (current address), `same (archived copy)`, `successor`, `equivalent`, or `no link found` | 344 |
| Linked resource name | the successor's or equivalent's name, when the link is one | 19 |
| Wayback backup | a verified Internet Archive capture of that link (blank when the link is itself an archived copy) | 296 |
| Original address | the address when the site was featured, where it verified | 246 |
| Also featured as | other picks that are the same resource | 12 |
| Note | the project's note on an error in the LSRD entry | 7 |
| OCLC number | for overlaying the WorldCat record | 243 |
| MARC record ID | the record's 001 in `claude_cataloging_marc/wotm_all.*` (picks of the same resource share one) | 344 |
| LSRD archive page | the LSRD page the entry was published on | 344 |

The link is chosen in the order listed under `Link is`. Counts (release
2026-11-10): same 283, same (archived copy) 41, successor 10, equivalent 9,
no link found 1 (2000-03, which has only a page describing it). 296 of the
302 live links have a verified Wayback backup. Every URL in the sheet is one
of the compiled archive's published (verified) links.

**To sever: delete this folder.** The compiled archive is unaffected.

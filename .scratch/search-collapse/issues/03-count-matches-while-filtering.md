# 03: Count matches while filtering

Category: bug
Status: done
Parent: [Honour a collapse made during a search](../spec.md)

**What to build:** While a search, category, or outcome filter is active, every category row (roots
included, open or collapsed) and every preparation band states its count as matches ("1 match",
"3 matches") instead of entries, in both its visible text and its accessible name, so a filtered
count never reads as the size of the whole group. Browsing wording and visibility are unchanged.

**Blocked by:** 01.

## Acceptance criteria

- [x] While filtering, every rendered category row shows its match count, including roots and open
  rows, and its accessible name reads like "Tea, level 2, 1 match".
- [x] While filtering, every band shows its match count and its accessible name reads like
  "Smoked Fish, 3 matches".
- [x] Singular and plural are correct for both rows and bands.
- [x] While browsing, nothing changes: a collapsed non-root row shows its chip and "N entries"; open
  and root rows show no category count; bands show "N entries"; accessible names are unchanged.
- [x] A bare scope change is not filtering and keeps "entries" wording.
- [x] Page tests cover visible text and accessible names for a root, a nested row, and a band, in
  both wordings.
- [x] Playwright scenarios whose count or accessible-name assertions under a filter now read matches
  are adjusted, e.g. "reveals a searched entry that sits inside a collapsed group" asserts
  "Cheese, level 2, 1 match", and the ticket 01 scenario asserts "1 match" on Drinks.
- [x] Coverage stays at 100% and every Playwright scenario passes.

## Comments

- 2026-09-25: Implemented and merged into `main` as ee6a57f; every acceptance criterion met, coverage at 100%, and all 79 Playwright scenarios pass.

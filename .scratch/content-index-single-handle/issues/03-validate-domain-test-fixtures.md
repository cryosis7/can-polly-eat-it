# 03: Build every domain test's index from validated fixtures

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Every domain and component test that builds a content index does so through the
test-support helper, so every fixture passes validation. Minimal fixtures become complete, valid
content, including the foods, guidance lists, and statuses they reference. Domain function
signatures do not change in this ticket; tests still call them as today, passing the new index where
an index is expected.

**Blocked by:** 02.

## Acceptance criteria

- [x] No domain or component test calls the two-argument index constructor.
- [x] Every fixture passes validation. A fixture is fixed only by adding or correcting records; no
  assertion is removed, loosened, or rewritten to fit.
- [x] Any fixture that cannot be made valid without changing what it asserts is flagged in this
  ticket's comments for a product decision rather than altered.
- [x] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `9953052`.
- Tests over unedited real content use the application's `contentIndex`; tests over fixtures or
  edited content build theirs with `buildContentIndex`, so every fixture now passes validation.
- Fixtures fixed by adding or correcting records only:
  - `assessment.test.ts`: fixtures now carry the foods their assessments name, both guidance lists,
    and a `raw` preparation.
  - `filtering.test.ts`: the alternative list gets its own slug, since validation rejects a
    duplicate.
  - `categoryPreparationGuidance.test.ts`: the three shellfish assessments name `nzfs`, since the
    dual-source list requires attribution.
- One fixture needed a judgement call, recorded here rather than flagged: "never accumulates an
  assessment authored in another guidance list" had an additive food assessment with nothing in
  its own list to add to, which validation rejects. It now also has a raw-only rule on the root in
  the same list, and the food declares `raw`. That rule sits on another axis, so the
  preparation-free resolution under test still returns only the food's own layer. The assertion is
  unchanged.
- No fixture had to be flagged for a product decision.
- Two tests still resolve subjects that are deliberately absent from a valid index (the orphan food
  and category, and one food placed under two parents). The index content is valid, so they stay.
- The 1,000-level deep tree still validates quickly (~1 s for the file).

# 01: Pin current behaviour before the content index refactor

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** A safety net that fails if the refactor changes anything a reader sees. Two ordering
rules the refactor moves are currently unasserted: a food's preparation sections follow the
preparation vocabulary order, not the order the food declares them in (every real food already
declares them in vocabulary order, so real content cannot catch a regression), and guidance lists
render in authored order even when the URL names scopes in another order (parsed scopes keep URL
order; pages rely on filtering the authored lists). Beyond those, no test pins the outline of every
real detail page. This ticket changes no application code and passes on today's code.

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [x] A fixture food that declares its preparation states out of vocabulary order renders its
  preparation sections, and any group-rule sections, in vocabulary order on food detail.
- [x] A URL naming scopes out of authored order renders guidance lists in authored order on food
  detail, category detail, and the catalogue.
- [x] A characterisation test records a normalised outline (heading order, the status label under
  each heading, and link targets) of every real food detail page and every assessed category detail
  page under the default scopes, plus the default catalogue, and compares it with a committed
  snapshot generated before ticket 02.
- [x] The snapshot is deterministic across runs and platforms, and a deliberate reorder of a
  preparation or guidance list makes it fail.
- [x] Coverage stays at 100% and the Playwright scenarios pass unmodified.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `9491309`. Tests are in `src/app/preparationOrder.test.tsx`,
  `src/app/guidanceListOrder.test.tsx` and `src/app/contentOutline.test.tsx`, with the snapshot in
  `src/app/__snapshots__/`. No application code changed.
- Every test renders through `<App />` at a pushed URL, so it survives pages taking the index as a
  prop. The preparation fixture uses `vi.mock` on `src/data/foods` and `src/data/preparations`
  (anchovy and barracouta declare out of order, and the vocabulary array is reversed), and asserts
  that the edits took effect.
- The outline covers every category, not only assessed ones (unassessed categories render
  "Category not found"), so the refactor cannot change which categories count as assessed. It also
  records the catalogue with categories expanded and with preparation bands expanded, because the
  default view collapses everything below the root groups.
- Each ordering assertion was checked against a matching temporary regression and failed. Reversing
  the guidance lists failed 203 snapshots; swapping the raw and smoked `sortOrder` failed 45.
- Known limit: the catalogue list-order test still passes if rendering follows URL scope order,
  because the catalogue rewrites its URL to authored order first. It pins what readers see; the
  food and category detail tests catch the internal regression.

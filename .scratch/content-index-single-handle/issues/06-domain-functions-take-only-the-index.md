# 06: Domain functions take only the content index

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Filtering of foods and guide entries, the catalogue and guide-entry row
derivations, and guidance resolution take the content index plus their own inputs, with no raw
content arrays. The assessment lookup is an index method. Pages read preparation vocabulary order and
the preparation states per category from the index, so the vocabulary sort exists once. Until the
subject-guidance spec lands, category detail finds its axes by filtering the guide-entry rows
derived from the index. Readers see no change.

**Blocked by:** 03, 04.

## Acceptance criteria

- [x] No domain function interface takes a raw foods, categories, assessments, preparations,
  guidance-list, or sources array alongside the index.
- [x] The preparation vocabulary is sorted in one place, and preparation states per category are
  derived in one place; food detail, category detail, and the catalogue all read them from the index.
- [x] Validation's additive-assessment check uses the index's assessment lookup; its rejection and
  acceptance cases pass unchanged.
- [x] Row derivations stay in the tree module; the catalogue view spec absorbs them later.
- [x] Resolution and filtering behaviour is unchanged, including per-row outcome filtering, AND
  across scopes, and category filters covering the descendant subtree.
- [x] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `dfec1da`. Ticket 04 had already moved filtering and the row derivations
  (`filterFoods`, `filterCategoryEntries`, `catalogueRows`, `categoryEntryRows`, `rowsByCategoryId`,
  and `entryRowsByCategoryId`) onto the index, with category detail filtering the guide-entry rows.
- `preparationIdsByCategoryId` is gone from the tree module. The index derives each category's states
  privately by filtering its sorted vocabulary, so the only vocabulary sort is in `createContentIndex`.
  Food detail, category detail, and the catalogue read `index.preparations` and `preparationStatesFor`.
- Resolution (`assessment.ts`) and validation's additive check use `index.assessmentsFor`.
  Validation now builds a full index with the single-argument constructor once only assessments are
  unchecked. It asserts the brand on its own parsed content first. Deriving states by filtering the
  vocabulary means an unknown preparation qualifier can no longer throw during that build, so
  validation still reports it in its own words. The rejection and acceptance cases pass unchanged.
- Pulled forward from ticket 07, because nothing called them any more and coverage would otherwise
  drop below 100%: the free `findAssessments` and the two-argument `createContentIndex` overload are
  deleted. `scripts/snapshotPreF18.ts` now reads the application's `contentIndex`.
- The four tree-module tests for the derivation moved to the index. The index suite already had
  equivalents for three of them (union in vocabulary order, a state carried only by a category
  assessment, and no dimension for foods declaring nothing). The fourth, a grouping appearing
  when a food is added, is ported to `contentIndex.test.ts`. The paua grouping case in
  `categoryPreparationGuidance.test.ts` now asks the index.

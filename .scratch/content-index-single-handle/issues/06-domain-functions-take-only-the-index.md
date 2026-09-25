# 06: Domain functions take only the content index

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Filtering of foods and guide entries, the catalogue and guide-entry row
derivations, and guidance resolution take the content index plus their own inputs, with no raw
content arrays. The assessment lookup is an index method. Pages read preparation vocabulary order and
the preparation states per category from the index, so the vocabulary sort exists once. Until the
subject-guidance spec lands, category detail finds its axes by filtering the guide-entry rows
derived from the index. Readers see no change.

**Blocked by:** 03, 04.

## Acceptance criteria

- [ ] No domain function interface takes a raw foods, categories, assessments, preparations,
  guidance-list, or sources array alongside the index.
- [ ] The preparation vocabulary is sorted in one place, and preparation states per category are
  derived in one place; food detail, category detail, and the catalogue all read them from the index.
- [ ] Validation's additive-assessment check uses the index's assessment lookup; its rejection and
  acceptance cases pass unchanged.
- [ ] Row derivations stay in the tree module; the catalogue view spec absorbs them later.
- [ ] Resolution and filtering behaviour is unchanged, including per-row outcome filtering, AND
  across scopes, and category filters covering the descendant subtree.
- [ ] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

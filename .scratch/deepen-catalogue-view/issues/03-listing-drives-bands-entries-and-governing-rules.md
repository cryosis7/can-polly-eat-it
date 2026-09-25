# 03: The listing drives bands, entries, and governing rules

Category: enhancement
Status: ready-for-agent
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** Each section the listing returns now carries its own unqualified guide entry, its
foods declaring no preparation, and its preparation bands in vocabulary order. Each band carries its
key, collapsed state, count, chip, governing rules (only for lists where an assessment was found),
whether the category holds its own entry for that preparation, and its foods. Every entry and
governing rule carries resolved guidance per selected list, in index order. The page renders
entirely from the listing and never calls resolution. Readers see no change.

**Blocked by:** 02.

## Acceptance criteria

- [ ] Sections return the own entry, foods declaring no preparation, and bands, all omitted or empty
  while the section is collapsed; band foods are empty while the band is collapsed.
- [ ] Band order follows the preparation vocabulary; food order is editorial.
- [ ] Governing rules resolve the band's category for that preparation, may come from an ancestor,
  and exist only for lists with an assessment.
- [ ] The page makes one listing call per render, builds hrefs, accessible names, and indentation
  itself, and imports no resolution, filtering, tree, or summary helper for derivation.
- [ ] Remaining derivation tests move to listing tests by the split rule (for example "drops a
  parent band whose rule its descendants already state", "shows orange juice once", "groups the food
  under each preparation"); "calls out the governing rule on the band and names the scope it was
  authored at" splits into a listing assertion and one rendering check.
- [ ] Page-level guidance-list ordering tests move to the listing where they assert order.
- [ ] "Not-assessed is neutral" and "never infer safety" are asserted directly on the listing.
- [ ] Coverage stays at 100% and every Playwright scenario passes unmodified.

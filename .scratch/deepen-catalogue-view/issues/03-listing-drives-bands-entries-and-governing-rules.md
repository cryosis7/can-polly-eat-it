# 03: The listing drives bands, entries, and governing rules

Category: enhancement
Status: done
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** Each section the listing returns now carries its own unqualified guide entry, its
foods declaring no preparation, and its preparation bands in vocabulary order. Each band carries its
key, collapsed state, count, chip, governing rules (only for lists where an assessment was found),
whether the category holds its own entry for that preparation, and its foods. Every entry and
governing rule carries resolved guidance per selected list, in index order. The page renders
entirely from the listing and never calls resolution. Readers see no change.

**Blocked by:** 02.

## Acceptance criteria

- [x] Sections return the own entry, foods declaring no preparation, and bands, all omitted or empty
  while the section is collapsed; band foods are empty while the band is collapsed.
- [x] Band order follows the preparation vocabulary; food order is editorial.
- [x] Governing rules resolve the band's category for that preparation, may come from an ancestor,
  and exist only for lists with an assessment.
- [x] The page makes one listing call per render, builds hrefs, accessible names, and indentation
  itself, and imports no resolution, filtering, tree, or summary helper for derivation.
- [x] Remaining derivation tests move to listing tests by the split rule (for example "drops a
  parent band whose rule its descendants already state", "shows orange juice once", "groups the food
  under each preparation"); "calls out the governing rule on the band and names the scope it was
  authored at" splits into a listing assertion and one rendering check.
- [x] Page-level guidance-list ordering tests move to the listing where they assert order.
- [x] "Not-assessed is neutral" and "never infer safety" are asserted directly on the listing.
- [x] Coverage stays at 100% and every Playwright scenario passes unmodified.

## Comments

- 2026-09-25: Implemented and merged into `main` as 84d48e6; every acceptance criterion met, coverage at 100%, and all 79 Playwright scenarios pass. Each listed row is now resolved once per selected list, and that one resolution both renders and folds into chips, where the page used to resolve every row twice; a band holding its own entry reuses that entry's resolution as its governing rule. A collapsed band keeps its governing rules and count and empties only its foods, as the spec's sketch has it. Seven more page tests moved to the listing. "Calls out the governing rule on the band and names the scope it was authored at", "renders a preparation grouping for a category holding qualified guidance and no foods", and "renders a category with no preparation dimension exactly as before" stay on the page as rendering checks, with their derivation now asserted on the listing. The App-level catalogue test in `guidanceListOrder.test.tsx` stays as the one guidance-list order rendering check. Follow-up db0b8fb gives the 1,000-level listing test the slow-test timeout, because validating its fixture overran the default under the coverage run.

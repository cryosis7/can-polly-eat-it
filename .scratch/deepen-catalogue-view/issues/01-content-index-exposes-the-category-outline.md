# 01: The content index exposes the category outline

Category: enhancement
Status: done
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** The prefactor. The content index gains a precomputed, query-independent
**category outline**: every category in editorial depth-first order with its breadcrumb and depth,
built once with the index. The catalogue's category filter control and its existing derivation read
the outline instead of flattening the tree on each render. Readers see no change.

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [x] The index exposes the category outline as a read-only collection in editorial depth-first
  order, each item carrying its category, breadcrumb, depth, and ancestor IDs.
- [x] The outline is built iteratively once per index, with no depth limit; a deep-tree test proves
  no stack overflow.
- [x] The category filter options and the page's current derivation read the outline; the page no
  longer flattens the tree itself.
- [x] The outline is tested through the index interface with small fixtures.
- [x] Coverage stays at 100% and every Playwright scenario passes unmodified.

## Comments

- 2026-09-25: Implemented and merged into `main` as 6469b61; every acceptance criterion met, coverage at 100%, and all 79 Playwright scenarios pass. The outline is built by a private builder inside the content index, so `flattenCategoryRows` and its `CategoryDisplayRow` type (with the unused `hasChildCategories`) were removed here rather than in ticket 04; the visibility and ancestor-retention helpers now take outline entries.

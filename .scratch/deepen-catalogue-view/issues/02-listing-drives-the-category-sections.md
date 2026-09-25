# 02: The listing drives the category sections

Category: enhancement
Status: ready-for-agent
Parent: [Deepen the catalogue listing](../spec.md)

**What to build:** The tracer bullet. A new domain catalogue listing takes the content index, the
domain filter state, and the collapse state, and returns the flat, depth-first category sections
the catalogue renders: which sections appear (matched content and its ancestors, with entries
already stated by a descendant band dropped), each section's breadcrumb, depth, collapsed state,
entry or match count, and aggregate chip, plus the top-level result count, `filtering` flag, and
selected guidance lists in index order. The page renders its category headings, chips, counts, and
result count from the listing. Readers see no change.

**Blocked by:** 01, and every ticket of [Honour a collapse made during a search](../../search-collapse/spec.md).

## Acceptance criteria

- [ ] The listing is one function over index, filters, and collapse state, importing no React,
  router, or browser modules.
- [ ] It applies the collapse-state module's rule internally; a chip is returned only on a collapsed,
  non-root section while not filtering.
- [ ] Sections are flat and depth-first in editorial order; the outcome fold stays deepest-first and
  iterative.
- [ ] The result count counts food rows and category entry rows after the surfacing drop, from the
  same derivation as the sections.
- [ ] Selected guidance lists come back in the index's order whatever the input order.
- [ ] The page renders headings, chips, counts, and the result count from the listing and picks
  "entry" or "match" wording from `filtering`; it still derives bands and foods itself for now.
- [ ] Page tests that assert which sections, counts, or chip outcomes exist (for example "renders
  every ancestor heading", "never chips a root category", "summarises a category holding one
  dissenting food as mixed", "lets a second scope change the summary", "counts matched category
  entries alongside foods") move to listing tests; mixed tests split, keeping one rendering check.
- [ ] Coverage stays at 100% and every Playwright scenario passes unmodified.

# 05: URL query helpers take the content index

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Parsing and building the catalogue query, parsing the preparation slug, and
choosing default scopes take the content index in place of guidance-list arrays, category slug sets,
and preparation arrays. Pages stop building slug sets to pass in. The shareable URL contract is
unchanged.

**Blocked by:** 04.

## Acceptance criteria

- [x] The URL helpers take the index and no raw content arrays or slug sets; slug checks use the
  index's slug lookups.
- [x] Unknown scope, category, and preparation slugs are still dropped and announced exactly as
  today; default scopes and the canonical scope order of a built query are unchanged.
- [x] No page builds a slug set or a slug map.
- [x] The URL helper tests build a small index through the test-support helper and keep every
  existing case.
- [x] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `7dc38d7`.
- `defaultScopeSlugs(index)`, `parseCatalogueQuery(searchParams, index)`,
  `buildCatalogueQuery(state, index)`, and `parsePreparationSlug(searchParams, index)`. Scope, category,
  and preparation checks use `guidanceListBySlug`, `categoryBySlug`, and `preparationBySlug`. The
  canonical scope order still follows `index.guidanceLists`, which is authored order.
- No page builds a slug set or slug map. The catalogue's remaining `Set` and `Map` values hold UI
  state such as collapsed IDs and row groups, not content lookups.
- `catalogueQuery.test.ts` builds a small index with `buildContentIndex`. It holds the authored
  guidance lists and their sources, one `dairy` category, and one `raw` preparation. The
  alternative-list cases build their own index from those lists. Every existing case is kept.

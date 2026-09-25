# 04: Pages and guidance rendering read only the content index

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The app shell passes the application's content index to the catalogue, food
detail, and category detail routes, and those pages and the guidance components take the index in
place of raw content. Detail pages stop rebuilding an index on every render. Guidance rendering finds
sources and reason-link target foods through index lookups rather than array scans. Page and
component tests build their index through the test-support helper, so content they edit is
validated. Readers see no change.

**Blocked by:** 02.

## Acceptance criteria

- [ ] No page or guidance component takes raw content as a prop, and no page builds an index.
- [ ] Pages resolve foods and categories from URL slugs through the index's slug lookups, and still
  show "Food not found" and "Category not found" (including a known but unassessed category).
- [ ] Source names, dissent notices, and reason-link targets come from index ID lookups.
- [ ] Guidance lists still render in authored order regardless of scope order in the URL.
- [ ] Page and component tests that edit real content build their index through the helper; fixture
  edits follow ticket 03's rule of adding records rather than loosening assertions.
- [ ] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

# 05: URL query helpers take the content index

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Parsing and building the catalogue query, parsing the preparation slug, and
choosing default scopes take the content index in place of guidance-list arrays, category slug sets,
and preparation arrays. Pages stop building slug sets to pass in. The shareable URL contract is
unchanged.

**Blocked by:** 04.

## Acceptance criteria

- [ ] The URL helpers take the index and no raw content arrays or slug sets; slug checks use the
  index's slug lookups.
- [ ] Unknown scope, category, and preparation slugs are still dropped and announced exactly as
  today; default scopes and the canonical scope order of a built query are unchanged.
- [ ] No page builds a slug set or a slug map.
- [ ] The URL helper tests build a small index through the test-support helper and keep every
  existing case.
- [ ] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass
  unmodified.

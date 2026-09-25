# 03: Build every domain test's index from validated fixtures

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** Every domain and component test that builds a content index does so through the
test-support helper, so every fixture passes validation. Minimal fixtures become complete, valid
content, including the foods, guidance lists, and statuses they reference. Domain function
signatures do not change in this ticket; tests still call them as today, passing the new index where
an index is expected.

**Blocked by:** 02.

## Acceptance criteria

- [ ] No domain or component test calls the two-argument index constructor.
- [ ] Every fixture passes validation. A fixture is fixed only by adding or correcting records; no
  assertion is removed, loosened, or rewritten to fit.
- [ ] Any fixture that cannot be made valid without changing what it asserts is flagged in this
  ticket's comments for a product decision rather than altered.
- [ ] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass.

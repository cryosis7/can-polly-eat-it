# 07: Retire the old index surface and forbid raw content imports

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The contract step. With every caller migrated, the old index surface is removed
and a lint rule stops raw content from becoming a second handle again. After this ticket the content
index is the only way application code reaches content.

**Blocked by:** 05, 06.

## Acceptance criteria

- [ ] The two-argument index constructor, the public assessment grouping and assessed-category
  fields, and the free assessment-lookup function are gone; the subject-key format is private.
- [ ] No page or component builds its own lookup map over content.
- [ ] A lint rule forbids importing raw content from the data entry point anywhere except the data
  entry point, test support, and test files, at any relative import depth; the rule is proven by a
  deliberate violation failing lint.
- [ ] Lint, type-check, the production build, coverage at 100%, and the Playwright scenarios all
  pass; ticket 01's tests pass unchanged.
- [ ] A subagent runs the `prepare` skill before the spec moves to `Done`.

# 02: Build one validated content index for the application

Category: enhancement
Status: ready-for-agent
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The expand step. The content index gains its full interface beside its current
fields, so every existing caller keeps compiling and behaving the same. Validation returns a branded
validated-content type and the index constructor accepts only that type. The data entry point builds
the application's one index at module load and exports it next to the validated raw content. A
test-support helper builds a validated index from a partial fixture by filling missing collections
with empty defaults.

**Blocked by:** 01.

## Acceptance criteria

- [ ] Validation returns the branded validated-content type; the index constructor rejects unbranded
  content at compile time. Validation may keep its own internal index over partly validated content.
- [ ] The index exposes read-only collections in authored order (foods, categories, guidance lists,
  sources) and preparations in vocabulary order, sorted once.
- [ ] ID lookups for foods, categories, sources, and preparations return the entity and throw on an
  unknown ID; slug lookups for foods, categories, guidance lists, and preparations return the entity
  or nothing.
- [ ] The index answers the assessments for a guidance list, subject, and optional preparation, the
  preparation states in play for a category (union of its foods' declared states and its own
  preparation-qualified assessments, in vocabulary order), and whether a category is assessed.
- [ ] The current public fields and the two-argument constructor remain, so no caller changes.
- [ ] The new interface is tested through its methods with small fixtures built by the helper, not
  by inspecting internal maps; the tree is still built iteratively with no depth limit.
- [ ] The index imports no React, router, or browser modules.
- [ ] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass.

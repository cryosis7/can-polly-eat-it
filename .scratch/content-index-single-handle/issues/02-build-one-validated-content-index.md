# 02: Build one validated content index for the application

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The expand step. The content index gains its full interface beside its current
fields, so every existing caller keeps compiling and behaving the same. Validation returns a branded
validated-content type and the index constructor accepts only that type. The data entry point builds
the application's one index at module load and exports it next to the validated raw content. A
test-support helper builds a validated index from a partial fixture by filling missing collections
with empty defaults.

**Blocked by:** 01.

## Acceptance criteria

- [x] Validation returns the branded validated-content type; the index constructor rejects unbranded
  content at compile time. Validation may keep its own internal index over partly validated content.
- [x] The index exposes read-only collections in authored order (foods, categories, guidance lists,
  sources) and preparations in vocabulary order, sorted once.
- [x] ID lookups for foods, categories, sources, and preparations return the entity and throw on an
  unknown ID; slug lookups for foods, categories, guidance lists, and preparations return the entity
  or nothing.
- [x] The index answers the assessments for a guidance list, subject, and optional preparation, the
  preparation states in play for a category (union of its foods' declared states and its own
  preparation-qualified assessments, in vocabulary order), and whether a category is assessed.
- [x] The current public fields and the two-argument constructor remain, so no caller changes.
- [x] The new interface is tested through its methods with small fixtures built by the helper, not
  by inspecting internal maps; the tree is still built iteratively with no depth limit.
- [x] The index imports no React, router, or browser modules.
- [x] Coverage stays at 100%, ticket 01's tests pass unchanged, and the Playwright scenarios pass.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `deb38a0` (commits `fd0625d` and `deb38a0`). No caller changed.
- `createContentIndex(content: ValidatedContent)` is an overload beside the legacy
  `createContentIndex(categories, assessments)`, which builds with empty foods, preparations,
  sources, and lists. Its new methods answer as though that content were empty, so migrated callers
  must not use a legacy-built index. Ticket 07 deletes that overload.
- New methods: `foodById`, `categoryById`, `sourceById`, `preparationById` (throw on a miss);
  `foodBySlug`, `categoryBySlug`, `guidanceListBySlug`, `preparationBySlug`; `assessmentsFor`;
  `preparationStatesFor` (returns `Preparation` objects); `isCategoryAssessed`. `findAssessments` now
  delegates to `assessmentsFor`.
- `src/data/index.ts` exports `contentIndex` and exports `content` as unbranded `ContentData`, so
  spreading and editing real content cannot build an index without revalidating.
- Test helper: `buildContentIndex(partial)` in `src/test/buildContentIndex.ts`.
- Left for later tickets: `preparationStatesFor` still derives its states through `categoryTree`'s
  `preparationIdsByCategoryId`, which sorts the vocabulary again. Ticket 06 moves that derivation
  into the index. Validation still uses the two-argument overload, so ticket 07 needs a
  validation-internal path before deleting it. Building the full index there fails today, because an
  unknown preparation would throw before validation can give its own message.
- The compile-time brand check is an `@ts-expect-error` in `contentIndex.test.ts`. Only `tsc -b`
  (`typecheck` and `build`) enforces it; the pre-commit hook does not.

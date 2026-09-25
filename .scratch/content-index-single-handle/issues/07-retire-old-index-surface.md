# 07: Retire the old index surface and forbid raw content imports

Category: enhancement
Status: done
Parent: [Make the content index the one handle on content](../spec.md)

**What to build:** The contract step. With every caller migrated, the old index surface is removed
and a lint rule stops raw content from becoming a second handle again. After this ticket the content
index is the only way application code reaches content.

**Blocked by:** 05, 06.

## Acceptance criteria

- [x] The two-argument index constructor, the public assessment grouping and assessed-category
  fields, and the free assessment-lookup function are gone; the subject-key format is private.
- [x] No page or component builds its own lookup map over content.
- [x] A lint rule forbids importing raw content from the data entry point anywhere except the data
  entry point, test support, and test files, at any relative import depth; the rule is proven by a
  deliberate violation failing lint.
- [x] Lint, type-check, the production build, coverage at 100%, and the Playwright scenarios all
  pass; ticket 01's tests pass unchanged.
- [x] A subagent runs the `prepare` skill before the spec moves to `Done`.

## Comments

### 2026-09-25 - Implemented

- Merged into `main` as `fcd97c3`. Ticket 06 had already deleted the two-argument constructor and
  the free `findAssessments`.
- `assessmentsBySubjectKey` and `assessedCategoryIds` are no longer on `ContentIndex`, and `subjectKey`
  is private to `contentIndex.ts`. Validation's uniqueness check keys the subject with
  `JSON.stringify(assessment.subject)` rather than reusing the index's private format.
- No page or component builds a lookup map over content. The catalogue's remaining `Set` and `Map`
  values hold UI state.
- `eslint.config.js` adds `no-restricted-imports`: `content` may not be imported from any
  `(../)*` or `./` path to `data`, `src/data`, or `data/index`, except in `src/data/index.ts`,
  `src/test/**`, `*.test.ts(x)`, and `e2e/**`. It was proven with temporary probe files, which
  were deleted afterwards. These failed lint: `src/lintProbe.ts` (`import * as data from './data'`),
  `src/app/lintProbe.ts` (`'../data'`), `src/features/catalogue/lintProbe.ts` (`'../../data/index'`),
  and `scripts/lintProbe.ts` (`export { content } from '../src/data'`). An import of `contentIndex`
  from `'../data'` passed.
- Lint, `tsc -b`, `npm run build`, coverage at 100%, and all 78 Playwright scenarios pass. Ticket
  01's tests, their snapshot, and the Playwright specs are unchanged since `9491309`.
- A subagent ran the `prepare` skill over `ea3a652..fcd97c3`. There were no dependency changes and
  no documentation drift, and no ADR is needed because the spec records none. It found no blockers.

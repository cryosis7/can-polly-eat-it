# Make the content index the one handle on content

Category: enhancement
Status: done
Feature: [F-01: Browse the food guide](../../docs/features/01-browse-food-guide.md), [F-04: Maintain trustworthy guidance content](../../docs/features/04-maintain-trustworthy-guidance-content.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 3

> Grilled in a deep-dive on 2026-09-25; decisions are integrated below and summarised under
> Comments.

## Problem Statement

The content index covers only the category tree and assessments. Everything else a caller needs
(foods, preparations, guidance lists, sources, and lookups by ID or slug) is passed as raw arrays
beside it, and each caller rebuilds its own lookups:

- Filtering guide entries takes six parameters, four of them raw content arrays.
- Working out the preparation states for each category takes three raw arrays and re-sorts the
  preparation vocabulary.
- Each page builds its own category-by-slug and preparation-by-ID maps. The detail pages rebuild the
  whole content index on every render.
- Guidance rendering looks up sources and reason-link target foods by linear search on every render.

The content index is shallow: its interface does not hide the content it indexes, so knowledge of
content shape leaks across its seam into every caller.

## Solution

Build the content index once from validated content data and let it own every lookup the domain and
UI need: the category tree, assessments by subject, foods, categories, guidance lists, sources and
preparations by ID and by slug, the preparation vocabulary order, and the preparation states in play
for each category. Domain functions take the index and nothing else from content. Readers see no
change.

## User Stories

1. As a maintainer, I want every domain function that needs content to take the content index, so that I never have to remember which raw arrays to pass alongside it.
2. As a maintainer, I want lookups by ID and slug to come from the index, so that pages stop building their own maps.
3. As a maintainer, I want the preparation vocabulary order computed once in the index, so that there is one definition of that order.
4. As a maintainer, I want the preparation states in play for each category computed once in the index, so that every surface agrees on them.
5. As a maintainer, I want the index built once for the application rather than per page render, so that detail pages do not repeat that work on every render.
6. As a maintainer, I want guidance components to find sources and reason-link target foods through the index, so that rendering does not depend on array scans.
7. As a maintainer writing a test, I want to build one index from a fixture, so that test setup has one entry point.
8. As a maintainer, I want the index built only from validated content, so that its lookups can keep relying on validation guarantees.
9. As a maintainer, I want the index to stay in the domain layer and import no React, router, or browser modules, so that the one-way import rule holds.
10. As a maintainer, I want the filtering, catalogue view, and subject guidance interfaces to shrink to the index plus their own inputs, so that those specs get smaller interfaces.
11. As a maintainer, I want the tree still built iteratively with no depth limit, so that the index respects the accepted catalogue ADR.
12. As a reader, I want every page to look and behave exactly as before, so that the refactor is invisible to me.

## Implementation Decisions

- The existing content index module is widened rather than replaced, so there is still one seam.
- Only validated content can build an index. Validation returns a branded validated-content type, and the index constructor accepts only that type. Validation may keep building its own internal index over partly validated content for the tree walk it already does.
- Interface:
  - Ordered, read-only collections in authored order: foods, categories, guidance lists, sources, and preparations (the last already in vocabulary order, sorted once). The category tree stays exposed with its current shape.
  - Lookup by ID for foods, categories, sources, and preparations returns the entity and throws on an unknown ID, because validated references always resolve and a miss is a programming error.
  - Lookup by slug for foods, categories, guidance lists, and preparations returns the entity or nothing, because slugs come from the URL.
  - Assessments for a guidance list, subject, and optional preparation replace the free `findAssessments` function; the subject-key grouping becomes private.
  - The preparation states in play for a category, and whether a category is assessed, are derived once.
- The data entry point builds the index once at module load and exports it. The app shell passes it to each route as a prop; there is no React context.
- Pages and guidance components receive only the index, never raw content. The data entry point still exports validated raw content for tests to spread and edit; a lint rule forbids importing it outside the data entry point, test support, and test files.
- The URL query helpers (parse and build catalogue query, parse preparation slug, default scopes) take the index in place of guidance-list arrays, category slug sets, and preparation arrays.
- Catalogue and guide-entry row derivations stay in the tree module and take the index rather than raw arrays; the catalogue view spec absorbs them later. Until the subject-guidance spec lands, category detail finds its axes by filtering the guide-entry rows derived from the index.
- Existing callers migrate to the widened interface; raw-array parameters are removed from domain function interfaces.
- Dependency category: in-process.
- No ADR conflicts: content stays static, validated, and client-side. No new ADR: every decision here is cheap to reverse.
- No domain-doc change: the content index is implementation, not domain vocabulary.

## Testing Decisions

- A good test builds an index from a small fixture and asserts lookups and derived orders through the index's interface, not its internal maps.
- The existing content index, category tree, and filtering tests adapt to the new interface. Test fixtures build one index.
- Tests build an index through one test-support helper that fills missing collections with empty defaults and always runs validation. Minimal fixtures must become complete, valid content, including the foods, guidance lists, and statuses they reference; a fixture that cannot pass validation was testing a state production cannot reach.
- Page tests that edit real content spread the exported raw content and build their index through the same helper, so edited content is validated too.
- Prior art: the existing category tree tests, including the deep-tree fixture, and the multi-source fixture.
- Coverage stays at 100% for application source; existing Playwright scenarios pass unchanged.

## Out of Scope

- Changing content shape, schemas, or validation.
- Introducing a runtime content API, cache, or any backend.
- Changing resolution or filtering behaviour.

## Further Notes

- Recommended first of the architecture review specs, because it shrinks the catalogue view and subject guidance interfaces.

## Comments

### 2026-09-25 - Deep-dive

- Decided: pages and guidance components receive only the index; the index exposes ordered collections as well as lookups.
- Decided: a branded validated-content type is the only input the index constructor accepts.
- Decided: the data entry point builds the index once at module load; the app shell passes it as a prop.
- Decided: lookups are methods; ID lookups throw on a miss, slug lookups return nothing; the assessment lookup becomes a method and its key format goes private.
- Decided: the URL query helpers take the index.
- Decided: the index owns preparation vocabulary order and per-category preparation states; row derivations stay in the tree module and take the index.
- Decided: one test-support helper builds a validated index from a partial fixture; raw content stays exported for tests only.
- Decided: a lint rule forbids importing raw content outside the data entry point, test support, and tests.

### 2026-09-25 - Delivered

- All seven tickets are `done`. Implementation merged into `main` through `fcd97c3`: `9953052`
  (03), `d114ac5` (04), `7dc38d7` (05), `dfec1da` (06), and `fcd97c3` (07), after `9491309` (01) and
  `deb38a0` (02).
- Sequencing changed from the ticket split. Ticket 04 took on the domain functions its pages call,
  because the index exposes no assessments collection. Ticket 06 deleted the legacy constructor and
  free lookup once nothing called them.
- One behaviour-neutral change in resolution: `statusBearingAssessments` was removed. Only an invalid
  fixture reached it, and it contradicted the architecture overview. See ticket 04.

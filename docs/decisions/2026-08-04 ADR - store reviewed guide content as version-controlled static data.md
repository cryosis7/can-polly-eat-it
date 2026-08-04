# 2026-08-04 ADR: Store Reviewed Guide Content as Version-Controlled Static Data

**Status:** Accepted
**Date:** 2026-08-04
**Deciders:** Project owner (requester)

## Context and Problem Statement

The initial guide needs trustworthy, reviewed pregnancy food-safety content with conditions, source
citations, review dates, explicit coverage, and source-version evidence. The first release has a
small catalogue, one maintainer, no accounts, and no need to publish content independently from an
application release. The storage approach must make every safety outcome auditable, distinguish
in-scope unassessed food from uncovered food, preserve alternative guidance scenarios, and prevent
overdue or broken records from reaching users.

## Considered Options

- Typed, version-controlled static data parsed with Zod 4 during development and CI.
- A headless CMS and runtime content API.
- A custom database, administrative API, and editing interface.

## Decision Outcome

Chosen option: "typed, version-controlled static data with Zod 4 validation", because data changes
remain reviewable alongside their tests, static deployment remains sufficient, and the validation
contract can reject unsafe or incomplete editorial records before release.

### Consequences

- Good, because every assessment, condition, citation, and review date is visible in a code review.
- Good, because the application works without a content API, credentials, or runtime database.
- Good, because schema validation catches orphaned records, invalid statuses, missing citations,
  invalid coverage, and overdue review dates.
- Bad, because publishing updated guidance requires a build and deployment.
- Bad, because non-technical editorial collaboration is not supported until a future CMS decision.

## Decision Drivers

- MPI guidance must be manually reviewed, not scraped or inferred.
- The catalogue is small and changes infrequently enough for repository review.
- The product must retain source URL, locator, accessed date, source-version evidence, coverage
  declaration, verification date, review due date, and assessment review date.
- The application must not store personal information or content-management credentials.

## Pros and Cons of the Options

### Typed, version-controlled static data with Zod 4 validation

- Good, because it pairs human review with programmatic validation at the same revision.
- Good, because it can be bundled into the SPA and served by any static host.
- Bad, because a source change cannot appear until a maintainer commits and deploys it.

### Headless CMS and runtime content API

- Good, because authorised editors could publish changes without an application deployment.
- Bad, because it introduces vendor selection, access control, runtime availability, content
  migration, and deployment complexity before the product needs them.

### Custom database, administrative API, and editing interface

- Good, because it can be tailored to future workflows.
- Bad, because it is the highest-cost option and creates security and maintenance obligations
  unrelated to the first user-facing guide.

## Implementation Plan

- **Affected paths:** `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/data/categories.*`, `src/data/foods.*`, `src/data/guidanceLists.*`,
  `src/data/assessments.*`, `src/data/sources.*`, and content validation tests.
- **Pattern to follow:** A list declares its all-catalogue or explicit category/food coverage,
  source-version evidence, verification/review-due dates, and citation. Treat every guidance
  scenario's prose instruction as authoritative; preserve alternative scenarios and ordered
  conditions. Optional facts retain a display value only and must not generate advice. Every
  assessment has exactly one `foodId`/`guidanceListId` pair, a non-fallback status owned by that
  list, an ISO review date, and at least one citation containing title, HTTPS URL, locator, and
  access date. Use a human-reviewed paraphrase rather than copying or scraping source text.
- **Tests:** Parse the complete data set; assert reference integrity, unique assessment pairs,
  valid ISO dates, allowed status IDs, valid citation URLs/locators, coverage resolution,
  non-overdue review dates, tree validity, mutually exclusive and chained scenarios, and a small
  rendered fixture for every status/condition kind.

## Confirmation

- [ ] All published categories, foods, lists, assessments, conditions, and citations parse through
  Zod 4 schemas.
- [ ] Validation fails for a missing citation, invalid/overdue date, invalid coverage, dangling
  reference, duplicate food/list assessment, invalid status/list pairing, or fallback status on an
  assessment.
- [ ] Each list records source-version evidence, verification date, and review due date.
- [ ] An uncovered food resolves differently from an in-scope food without an assessment.
- [ ] Every assessment links to an official reviewed source URL and precise locator.
- [ ] The content data has no network fetch, scraping routine, or browser-only mutation path.
- [ ] Continuous integration validates the complete data set before build/deployment.

## More Information

The initial source baseline is MPI's [Food and pregnancy](https://www.mpi.govt.nz/food-safety-home/food-pregnancy)
and [List of safe food in pregnancy](https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy)
guidance. This ADR governs Feature 04,
[`docs/features/04-maintain-trustworthy-guidance-content.md`](../features/04-maintain-trustworthy-guidance-content.md).
A new ADR is required before adding a CMS, database, or automated source ingestion.

# 2026-08-05 ADR: Remove temporal freshness metadata from guidance content

**Status:** Accepted
**Date:** 2026-08-05
**Deciders:** Project owner (requester)

## Context and Problem Statement

The static content contract currently requires access, source-version, verification, and review-due
dates, and rejects a list when its review date passes. The maintainer has determined that the
guide's dietary-suitability content does not change often enough to justify maintaining those dates.
Source links must remain available in the app so every guidance claim remains traceable.

## Considered Options

- Retain access, source-version, verification, and review-due metadata with overdue validation.
- Exempt only the vegetarian-suitability list from temporal metadata.
- Remove temporal freshness metadata and overdue validation from all guidance lists while retaining
  source title, HTTPS URL, and exact locator.

## Decision Outcome

Chosen option: "remove temporal freshness metadata and overdue validation from all guidance lists
while retaining source title, HTTPS URL, and exact locator", because it removes recurring editorial
overhead without removing the user's ability to find the source of each guidance claim.

### Consequences

- Good, because content no longer fails validation solely because a calendar date passes.
- Good, because source citations remain directly navigable and precisely located.
- Bad, because content freshness becomes a manual maintainer responsibility rather than an enforced
  validation check.

## Decision Drivers

- Dietary-suitability conclusions are not expected to change quickly.
- The app must continue to provide direct, precise source links.
- The existing client-only, version-controlled static-data model remains unchanged.

## Pros and Cons of the Options

### Retain temporal freshness metadata and overdue validation

- Good, because it prompts periodic source review.
- Bad, because it creates the date-maintenance overhead the maintainer wants to remove.

### Exempt only the vegetarian-suitability list

- Good, because it limits the immediate schema change.
- Bad, because it creates inconsistent content requirements across guidance lists.

### Remove temporal metadata while retaining source citations

- Good, because all lists have one simpler content contract and remain source-traceable.
- Bad, because maintainers must independently decide when a source requires review.

## Implementation Plan

- **Affected paths:** `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/domain/contentValidation.test.ts`, `src/data/guidanceLists.ts`,
  `src/data/assessments.ts`, `docs/architecture/overview.md`,
  `docs/implementation-plan.md`, `docs/features/04-maintain-trustworthy-guidance-content.md`, and
  `.github/copilot-instructions.md`.
- **Pattern to follow:** `SourceCitation` retains a title, HTTPS URL, and exact locator. Coverage
  declarations retain their explicit scope and source citations but have no temporal fields. Remove
  date parsing and overdue validation; retain all non-temporal validation.
- **Tests:** Run the content-validation tests and complete coverage suite. Validation must still
  reject invalid references, status ownership, fallback usage, coverage, and citations while valid
  date-free content parses.

## Confirmation

- [x] Guidance-list coverage declarations do not contain source-version, verification, or review-due
  fields.
- [x] Source citations do not contain access dates but retain title, HTTPS URL, and exact locator.
- [x] The content validator has no temporal freshness or overdue-review checks.
- [x] Current content validates while preserving traceable citations.
- [x] Repository documentation describes the date-free content contract.

## More Information

This decision partially supersedes the temporal provenance and freshness requirements in
[2026-08-04 ADR: Store Reviewed Guide Content as Version-Controlled Static Data](<2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>).
It does not change the independent-guidance-list model, content citations, or manual review
requirement. The 2026-08-07 single not-assessed state ADR later removed coverage declarations.

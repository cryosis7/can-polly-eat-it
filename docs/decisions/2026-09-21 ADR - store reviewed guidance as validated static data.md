# 2026-09-21 ADR: store reviewed guidance as validated static data

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

Health guidance must be reviewable, attributable, and invalid states must fail before users can see
them. The catalogue is maintained by a small team and does not need content to publish independently
from the application.

## Considered Options

- Typed, version-controlled TypeScript records validated with Zod.
- A headless CMS with a runtime content API.
- A custom database and editorial application.

## Decision Outcome

Chosen option: "typed, version-controlled TypeScript records validated with Zod", because content,
schema changes, and tests can be reviewed together while the application remains entirely static.

`src/data/` contains authored categories, foods, preparations, guidance lists, sources, and
assessments. `src/domain/schemas.ts` defines their types and shapes, and
`src/domain/contentValidation.ts` validates schemas and cross-record relationships before the data
is exported to the application.

Source material is manually reviewed and paraphrased. Citations use HTTPS URLs and precise locators
when the owning guidance list requires them. The records deliberately carry no review-due or other
temporal freshness metadata: maintainers update guidance when a source changes rather than treating
an elapsed date as evidence that content is wrong.

### Consequences

- Good, because each published claim has an inspectable data and test diff.
- Good, because invalid references, status ownership, source attribution, and citation requirements
  fail locally before rendering.
- Bad, because maintainers need code-review skills and a deployment for each content update.
- Bad, because a future non-technical editorial workflow would require a new decision.

## Implementation Plan

- **Affected paths:** `src/data/`, `src/domain/schemas.ts`, `src/domain/contentValidation.ts`, and
  content/domain rendering tests.
- **Pattern to follow:** Keep authored records declarative; put validation, derivation, search, and
  filtering in `src/domain/`; never scrape, infer, or mutate health guidance at runtime.
- **Tests:** Parse the complete dataset and exercise every relationship invariant and visible
  content outcome changed by an edit.

## Confirmation

- [x] All published content parses through the Zod schemas.
- [x] Relationship validation rejects dangling, duplicate, cyclic, misattributed, or uncited
  records according to the owning list's policy.
- [x] Authored guidance remains data rather than JSX or filtering logic.
- [x] No scraper, live content request, CMS, or database participates in rendering.

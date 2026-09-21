# 2026-09-21 ADR: permit review-gated AI guidance drafting

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

Turning a credible source into schema-valid catalogue and assessment records is repetitive, but
automatically publishing interpreted health guidance would bypass the product's provenance and
human-review requirements.

## Considered Options

- Let a repository skill prepare a local draft from a maintainer-supplied credible source, then
  require human review.
- Let AI produce evidence and a plan but make every data edit manually.
- Automatically ingest and publish source-derived guidance.

## Decision Outcome

Chosen option: "let a repository skill prepare a local draft from a maintainer-supplied credible
source, then require human review", because it reduces transcription work without delegating the
health judgement or publication decision.

The `ai-guidance-list-curation` skill may read the supplied HTTPS URL and same-domain pages linked
directly from it. If the live source is inaccessible, it may use a saved snapshot of that same URL,
must cite the canonical URL, and must disclose the snapshot in its review packet. It may prepare
local static-data and focused test changes. It must preserve the shared catalogue, independent
guidance lists, exact citation locators, source attribution, and neutral treatment of uncertainty.

The skill must stop before commit, merge, publication, or deployment. It flags inaccessible,
ambiguous, incomplete, brand-dependent, conditional, or unsupported material instead of inferring a
favourable assessment. A maintainer reviews every proposed status, paraphrase, scenario, citation,
and unresolved item.

### Consequences

- Good, because maintainers receive a concrete, validated draft rather than a transcription plan.
- Good, because the source evidence and local diff remain inspectable before any guidance changes.
- Bad, because a knowledgeable human must still verify every claim.
- Bad, because missing evidence or ambiguous sources block drafting rather than producing a
  convenient fallback.

## Implementation Plan

- **Affected paths:** `.agents/skills/ai-guidance-list-curation/`, `src/data/`, and focused domain,
  rendering, and browser tests for each draft.
- **Pattern to follow:** Start only from a maintainer-supplied source and declared list purpose;
  draft ordinary repository changes; report evidence and uncertainty; never commit or publish.
- **Tests:** Validate the skill structure, the complete content dataset, changed domain/rendering
  behaviour, and any affected Playwright journey.

## Confirmation

- [x] The skill limits retrieval to the supplied source, its directly linked same-domain pages, and
  a disclosed saved snapshot of the same URL when the live page is inaccessible.
- [x] Every proposed claim is traceable to source evidence and an exact locator.
- [x] Unsupported or ambiguous guidance is blocked or escalated rather than inferred.
- [x] Human review remains mandatory before the draft can be committed or published.

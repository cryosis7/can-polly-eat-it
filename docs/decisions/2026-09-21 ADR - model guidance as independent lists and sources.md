# 2026-09-21 ADR: model guidance as independent lists and sources

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

A food can have different outcomes for pregnancy safety, vegetarian suitability, and future
perspectives. Each perspective can also rely on several authorities that agree or disagree. A single
global status or context-specific fields on `Food` cannot preserve those meanings.

## Considered Options

- Independent guidance lists with list-owned statuses, citation policy, and attributed source
  assessments over one catalogue.
- One global RAG status plus special-purpose fields on each food.
- Separate catalogues for every guidance perspective or source.

## Decision Outcome

Chosen option: "independent guidance lists with list-owned statuses, citation policy, and attributed
source assessments over one catalogue", because catalogue identity stays stable while every
perspective retains its own words, evidence rules, and authorities.

Each guidance list owns its statuses, generic outcome-band mapping, neutral fallback, unassessed
notice, source set, and either a required or optional citation policy. A citation-optional list must
state its evidentiary basis. An assessment is keyed by subject, optional preparation, guidance list,
and optional source. Multi-source lists attribute every assessment; single-source and no-source
lists may rely on list-level attribution. A matching source ID is valid but redundant in a
single-source list; a no-source list cannot name one.

The catalogue selects pregnancy food safety and vegetarian suitability when a URL carries no scope.
Selected scopes are cumulative constraints, while selected generic outcome bands are alternatives
within every selected scope. This comparison never replaces list-owned wording or statuses.

Reason links may explain that one food contains, derives from, or is made with another canonical
food, but they never determine either food's status.

### Consequences

- Good, because adding a perspective or source does not change the food schema or duplicate the
  catalogue.
- Good, because UI and filtering can preserve list-specific language while comparing generic
  outcome bands.
- Bad, because every resolver and view must carry explicit list and source context.
- Bad, because list/source uniqueness and attribution rules require cross-record validation.

## Implementation Plan

- **Affected paths:** `src/data/guidanceLists.ts`, `src/data/sources.ts`,
  `src/data/assessments.ts`, `src/data/teaAssessments.ts`, `src/domain/schemas.ts`,
  `src/domain/contentValidation.ts`, and guidance components.
- **Pattern to follow:** Add list-specific assessments, not fields on `Food`; preserve status,
  wording, scenarios, conditions, citations, and source attribution as one authored layer.
- **Tests:** List/status ownership, source attribution, citation policy, reason links, and
  multi-source agreement and disagreement rendering.

## Confirmation

- [x] Pregnancy and vegetarian guidance share one food catalogue.
- [x] Every status belongs to exactly one guidance list and maps to a generic outcome band.
- [x] Multi-source assessments carry explicit attribution and source positions remain visible.
- [x] Reason links explain authored guidance without inferring an outcome.

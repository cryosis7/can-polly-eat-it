# 2026-09-21 ADR: resolve guidance conservatively without inference

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

The guide combines food-level and category-level assessments, preparation-specific rules, and
several sources. Resolution must never manufacture reassurance, hide a relevant authored rule, or
blend statements into advice no authority gave.

## Considered Options

- Resolve explicit assessments nearest-subject-first, preserve authored layers whole, and use a
  neutral fallback.
- Merge all matching statuses and text into one generated answer.
- Infer missing outcomes from sibling foods, ingredient links, or unassessed ancestors.

## Decision Outcome

Chosen option: "resolve explicit assessments nearest-subject-first, preserve authored layers whole,
and use a neutral fallback", because safe health guidance depends on provenance and silence is not
evidence of safety.

Resolution runs independently for food-wide guidance and each preparation. On each axis, use the
food's own assessment, otherwise the nearest assessed ancestor in the same list, otherwise the
list's neutral `not-assessed` state. `not-assessed` is never authored on an assessment and never
means safe.

An assessment replaces inherited guidance unless it explicitly declares `relation: "adds-to"`.
Additive resolution retains whole attributed layers, broadest first, through the first replacing
ancestor. Never merge statuses, summaries, scenarios, conditions, citations, subject levels,
preparation states, guidance lists, or source positions into new advice.

When sources disagree, the most cautious authored generic outcome governs the chip and filtering,
while every source's complete position remains visible and the dissent is stated in words. A source
that did not assess the subject is silent.

Collapsed-row summaries are display-only folds over already resolved generic outcomes. They are
never persisted or presented as a list-owned status, and no chip is shown for a filtered subset.

### Consequences

- Good, because every displayed instruction remains attributable to its authored subject and source.
- Good, because missing or conflicting guidance cannot accidentally appear favourable.
- Bad, because the UI may show several layers or competing source positions instead of one short
  synthetic answer.
- Bad, because resolver and validation logic must enforce separate axes and additive constraints.

## Implementation Plan

- **Affected paths:** `src/domain/assessment.ts`, `src/domain/collapsedRowSummary.ts`,
  `src/domain/filtering.ts`, `src/components/GuidanceLayers.tsx`,
  `src/components/GuidanceSection.tsx`, `src/components/DissentNotice.tsx`, and catalogue/detail
  pages.
- **Pattern to follow:** Resolve only authored records; carry origin, source, status, and body
  together; use generic outcomes only for filtering and display summaries.
- **Tests:** Nearest-subject inheritance, additive layers, preparation axes, fallback neutrality,
  multi-source disagreement, wording preservation, and collapsed-row summaries.

## Confirmation

- [x] Missing guidance resolves to neutral not-assessed and never to a favourable status.
- [x] Food, category, preparation, source, and list boundaries remain explicit in resolved output.
- [x] All resolved layers render wherever guidance is shown.
- [x] Disagreement uses the most cautious authored outcome without hiding any source's words.

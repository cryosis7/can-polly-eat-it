# 2026-08-25 ADR: Author a declined judgement as its own guidance status

**Status:** Accepted
**Date:** 2026-08-25
**Deciders:** Scott Dacre-Curtis

## Context and Problem Statement

Curating tea guidance brought three new sources into `pregnancy-food-safety`. One of them, the
American Pregnancy Association, does not reach a verdict on several herbs: it rates them
"insufficient reliable information available" and tells the reader to ask their midwife or doctor.

The list's four statuses had no way to say that. The nearest was `Only with conditions`, whose
authored wording is "the guide says this food is okay to eat only when its conditions are met" — a
sentence that promises conditions the source never stated, and turns a refusal to judge into
qualified permission. This is health guidance, so putting a verdict in an authority's mouth is the
failure mode that matters most; the guide's standing rule is that a status is never inferred.

## Considered Options

- **A — Flatten it.** Author the declined judgement as `Only with conditions`, keeping four statuses.
- **B — A fifth status, amber.** Add `pregnancy-insufficient-evidence`, labelled `Not enough
  evidence`, amber-toned, mapped to the `maybe` outcome band.
- **C — A fifth status, grey.** The same status and band, grey-toned so it reads as "nobody knows"
  rather than "conditions apply".

## Decision Outcome

Chosen option: **B — a fifth status, amber**, because it lets the source say what it actually said
while leaving both fixed vocabularies untouched, and because grey must go on meaning exactly one
thing.

A status is list-owned data; the four generic outcome bands are fixed in code and shared by every
list. `StatusDefinition.outcomeBand` is a many-to-one mapping, so a list may hold two statuses in one
band. This decision uses that latitude and adds nothing to the generic model: no new tone, no new
band, no code change — one record in `pregnancy-food-safety.statuses`.

C was rejected on the specific ground the mockup was built to test. Grey is the tone of the
`not-assessed` fallback, and the guide leans on that meaning being unambiguous: `not-assessed` says
*we have not looked*, and must never be read as safe. A second grey saying *we looked and the
evidence is not there* puts two different meanings behind one colour a few rows apart in the same
browse group, and blurs the one distinction the fallback exists to protect. Being counted as a
caution while looking like the neutral fallback also sets tone against band.

A was rejected because it is the only option that misstates a source.

### Consequences

- Good, because a source that declines to judge is now shown as declining, and the guide stops
  attributing a conditional verdict to an authority that reached none.
- Good, because it costs no code: tone stays constrained to four colours, the outcome bands stay
  fixed at four values, and the generic-outcome-filters and collapsed-row ADRs are unaffected.
- Good, because grey keeps its single meaning, so `Not assessed` still reads unambiguously as "not
  looked at yet".
- Bad, because `maybe` now holds two pregnancy statuses, so the outcome filter cannot separate "there
  are conditions you can meet" from "nobody knows". Only the authored words distinguish them, and a
  reader scanning chips rather than reading will not see a difference.
- Bad, because the term enters `pregnancy-food-safety` for every food, not only tea, on the strength
  of three entries using it today.

## Decision Drivers

- Never infer or misattribute a status; a source that declines to judge has not judged.
- `not-assessed` is a neutral fallback that never implies safety, so the grey tone must not blur.
- Statuses are list-owned authored data, and the generic bands are fixed; a content problem should be
  solved in data rather than by widening the shared model.
- Filtering precision is worth less than truthfulness in attribution.

## Implementation Plan

Already implemented; this ADR records the decision rather than scheduling it.

- **Affected paths**: [`src/data/guidanceLists.ts`](../../src/data/guidanceLists.ts) declares the
  status; [`src/data/teaAssessments.ts`](../../src/data/teaAssessments.ts) authors it onto the three
  assessments that use it.
- **Pattern to follow**: author `pregnancy-insufficient-evidence` only where a source states in its
  own words that the evidence is insufficient or unavailable. It is not a substitute for
  `not-assessed`, which stays reserved for a subject no source has addressed, and it must never be
  used to soften a source that did reach a verdict.
- **Tests**: [`src/domain/teaGuidance.test.ts`](../../src/domain/teaGuidance.test.ts) covers
  resolution and the never-authored fallback;
  [`src/components/teaRendering.test.tsx`](../../src/components/teaRendering.test.tsx) and
  [`e2e/tea-guidance.spec.ts`](../../e2e/tea-guidance.spec.ts) cover rendering and the dissent
  notice.

## Confirmation

Walked against the authored content on 2026-08-25, at the point the decision was accepted.

- [x] `pregnancy-food-safety` declares five statuses, and `unassessedStatusId` still names
      `pregnancy-not-assessed`.
- [x] `pregnancy-insufficient-evidence` has `tone: 'amber'` and `outcomeBand: 'maybe'`.
- [x] `grey` is the tone of exactly one status per guidance list, the fallback. Holds for
      `vegetarian-suitability` too, so the rule that rejected the grey option binds the whole guide.
- [x] The `outcomeBand` enum in `src/domain/schemas.ts` is unchanged at four values.
- [x] No assessment authors the list's `unassessedStatusId`.
- [x] Every assessment using the new status cites a source whose wording states that the evidence is
      insufficient. Three uses, all the American Pregnancy Association, on chamomile, dandelion and
      rose hip.

## More Information

- Constrained by [2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>),
  whose fixed band vocabulary this decision deliberately does not widen.
- Constrained by [2026-08-07 ADR: resolve unassessed guidance from a single not-assessed state](<2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>),
  which is why option C's second grey chip was rejected.
- Sits alongside [2026-08-08 ADR: model guidance sources as attributed peers within a guidance list](<2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>),
  which supplies the disagreement handling the tea sources needed.
- Curated under [2026-08-05 ADR: adopt AI-assisted local draft curation for official sources](<2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>).

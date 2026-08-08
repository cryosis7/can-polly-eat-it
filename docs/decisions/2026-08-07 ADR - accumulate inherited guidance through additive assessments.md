# 2026-08-07 ADR: Accumulate inherited guidance through additive assessments

**Status:** Accepted
**Date:** 2026-08-07
**Deciders:** Project owner (requester)

## Context and Problem Statement

The guide resolves a food's guidance nearest-subject-first: its own assessment, else the nearest
assessed ancestor category, else the list's coverage fallback. A food-level assessment is a **total
override**, and
[assess categories as first-class subjects with inherited guidance](<2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>)
states the rule plainly: an inherited assessment is applied whole, and "no two assessments may ever be
blended into advice that no source stated".

That is correct when a specific statement *replaces* a group rule. The MPI pregnancy guide contains a
shape where it is wrong, and the consequence is live in the shipped content today.

Under the source heading `Freshly cooked fish, mussels, oysters, crayfish, scallops, etc`, the guide
states "Cook seafood thoroughly and eat it while hot" (`preparation`, cook above 75°C throughout). A
separate footnote adds, for two named shellfish, "Limit these shellfish to one serving each month"
(`frequency`). The footnote **adds a restriction**; it does not exempt an oyster from being cooked.

Because `bluff-and-pacific-oysters` and `queen-scallops` carry their own assessments, they totally
override the group rule. A reader opening either food today sees the monthly serving limit and **no
cooking instruction at all** — the guide withholds a cited instruction its own source gives for that
food.

Contrast `fresh-filled-pasta`, which the source genuinely carves out of the `Cereals` rule and whose
guidance correctly replaces it. The model can express replacement but has no way to express addition,
so an author's only options are to lose the group instruction or to copy it onto each specific food.

How can the guide present every authored instruction that applies to a food, from more than one
subject level, without merging, rewording, or inferring advice that no source stated?

## Considered Options

- Add an authored `relation` to an assessment declaring whether it **replaces** or **adds to** the
  guidance it inherits, and render accumulated guidance as discrete, separately attributed layers.
- Authored duplication: restate the group's conditions on each specific food record, citing both
  locators. No schema change, no ADR.
- Status quo: accept that a specific assessment hides its group rule.
- Merge inherited conditions into the specific assessment's scenarios at resolution time.

## Decision Outcome

Chosen option: **an authored `relation` field with layered rendering**, because it lets one reviewed
statement be authored and cited once at the level the source scopes it to, while a more specific
statement adds to it without either being reworded or combined — and because the alternative that
needs no code change reintroduces exactly the duplication the guide is currently removing.

The decision has five parts.

### 1. An assessment declares its relation to inherited guidance

`Assessment` gains `relation: 'replaces' | 'adds-to'`, **optional, defaulting to `'replaces'`**.

Every one of the 134 existing assessments is a replacement, so the default preserves current behaviour
byte-for-byte and requires no data edit. Only the safety-relevant direction, `'adds-to'`, must be
written explicitly. The relation is authored from the source's own structure and is **never inferred**
from condition kinds, wording, or how different two rules appear.

### 2. The nearest authored status always governs

Resolution of a food's **status** is unchanged. The nearest assessment — the food's own, else the
nearest assessed ancestor — supplies the status, whatever its relation. The guide never computes,
blends, or promotes a status, so the chip, outcome band, filtering, and result count behave exactly as
they do today.

This is deliberate. An addition by definition adds a restriction, so its authored status is already at
least as restrictive as what it adds to; a less restrictive addition is incoherent. That coherence is
enforced by validation (part 5) rather than repaired by computation.

Note that "most restrictive" could not be computed from `sortOrder` in any case: the pregnancy list
ascends in severity (`pregnancy-ok` 1, `pregnancy-conditions` 2, `pregnancy-avoid` 3) but the
vegetarian list does not — `vegetarian-animal-derived` is red at `sortOrder` 2 while
`vegetarian-check-ingredients` is amber at `sortOrder` 3. Only the generic `outcomeBand` orders
safely, and the guide uses it for validation, not for display.

### 3. Accumulation walks the full ancestor chain

Starting at the nearest assessment and walking towards the root within one guidance list: collect each
assessment, and **stop at the first assessment whose relation is `'replaces'`**, including it. A
`'replaces'` assessment terminates the walk; an `'adds-to'` assessment continues it.

Walking only one level would silently drop an authored, cited instruction two levels up — the very
defect this ADR exists to remove. The termination rule mirrors the existing resolver's ancestor walk
and needs no depth constant.

### 4. Accumulated guidance renders as cumulative layers, never merged conditions

The resolver returns an ordered list of **layers**, broadest ancestor first, ending with the nearest
assessment. Each layer keeps its own assessment intact: its own scenarios, summary, scope statement,
and citations.

Merging conditions into scenarios is explicitly rejected. Guidance scenarios are **mutually exclusive
alternatives**, so splicing an addition into them forces it to be duplicated across every alternative
and can produce contradictions — an "eat within one day" condition spliced into a "throw them away"
scenario. Layering keeps each authored scenario untouched.

Two headings carry the semantics: layers are introduced as **"all of the following apply"**, while a
layer holding more than one scenario introduces them as **"Follow whichever applies"**.

### 5. Validation enforces coherence

- An `'adds-to'` assessment with no ancestor assessment in the same guidance list **fails validation**,
  because such a record would silently behave as a replacement.
- An `'adds-to'` assessment whose `outcomeBand` is **less restrictive** than the assessment it adds to
  (`okay` < `maybe` < `not-okay`) **fails validation**.
- Accumulation never crosses guidance lists, and the existing rules on `scopeStatement` ownership,
  subject uniqueness, coverage containment, and citation policy are unchanged.

### Consequences

- Good, because `Bluff and Pacific oysters` and `Queen scallops` will show the cooking instruction the
  source states for them, closing a live safety gap.
- Good, because a group rule stays authored and cited once, at the level the source scopes it to, so a
  source correction remains a one-line diff.
- Good, because status, filtering, counting, and the URL contract are untouched, which keeps the blast
  radius inside the guidance body and its rendering.
- Good, because the default preserves every existing record's behaviour, so the change is additive and
  no content migration is forced.
- Good, because every displayed instruction remains a verbatim authored statement with its own
  citation and locator; nothing is merged, reworded, or synthesised.
- Bad, because a food's guidance can now come from several records, so a reviewer must read the
  rendered result rather than a single record to know what a reader will see.
- Bad, because it amends an accepted ADR's total-override rule, and the boundary between *authored
  accumulation of cited statements* and *forbidden blending* now has to be understood by every future
  author and agent.
- Bad, because the browse view shows only one summary, so an accumulated food needs an explicit marker
  or its catalogue entry understates its guidance.
- Bad, because `GuidanceSection` gains a nesting level, taking scenario applicability headings to `h6`.

## Decision Drivers

- The guide must never withhold an instruction its cited source gives for a food.
- The guide must never display advice, or a status, that no source stated.
- A group rule should be authored and cited once, not copied onto each member food.
- Existing content must not change behaviour as a side effect of enabling a new capability.
- Guidance scenarios are mutually exclusive alternatives, and that invariant must survive.
- Suitability stays list-specific: accumulation never crosses guidance lists.
- The application is unreleased, so schema shapes can change without migration.

## Pros and Cons of the Options

### Authored `relation` with layered rendering

- Good, because the source's own structure — group claim plus footnote — is represented directly.
- Good, because provenance survives: each layer shows its own scope statement, source, and locator.
- Good, because it is opt-in and defaults to today's behaviour.
- Bad, because it adds a resolver concept, a rendering mode, and two validation rules.
- Bad, because it makes it possible to author a long accumulation that no reviewer assessed as a whole.

### Authored duplication

- Good, because it needs no schema change, no resolver change, and no ADR; the current schema already
  permits many conditions and many citations on one assessment.
- Good, because it could fix the two affected records immediately.
- Bad, because it reintroduces precisely the duplication that
  [F-12](../features/12-lift-group-guidance-onto-categories.md) exists to remove, and a later source
  correction would have to be applied to the category and every copy, with silent drift if missed.
- Bad, because it forces an author to write a new combined summary sentence covering two source
  statements, which is new prose rather than a paraphrase of one reviewed claim.

### Status quo

- Good, because it is free and the merge prohibition stays absolute.
- Bad, because the guide knowingly withholds cited safety guidance from a pregnant reader.

### Merge inherited conditions into the specific assessment's scenarios

- Good, because a reader sees one flat list of instructions with no new layout concept.
- Bad, because scenarios are alternatives, so the addition must be duplicated into each one and can
  contradict it, producing advice no source stated.
- Bad, because the merged scenario is no longer any source's authored statement, which is the outcome
  the existing ADR forbids.

## Implementation Plan

- **Affected paths**: `src/domain/schemas.ts`, `src/domain/assessment.ts`,
  `src/domain/contentValidation.ts`, `src/components/GuidanceSection.tsx`,
  `src/components/GuideEntrySummary.tsx`, `src/data/assessments.ts`, `src/data/categories.ts`,
  `src/data/foods.ts`, and their tests plus `e2e/`.

- **Schema**: add `relation: z.enum(['replaces', 'adds-to']).optional()` to `assessmentSchema`. Treat
  an absent value as `'replaces'` at every read site; do not backfill the 134 existing records.

- **Resolver**: extend `ResolvedAssessment` with an ordered `layers` array, broadest ancestor first
  and ending with the nearest assessment:

  ```ts
  export type GuidanceLayer = { assessment: Assessment, origin: AssessmentOrigin }
  export type ResolvedAssessment = {
    status: StatusDefinition          // unchanged: from the nearest assessment
    assessment?: Assessment           // unchanged: the nearest assessment
    origin: AssessmentOrigin          // unchanged
    layers: GuidanceLayer[]           // length 1 unless accumulating
  }
  ```

  After locating the nearest assessment as today, continue walking ancestors only while the collected
  assessment's relation is `'adds-to'`, stopping at and including the first `'replaces'`. A
  coverage-fallback resolution yields an empty `layers` array. The walk stays iterative with no depth
  constant, and `src/domain/` must not import React, router, or browser modules.

- **Validation**: in `validateAssessments`, reject an `'adds-to'` assessment with no same-list ancestor
  assessment, and reject one whose `outcomeBand` is less restrictive than the assessment it adds to,
  ordering `okay` < `maybe` < `not-okay`.

- **Rendering**: `GuidanceSection` renders `layers`. With a single layer the existing markup is
  emitted unchanged, so no current page changes. With more than one, render the
  "all of the following apply" heading and one block per layer carrying the layer's scope statement or
  the food's name, the layer's summary, its scenarios, and its citation; introduce a layer's scenarios
  with "Follow whichever applies" when it has more than one. The `Sources` list aggregates every
  layer's citations, de-duplicated by URL and locator. `GuideEntrySummary` shows a marker that further
  group guidance applies when `layers.length > 1`.

- **Content**: lift the freshly-cooked-seafood group rule onto the `freshly-cooked-seafood` category
  with an authored `scopeStatement`, retire its mirror food record, and set `relation: 'adds-to'` on
  the `bluff-and-pacific-oysters` and `queen-scallops` pregnancy assessments. Confirm the category
  resolves inside the pregnancy list's declared coverage. Extend the `AssessmentSpec` and
  `CategoryAssessmentSpec` helpers in `src/data/assessments.ts` with an optional `relation`. This work
  is deliberately excluded from
  [F-12](../features/12-lift-group-guidance-onto-categories.md) and belongs to
  [F-16](../features/16-express-accumulating-guidance.md).

- **Tests**: `src/domain/assessment.test.ts` for single-layer parity with today, two-layer and
  three-layer accumulation, termination at the first `'replaces'`, no accumulation across guidance
  lists, and `Parmesan` still totally overriding `Hard cheese`.
  `src/domain/contentValidation.test.ts` for both new failure rules.
  `src/components/GuidanceSection` tests, via `FoodDetailPage.test.tsx`, for layered rendering, the
  multi-scenario layer heading, and de-duplicated sources.
  `CataloguePage.test.tsx` for the accumulated-entry marker.
  `e2e/catalogue.spec.ts` for the oysters detail route showing both instructions, and
  `e2e/accessibility.spec.ts` extended to scan it. Repository-wide 100% statements, branches,
  functions, and lines coverage for application source must be retained.

## Confirmation

- [x] `Assessment.relation` exists, is optional, and an absent value behaves exactly as `'replaces'`.
- [ ] No existing assessment record was edited to adopt the new field, and every currently rendered
      page is byte-identical apart from the seafood records this decision migrates.
- [ ] `Bluff and Pacific oysters` and `Queen scallops` each display the cooking instruction and the
      monthly serving limit, each attributed to its own locator.
- [x] `Parmesan` in the vegetarian scope still displays only its own guidance.
- [x] A food's status, outcome band, chip, filtering behaviour, and the announced result count are
      unchanged by accumulation.
- [x] Accumulation stops at the first `'replaces'` assessment and never crosses guidance lists.
- [x] Conditions are never moved between scenarios, and no scenario is rendered with conditions its
      author did not place in it.
- [x] Content validation fails an `'adds-to'` assessment with no same-list ancestor assessment.
- [x] Content validation fails an `'adds-to'` assessment less restrictive than what it adds to.
- [x] A multi-layer food's catalogue entry indicates that further group guidance applies.
- [ ] Every displayed instruction appears verbatim in an authored, cited assessment; none is
      generated, reworded, or combined.
- [ ] WCAG 2.2 AA axe scans pass on the layered detail route with zero violations.

## More Information

This decision **amends**
[2026-08-06 ADR: assess categories as first-class subjects with inherited guidance](<2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>).
That ADR's rule that "a food-level assessment is a total override" and that guidance is never merged
across subject levels remains the **default** and remains the whole of the behaviour for every
assessment that does not opt in. The amendment is narrow: an author may declare that a specific
assessment *adds to* the guidance it inherits, in which case both statements are displayed
side by side, each intact and separately attributed. The prohibition the original rule protects — the
guide presenting advice or a status that no source stated — is preserved, because nothing is merged,
reworded, or computed. Everything else in that ADR stands unchanged: nearest-subject-first resolution,
mandatory `scopeStatement` on category subjects, disclosed provenance, coverage containment, and
assessed categories as guide entries.

It preserves the filtering and counting semantics of
[2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)
exactly, since status resolution is untouched.

It relies on the manual-review requirement in
[2026-08-04 ADR: store reviewed guide content as version-controlled static data](<2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>)
and
[2026-08-05 ADR: adopt AI-assisted local draft curation for official sources](<2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>):
whether a source statement adds to or replaces another is a human reading of the source and must never
be inferred by tooling.

It is implemented by [F-16: Express guidance that accumulates across subject levels](../features/16-express-accumulating-guidance.md),
and its seafood content migration is deliberately excluded from
[F-12](../features/12-lift-group-guidance-onto-categories.md).

### Interaction with the single not-assessed state ADR

[2026-08-07 ADR: resolve unassessed guidance from a single not-assessed state](<2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)
is also `Proposed` and would remove guidance-list coverage declarations and the `outside-coverage`
state. The two decisions are independent and can be accepted in either order:

- No rule in this ADR depends on coverage existing. The two new validation rules concern ancestor
  presence and outcome-band ordering only.
- Where this ADR says coverage containment is "unchanged", that clause simply drops out if coverage is
  removed; nothing here needs to replace it.
- Where the implementation plan asks that the `freshly-cooked-seafood` category resolve inside the
  pregnancy list's declared coverage, that check becomes moot rather than incorrect.
- A coverage-fallback resolution yields an empty `layers` array, and a single not-assessed resolution
  would do the same, so the rendering contract is identical under either decision.

Whichever is accepted second should have this section reconciled rather than its rules revisited.

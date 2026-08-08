# F-17: Support Multiple Sources Within One Guidance List

**Status:** Proposed

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-05: Add Independent Guidance Lists](<05-add-independent-guidance-lists.md>), [F-08: Rework Guidance-Scope Filtering](<08-rework-guidance-scope-filtering.md>), [F-10: Vary Citation Expectations by Guidance List](<10-vary-citation-expectations-by-list.md>), [F-16: Express Guidance That Accumulates Across Subject Levels](<16-express-accumulating-guidance.md>)

**Governing decisions:** [model guidance sources as attributed peers within a guidance list](<../decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>) (Accepted). It amends [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>) (the unique assessment per subject/list pair) and extends [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>). It preserves [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>), [assess categories as first-class subjects](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), and [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>).

## Goal

As Polly, I need to see what *every* reviewed authority says about a food in one pregnancy view, so
that when authorities disagree I can read each position and decide for myself, instead of the guide
quietly showing me one authority's answer as though it were the only one.

## Problem evidence

The guide can hold many guidance lists, but each list can hold only one position per food, and that
position has no stated author. Adding a second pregnancy authority is therefore not a content task
today — it is blocked by four separate mechanisms.

- **A source has no identity.** `sourceCitationSchema` in
  [`src/domain/schemas.ts`](../../src/domain/schemas.ts) is `{ title, url, locator }` — a bare link.
  Nothing in the model records *who* said something. That one source underwrites the whole pregnancy
  list is a convention expressed only in a prose `description` field: "Food-safety guidance for
  pregnancy from New Zealand Food Safety."
- **One verdict per subject is enforced.** `validateAssessments` in
  [`src/domain/contentValidation.ts`](../../src/domain/contentValidation.ts) rejects a duplicate
  `subject:guidanceListId` pair, and `resolveAssessment` in
  [`src/domain/assessment.ts`](../../src/domain/assessment.ts) returns exactly one `status`.
  Disagreement between two authorities is not merely unhandled; it is unrepresentable.
- **The existing accumulation mechanism does not substitute for it.** `relation: 'adds-to'` layers
  guidance *vertically*, up the category ancestry, and is guarded by a restrictiveness check that
  requires an addition to be no less cautious than what it adds to. Two authorities are *horizontal*
  peers at the same subject, with no such ordering between them.
- **The authoring guidance already papers over the gap.** The `ai-guidance-list-curation` skill
  instructs a curator that a `(subject, guidanceListId)` pair "may only be assessed once", so a
  second source's advice must be recorded by citing "the additional locator on the existing
  assessment" — attaching authority B's URL to authority A's sentence — and to stop and ask the
  maintainer when a source is "conflicting". The only two outcomes available today are silent
  attribution drift or a halt.

The interface has begun to reflect the same assumption. `GuideEntrySummary` renders
`citations[0]` as the "Primary source", which already picks a winner from an ordered array with no
authored meaning.

Separately, the content shows why per-source wording would be the wrong default. Most authored
summaries in [`src/data/assessments.ts`](../../src/data/assessments.ts) are the boilerplate
`'The guide lists this food as okay to eat.'`, repeated across many records, while a minority
(`'Eat low-acid soft pasteurised cheese only when it is cooked.'`) carry genuine source-specific
meaning. If two agreeing authorities each restated the boilerplate, the reader would see the same
sentence twice for no reason.

## Primary experience

1. Open a food where NZ and another reviewed authority agree, and see **one** status, **one** piece
   of advice, and both authorities listed as sources beneath it.
2. Open a food where they disagree, and see the more cautious authored status, plus a plainly worded
   note naming the other authority, stating what *it* concluded, and linking to it.
3. See that same disclosure in the catalogue overview, which is the most-used screen — a food where
   one authority says "Avoid" and another says "OK to eat" must not appear as a plain red entry with
   the dissent hidden one click away.
4. Follow either authority's link and read its own words, then decide.
5. Filter by outcome and find the food under its most cautious band, counted once.
6. Browse the vegetarian scope and see no attribution machinery at all, because that list has one
   source and nothing to disclose.

## Required behaviour

### Source identity

- A **source** becomes a first-class authored record with a stable identity, distinct from a
  citation. A citation is a link to a specific passage; a source is the authority that stands behind
  a statement. Provenance is never inferred from the presence, order, or hostname of a citation.
- A guidance list declares its sources. A source may appear in many lists.
- **Attribution is required only where it is ambiguous.** In a list with two or more sources, every
  assessment must name one, and validation fails otherwise. In a list with a single source, or a
  list that stands on its `evidentiaryBasis` rather than a named authority, assessments name no
  source and are authored exactly as they are today.
- A list that gains a second source therefore fails validation until each of its existing records
  states who it came from. Attribution becomes mandatory at precisely the moment it starts to carry
  meaning, rather than a default being silently inherited once it has become wrong.

### Representing agreement and disagreement

- A `(subject, guidanceList)` pair may hold at most one assessment **per source**. The uniqueness
  rule becomes `(subject, guidanceList, source)`.
- A food resolves to **one ordered set of guidance layers**, not one stack per source. Each layer is
  a single authored statement, applied whole, labelled with the source that stated it. This extends
  the layer model F-16 already established across subject levels; it does not add a second structure
  beside it.
- Two sources stating identical text produce **one** layer carrying both names. No statement is ever
  rendered twice because two authorities happen to agree on it.
- `adds-to` accumulation may layer onto an ancestor rule stated by a **different** source. Each
  layer keeps its own source label, scope statement, and citation, so the reader can always see
  which authority stated which instruction.
- The existing restrictiveness guard — an addition may not be less cautious than what it adds to —
  applies **within a source only**. Across sources it would let one authority's caution invalidate
  another authority's authored record, which is a veto rather than a coherence check.
- A source that has not assessed a subject is **silent, not dissenting**. Absence of an assessment
  is never evidence of agreement or disagreement, consistent with the single not-assessed state
  decision. Only sources that actually assessed a subject participate in agreement, disagreement, or
  the resolved status.
- When no source has assessed a subject, the list's existing grey `Not assessed` fallback and its
  `unassessedNotice` are shown exactly as today.

### Which status governs

- Where assessed sources disagree, the **most cautious authored status wins** for the status chip,
  the outcome band, filtering, and the result count. It is selected from the authored statuses, never
  averaged, blended, or synthesised, and no new status is invented.
- Caution is ordered by generic outcome band (`okay` < `maybe` < `not-okay`), reusing the existing
  ordering. It cannot be derived from `sortOrder`, which is list-specific display order.
- A food still resolves to exactly **one** status and one outcome band, so search, filtering, and the
  announced count are structurally unchanged.

### Disclosing disagreement

- **Sources that agree on the status** have their guidance presented as one stacked list of
  attributed layers, introduced as cumulative. Their instructions are complementary, so "all of the
  following apply" is a true statement about them.
- **Sources that disagree on the status** are presented as competing positions, never as one stack.
  Stacking a "cook it thoroughly" rule beneath an "avoid entirely" rule would read as a single
  combined regime that neither authority stated. Each position is shown whole, under its own
  source, so the reader can weigh them and choose.
- Wherever a contested status is shown — catalogue overview included — the guide states in text that
  a named source reached a different conclusion, gives that source's authored status, and links to
  it. Disagreement is never signalled by colour alone, and is never hidden behind a hover or an
  interaction that a keyboard or screen-reader user cannot reach.
- Each position keeps its own summary, scenarios, conditions, and citations, applied whole. Nothing
  is merged across sources, exactly as nothing may be merged across subject levels or lists.

### List-owned wording

- A guidance list owns the canonical wording for each of its statuses, so an assessment that has
  nothing source-specific to say need not restate it. Where an assessment authors no summary, the
  list's wording for its resolved status is displayed.
- A source-specific summary remains authored on the assessment and is attributed to its source. It is
  never rewritten, and never merged with another source's summary.
- This makes collapse honest: agreeing sources show one sentence because it is one authored sentence
  owned by the list, not because two sentences were combined into a third that nobody wrote.

### Sources without links

- Source identity and citation policy stay independent. A source is an authority that can be named;
  a citation is a link to a passage. A list that has no named authority stands on its
  `evidentiaryBasis` and declares no source at all.
- `citationPolicy` remains list-owned and unchanged in meaning. A `required` list must still cite
  every assessment and its unassessed notice; an `optional` list may still author uncited records and
  continues to display its `evidentiaryBasis` once per view. A useful link on an otherwise uncited
  list — such as an explanation of non-vegan fining agents in wine — remains a citation on that one
  assessment and implies nothing about attribution.
- No rendering path may index into a citation array without checking it is non-empty, and no
  per-assessment "no source attached" marker is introduced.

### Not disturbing single-source lists

- A list whose displayed guidance resolves to a single source renders exactly as it does today, with
  no attribution headers, no source-comparison affordance, and no disagreement notice. The vegetarian
  list's presentation and content are unchanged.

### Content and authoring

- **No existing assessment changes.** Both lists are single-source today, so under the attribution
  rule above no pregnancy or vegetarian record needs a source named. The pregnancy list declares New
  Zealand Food Safety as its source; the vegetarian list declares none and keeps its
  `evidentiaryBasis`. Every reviewed status, summary, scenario, condition, and citation is untouched.
- The `ai-guidance-list-curation` skill's one-assessment-per-pair rule and its "stop when the source
  conflicts" instruction are corrected, so a curator records a second authority as its own attributed
  assessment rather than appending a locator to another authority's sentence. This feature updates
  only the rules it invalidates; a broader refresh of that skill is out of scope.

## Non-goals

- **Curating an actual second pregnancy source.** This feature delivers the model, validation, and
  interface, proven with the existing source plus test fixtures for agreement and disagreement. Real
  health guidance is added as separate, reviewed content work.
- Ranking, scoring, or expressing trust in one authority over another. "Most cautious wins" is a
  safety rule, not a judgement about which authority is better.
- Letting a reader disable a source, choose a preferred authority, or persist any such preference.
- A new `contested` outcome band, status tone, or filter. Contested foods filter under their most
  cautious band.
- Synthesising, summarising, or reconciling two authorities' wording into new text.
- Comparing across guidance lists. Pregnancy and vegetarian positions are different questions, not
  disagreement.
- Changing the `v=1` URL contract, the scope/outcome parameters, or the AND/OR filter semantics.
- Re-fetching, re-scraping, or automatically updating any existing source.

## Assumptions and open questions

- **This needs an ADR before implementation.** It changes the assessment key that an accepted ADR
  states as "no more than one assessment per `(foodId, guidanceListId)` pair", and introduces
  provenance as a modelled concept rather than a property of a citation. The ADR must draw the line
  between *selecting* the most cautious authored status, which this feature does, and *computing*
  advice no source stated, which remains forbidden.
  **The ADR is accepted:** [model guidance sources as attributed peers within a guidance list](<../decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>).
  It records the most-cautious-wins rule, the single attributed layer set, and the conditional
  attribution rule. The remaining prerequisite for `Planned` is an approved feature-specific
  implementation plan.
- Deferred to that plan, and recorded by the ADR review: whether identical-text collapse should rely
  on string equality, which is brittle against punctuation and whitespace, or on an authored "these
  are the same statement" link; and whether a source in a multi-source list must carry a `homeUrl`.
- **Resolved:** attribution is mandatory only in a list with two or more sources. A single-source
  list, or one standing on its `evidentiaryBasis`, authors exactly as it does today. The vegetarian
  list's answer to "who says this?" is already declared once per list — "Reflects general vegetarian
  knowledge; sources are attached where a useful one exists" — so stamping a source onto each of its
  records would be ceremony without information. A useful link on a nuanced entry, such as non-vegan
  fining agents in wine, is a **citation** and is already permitted under an `optional` policy.
- **Resolved:** `adds-to` may accumulate onto an ancestor rule stated by a different source, with
  every layer labelled by its own source. A food shows one set of instructions, each referencing
  where it came from, rather than one stack per source — which would render a shared ancestor rule
  twice on the same page.
- **Resolved:** layers stack as one cumulative list only where the sources agree on the status.
  Where they disagree, the positions are shown as competing alternatives, because stacking
  contradictory instructions asserts a combined regime no authority stated.
- **Resolved:** the restrictiveness guard applies within a source only, so one authority cannot
  invalidate another's authored record.
- Open: how a contested entry is worded in the catalogue, where space is tight and the note must
  still name the source and its conclusion. This is a content and interface question for the
  implementation plan, not a model question.
- Open: whether "most cautious wins" needs a tie-break rule when two sources reach the same outcome
  band through differently worded statuses.
- Assumed: two sources agreeing on a status but authoring different bespoke summaries show as one
  status with each summary attributed. Only identical authored text collapses into a single layer.
- The application is unreleased, so schema and data shapes can change without migration concerns.

## Acceptance criteria

- A food assessed by two sources that reach the same status displays one status and one cumulative
  set of attributed layers, with no statement rendered twice.
- A food assessed by two sources that reach different statuses displays the more cautious authored
  status, presents each source's position as a competing alternative rather than one stacked list,
  and states in text which source concluded otherwise, what it concluded, and where to read it — on
  the catalogue overview as well as the detail page.
- A layer inherited from an ancestor rule stated by another source is shown once, labelled with the
  source that stated it.
- No displayed sentence, status, condition, or citation is absent from a single authored,
  attributed assessment. The guide never shows combined text.
- A source that has not assessed a food is not represented as agreeing or disagreeing with anything.
- A food contested between `okay` and `not-okay` appears under the `not-okay` filter, does not appear
  under `okay`, and is counted once.
- Content validation rejects two assessments for the same subject, list, **and** source, and accepts
  two for the same subject and list from different sources.
- Content validation rejects an assessment whose source is unknown, and rejects an unattributed
  assessment in a list that declares two or more sources.
- An assessment in a single-source list validates and renders with no source named, unchanged from
  today.
- A `required`-policy list still fails validation when any assessment or its unassessed notice has no
  citation; an `optional`-policy list still validates with uncited assessments and renders no "no
  source attached" marker.
- The vegetarian scope's rendered output is unchanged, including for `Parmesan` and the hard-cheese
  rule it replaces.
- Every existing pregnancy and vegetarian assessment is unchanged by this feature.
- Disagreement is conveyed without relying on colour, and is reachable by keyboard and screen reader.
- An accepted ADR records the decision, the most-cautious-wins rule, the per-source resolution
  boundary, and how it amends the independent-guidance-lists ADR.

## Validation

Domain unit tests for attributed layer resolution, cross-source `adds-to` accumulation without
duplicate layers, most-cautious selection across disagreeing sources, silence of unassessed sources,
collapse of identical statements from two sources, the within-source restrictiveness guard,
list-owned status wording fallback, and each new validation failure. React Testing Library tests for
the agreement, disagreement, and single-source renderings on both catalogue and food detail,
including the catalogue dissent note. Chromium Playwright coverage for a contested food's detail
route and a filtered URL containing a contested food, plus the existing axe-core WCAG 2.2 AA scans
over both states. Repository-wide 100% statements, branches, functions, and lines coverage for
application source is retained.

Fixtures, not published health content, prove the multi-source behaviour: no real second authority is
curated in this feature.

### Pre-PR `prepare` review

To be run by a subagent after implementation and targeted validation, and before this feature moves
to `Done`. Its findings, or their resolution, are recorded here.

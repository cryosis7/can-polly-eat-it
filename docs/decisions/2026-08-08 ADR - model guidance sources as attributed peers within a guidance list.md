# 2026-08-08 ADR: Model guidance sources as attributed peers within a guidance list

**Status:** Accepted
**Date:** 2026-08-08
**Deciders:** Project owner (requester)

## Context and Problem Statement

The pregnancy guide currently carries one authority: New Zealand Food Safety. That it does so is a
convention, not a modelled fact — it survives only in a prose `description` on the guidance list.

A maintainer who finds a second credible pregnancy authority cannot add it. Four mechanisms block it.
`validateAssessments` rejects a duplicate `(subject, guidanceListId)` pair. `resolveAssessment`
returns exactly one status. `sourceCitationSchema` is `{ title, url, locator }` — a link with no
notion of who stands behind it. And the `ai-guidance-list-curation` skill instructs a curator that a
subject/list pair "may only be assessed once", so a second authority's advice must be recorded by
citing "the additional locator on the existing assessment" — attaching authority B's URL to authority
A's sentence — and to stop and ask the maintainer whenever a source is "conflicting".

So the only two outcomes available today are silent misattribution or a halt. Meanwhile the interface
has already begun to assume single authorship: `GuideEntrySummary` renders `citations[0]` as the
"Primary source", picking a winner from an array whose order carries no authored meaning.

Two authorities frequently agree, and where they agree the reader should see one answer with both
links rather than the same sentence twice. Where they disagree, the guide must not silently choose;
a reader deciding what to eat in pregnancy is entitled to know that another authority reached a
different conclusion, and to read it. How should a guidance list represent more than one authority?

## Considered Options

- Model sources as first-class attributed records inside one guidance list.
- Create a separate guidance list per authority, for example `pregnancy-nzfs` and `pregnancy-nsw`.
- Keep one assessment per subject/list pair and have maintainers merge authorities by hand.

## Decision Outcome

Chosen option: "model sources as first-class attributed records inside one guidance list", because
the reader's question is "what should I know about this food during pregnancy?", not "what does each
authority say?". Selecting the pregnancy scope must surface every authority that covers a food,
without the reader having to know a second scope exists and tick it.

A **source** becomes an authored record with a stable identity, distinct from a citation: a citation
points at a passage, a source is the authority that stands behind a statement. Assessment uniqueness
becomes `(subject, guidanceList, source)`.

A food resolves to **one** ordered set of guidance layers, each labelled with the source that stated
it — not one stack per source. This extends the layer model already established for accumulation
across subject levels rather than adding a second structure beside it. Two sources stating identical
text produce one layer carrying both names, so no statement is rendered twice merely because two
authorities agree.

Where assessed sources reach **different** statuses, the most cautious authored status governs the
chip, outcome band, filtering, and result count, and the dissent is stated in text wherever that
status appears — the catalogue overview included. The status is *selected* from authored statuses;
it is never averaged, blended, or invented.

### Consequences

- Good, because a second pregnancy authority becomes authored content rather than an architectural
  change, and appears automatically under the existing pregnancy scope.
- Good, because "who said this?" becomes a modelled fact instead of an inference from a citation's
  hostname or array position.
- Good, because agreement genuinely collapses: one status, one set of layers, every agreeing source
  credited.
- Good, because disagreement is disclosed rather than resolved on the reader's behalf, while the
  default they act on is still the cautious one.
- Good, because no existing content changes. Both lists are single-source today, so no assessment
  needs editing.
- Bad, because resolution, filtering, and both rendering surfaces must all become source-aware, and
  each needs coverage in agreeing, disagreeing, and single-source states.
- Bad, because "most cautious wins" can present an authority's position as the guide's answer for a
  food that authority never assessed as risky — mitigated by always naming the dissenting source and
  its conclusion alongside the status.
- Bad, because the `ai-guidance-list-curation` skill's authoring rules are now wrong and must be
  corrected, or curators will keep merging authorities into one record.

## Decision Drivers

- The reader's question is scoped to a context (pregnancy), not to an authority.
- Safety asymmetry: showing a cautious answer when an authority was permissive is tolerable; the
  reverse is not.
- Silence is not consent. An authority that never assessed a food must not be represented as
  agreeing with one that did.
- Boilerplate must not multiply. Most authored summaries are the repeated
  `'The guide lists this food as okay to eat.'`, and two agreeing authorities restating it would be
  noise.
- The prohibition on merging statuses, summaries, scenarios, conditions, and citations is a safety
  invariant, not a stylistic one, and must survive this change intact.
- The catalogue overview is the most-used screen, so disclosure cannot live only on detail pages.

## Pros and Cons of the Options

### Attributed sources inside one guidance list

- Good, because one scope selection surfaces every authority covering a food.
- Good, because agreement and disagreement are both expressible, and distinguishable.
- Good, because a list with one source keeps authoring and rendering exactly as it is today.
- Bad, because it changes an assessment key that an accepted ADR fixed, so validation, resolution,
  and rendering all move together.

### A separate guidance list per authority

- Good, because it needs no schema change; the model already supports many lists.
- Bad, because the reader must know a second pregnancy scope exists and select it, so the default
  view silently omits an authority.
- Bad, because agreeing authorities can never collapse — the same advice renders twice, in two
  panels, permanently.
- Bad, because it overloads "guidance list", which exists to separate *questions* (pregnancy versus
  vegetarian), not publishers answering the same question.
- Bad, because scopes are ANDed in filtering, so selecting both authorities would return only foods
  both had assessed.

### Manual merging by maintainers

- Good, because it needs no code change at all.
- Bad, because it is what the tooling currently instructs, and it produces exactly the
  misattribution this ADR exists to prevent: authority B's citation beneath authority A's wording.
- Bad, because genuine disagreement remains unrepresentable, so the maintainer must silently discard
  one authority's position.

## Implementation Plan

- **Affected paths**: `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/domain/contentIndex.ts`, `src/domain/assessment.ts`, `src/domain/filtering.ts`, a new
  `src/data/sources.ts`, `src/data/guidanceLists.ts`, `src/components/GuidanceSection.tsx`,
  `src/components/GuideEntrySummary.tsx`, `.agents/skills/ai-guidance-list-curation/SKILL.md`,
  `docs/architecture/overview.md`, `.github/copilot-instructions.md`, and the corresponding tests.

- **Source records**: add `sourceSchema` as `{ id, slug, name, organisation, homeUrl? }` with unique
  IDs and slugs, and an HTTPS constraint on `homeUrl` where present. A `GuidanceList` declares the
  source IDs it draws on. A list with no named authority declares none and continues to stand on its
  `evidentiaryBasis`.

- **Attribution**: add an optional `sourceId` to `assessmentSchema`. Validation requires it on every
  assessment in a list declaring **two or more** sources, rejects it where the ID is unknown to that
  list, and permits its absence in a single-source or no-source list, where the list supplies the
  attribution. A list that gains a second source therefore fails the build until each record states
  its author — attribution becomes mandatory exactly when it starts to carry meaning.

- **Uniqueness**: change the duplicate check in `validateAssessments` from
  `${subjectKey}:${guidanceListId}` to include the resolved source, and key
  `assessmentsBySubjectKey` in `contentIndex.ts` accordingly so a subject can hold one assessment per
  source. `findAssessment` returns the set of assessments for a subject and list.

- **Resolution**: `resolveAssessment` returns one `status`, one `origin`, and one ordered
  `layers` array in which every layer carries its source. Walk the ancestor chain as today,
  collecting each assessed ancestor regardless of which source assessed it, and stopping at the first
  `replaces` layer. Deduplicate layers whose authored text is identical, merging their source labels.
  An assessment may add to an ancestor rule stated by a different source.

- **Restrictiveness guard**: `validateAdditiveAssessment` compares an addition only against ancestor
  guidance from the **same** source. Across sources the check would let one authority's caution
  invalidate another authority's authored record, which is a veto rather than a coherence check.

- **Status selection**: where assessed sources disagree, select the status whose `outcomeBand` is
  most restrictive using the existing `restrictiveness` ordering (`okay` < `maybe` < `not-okay`).
  Never derive precedence from `sortOrder`, which is list-specific display order — the vegetarian
  list places red at 2 and amber at 3. Sources with no assessment for the subject take no part; when
  none has assessed it, the list's grey `not-assessed` fallback resolves exactly as today.

- **List-owned wording**: add canonical summary wording to `statusDefinitionSchema` and make
  `Assessment.summary` optional, falling back to the resolved status's wording. A source-specific
  summary stays authored on the assessment and is attributed to its source. This is what makes
  collapse honest — agreeing sources show one sentence because it is one authored sentence owned by
  the list, not because two were combined into a third nobody wrote.

- **Rendering**: sources agreeing on status render as one cumulative stack of attributed layers.
  Sources disagreeing on status render as competing positions, never stacked, because stacking a
  "cook it thoroughly" rule beneath an "avoid entirely" rule asserts a combined regime neither
  authority stated. `GuideEntrySummary` must name the dissenting source and its conclusion in text,
  and its `citations[0]` "Primary source" affordance is removed. A list resolving to a single source
  renders with no attribution chrome at all.

- **Content**: no assessment changes. `pregnancy-food-safety` declares New Zealand Food Safety;
  `vegetarian-suitability` declares no source and keeps its `evidentiaryBasis`.

- **Curation skill**: correct the rule that a subject/list pair "may only be assessed once" and the
  instruction to append a locator to an existing assessment, so a second authority is recorded as its
  own attributed assessment. Conflicting sources become authored disagreement rather than a halt. The
  requirement that every AI-drafted record carries a citation is unchanged.

- **Tests**: domain unit tests for attributed layer resolution, cross-source accumulation without
  duplicate layers, identical-text collapse, most-cautious selection, silence of unassessed sources,
  the within-source restrictiveness guard, status-wording fallback, and every new validation failure.
  React Testing Library tests for agreeing, disagreeing, and single-source rendering on both
  catalogue and food detail. Playwright coverage for a contested food's detail route and a filtered
  URL containing one, with the existing axe-core WCAG 2.2 AA scans over both states. The 100%
  coverage gate stays green.

## Confirmation

- [ ] A source is an authored record with its own identity, and no code infers provenance from a
      citation's URL, title, or array position.
- [ ] Two assessments for the same subject, list, and source fail validation; two for the same
      subject and list from different sources validate.
- [ ] An assessment naming a source unknown to its guidance list fails validation.
- [ ] An assessment with no source fails validation in a list declaring two or more sources, and
      validates in a single-source or no-source list.
- [ ] A food renders one ordered set of guidance layers, each labelled with its source, and no
      statement appears twice because two sources agree on it.
- [ ] An `adds-to` assessment may accumulate onto an ancestor rule stated by a different source, and
      the restrictiveness guard compares only same-source guidance.
- [ ] Sources agreeing on a status render as one cumulative stack; sources disagreeing render as
      competing positions.
- [ ] A contested food shows the most cautious authored status, names the dissenting source and its
      conclusion in text on the catalogue overview as well as food detail, and does not rely on
      colour to convey the disagreement.
- [ ] A contested food filters under its most cautious band only, and is counted once.
- [ ] A source that has not assessed a subject is never presented as agreeing or disagreeing.
- [ ] No existing pregnancy or vegetarian assessment is edited, and the vegetarian scope's rendered
      output is unchanged.
- [ ] No rendering path indexes into a citation array without checking it is non-empty, and the
      "Primary source" affordance in `GuideEntrySummary` is gone.
- [ ] The `ai-guidance-list-curation` skill no longer instructs curators to append a second
      authority's locator to an existing assessment.
- [ ] `docs/architecture/overview.md` and `.github/copilot-instructions.md` describe assessments as
      keyed by subject, list, and source.

## More Information

This decision amends
[2026-08-04 ADR: use independent guidance lists for food assessments](<2026-08-04 ADR - use independent guidance lists for food assessments.md>).
Its rule that "each `(foodId, guidanceListId)` pair has no more than one assessment" becomes one
assessment per `(subject, guidanceList, source)`. Everything else in it stands: one shared catalogue,
list-owned status vocabularies, no contextual fields on `Food`, and the grey not-assessed fallback.

It extends
[2026-08-07 ADR: accumulate inherited guidance through additive assessments](<2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>).
Layers gain a source label and may cross sources; the prohibition on merging two authored statements
into a third is unchanged, and the restrictiveness guard is narrowed to same-source comparisons.

It preserves
[2026-08-06 ADR: vary source-citation requirements by guidance list](<2026-08-06 ADR - vary source-citation requirements by guidance list.md>)
unchanged in meaning. Attribution and citation are independent: `citationPolicy` still governs
whether a link is required, while a source records who stands behind a statement. A list with no
named authority still declares an `evidentiaryBasis`.

It preserves
[2026-08-07 ADR: resolve unassessed guidance from a single not-assessed state](<2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>).
An unassessed source is silent; absence of an assessment is never evidence of agreement or
disagreement, and never resolves to anything but the list's grey fallback.

It governs
[F-17: Support multiple sources within one guidance list](<../features/17-support-multiple-sources-per-guidance-list.md>),
which holds the product scope, acceptance criteria, and the reader-facing experience. That feature
deliberately curates no real second authority: it delivers the model, validation, and interface,
proven with fixtures, so that adding a real authority later is reviewed content work.

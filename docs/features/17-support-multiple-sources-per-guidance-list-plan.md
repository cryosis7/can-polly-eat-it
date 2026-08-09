# F-17 Implementation Plan: Support Multiple Sources Within One Guidance List

**Feature:** [F-17](<17-support-multiple-sources-per-guidance-list.md>)
**Status:** Implemented and verified

**Governing decisions:** [model guidance sources as attributed peers within a guidance list](<../decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>), [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>), and [resolve unassessed guidance from a single not-assessed state](<../decisions/2026-08-07 ADR - resolve unassessed guidance from a single not-assessed state.md>)

The accepted ADR settles the model. This plan sequences it and resolves the questions the ADR and the
brief leave to implementation.

## Design decisions settled by this plan

### 1. End-to-end proof is deferred with the content, not faked with demo data

The brief asks for Playwright coverage of a contested food's detail route, but every route is built
from the reviewed records in `src/data/`, and this feature's non-goal forbids curating a real second
authority. Shipping a synthetic contested food would put unreviewed health guidance in front of a
reader, and an e2e-only data injection path would add a second content-loading mechanism that no
accepted ADR supports.

So F-17 proves agreement, disagreement, and single-source rendering with domain and React Testing
Library fixtures. The Playwright scenarios and their axe-core scans for a contested route move to the
later content feature that curates a real second authority, which is when a contested route first
exists. The existing e2e suite gains no new scenarios; two of its assertions are updated because the
catalogue's "Primary source" affordance is removed, which the ADR requires. This supersedes the
corresponding line in the brief's Validation section and the ADR's test note; both are amended by
this plan rather than silently dropped.

### 2. Disagreement is a difference of authored status, not of outcome band

Two sources disagree when their nearest authored `statusId` values differ. Comparing outcome bands
instead would present two differently worded statuses as one agreed position and stack instructions
neither authority stated together. Band ordering decides only which status *governs*, not whether
there is a disagreement to disclose.

### 3. Most-cautious ties break on nearest subject, then on declared source order

Where contested statuses share an outcome band, the governing status is the one authored at the
nearest subject level. Where they are also at the same level, the governing status is that of the
source declared first in the guidance list's `sourceIds`. This is a determinism rule for display, not
a ranking of authorities: both positions are still shown whole and both are named, so nothing is
hidden by the tie-break. It never consults `sortOrder`, which is list-specific display order.

### 4. Identical-statement collapse is exact structural equality, never fuzzy matching

Two layers collapse into one carrying both source names only when their whole authored body is
identical: `summary`, `scopeStatement`, `relation`, and the full `guidanceScenarios`, `conditions`,
and `reasonLinks` structures, compared after trimming whitespace and ignoring `id`, `sourceId`, and
`citations`. Citations are unioned onto the collapsed layer; nothing else is merged.

Near-identical text is treated as two statements and rendered as two layers. Under-collapsing shows a
reader a duplicated sentence; over-collapsing attributes wording to an authority that did not write
it, so the safe failure is the visible one. An authored "these are the same statement" link is not
introduced until real content shows exact equality is insufficient.

### 5. `homeUrl` stays optional, and dissent links prefer the authored citation

A source may be named without a link. The disagreement disclosure links, in order, to the dissenting
assessment's first citation, then to the source's `homeUrl`, then to nothing — naming the source in
text either way. No path indexes into a citation array without checking it is non-empty. The
pregnancy list's `required` citation policy already guarantees a link in practice; the fallbacks exist
so an `optional`-policy list can never crash or render a dangling affordance.

### 6. The contested wording

Both surfaces state the dissent in a full sentence, never by colour or by an interaction:

> New South Wales Health reached a different conclusion: OK to eat. Read New South Wales Health.

The catalogue card uses exactly this sentence, once per dissenting source, beneath the status and
summary. The detail page repeats it as the introduction to the competing positions. It names the
source, states its authored status label verbatim, and links where the reader can read it.

### 7. Attribution chrome follows authored attribution, not how many sources happened to assess a food

A layer names its source whenever the assessment names one, which happens only in a list declaring
two or more sources. So a food that just one authority has assessed, in a two-source list, still says
"Stated by New Zealand Food Safety" — otherwise a reader would take the silence of the other
authority for its agreement, which the ADR explicitly forbids. The guarantee that a single-source
list renders exactly as today therefore attaches to the list, not to the food: both authored lists
declare fewer than two sources, so neither shows any attribution chrome.

## Affected areas

| Area | Change |
| --- | --- |
| `src/domain/schemas.ts` | Add `sourceSchema` (`{ id, slug, name, organisation, homeUrl? }`, HTTPS-constrained). Add `sourceIds` to `guidanceListSchema`, `sourceId` to `assessmentSchema`, and canonical `summary` wording to `statusDefinitionSchema`; make `Assessment.summary` optional. |
| `src/data/sources.ts` | New. Declares New Zealand Food Safety. |
| `src/data/guidanceLists.ts` | `pregnancy-food-safety` declares its source; `vegetarian-suitability` declares none. Both lists gain canonical per-status summary wording. |
| `src/data/index.ts` | Pass `sources` into `validateContent`. |
| `src/domain/contentValidation.ts` | Validate source records, list source references, the conditional attribution rule, the `(subject, list, source)` uniqueness key, and narrow the restrictiveness guard to same-source ancestors. |
| `src/domain/contentIndex.ts` | Key assessments by subject and list to a *list* of assessments; `findAssessments` replaces `findAssessment`. |
| `src/domain/assessment.ts` | Attributed layers, identical-statement collapse, per-source competing positions, most-cautious selection with the tie-break, and the list-owned summary fallback. |
| `src/domain/filtering.ts` | Confirm filtering and counts read the single resolved status only; change only if they do not. |
| `src/components/GuidanceSection.tsx` | Source labels on layers, competing-position rendering, and the dissent sentence. |
| `src/components/GuideEntrySummary.tsx` | The catalogue dissent sentence; remove the `citations[0]` "Primary source" affordance. |
| `.agents/skills/ai-guidance-list-curation/SKILL.md` | Correct the one-assessment-per-pair rule and the append-a-locator instruction. |
| `docs/architecture/overview.md`, `.github/copilot-instructions.md` | Describe assessments as keyed by subject, list, and source. |
| Tests | `contentValidation.test.ts`, `assessment.test.ts`, a new `multiSourceGuidance.test.ts`, `migrationInvariant.test.ts`, `FoodDetailPage.test.tsx`, `CataloguePage.test.tsx`, `filtering.test.ts`. |

No change to the URL contract, the scope/outcome parameters, the AND/OR filter semantics, search, or
`src/app/`. No existing assessment record is edited.

## Resolution model

`resolveAssessment` keeps returning one `status`, one `origin`, and one ordered `layers` array, and
gains `positions`, which is empty unless the subject is contested.

1. Walk from the subject towards the root and stop at the first level holding any assessment for the
   list. Every assessed source at that level yields a position.
2. **Agreeing** (one distinct `statusId`): the merged layer set is built by today's walk, collecting
   each assessed ancestor whatever source stated it, stopping at and including the first `replaces`
   layer. Identical statements collapse per decision 4. `positions` stays empty.
3. **Contested** (more than one distinct `statusId`): `status` is the most cautious authored status by
   outcome band with the decision 3 tie-break, and each position carries its own source, status, and
   layer stack, built by the same walk seeded with that source's nearest assessment. A shared ancestor
   layer is rendered once per position it applies to, labelled with the source that stated it.
4. A source with no assessment for the subject takes no part in any of this. When no source has
   assessed it, the list's grey fallback and `unassessedNotice` resolve exactly as today.

Every layer carries its source or sources. A layer with no `sourceId`, in a single-source or no-source
list, is labelled from the list rather than the assessment, so no attribution chrome appears.

## Constraints

- No existing pregnancy or vegetarian assessment changes, and the vegetarian scope's rendered output
  is byte-identical.
- A list resolving to a single source renders with no attribution chrome, no comparison affordance,
  and no dissent notice.
- Statuses, summaries, scenarios, conditions, and citations are never merged across sources, subject
  levels, or lists. The governing status is selected from authored statuses only.
- The restrictiveness guard compares an addition only against ancestor guidance from the same source.
- `src/domain/` must not import React, router, or browser modules, and the walks stay iterative.
- Disagreement is never conveyed by colour alone and is reachable by keyboard and screen reader.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.

## Tests

Validation, `src/domain/contentValidation.test.ts`:

1. Duplicate source IDs, duplicate slugs, and a non-HTTPS `homeUrl` each fail.
2. A guidance list referencing an unknown source ID fails.
3. Two assessments for the same subject, list, and source fail; two from different sources validate.
4. An assessment naming a source its list does not declare fails.
5. An unattributed assessment fails in a list declaring two or more sources.
6. An unattributed assessment validates in a single-source list and in a no-source list.
7. An `adds-to` assessment fails when no *same-source* ancestor is assessed, and validates when a
   different source's ancestor is more restrictive than it.
8. A `required`-policy list still fails when an assessment or its unassessed notice has no citation;
   an `optional`-policy list still validates uncited assessments.
9. A list whose statuses lack canonical summary wording fails.

Resolution, `src/domain/assessment.test.ts` and `src/domain/multiSourceGuidance.test.ts`:

10. Two sources agreeing on a status resolve to that status, one layer set, and both source names.
11. Two sources authoring identical statements collapse to one layer with both names and both
    citations; differing punctuation or whitespace-normalised-but-unequal text does not collapse.
12. Two sources authoring different summaries under the same status resolve to two attributed layers.
13. Contested sources resolve to the most cautious authored status and one position per source.
14. A contested tie within an outcome band resolves to the nearest subject level, then to declared
    source order.
15. A cross-source `adds-to` layer appears once per position, labelled with the source that stated it.
16. An unassessed source is absent from `positions` and does not make a subject contested.
17. An assessment with no authored summary displays the list's canonical wording for its status.
18. Single-source resolution is unchanged from today, and `positions` is empty.
19. The not-assessed fallback is unchanged and returns empty `layers` and `positions`.

Filtering, `src/domain/filtering.test.ts`:

20. A food contested between `okay` and `not-okay` appears under `not-okay`, not under `okay`, and is
    counted once.

Content, `src/domain/migrationInvariant.test.ts`:

21. Every existing food and category resolves to the same status, layers, and citations as before this
    feature, in both lists.

React Testing Library:

22. `FoodDetailPage.test.tsx`: agreeing sources render one cumulative stack with each layer's source
    named.
23. `FoodDetailPage.test.tsx`: contested sources render competing positions, never one stack, with the
    dissent sentence naming the source, its status label, and a link.
24. `FoodDetailPage.test.tsx`: a single-source list renders no attribution chrome.
25. `CataloguePage.test.tsx`: a contested card shows the most cautious status and the dissent sentence;
    an uncontested card shows neither, and no "Primary source" affordance remains anywhere.
26. `GuideEntrySummary` renders no link when the dissenting assessment has no citation and its source
    has no `homeUrl`.

## Ordered tasks

1. Add `sourceSchema`, `sourceIds`, `sourceId`, and canonical status wording to the schemas; add
   `src/data/sources.ts` and declare each list's sources and status wording. No behaviour change.
2. Move `contentIndex` to per-source assessment lists and update every read site, keeping resolution
   behaviour identical. Confirm test 21 stays green.
3. Add the validation rules and the same-source narrowing of the restrictiveness guard. Add tests 1-9.
4. Extend `resolveAssessment` with attributed layers, identical-statement collapse, competing
   positions, most-cautious selection with the tie-break, and the summary fallback. Add tests 10-19.
5. Confirm filtering and the announced count read only the resolved status. Add test 20.
6. Render source labels, competing positions, and the dissent sentence, and remove the "Primary
   source" affordance. Add tests 22-26.
7. Correct the `ai-guidance-list-curation` skill's authoring rules, and update
   `docs/architecture/overview.md` and `.github/copilot-instructions.md`.
8. Run targeted validation, then the full gates.
9. Pre-merge verification: instruct a subagent to run the `prepare` skill against the branch diff,
   noting the repository has no remote so it reviews the local diff against `main`. Record its
   findings, or their resolution, in the feature brief before F-17 moves to `Done`.

## Validation

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts src/domain/multiSourceGuidance.test.ts src/domain/filtering.test.ts src/domain/migrationInvariant.test.ts src/features/food-detail/FoodDetailPage.test.tsx src/features/catalogue/CataloguePage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e` — no new scenarios; two assertions updated for the removed catalogue
  "Primary source" affordance, including the existing WCAG 2.2 AA axe scans
- `npm run build`

## Risks

- **A silent change to existing guidance.** Mitigation: `sourceId` and `summary` fallbacks are
  optional, no record is edited, and test 21 pins every current resolution before the resolver moves.
- **Over-collapsing two authorities into one sentence.** Mitigation: exact structural equality only,
  with the deliberate bias towards showing two layers.
- **A contested reading that no authority stated.** Mitigation: contested subjects never stack; each
  position is rendered whole under its own source, and the governing status is always an authored one.
- **Multi-source behaviour proven only below the browser.** Accepted, per decision 1: the contested
  Playwright and axe coverage lands with the real second authority, which is when a contested route
  first exists.

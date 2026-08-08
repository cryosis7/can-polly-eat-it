# F-16: Express Guidance That Accumulates Across Subject Levels

**Status:** Done

**Implementation plan:** [F-16 implementation plan](<16-express-accumulating-guidance-plan.md>), approved.

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-09: Assess and Browse Food Categories](<09-assess-and-browse-food-categories.md>)

**Governing decisions:** [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [use independent guidance lists for food assessments](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), and [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>)

## Goal

As Polly, I need a food to show me *every* instruction its source gives about it, so that when a
source states a rule for a whole group and then adds a further restriction for one member of that
group, I am told both rather than only the more specific one.

## Problem evidence

The guide's resolution order treats a food-level assessment as a **total override** of any ancestor
category rule, and an accepted ADR forbids merging: "an inherited assessment is applied whole",
"never merge statuses, summaries, scenarios, conditions, or citations across levels", and "no two
assessments may ever be blended into advice that no source stated".

That rule is correct when the specific assessment *replaces* the group rule. It is wrong when the
source's specific statement *adds to* it, and the MPI pregnancy guide contains exactly that shape.

Under the source's `Freshly cooked fish, mussels, oysters, crayfish, scallops, etc` heading:

| Subject | Rule | Condition kind | Locator |
| --- | --- | --- | --- |
| Freshly cooked seafood | Cook seafood thoroughly and eat it while hot; cook above 75°C throughout | `preparation` | `Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc` |
| Bluff and Pacific oysters | Limit these shellfish to one serving each month | `frequency` | `Seafood footnote: Bluff and Pacific oysters and queen scallops` |
| Queen scallops | Limit these shellfish to one serving each month | `frequency` | `Seafood footnote: Bluff and Pacific oysters and queen scallops` |

The two rules govern different things. A monthly serving limit does not exempt an oyster from being
cooked through, and the source presents the footnote as an addition to the heading it sits under, not
as a carve-out from it. Contrast `Fresh filled pasta`, which the source genuinely carves out of the
cereals rule, and where total override is the right behaviour.

Today both oyster and scallop records carry their own food-level assessment, so a reader sees the
serving limit and no cooking instruction. This is a **live content gap, not a hypothetical**: the
guide currently withholds a cooking instruction that its own source states for those foods.

The gap is currently masked rather than absent. It surfaces wherever a food-level assessment sits
beneath an assessed ancestor, and only one such pair exists today — `parmesan` overriding
`hard-cheese` in the vegetarian list, where total override happens to be correct. As F-12 lifts group
rules onto categories, the number of override pairs rises sharply, and every one of them is a place
this question must be answered correctly.

## Primary experience

1. Open `Bluff and Pacific oysters` and see the monthly serving limit **and** the cooking instruction
   the group rule states.
2. See each instruction attributed to its own source locator, so it is clear which statement is the
   group's and which is specific to this shellfish.
3. Open `Parmesan` in the vegetarian scope and see only its own rule, because that rule replaces the
   hard-cheese rule rather than adding to it.
4. Filter by outcome and see the food counted once, under a single resolved status.

## Required behaviour

- An assessment can be authored to state whether it **replaces** the guidance it inherits or
  **adds to** it. The distinction is authored from the source's own structure and is never inferred
  from condition kinds, wording, or how different two rules happen to look.
- Replacement remains the default. An existing assessment with nothing authored continues to behave
  exactly as it does today, so no current guidance changes silently.
- Where an assessment adds to inherited guidance, both the inherited and the specific instruction are
  rendered, each with its own scope statement, citation, and locator, and neither is reworded,
  summarised, or combined into a single sentence. The guide displays two authored statements; it never
  synthesises a third.
- **Accumulation happens as discrete layers, not by merging conditions.** Guidance scenarios are
  mutually exclusive alternatives, so splicing an inherited condition into them would duplicate it
  across every alternative and can contradict one — an "eat within one day" condition spliced into a
  "throw them away" scenario. Each assessment therefore renders as its own intact layer with its own
  scenarios, summary, scope statement, and citation. Layers are cumulative and introduced as "all of
  the following apply"; a layer holding more than one scenario introduces them as "Follow whichever
  applies".
- The freshly-cooked-seafood group rule is lifted onto the `Freshly cooked fish, mussels, oysters,
  crayfish, scallops, etc` category with an authored `scopeStatement`, and its mirror food record is
  retired. Without this there is no ancestor guidance for the footnoted shellfish to accumulate from.
  [F-12](<12-lift-group-guidance-onto-categories.md>) deliberately excludes this work.
- An accumulated food's catalogue entry shows its own summary plus each inherited layer's authored
  summary and a link to that layer's origin category, because the browse view renders only a status and
  one summary and would otherwise understate the guidance. The summaries are shown whole and side by
  side; neither is reworded or merged into the other.
- A food resolves to exactly one status and one outcome band, so search, filtering, and the result
  count are unaffected. The feature must define which status governs when an additive rule and its
  inherited rule differ, and that resolution must be authored or deterministic, never averaged.
- Accumulation walks the same ancestor path as existing resolution, stays strictly within one guidance
  list, and never crosses guidance lists.
- Content validation rejects an additive assessment that has no inherited guidance to add to, since
  such a record would silently behave as a replacement.
- The `Bluff and Pacific oysters` and `Queen scallops` records are migrated to show both instructions.

## Non-goals

- Automatically merging any two assessments. Every accumulation is authored and reviewed.
- Inferring that two rules are additive because their condition kinds differ. `preparation` versus
  `frequency` is a useful signal for a human reviewer and is not a rule the software may apply.
- Changing any reviewed status, summary, condition, scenario, or citation wording.
- Blending statuses, or computing a combined outcome band from two statuses.
- Changing the behaviour of `Parmesan` or any other existing override.
- Re-fetching or re-scraping any source.
- Lifting group rules onto categories generally, which is
  [F-12](<12-lift-group-guidance-onto-categories.md>). This feature lifts exactly one rule — the
  freshly-cooked-seafood group rule that F-12 excludes — because its own acceptance criteria cannot be
  met without an assessed ancestor to accumulate from.

## Assumptions and open questions

- **This needed an ADR before implementation,** because it amends an accepted decision: the
  category-assessment ADR states that a food-level assessment is a total override and that advice is
  never merged across subject levels. That constraint exists to prevent the guide from presenting
  advice no source stated, which remains the correct goal, so the amendment had to draw a defensible
  line between *authored accumulation of two cited statements* and *inferred blending* rather than
  simply relaxing the rule.
- **The ADR is accepted:** [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>).
  It amends the category-assessment ADR's total-override rule narrowly, keeping that rule as the
  default and preserving the prohibition on displaying advice or a status no source stated. The
  remaining prerequisite for `Planned` is an approved feature-specific implementation plan.
- Resolved by the ADR: the **nearest authored status always governs**, whether the assessment replaces
  or adds. Status, chip, outcome band, filtering, and the result count are therefore unchanged, and no
  status is ever computed, blended, or promoted. Coherence is enforced by validation instead: an
  addition less restrictive than what it adds to fails the build. Note that "most restrictive" could
  not have been computed from `sortOrder` anyway — the vegetarian list places red at `sortOrder` 2 and
  amber at 3.
- Resolved by the ADR: the shape is a `relation: 'replaces' | 'adds-to'` field, **optional and
  defaulting to `'replaces'`**, so all 134 existing assessments keep their behaviour with no edit and
  only the safety-relevant direction is written explicitly.
- Resolved by the ADR: accumulation walks the **full ancestor chain**, stopping at and including the
  first `'replaces'`. Stopping after one level would silently drop an authored, cited instruction two
  levels up, which is the same defect this feature exists to remove.
- Rejected alternative, recorded so the ADR need not revisit it: **authored duplication**, restating the
  group's conditions on each specific food record with both citations. It needs no schema change and no
  ADR, and the current schema already permits it. It was rejected because it reintroduces exactly the
  duplication F-12 exists to remove — a source correction becomes a multi-record diff with silent drift
  between the category rule and its copies — and because it forces a human to write a new combined
  summary sentence covering both rules.
- Open: whether an additive assessment should be permitted to add to another additive assessment,
  producing a chain of three or more statements. Restricting to a single inherited rule plus one
  addition is simpler and covers every known case.
- **Needs review before publication:** whether the MPI seafood footnote is genuinely additive. This
  brief reads it as an addition because a serving limit cannot sensibly exempt a food from cooking, but
  that is a reviewer's judgement about the source and must be confirmed against the source text, not
  settled by this brief.
- The application is unreleased, so schema and data shapes can change without migration.
- Deferred from F-12: that feature deliberately leaves the freshly-cooked-seafood group untouched
  rather than lifting its rule onto the category, because lifting would assert that the footnote is an
  exception to the group rule. F-12 records this and points here.

## Acceptance criteria

- `Bluff and Pacific oysters` and `Queen scallops` display both the monthly serving limit and the
  group's cooking instruction, each with its own locator, and neither statement is reworded or merged
  into the other.
- No food displays an instruction that is not present verbatim in an authored, cited assessment.
- `Parmesan` in the vegetarian scope displays only its own rule, unchanged from today.
- Every food resolves to exactly one status, and the announced result count is unchanged by this
  feature except where a status deliberately changes.
- An additive assessment authored where no ancestor guidance exists fails content validation.
- Accumulation never crosses guidance lists, and no list's guidance appears under another's scope.
- An accepted ADR records the decision, its boundary against inferred blending, and how it amends the
  category-assessment ADR's total-override rule.

## Validation

Domain unit tests for additive resolution, replacement resolution, status precedence, the
no-inherited-guidance validation failure, cross-list isolation, and the unchanged `Parmesan` override.
React Testing Library tests confirming both statements render with separate scope statements and
citations on food detail. Chromium Playwright coverage for an accumulated food's detail route.
Repository-wide 100% statements, branches, functions, and lines coverage for application source is
retained.

### Content review gate

The one judgement this feature makes about the source is whether the MPI seafood footnote adds to the
group's cooking rule or carves those shellfish out of it. As implemented, `Bluff and Pacific oysters`
and `Queen scallops` show the cooking instruction and the monthly serving limit as two layers, each
with its own locator, and neither statement is reworded.

- Reviewer confirmation that the footnote is additive rather than a carve-out:
  **confirmed by the maintainer**.

### Pre-PR `prepare` review

- Run against base `96a942a`, branch `agents/feature-iteration-cycle-implementation`, covering 22
  changed files. No dependency-bearing lines changed.
- Documentation drift: the architecture overview and the repository Copilot instructions both still
  stated that a food-level assessment is always a total override. Both now describe the `relation`
  field, the layered resolution, and the two new validation rules.
- The ADR's confirmation checklist was stale; the code- and test-confirmable items are now ticked, and
  the items needing human content review were resolved by the content review gate above.
- Missing documentation: none. The decision itself is already recorded in an accepted ADR.


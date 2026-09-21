# F-03: Understand reviewed guidance

**Status:** Done

**Depends on:** [F-01: Browse the Food Guide](<01-browse-food-guide.md>)

**Governing decisions:** [Validated static guidance](<../decisions/2026-09-21 ADR - store reviewed guidance as validated static data.md>), [catalogue subjects and preparation](<../decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md>), [independent guidance lists and sources](<../decisions/2026-09-21 ADR - model guidance as independent lists and sources.md>), [conservative resolution](<../decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md>), and [local quality gates](<../decisions/2026-09-21 ADR - enforce local quality gates.md>)

## Goal

Let Polly understand what each reviewed authority says about a food or category, the preparation and
conditions to which it applies, and the evidence behind it.

## Primary experience

1. Open a food or assessed-category detail route from the catalogue or directly.
2. Read each selected guidance list's status and complete authored guidance.
3. Compare preparation states and, where sources disagree, read each authority's position.
4. Follow category origins, reason foods, and precise source citations.
5. Return to the previous catalogue context.

## Required behaviour

- Resolve food and category guidance independently for every selected list and preparation.
- Show all resolved layers with their subject origin, source attribution, status, summary, scenarios,
  conditions, and citations; never replace guidance words with a status chip.
- Present inherited and additive category rules as discrete attributed layers.
- Keep alternative scenarios separate and preserve their authoritative prose before supporting facts.
- Present the most cautious authored status where sources disagree while stating every dissenting
  position in words.
- Show neutral not-assessed wording whenever no reviewed rule applies; never imply that silence is
  safe.
- Display list-level evidentiary basis where citations are optional.
- Render reason links as explanations only; never infer status from the linked food.
- Preserve catalogue query context and mark the preparation from which a food was opened.
- Show a safe not-found view for unknown food or category routes.
- Include the medical-information disclaimer and colour-independent status meaning.

## Non-goals

- Personal medical advice, triage, portion planning, or recommendations.
- Generated summaries, merged source positions, or calculations from condition facts.
- In-application content editing.

## Assumptions and open questions

- Source guidance remains authoritative; the application paraphrases and organises it without
  replacing professional advice.
- No open question blocks this implemented capability.

## Acceptance criteria

- A food with food-wide and preparation-specific guidance shows each preparation as a standalone
  answer with all applicable layers.
- A category rule inherited by a food names and links its origin rather than appearing food-specific.
- Agreeing and dissenting sources retain their complete attributed positions, with the most cautious
  authored outcome governing the visible status.
- A direct food or category URL renders the same reviewed guidance as catalogue navigation and
  preserves valid selected scopes.
- Users can distinguish okay, conditional, avoid, insufficient-evidence, and not-assessed meanings
  without relying on colour.

## Validation

Domain tests cover inheritance, additive layers, preparation axes, source agreement and dissent,
fallbacks, and wording preservation. Component and Chromium Playwright tests cover direct routes,
citations, category origins, reason links, disclaimers, not-found views, and responsive accessible
rendering under the repository-wide quality gates.

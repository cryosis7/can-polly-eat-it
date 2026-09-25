# One subject-guidance module for every guide entry

Category: enhancement
Status: needs-triage
Feature: [F-01: Browse the food guide](../../docs/features/01-browse-food-guide.md), [F-03: Understand reviewed guidance](../../docs/features/03-understand-reviewed-guidance.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 2

> Not yet grilled. The seam, interface shape, and naming below are proposals to confirm in a
> deep-dive before this moves to `ready-for-agent`.

## Problem Statement

A subject's guidance is resolved per axis: the food-wide axis plus one axis per preparation state.
Deciding which axes a subject has, in what order, and how each is labelled is worked out three
different ways today:

- The food detail page sorts the preparation vocabulary, keeps the food's declared states, then
  derives the category's preparation states and subtracts the declared ones to find the group rules
  it must show under "General guidance for ... applies".
- The category detail page builds guide-entry rows for a single category and splits them into
  qualified and unqualified axes.
- The catalogue builds the axes for each preparation grouping from a precomputed preparation order,
  resolves each selected guidance list, and keeps only those where an assessment was found.

The preparation vocabulary sort is written three times. The accepted rule that a category must be
resolved per axis, so that it never renders `not-assessed` over authored rules, is honoured by
convention in each page rather than by one module. A new surface that shows a subject's guidance
would need to rediscover all of this.

## Solution

Introduce a **subject guidance** module in the domain layer. Given a guidance subject (a food or a
category), the selected guidance lists, and the content index, it returns the subject's ordered axes.
Each axis names its preparation (or none for food-wide), its basis (the subject's own guidance, or
its group's rule for a preparation the food does not declare), and the resolved guidance for each
selected list.

Food detail, category detail, and catalogue preparation groupings all read from it. Readers see no
change.

## User Stories

1. As a maintainer, I want one module to decide which axes a guidance subject has, so that food detail, category detail, and the catalogue cannot disagree.
2. As a maintainer, I want the preparation vocabulary order applied in one place, so that reordering the vocabulary changes every surface together.
3. As a maintainer, I want the "resolve a category per axis, never render not-assessed over authored rules" rule enforced by that module, so that a new surface cannot break it.
4. As a maintainer, I want the module to label an axis as the subject's own guidance or as its group's rule, so that pages only choose headings rather than derive the distinction.
5. As a maintainer, I want the module to return resolved guidance per selected guidance list for each axis, so that pages stop looping over lists and calling resolution themselves.
6. As a maintainer, I want the food detail page's undeclared-preparation logic to disappear into the module, so that the page reads as rendering only.
7. As a maintainer, I want the category detail page to stop borrowing a catalogue row helper to find its axes, so that it depends on an interface built for its purpose.
8. As a maintainer, I want the catalogue's preparation-grouping governing rules to come from the same module, so that the catalogue and the detail pages show the same rule for the same axis.
9. As a maintainer, I want axis tests written once against the module, so that food and category detail tests only check rendering.
10. As a maintainer adding a new preparation state, I want every surface to pick it up from the module, so that the change is data only.
11. As a maintainer, I want the module to import no React, router, or browser modules, so that it respects the one-way import rule.
12. As a reader on a food page, I want each preparation I eat the food in to still show its guidance, in vocabulary order, so that nothing moves.
13. As a reader on a food page, I want the group's rule for a preparation the food is not eaten in to still appear under the "General guidance for ... applies" heading, so that I get the authored answer rather than silence.
14. As a reader on a category page, I want its unqualified guidance followed by each preparation-qualified rule, so that the page reads the same as today.
15. As a reader arriving from a catalogue preparation grouping, I want the preparation I was looking at still marked on the detail page, so that I keep my place.
16. As a product owner, I want the rule that a preparation declaration never expresses risk preserved, so that the module only reports axes and never infers status from them.

## Implementation Decisions

- A new subject guidance module lives in the domain layer.
- Proposed interface: guidance subject, selected guidance lists, and content index in; an ordered list of axes out. Each axis carries an optional preparation, a basis of own guidance or group rule, and resolved guidance per list.
- Open question for the deep-dive: whether "group rule" is a basis only a food can have, or whether a category can also show an ancestor's rule for a preparation it holds no rule on. Today only the food page shows group rules.
- Open question for the deep-dive: whether the catalogue should consume this module per preparation grouping, or whether the catalogue view spec absorbs that use. Answered 2026-09-25 while grilling the [catalogue listing](../deepen-catalogue-view/spec.md): the listing computes band governing rules itself behind its interface, and this module may later replace that internally without changing the listing's interface.
- The two current axis derivations in the tree module (per-category preparation states and guide-entry rows) become internal implementation where no other caller needs them.
- Needs a domain term for the basis distinction. "Group's rule" is the phrase the architecture overview and food page use; confirm it during the deep-dive and add it to the domain docs.
- Dependency category: in-process.
- No ADR conflicts: it implements the accepted "resolve guidance conservatively without inference" and "model catalogue subjects and preparation independently" decisions in one place.

## Testing Decisions

- A good test gives the module a fixture subject and asserts the returned axes: their order, preparation, basis, and resolved statuses per list. It does not assert which helpers were called.
- Cases to cover at the interface: a food with no preparation states; a food with declared states; a food whose category holds rules for undeclared states; a category holding only preparation-qualified rules; a category with both; multi-source and multi-list subjects.
- Food and category detail page tests keep headings, the "the preparation you were looking at" marker, links, and accessibility, and drop axis-derivation assertions.
- Prior art: the existing category preparation guidance, preparation guidance, and lifted category guidance domain tests, and the multi-source fixture.
- Playwright detail-page journeys stay unchanged.

## Out of Scope

- Changing resolution, inheritance, or dissent rules.
- Changing how guidance is rendered.
- Changing which preparation states a food declares.

## Further Notes

- Pairs with the catalogue view spec and benefits from the content index spec, which would give the module a two-parameter interface over content.

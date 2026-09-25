# One guidance renderer that always states dissent

Category: enhancement
Status: needs-triage
Feature: [F-03: Understand reviewed guidance](../../docs/features/03-understand-reviewed-guidance.md)
Reported: 2026-09-24
Origin: architecture review of 2026-09-24, candidate 4

> Not yet grilled. The seam and the density options below are proposals to confirm in a deep-dive
> before this moves to `ready-for-agent`.

## Problem Statement

The architecture overview requires that wherever a contested status appears, including the
catalogue overview, the guide states in text which source concluded otherwise, what it concluded,
and where to read it. Today that rule is honoured separately at each place resolved guidance is
rendered:

- Detail pages use a full guidance section that includes the dissent notice.
- Catalogue cards use a guide entry summary that includes the dissent notice.
- The catalogue's preparation-grouping callout composes the status chip and guidance layers directly
  in the catalogue page and does not include the dissent notice.

No test covers dissent in a preparation-grouping callout. Current content has no contested
preparation-qualified category rule (every preparation-qualified category assessment comes from one
source), so no reader sees the gap today. The first multi-source preparation rule would expose it.

The status icon mapping is also defined twice, in the status chip and in the full guidance section.

## Solution

Introduce one guidance renderer that takes a resolved assessment and its guidance list and renders
it at a chosen density (detail, catalogue card, or preparation callout). Every density always shows
the status with its icon and label, every authored layer, and the dissent notice where sources
disagree. Density controls how much detail is shown, never whether provenance is shown.

## User Stories

1. As a reader, I want a contested status in a catalogue preparation grouping to say which source disagreed and where to read it, so that I am never shown a contested status as settled.
2. As a reader, I want the detail page, catalogue card, and preparation callout to use the same status icon and label for the same status, so that the meaning never shifts between views.
3. As a reader using a screen reader, I want dissent always stated in words, so that it never depends on colour.
4. As a maintainer, I want the dissent rule enforced by one renderer, so that a new surface cannot forget it.
5. As a maintainer, I want density to be a parameter of that renderer, so that a new surface picks a density rather than composing parts.
6. As a maintainer, I want the status icon mapping defined once, so that changing it changes every view.
7. As a maintainer, I want the rule that every authored layer renders (never a chosen subset) enforced by the same renderer, so that no density can understate authored guidance.
8. As a maintainer, I want the catalogue page to stop composing guidance parts itself, so that it only chooses where guidance appears.
9. As a maintainer, I want a test that a contested preparation-qualified category rule shows its dissent in the catalogue, so that the gap is closed and stays closed.
10. As a product owner, I want the "Wherever a contested status appears" rule to hold by construction, so that adding multi-source preparation guidance needs no UI change.
11. As a reader, I want everything else about how guidance looks to stay the same, so that only the missing dissent notice changes.

## Implementation Decisions

- One guidance renderer module in the shared components directory becomes the only way to render a resolved assessment.
- Proposed interface: resolved assessment, guidance list, sources lookup, return search, and density.
- Open question for the deep-dive: whether the detail density's positions, "all of the following apply" layering, scenarios, reason links, and source list belong to the same renderer or stay a separate detail module that shares the status and dissent parts.
- Open question for the deep-dive: whether the collapsed-row chip's separate presentation vocabulary should also share the status icon definition. It summarises generic outcome bands, not list-owned statuses, so it may rightly differ.
- The existing guide entry summary, status chip, guidance layers, and dissent notice become internal parts of the renderer where no other caller needs them.
- Dependency category: in-process.
- No ADR conflicts: implements the accepted "model guidance as independent lists and sources" and "resolve guidance conservatively without inference" decisions.

## Testing Decisions

- A good test renders the guidance renderer with a fixture resolved assessment at each density and asserts what a reader sees: status label and icon, layer summaries, and dissent text with its link. It does not assert which sub-parts were composed.
- Add a regression: a contested preparation-qualified category rule shows its dissent in the catalogue preparation callout.
- Prior art: the multi-source rendering and tea rendering component tests, and the multi-source fixture.
- Existing rendered-wording preservation tests must still pass.

## Out of Scope

- Changing dissent, governing-status, or layering rules.
- Visual redesign of guidance.
- Changing the collapsed-row chip.

## Further Notes

- If the product owner wants the gap closed before the refactor, a narrow fix is to add the dissent notice to the preparation callout with its regression test. That would be a separate `bug` issue.

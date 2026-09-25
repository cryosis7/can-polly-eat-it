# Honour a collapse made during a search

Category: bug
Status: ready-for-agent
Feature: [F-01: Browse the food guide](../../docs/features/01-browse-food-guide.md), [F-02: Find, filter, and share guide entries](../../docs/features/02-find-filter-and-share-guide-entries.md)
Reported: 2026-09-25
Origin: grilling of [Deepen the catalogue view](../deepen-catalogue-view/spec.md), 2026-09-25

## Problem Statement

While a search, category, or outcome filter is active, the catalogue forces open every group
holding a match. The disclosure controls still respond to clicks, but only by flipping the reader's
stored browse collapse state behind the scenes:

1. Open `/?v=1&scope=pregnancy-food-safety`. Every root group is collapsed.
2. Search `rice`. Breads and cereals and Drinks open, because each holds a match.
3. Press the "−" on Drinks. Nothing visible happens and the control still reports
   `aria-expanded="true"`.
4. Clear the search. Drinks is now **expanded**, although it was collapsed before the search and the
   reader's last visible action was trying to collapse it.

Preparation band toggles behave the same way. A reader cannot tidy a long result list, the control
misreports what it did, and the search leaks into the browse state it was meant to leave alone.

Counts are also misleading under a filter. A collapsed nested row or a preparation band states
"N entries", but under a filter that number counts only the matching subset: Tea holds 31 entries
while browsing but one match for `rice`, so "1 entry" reads as the size of the whole group.

## Solution

While a filter is active, a toggle performs a **search collapse**: it really collapses or reopens
that row or band, for this filter only. A search collapse never shows an aggregate chip, because a
chip never summarises a filtered subset. It is stamped with the filter it was made under and is
ignored as soon as the search text, category, outcomes, or selected dietary scopes differ, so every
group holding a new match opens and no new match is ever hidden. Clearing the filters restores the
reader's browse collapse state exactly as it was before the search.

While filtering, every category row and every preparation band, open or collapsed and roots
included, states its count as matches ("1 match", "3 matches") instead of entries, in both its
visible text and its accessible name.

The rule deciding which rows are collapsed lives in the domain layer, so the page only holds state
and renders it. The later [catalogue listing](../deepen-catalogue-view/spec.md) takes this rule over.

## User Stories

1. As a reader searching the catalogue, I want to collapse a matching group I don't care about, so that I can tidy a long result list.
2. As a reader, I want a toggle to always do what it says, so that its expanded state and the page agree.
3. As a reader, I want clearing a search to return my browse collapse state exactly as I left it, so that searching never rearranges my browsing.
4. As a reader, I want any change to the search, category, outcomes, or selected scopes to reopen every group holding a match, so that a new match is never hidden by a collapse I made for an earlier search.
5. As a reader, I want a group I collapsed during a search to show no aggregate chip, so that I never read a filtered subset as the whole group's answer.
6. As a reader, I want each row and band to count its matches while I filter, so that I don't mistake a filtered count for the size of the group.
7. As a screen-reader user, I want each row's and band's accessible name to say "N match(es)" while I filter, so that I hear the same count sighted readers see.
8. As a reader browsing without a filter, I want collapse, chips, and counts to behave exactly as they do today, so that nothing else moves.
9. As a reader, I want selecting a further dietary scope without a filter to leave my browse collapse state alone, as it does today.
10. As a reader, I want collapsing during a search to leave the result count unchanged, so that the count still announces what the guide holds for my query.

## Implementation Decisions

- "Filtering" means a search, category, or outcome filter is active; selected scopes alone are not
  filtering. This is today's rule, now owned by the domain.
- Collapse state has two parts. The browse part is today's state: collapsed category IDs, defaulting
  to every root category, and expanded band keys, defaulting to none. The search part holds
  collapsed category IDs and collapsed band keys, defaults to empty (everything open), and carries
  the filter it was made under.
- The filter stamp is the domain filter state (search text, category ID, selected guidance list IDs,
  outcome bands), compared by value with list IDs and outcome bands treated as sets. It includes
  scopes even though scopes alone are not filtering, because while an outcome filter is active,
  dropping a scope can bring new matches into view.
- A search collapse whose stamp does not match the current filter is ignored, and the page discards
  it during render (not in an effect) as soon as it renders under a different filter, so the first
  render after a filter change never uses stale state and returning to an earlier filter opens every
  group rather than reviving a collapse made for it.
- A toggle while filtering starts from an empty search part when the stored stamp differs, flips the
  row or band, and stamps the result with the current filter. It never touches the browse part. A
  toggle while browsing touches only the browse part, as today.
- While filtering, a row or band is collapsed only if the current search part collapses it. Every
  rendered row still holds a match or is an ancestor of one, so only a reader's own search collapse
  hides anything.
- No aggregate chip renders while filtering, collapsed or not. Root groups stay chip-free always.
- While filtering, every category row shows its count, roots included and open or collapsed, and
  every band shows its count, worded as matches with the correct singular. Browsing is unchanged: a
  collapsed non-root row shows its chip and "N entries"; open and root rows show no category count;
  bands always show "N entries".
- Accessible names while filtering: a category row reads, for example, "Tea, level 2, 1 match" and a
  band "Smoked Fish, 3 matches". Browsing names are unchanged.
- The collapse-state type, its defaults, the stamp comparison, the toggle rule, the band key, and
  the "is this row or band collapsed" rule live in a new domain module (proposed
  `src/domain/collapseState.ts`) that imports no React, router, or browser modules. The page holds
  the state, calls the module, and stops building band key strings itself.
- Docs: the architecture overview's catalogue section already defines **match** and **search
  collapse** (2026-09-25). In F-02, replace "Auto-expand matching rows so a search or filter cannot
  hide a result behind a disclosure" with the new rule and add a matching acceptance criterion.
  F-01's "never show an aggregate chip ... while a content-narrowing filter is active" still holds.
- No ADR conflicts. The chip rule in the conservative resolution ADR is preserved.

## Testing Decisions

- Domain tests drive the collapse-state module through its interface: defaults; a browse toggle; a
  search toggle; a stale stamp ignored after each of the four filter fields changes; scope and
  outcome order not making a stamp stale; returning to browsing restoring the browse state.
- Catalogue page tests cover rendering: a search-collapsed row hides its body, shows no chip, and
  reports `aria-expanded="false"`; a changed search reopens it; clearing restores the prior browse
  state; match wording in visible text and accessible names, singular and plural, for a root, a
  nested row, and a band; browse wording unchanged.
- Rewrite the existing page test "reveals a match inside a collapsed group and restores manual
  expansion when the search clears" wherever it relied on the old behaviour.
- Playwright: add a Chromium scenario that searches `rice`, collapses Drinks, sees its body hidden
  with no chip and "1 match" in its accessible name, clears the search, and finds the browse
  collapse state as it was before the search. Adjust existing scenarios where a count or accessible
  name under a filter now reads matches; for example, "reveals a searched entry that sits inside a
  collapsed group" asserts "Cheese, level 2, 1 match".
- Coverage stays at 100% for application source.

## Out of Scope

- The catalogue listing refactor, which follows this fix and absorbs the collapse rule.
- Persisting collapse state in the URL or browser storage.
- Chip semantics, resolution, filtering, and result-count rules.
- Unfiltered totals such as "1 of 31", which were considered and rejected.

## Further Notes

- Cause: while filtering, the page removes every contentful row from the effective collapsed set
  and forces every band open, so a toggle only mutates hidden browse state.
- Presentation chosen from a rendered mockup (option B). Rejected: "N entries" (a filtered count
  read as the group size), no count (open bands would show a count and collapsed ones would not),
  and "N of M" (needs unfiltered totals and reads as "1 of 1").

## Comments

- 2026-09-25: Product owner confirmed that a stale search collapse is discarded rather than only
  ignored, so returning to an earlier filter (for example `rice` → clear → `rice`) opens every group.
  Implementation Decisions updated to match.

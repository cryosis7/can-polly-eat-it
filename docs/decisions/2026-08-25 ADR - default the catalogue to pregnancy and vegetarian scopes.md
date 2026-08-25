# 2026-08-25 ADR: Default the Catalogue to Pregnancy and Vegetarian Scopes

**Status:** Accepted
**Date:** 2026-08-25
**Deciders:** Product owner (requester)

## Context and Problem Statement

The [2026-08-06 ADR on scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>)
decided that pregnancy food safety is the only dietary scope selected when a reader opens the guide
with no `scope` in the URL; vegetarian suitability must be added deliberately. In practice the reader
who cares about both at once — a vegetarian who is pregnant — is the common case, not an edge case.
Under the current default that reader sees only pregnancy guidance on first load and must discover
and tick the vegetarian checkbox themselves before the guide reflects both constraints they actually
hold.

Should the catalogue's no-`scope` default keep showing pregnancy alone, or show both dietary scopes
this product already treats as the flagship combination?

## Considered Options

- Keep pregnancy-only as the default scope, vegetarian remains an opt-in add. (status quo, rejected)
- Default both `pregnancy-food-safety` and `vegetarian-suitability` on, each still independently
  removable down to a minimum of one selected scope. (chosen)

## Decision Outcome

Chosen option: "default both `pregnancy-food-safety` and `vegetarian-suitability` on", because the
combined pregnancy-and-vegetarian reader is the primary audience this product was built to serve
together (see the [independent-guidance-lists ADR](<2026-08-04 ADR - use independent guidance lists for food assessments.md>)),
and making them see both layers immediately removes a discovery step for the common case without
removing anyone's ability to narrow back to one scope.

This supersedes only the default-scope clause of the 2026-08-06 ADR (pregnancy is selected by
default). That ADR's other decisions — generic outcome bands, OR-within-scope / AND-across-scope
filtering semantics, the `scope=`/`outcome=` URL contract, and unknown-value stripping — are
unchanged and remain governed by it.

### Consequences

- Good, because the guide answers "what can I eat, being pregnant and vegetarian?" on first load with
  no configuration step.
- Good, because a reader who only cares about one scope can still remove the other with one click; the
  existing minimum-one-scope invariant is untouched.
- Bad, because a reader who only ever wants pregnancy guidance now sees an extra vegetarian layer on
  every card until they remove it once (their removal persists only for that session/URL, not as a
  saved preference, since this product has no accounts).
- Bad, because every fixture and test asserting the old single-scope default (`catalogueQuery.ts`,
  `CataloguePage.tsx`, their tests, `e2e/catalogue.spec.ts`) needs updating in the same change.

## Implementation Plan

- **Affected paths:** `src/app/catalogueQuery.ts` (`defaultState`), `src/app/catalogueQuery.test.ts`,
  `src/features/catalogue/CataloguePage.tsx` (`defaultScopeSlug` and the "Clear filters" reset),
  `src/features/catalogue/CataloguePage.test.tsx`, `e2e/catalogue.spec.ts`,
  `docs/architecture/overview.md`, `docs/features/08-rework-guidance-scope-filtering.md`.
- **Pattern to follow:** Compute the default scope slugs by filtering the loaded `guidanceLists` for
  `pregnancy-food-safety` and `vegetarian-suitability` (preserving `guidanceLists` order), falling back
  to the first available list if neither is present, exactly as the existing single-slug fallback did.
  Keep this derivation in one place in `catalogueQuery.ts` and have `CataloguePage.tsx` reuse it rather
  than hard-coding a second literal.
- **Tests:** Update `catalogueQuery.test.ts` and `CataloguePage.test.tsx` assertions that hard-code the
  old pregnancy-only default. Update the relevant `e2e/catalogue.spec.ts` scenario(s) asserting the
  default checkbox state.

## Confirmation

- [ ] A fresh catalogue load with no `scope` in the URL has both `pregnancy-food-safety` and
      `vegetarian-suitability` selected, and the URL reflects both.
- [ ] Unchecking one of the two defaulted scopes leaves the other checked and selectable; unchecking
      down to one scope disables further removal of that last scope (existing invariant, unchanged).
- [ ] "Clear filters" restores both default scopes.
- [ ] A shared URL that explicitly selects one scope is not overridden back to both.
- [ ] `docs/architecture/overview.md` and `docs/features/08-rework-guidance-scope-filtering.md` describe
      the new default rather than the superseded pregnancy-only one.

## More Information

Supersedes the default-scope clause of the
[2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>);
all its other decisions stand.

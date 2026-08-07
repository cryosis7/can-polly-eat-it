# 2026-08-06 ADR: Assess Categories as First-Class Subjects with Inherited Guidance

**Status:** Accepted
**Date:** 2026-08-06
**Deciders:** Project owner (requester)

## Context and Problem Statement

Authoritative sources give advice at the group level. The MPI pregnancy guide has a single "Hard
cheese" row, not a row per named cheese. The domain can only attach an assessment to a `Food`, so
that one group rule is authored by duplicating a statement across an enumerated food list
(`foodIds: ['cheddar', 'parmesan']`). Adding Gouda under `Hard cheese` therefore resolves to the grey
"Not assessed" fallback until a maintainer remembers to extend that array, and a vegetarian rule such
as "check the label for animal rennet, which applies to hard cheese generally" cannot be stated once
for the group at all.

The same gap has produced pseudo-food records that exist only to carry group advice: the `breads`,
`plain-cakes-slices-and-muffins`, and `cakes-slices-and-muffins-with-cream-or-custard` foods each
mirror a category of the same name so that the category's rule has somewhere to live.

How should the guide author advice for a category, apply it to the foods beneath it, and still let a
specific food override it, without inferring safety or merging advice that no source stated together?

## Considered Options

- Author a polymorphic `Assessment` whose subject is a food **or** a category, resolved
  nearest-subject-first, and treat an assessed category as a first-class guide entry.
- Keep per-food assessments and extend the data-layer authoring helper to expand a category rule over
  its descendant foods at module load.
- Add a separate `CategoryAssessment` record type alongside the existing `FoodAssessment`.
- Derive suitability from rules or tags, for example "any food tagged `contains-rennet` resolves to
  `maybe`".

## Decision Outcome

Chosen option: "a polymorphic `Assessment` subject with nearest-subject-first resolution, and
assessed categories as first-class guide entries", because it represents the source's own shape
directly, keeps one schema, one validator, one resolver, and one renderer, and makes the breadth of
every claim explicit, authored, and cited rather than inferred.

An assessment's subject becomes a discriminated union of `{ kind: 'food', foodId }` and
`{ kind: 'category', categoryId }`. Resolution for a food is: its own authored assessment, otherwise
the nearest ancestor category with an assessment in that guidance list, otherwise the existing
coverage fallback. An inherited assessment is applied whole and its provenance is displayed. A
category that carries its own authored assessment becomes a guide entry: it is searchable,
filterable, counted, and addressable at `/category/:slug`. The pseudo-food records are retired and
their assessments move onto the categories they were standing in for.

### Consequences

- Good, because adding Gouda under `Hard cheese` inherits the pregnancy and vegetarian group rules
  with no assessment edit, which is the behaviour the guide's sources already assume.
- Good, because a group rule is authored and cited once instead of being duplicated across every
  member food, so a source correction is a one-line diff.
- Good, because `Food` and `Category` gain no dietary fields and the independent-guidance-list model,
  list-owned statuses, generic outcome bands, and both grey fallbacks are unchanged.
- Good, because "can hard cheese as a whole be advised?" is answerable in the interface rather than
  only in the data.
- Good, because pseudo-foods that duplicate a category stop being the only way to express group
  advice.
- Bad, because a food added under an assessed category inherits guidance that no human reviewed for
  that specific food, which is a content-safety risk requiring the guardrails below.
- Bad, because `docs/architecture/overview.md` design principle 1 ("never infer a food's safety from
  its name or from a parent category") must be amended to distinguish forbidden inference from an
  authored, cited, disclosed category assessment.
- Bad, because the catalogue, search, result count, and routing must handle two entry kinds instead
  of one, and every affected test grows a category case.
- Bad, because resolution now walks the ancestor path per food per selected scope, so the content
  index becomes necessary rather than optional.

## Decision Drivers

- Authoritative guidance is authored at the group level; the model should not force it into an
  enumeration.
- A missing enumeration entry must not be the difference between correct advice and a silent "Not
  assessed".
- Every displayed outcome must remain traceable to a reviewed statement with a durable URL and exact
  locator.
- A more specific authored assessment must always beat a broader one, and no two assessments may ever
  be blended into advice that no source stated.
- Suitability stays contextual: inheritance operates strictly within one guidance list.
- The application is unreleased, so schema, data, and URL shapes can change now without migration.

## Pros and Cons of the Options

### Polymorphic assessment subject with assessed categories as guide entries

- Good, because one schema, one uniqueness invariant, one resolver, and one renderer serve both
  subject kinds.
- Good, because the resolver can report provenance, so the interface can state "Applies to all hard
  cheese" and cite the category's own source.
- Good, because a food-level assessment is a total override, which is a simple rule to author against
  and to test.
- Bad, because it is a breaking rename across the domain, data, features, and tests.
- Bad, because it makes broad claims easy to author, so validation and review guardrails carry more
  weight.

### Expand a category rule over descendant foods in the data layer

- Good, because the domain, interface, and existing ADR wording need no change.
- Bad, because provenance is destroyed: every inherited outcome looks food-specific, so the interface
  cannot disclose the breadth of the claim.
- Bad, because override precedence degrades into an expansion-ordering detail in `src/data/` rather
  than a tested domain rule.
- Bad, because derivation logic moves into `src/data/`, which the architecture reserves for authored
  records only.

### Separate `CategoryAssessment` record type

- Good, because `FoodAssessment` is untouched, so existing code churns less.
- Bad, because roughly ninety per cent of the schema, validation, and rendering is duplicated and
  must then be kept in step.
- Bad, because every consumer has to read two collections and re-implement precedence between them.

### Derive suitability from rules or tags

- Good, because one rule could cover many foods with no per-group authoring.
- Bad, because it computes health guidance, contradicting the manual-review, citation, and
  no-inference principles in the architecture overview and the static-content ADR.

## Implementation Plan

- **Affected paths:** `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/domain/assessment.ts`, `src/domain/filtering.ts`, `src/domain/search.ts`,
  `src/domain/categoryTree.ts`, a new `src/domain/contentIndex.ts`, `src/data/assessments.ts`,
  `src/data/foods.ts`, `src/data/guidanceLists.ts`, `src/app/App.tsx`,
  `src/app/catalogueQuery.ts`, `src/features/catalogue/`, `src/features/food-detail/`, a new
  `src/features/category-detail/`, `e2e/`, `docs/architecture/overview.md`,
  `.github/copilot-instructions.md`, and the corresponding tests.

- **Assessment subject:** Replace `FoodAssessment.foodId` with

  ```ts
  subject:
    | { kind: 'food'; foodId: string }
    | { kind: 'category'; categoryId: string }
  ```

  and rename the type to `Assessment`. A category subject additionally requires an authored
  `scopeStatement`, for example "Applies to all hard cheese"; a food subject must not set one.
  `Food` and `Category` gain no fields. Reason links continue to target existing, non-self `Food`
  records.

- **Resolution:** `resolveAssessment` returns
  `{ status, assessment?, origin: { kind: 'food' } | { kind: 'category', category } | { kind: 'coverage-fallback' } }`.
  For a food, check its own assessment, then walk `tree.pathByCategoryId` from the nearest ancestor to
  the root and take the first category assessed in that list, then fall back to coverage exactly as
  today. For a category, walk from the category itself upward. The walk is iterative with no depth
  constant. An inherited assessment is applied whole: never merge statuses, summaries, scenarios,
  conditions, or citations across levels, and never across guidance lists.

- **Content index:** Add `createContentIndex(content)` building the `CategoryTree` and
  `assessmentsByListAndSubject: Map<listId, Map<'food:<id>' | 'category:<id>', Assessment>>` once.
  `resolveAssessment`, coverage resolution, filtering, and the pages take the index instead of raw
  arrays, replacing the current per-food `buildCategoryTree` call inside `isFoodCovered`.

- **Guide entries:** Introduce `GuideEntry = { kind: 'food', food } | { kind: 'category', category }`.
  A category is a guide entry only when it carries its **own authored** assessment in any guidance
  list; categories that merely inherit remain plain browse headings. Search, outcome filtering,
  category filtering, and the result count operate over guide entries. The catalogue's accessible
  count announces "N results in the guide", where results are matching foods plus matching assessed
  categories. Search keeps its existing food name/alias/category-path matching and matches a category
  entry against its own name, its aliases, and its ancestor path labels, so both entry kinds behave
  symmetrically.

- **Routing and display:** Add `/category/:categorySlug` alongside `/food/:foodSlug`, preserving the
  catalogue query on both. Category group headings render the category's resolved status chip for the
  selected scopes. A food whose guidance is inherited renders the origin category's `scopeStatement`,
  a link to that category, and the category assessment's citation and locator, and must never present
  inherited advice as food-specific. Colour is never the only status signal, and the
  medical-information disclaimer appears on category detail as it does on food detail.

- **Validation:** Enforce uniqueness of `(subject.kind, subject id, guidanceListId)`; existence of the
  referenced food or category; `scopeStatement` present for category subjects and absent for food
  subjects; and that **every assessed subject lies within its guidance list's declared coverage**, so
  a category rule cannot reach foods the list does not claim to cover. Existing rules are retained:
  list-owned non-fallback status, at least one citation, no authored fallback status, and valid
  reason links. Parse failures still throw at module load in production builds.

- **Data migration:** Convert the hard-cheese pregnancy spec to a category subject on `hard-cheese`,
  keeping its summary, locator, and citation. Convert the low-acid soft pasteurised cheese spec the
  same way. Retire the `breads`, `plain-cakes-slices-and-muffins`, and
  `cakes-slices-and-muffins-with-cream-or-custard` **food** records, keep their categories, and move
  their assessments onto those categories. Add the `gouda` food under `hard-cheese` with no
  assessment. Add a vegetarian assessment on `hard-cheese` with status
  `vegetarian-check-ingredients`, and extend `vegetarian-suitability.coverage.categoryIds` with
  `hard-cheese` plus a matching coverage description and citation.

- **Safety guardrails:** The mandatory `scopeStatement`, the displayed provenance, and the
  coverage-containment rule are the enforcement mechanism for inherited advice. Add a checklist item
  to `.agents/skills/ai-guidance-list-curation` requiring an author adding a food beneath an assessed
  category to confirm the inherited outcome is correct for that specific food. Do not add an
  inheritance opt-out flag until a real exception exists; an exception is authored as a food-level
  assessment.

- **Tests:** Domain unit tests for nearest-ancestor precedence, food-level override, no inheritance
  across guidance lists, no merging of scenarios, a 1,000-level ancestor walk, duplicate-subject
  rejection, missing/forbidden `scopeStatement`, and an assessed subject outside coverage. React
  Testing Library tests for inherited versus authored rendering, category chips on group headings,
  and the category detail route. Playwright coverage for a direct `/category/<slug>` load and a
  filtered URL whose results include an inheritance-only food and a category entry. `npm test` must
  keep the 100% coverage gate green.

## Confirmation

- [ ] `Food` and `Category` still carry no dietary status, boolean, or assessment fields.
- [ ] An assessment's subject is exactly one food or one category, and each
      `(subject, guidanceListId)` pair appears at most once.
- [ ] A food with no assessment of its own resolves to the nearest assessed ancestor category in the
      same guidance list, and to the existing coverage fallbacks when no ancestor is assessed.
- [ ] Gouda, added under `Hard cheese` with no assessment, resolves to pregnancy "OK to eat" and
      vegetarian "Check ingredients", each with disclosed provenance and the category's citation.
- [ ] Parmesan's authored vegetarian assessment still overrides the hard-cheese category rule.
- [ ] Statuses, summaries, scenarios, conditions, and citations are never merged across subject levels
      or across guidance lists.
- [ ] Every category assessment carries an authored `scopeStatement` that is rendered wherever its
      advice is inherited.
- [ ] Content validation rejects an assessed subject that falls outside its guidance list's declared
      coverage.
- [ ] The `breads`, `plain-cakes-slices-and-muffins`, and
      `cakes-slices-and-muffins-with-cream-or-custard` food records are gone, and their advice remains
      searchable, filterable, counted, and reachable at `/category/<slug>`.
- [ ] A category is a guide entry only when it has its own authored assessment.
- [ ] The catalogue announces "N results in the guide", counting matching foods and matching assessed
      categories, and a category entry is matched by its own name, its aliases, and its ancestor path
      labels.
- [ ] `docs/architecture/overview.md` design principle 1 and its domain-model section, and
      `.github/copilot-instructions.md`, describe subject-based assessment and inheritance.
- [ ] Category detail and category chips meet the existing non-colour, keyboard, and disclaimer
      requirements.

## More Information

**Amended 2026-08-07** by
[2026-08-07 ADR: accumulate inherited guidance through additive assessments](<2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>).
The total-override rule stated below — that a food-level assessment wholly replaces any inherited
category guidance, and that guidance is never combined across subject levels — remains the **default**
and the whole of the behaviour for any assessment that does not opt in. An assessment may now declare
`relation: 'adds-to'`, in which case its guidance is displayed alongside the guidance it inherits, each
statement intact and separately attributed. Nothing is merged, reworded, or computed, so this ADR's
prohibition on presenting advice or a status that no source stated is preserved. Everything else below
stands unchanged.

This decision builds on
[2026-08-04 ADR: model food groups as an unbounded category tree](<2026-08-04 ADR - model food groups as an unbounded category tree.md>)
and keeps its adjacency-list forest and separate food records; a category assessment is a separate
record referencing a category, not a status copied into a category node.

It supersedes the resolution rule in
[2026-08-04 ADR: use independent guidance lists for food assessments](<2026-08-04 ADR - use independent guidance lists for food assessments.md>)
— specifically "define `FoodAssessment` with one food ID" and "the absence of an assessment resolves
from coverage" — by inserting nearest-ancestor category inheritance between the authored assessment
and the coverage fallback. Everything else in that ADR stands: one catalogue, list-owned status
vocabularies, unique subject/list pairs, and two distinct grey fallbacks.

It preserves the filtering and URL semantics of
[2026-08-06 ADR: show scoped guidance with generic outcome filters](<2026-08-06 ADR - show scoped guidance with generic outcome filters.md>),
extending them from foods to guide entries.

It requires an amendment to design principle 1 in
[`docs/architecture/overview.md`](../architecture/overview.md): inferring safety from a food's name or
from an unassessed ancestor remains forbidden, while applying an authored, cited, scope-stated
category assessment is the mechanism this ADR introduces.

A feature brief covering the data migration, category entries, category detail route, and curation
guardrails should be planned before implementation begins.

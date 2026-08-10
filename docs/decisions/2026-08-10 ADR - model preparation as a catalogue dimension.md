# 2026-08-10 ADR: Model preparation as a catalogue dimension

**Status:** Accepted
**Date:** 2026-08-10
**Deciders:** Project owner (requester)

## Context and Problem Statement

The catalogue's category tree is meant to express **what a food is**. In one place it instead
expresses **how a source shaped its guidance**, and that inconsistency now blocks content work.

`fish-mercury-guidance` is a category holding roughly 60 species. It is not a kind of food; it is a
kind of advice. It exists because New Zealand Food Safety publishes mercury limits as a single table,
so the species were grouped by the table they came from. Meanwhile preparation — the dimension that
actually governs seafood risk — sits as three sibling categories directly under `seafood`
(`raw-fish`, `smoked-seafood`, `freshly-cooked-seafood`) that contain almost no species between them.

A food declares exactly one `primaryCategoryId` and therefore inherits down exactly one ancestor
path. So a species can sit under the mercury table **or** under a preparation group, never both. No
species can carry both its mercury serving limit and its preparation advice.

Curating the NHS as a second pregnancy authority made this concrete and halting. The NHS states
advice by preparation for the same species New Zealand Food Safety rates by mercury: it says cooked
salmon is safe, cold-smoked salmon must be heated until steaming hot, and raw salmon must be avoided,
while New Zealand Food Safety says salmon is limited to three or four servings a week. There is no
subject in the current model those NHS statements can attach to. Attaching "avoid raw fish" to
`swordfish` asserts it about cooked swordfish too; attaching it to `raw-fish` loses the species,
because no species lives there. Curation was stopped and no NHS content was authored.

The pattern is not confined to seafood. Ten parent categories already model preparation, processing,
or provenance as ordinary child categories — `eggs` splits into `raw-eggs` and `cooked-eggs`, `milk`
into `pasteurised-milk` and `unpasteurised-milk-and-dairy-products`, `sushi` into `store-bought-sushi`
and `home-made-sushi`, and so on through `custard`, `ice-cream`, `salads`, `herbs`, `vegetables`,
`fruit`, and `fruit-juice-kombucha-and-cider`. Seafood is not the exception; it is the one group
where the preparation dimension was dropped in favour of a guidance-shaped category, while every
other group solved the same problem ad hoc by spending a tree level on it.

How should the catalogue express preparation, so that a food is found by what it is and assessed by
how it is eaten?

## Considered Options

- Model preparation as a dimension that crosses the category hierarchy, with each food declaring the
  preparation states it is eaten in.
- Allow a food to belong to several categories (`categoryIds: string[]`), making preparation an
  ordinary category level.
- Duplicate each species into one food record per preparation state, keeping one category per food.

## Decision Outcome

Chosen option: "model preparation as a dimension that crosses the category hierarchy", because it is
the only option that lets one food record hold both its species-level facts and its
preparation-specific advice without the software ever choosing between two authored statements.

A **preparation state** becomes a record in a single global vocabulary with a stable id, label, slug,
and sort order. A **food declares the preparation states it is actually eaten in**. A **category's
preparation groupings are derived**, never authored: the union of the states its foods declare and
the states carrying an authored category assessment.

**Catalogue structure and guidance are held to deliberately different evidentiary standards.** A
food's preparation states describe how people eat that food, so they may be *proposed* from general
knowledge of the world and are authored only once a maintainer confirms them. An assessment's
preparation qualifier is health guidance, so it comes from the source's own words or is not authored
at all.

The two carry different risk, which is why they are governed differently. Being wrong that salmon is
eaten raw produces a row nobody needed, or sends a reader to the group rule. Being wrong about what a
source says regarding raw salmon can tell someone a food is safe when no authority said so.

The two combine as follows. Where a source says only "do not eat raw fish", and salmon is commonly
eaten raw, smoked, and cooked, the food declares all three preparations, the avoid guidance attaches
to the raw preparation alone, and the smoked and cooked preparations resolve through the ordinary
rules — the group's rule for that preparation, the species' own unqualified guidance, or the list's
not-assessed fallback. A source is never stretched to cover a preparation it did not address, and a
preparation is never withheld from the catalogue merely because one source ignored it.

An **assessment may be qualified by a preparation state**, at food or category level. An unqualified
assessment applies however the food is prepared and layers onto preparation-specific advice through
the existing `relation: 'adds-to'` accumulation. Assessment uniqueness extends from
`(subject, guidanceList, source)` to `(subject, preparation, guidanceList, source)`.

Browse renders `Category → … → Preparation → Food`. The preparation level appears only where a
grouping is derived, so groups with no preparation dimension render exactly as they do today.

The decisive property is that **every rendered entry sits inside a preparation context and therefore
shows exactly one authored status**. Because search filters the same tree that browse renders rather
than producing a separate flat list, no surface ever asks a food for a single preparation-free
status. This ADR therefore specifies **no collapse rule**, because nothing collapses. That is not an
omission: every available collapse rule was unacceptable. Most-cautious-wins would mark salmon
`Avoid` because raw salmon is, which is false for cooked salmon and would turn most of the catalogue
red; most-permissive-wins violates the project's safety asymmetry outright; and picking a "typical"
preparation infers a status, which is forbidden.

### Consequences

- Good, because a species carries its mercury limit and its preparation advice at once, each as its
  own authored, cited layer, with neither reworded nor merged.
- Good, because a second authority that reasons by preparation can be authored against the same
  catalogue as one that reasons by species, which is what curation needs and cannot do today.
- Good, because the category tree returns to expressing food structure only, and eleven categories
  that encode advice shape or preparation stop competing with it.
- Good, because no status is ever collapsed, averaged, promoted, or synthesised, and the four outcome
  bands are untouched.
- Good, because category groupings are derived, so the tree cannot drift out of step with the foods
  in it and adding a food needs one edit rather than two.
- Good, because a food's preparation states can be proposed from ordinary knowledge and confirmed by a
  maintainer, so the catalogue describes how food is really eaten rather than only what a given source
  happened to mention.
- Good, because the single `primaryCategoryId` invariant survives, so ancestor resolution stays
  unambiguous and no code has to choose between two inheritance paths.
- Bad, because roughly 60 species each need an authored, reviewed declaration of the preparations
  they are eaten in, and a missed declaration silently downgrades that preparation to group guidance.
- Bad, because `filterFoods` and `foodsByCategoryId` must return `(food, preparation)` rows rather
  than foods, which is a signature change rippling into the catalogue page rather than an additive
  field.
- Bad, because browse rows multiply by the number of preparations a food declares, so a group that
  reads as 60 entries today may read as many more.
- Bad, because retiring eleven categories changes their `/category/<slug>` routes, and the guidance
  authored against them must be moved without any wording changing.
- Bad, because a category is limited to one preparation axis, so a source distinguishing a food along
  a second axis — sushi by provenance *and* by whether its fish is raw — must express the second in
  guidance scenarios rather than in structure.
- Bad, because the `ai-guidance-list-curation` skill's authoring rules become incomplete the moment
  this lands: a curator following them would place a food in a category and never state how it is
  eaten, so every drafted seafood record would silently lose its preparation. The skill must be
  corrected in the same change.
- Bad, because that skill must then apply two evidentiary standards within one workflow — general
  knowledge for catalogue structure, source-only for guidance — which is a subtle distinction that
  will be misapplied if the review packet does not keep the two visibly apart.

## Decision Drivers

- A reader's question is "can I eat this, the way I am about to eat it?", so the answer must be
  scoped to a preparation rather than averaged across all of them.
- The project forbids inferring or synthesising a status, which eliminates every rule for collapsing
  several preparation statuses into one chip.
- Safety asymmetry: showing a cautious answer where a source was permissive is tolerable; the reverse
  is not. But a blanket `Avoid` on every food with a risky raw form is its own failure, because it
  makes the status meaningless and trains readers to ignore it.
- Two authorities already disagree in *shape*, not just in conclusion. The model must hold
  species-keyed and preparation-keyed advice side by side without distorting either.
- Authored guidance must move without being reworded. This is a structural change, not a
  reassessment.
- Describing how a food is eaten is a different act from stating what an authority says about it. The
  first is catalogue structure a maintainer can confirm from ordinary knowledge; the second is health
  guidance only a source can supply.
- The category tree must describe food, because it is also the browse and search structure, and a
  reader looks for a food by what it is.

## Pros and Cons of the Options

### Preparation as a crossing dimension

- Good, because one food record keeps one identity, one URL, and one search result while carrying
  advice for several preparations.
- Good, because species-level facts are authored once and layer onto every preparation, so a source
  correction is a one-line diff.
- Good, because it reuses the accumulation layer model already built and tested, rather than adding a
  second structure beside it.
- Good, because derived groupings make the structure a consequence of the content instead of a second
  thing to maintain.
- Bad, because it introduces a new entity, a new assessment key component, and a new browse level, so
  resolution, validation, filtering, and rendering all move together.

### Multiple categories per food

- Good, because it needs no new entity; the tree already supports any structure.
- Good, because `swordfish` could appear under both `smoked-seafood` and `cooked-seafood` with no new
  concept.
- Bad, because "nearest assessed ancestor" stops being well defined: two paths can each assess the
  food differently, and the domain would have to pick a winner. That is precisely the inference the
  safety rules forbid, and no tie-break is defensible.
- Bad, because it breaks an invariant the category-tree ADR fixed, and every consumer of
  `primaryCategoryId` — resolution, breadcrumbs, filtering, search text — would need a rule for
  multiplicity.

### Duplicate species per preparation state

- Good, because it needs no schema or domain change at all, and is the fastest to ship.
- Good, because each duplicate has exactly one status, so no collapse rule is needed.
- Bad, because it fragments one real food into several synthetic records, so searching `salmon`
  returns three near-identical entries and no page describes salmon.
- Bad, because the species-level mercury limit must be authored two or three times per species, which
  invites exactly the drift that lifting group guidance onto categories exists to remove.
- Bad, because it changes food slugs, breaking the shareable `/food/<slug>` contract for every
  affected species.
- Bad, because it destroys the single browsable view of mercury guidance across species without
  replacing it.

## Implementation Plan

- **Affected paths**: `src/domain/schemas.ts`, `src/domain/contentIndex.ts`,
  `src/domain/assessment.ts`, `src/domain/filtering.ts`, `src/domain/categoryTree.ts`,
  `src/domain/contentValidation.ts`, a new `src/data/preparations.ts`, `src/data/foods.ts`,
  `src/data/categories.ts`, `src/data/assessments.ts`, `src/data/index.ts`,
  `src/features/catalogue/CataloguePage.tsx`, `src/features/food-detail/FoodDetailPage.tsx`,
  `src/components/GuidanceSection.tsx`, `src/components/GuideEntrySummary.tsx`, the URL-state module,
  `.agents/skills/ai-guidance-list-curation/SKILL.md`, `docs/architecture/overview.md`,
  `.github/copilot-instructions.md`, and the corresponding tests.

- **Preparation records**: add `preparationSchema` as `{ id, slug, name, sortOrder }` with unique ids
  and slugs, authored in `src/data/preparations.ts` as one global vocabulary. Add
  `preparationIds: string[]` to `foodSchema`, defaulting to empty for a food with no preparation
  dimension. Do not add a preparation list to `categorySchema`; category groupings are derived.

- **Derivation**: extend `buildCategoryTree` (or a sibling builder) to derive, per category, the
  ordered preparation states in play — the union of the declared states of its foods and the states
  carrying an authored category assessment for that category — ordered by the vocabulary's
  `sortOrder`, never by authoring order. A category with an empty derived set renders exactly as it
  does today, with no preparation level.

- **Attribution and uniqueness**: add optional `preparationId` to `assessmentSchema`. Extend
  `subjectKey` in `contentIndex.ts` and the duplicate check in `validateAssessments` to include the
  preparation, so `(subject, preparation, guidanceList, source)` is the unique key and a subject can
  hold one assessment per preparation per source.

- **Resolution**: `resolveAssessment` takes an optional preparation context. With one, it prefers a
  preparation-qualified assessment at the nearest subject level and layers any unqualified assessment
  onto it through the existing `adds-to` accumulation, so a species-level mercury limit accumulates
  onto preparation advice from another source. Without one, it behaves exactly as it does today. The
  existing most-cautious selection across sources is unchanged and must never be extended to select
  across preparations.

- **Filtering**: change `filterFoods` to return `(food, preparation?)` rows and `foodsByCategoryId` to
  group by category and preparation. `matchesGuidanceFilters` resolves with the row's preparation, so
  a band filter returns the cooked row and not the raw row of the same food, and each row counts once.

- **Rendering**: `CataloguePage` renders the derived preparation level between a category and its
  foods and links each row to its preparation-scoped food URL. `FoodDetailPage` renders one section
  per declared preparation, any unqualified guidance presented as applying however the food is
  prepared, and the inherited group rule for undeclared preparations under a label distinguishing it
  from advice about that food.

- **Routing**: keep `/food/{slug}` canonical and carry preparation as a query parameter alongside the
  existing `v=1` contract, so both the bare and preparation-scoped URLs are shareable and an unknown
  preparation value is stripped like any other invalid parameter.

- **Content migration**: retire `fish-mercury-guidance`, move its species under real food categories,
  and re-key every mercury assessment as unqualified species-level guidance. Normalise the ten
  preparation, processing, and provenance category levels onto the dimension, re-keying their
  assessments as preparation-qualified assessments on the parent. No status, summary, scope statement,
  scenario, condition, citation, or locator wording changes in this migration.

- **Curation skill**: the `ai-guidance-list-curation` skill must propose preparation states alongside
  category placement and hold both behind its existing maintainer confirmation gate. Its required
  input gains the preparation scope, and its evidence table gains the preparation a claim applies to.
  The skill **proposes a food's preparation states from general knowledge of how that food is eaten**,
  marked as a structural suggestion carrying no guidance; it **may never propose a preparation
  qualifier for an assessment that the source did not state**. Its review packet lists proposed
  preparation states separately from drafted assessments, so a maintainer confirms catalogue structure
  and approves guidance as two distinct acts.

- **Tests**: domain unit tests for preparation-qualified resolution, unqualified guidance layering
  onto preparation advice, derived grouping order, the group-guidance fallback for an undeclared
  preparation, per-row filtering and counting, and each new validation failure. React Testing Library
  tests for the browse preparation level, a food page showing several preparations plus labelled group
  guidance, and a filtered view returning one preparation row of a food but not another. Chromium
  Playwright coverage for browsing to a preparation group, a preparation-scoped food URL, and a
  filtered URL containing a preparation-varying food, with the existing axe-core WCAG 2.2 AA scans.
  The 100% coverage gate stays green.

## Confirmation

- [ ] A preparation state is an authored record in one global vocabulary, and no code infers a
      preparation from a food's name, category, or siblings.
- [ ] A food declares its own preparation states, and no category authors a list of them.
- [ ] A category's preparation groupings are derived, ordered by the vocabulary's `sortOrder`, and
      adding a food with a new declared state makes the grouping appear with no other edit.
- [ ] A category assessment qualified by a preparation keeps that preparation in the derived grouping
      even when no food declares it.
- [ ] Two assessments for the same subject, preparation, list, and source fail validation; two for the
      same subject and list under different preparations validate.
- [ ] A food declaring an unknown preparation state fails validation, as does an assessment qualified
      by a preparation its subject does not declare.
- [ ] A species displays its unqualified species-level guidance and its preparation-specific guidance
      as separate layers, each with its own scope statement, citation, and locator.
- [ ] Every browse and search entry displays exactly one authored status, and no code path computes,
      averages, promotes, or otherwise derives a status across preparation states.
- [ ] Filtering by outcome band returns only the matching preparation rows, and each row is counted
      once.
- [ ] A food page shows each declared preparation, plus the inherited group rule for undeclared
      preparations under a label distinguishing it from advice about that food.
- [ ] `/food/{slug}` resolves without a preparation parameter, a preparation-scoped URL resolves to the
      same food, and an unknown preparation value is stripped like any other invalid parameter.
- [ ] `fish-mercury-guidance` no longer exists, and no category names a kind of guidance rather than a
      kind of food.
- [ ] The ten preparation, processing, and provenance category levels are normalised, and every food
      remains reachable by browse and by search.
- [ ] No status, summary, scope statement, scenario, condition, citation, or locator wording differs
      from its pre-change value.
- [ ] `docs/architecture/overview.md` and `.github/copilot-instructions.md` describe assessments as
      keyed by subject, preparation, list, and source.
- [ ] The `ai-guidance-list-curation` skill proposes a food's preparation states from general
      knowledge as a structural suggestion, proposes an assessment's preparation qualifier only where
      the source states it, lists the two separately in its review packet, and holds both behind its
      maintainer confirmation gate.
- [ ] A drafted assessment is never qualified by a preparation its source did not address, and a
      preparation a source ignored is never withheld from the food's declared states for that reason.

## More Information

This decision amends
[2026-08-04 ADR: model food groups as an unbounded category tree](<2026-08-04 ADR - model food groups as an unbounded category tree.md>).
That ADR's adjacency-list tree, its arbitrary depth, and its rule that a food references exactly one
`primaryCategoryId` all stand unchanged — this decision deliberately preserves the single-category
invariant and adds preparation *beside* the tree rather than inside it.

It amends
[2026-08-06 ADR: assess categories as first-class subjects with inherited guidance](<2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>)
by extending the assessment subject key with a preparation. Nearest-subject-first resolution, the
grey not-assessed fallback, and assessed categories as routable guide entries are unchanged.

It extends
[2026-08-07 ADR: accumulate inherited guidance through additive assessments](<2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>)
by making unqualified species-level guidance accumulate onto preparation-specific guidance. The
prohibition on merging two authored statements into a third is unchanged.

It preserves
[2026-08-08 ADR: model guidance sources as attributed peers within a guidance list](<2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>)
unchanged. Most-cautious selection continues to apply across *sources* only, and must never be
extended across preparations, which are not competing claims but simultaneously true ones.

It governs
[F-18: Model preparation as a catalogue dimension](<../features/18-model-preparation-as-a-catalogue-dimension.md>),
which holds the product scope, acceptance criteria, and the reader-facing experience. Authoring the
NHS pregnancy content that exposed this problem is deliberately excluded from both, so that a
structural change and a guidance change are never reviewed as one diff.

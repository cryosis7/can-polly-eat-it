# F-18: Model Preparation as a Catalogue Dimension

**Status:** Done

**Implementation plan:** [F-18 implementation plan](<18-model-preparation-as-a-catalogue-dimension-plan.md>)

**Depends on:** [F-09: Assess and Browse Food Categories](<09-assess-and-browse-food-categories.md>), [F-11: Make the Browse Hierarchy Legible and Collapsible](<11-make-browse-hierarchy-legible.md>), [F-12: Lift Group-Level Guidance onto Categories](<12-lift-group-guidance-onto-categories.md>), [F-16: Express Guidance That Accumulates Across Subject Levels](<16-express-accumulating-guidance.md>)

**Governing decisions:** [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>) (Accepted). Constrained by [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>), and [model guidance sources as attributed peers within a guidance list](<../decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>).

## Goal

As Polly, I need to find a food under what it *is* and then see the advice for the way I am actually
going to eat it, so that "can I eat salmon?" is answered as "raw, no; cooked, yes, but limit it"
rather than by a single status that is either misleadingly alarming or misleadingly permissive.

## Problem evidence

The catalogue's category tree currently encodes **how a source shaped its guidance** rather than
**what a food is**, and it does so inconsistently.

The clearest instance is `fish-mercury-guidance`, a category holding around 60 species. It is not a
kind of food; it is a kind of *advice*. It exists because New Zealand Food Safety publishes mercury
limits as one table, so the species were grouped by the table they came from. Preparation — the
dimension that actually governs seafood risk — is instead modelled as three sibling categories
directly under `seafood` (`raw-fish`, `smoked-seafood`, `freshly-cooked-seafood`) which contain
almost no species between them.

The two dimensions were therefore flattened into one level and then split by guidance shape. The
consequence is that **no species can carry both its mercury limit and its preparation advice**, because
a food has exactly one `primaryCategoryId` and therefore exactly one ancestor path to inherit from.

This became blocking when a second pregnancy authority was curated. The NHS states advice by
preparation for species that New Zealand Food Safety rates by mercury:

| Species | New Zealand Food Safety | NHS |
| --- | --- | --- |
| Swordfish | Limit to 1 serving per 1–2 weeks | Avoid |
| Salmon (farmed) | Limit to 3–4 servings per week | Cooked is safe; cold-smoked must be heated until steaming hot; raw must be avoided |
| Shark species | Rated per species by mercury | Avoid |

There is no subject in the current model these NHS statements can attach to. Attaching "avoid raw
fish" to `swordfish` asserts it about cooked swordfish too; attaching it to `raw-fish` loses the
species entirely, because no species lives there. The curation attempt was halted for this reason and
no NHS content was authored.

The pattern is **not confined to seafood**. Ten parent categories already model preparation,
processing, or provenance as ordinary child categories:

| Parent | Children that are really preparation, processing, or provenance |
| --- | --- |
| `eggs` | `raw-eggs`, `cooked-eggs` |
| `milk` | `pasteurised-milk`, `unpasteurised-milk-and-dairy-products` |
| `custard` | `ready-made-chilled-custard`, `home-made-custard` |
| `ice-cream` | `packaged-ice-cream`, `soft-serve-ice-cream`, `home-made-ice-cream` |
| `salads` | `pre-packaged-and-ready-made-salads`, `home-made-salads` |
| `sushi` | `store-bought-sushi`, `home-made-sushi` |
| `herbs` | `dried-herbs`, `fresh-herbs` |
| `vegetables` | `fresh-vegetables`, `frozen-vegetables` |
| `fruit` | `fresh-fruit`, `imported-frozen-berries` |
| `fruit-juice-kombucha-and-cider` | `pasteurised-*`, `unpasteurised-*` |

Seafood is not the exception. It is the one place where the preparation dimension was **dropped** in
favour of a guidance-shaped category, and every other group solved the same problem ad hoc by
spending a tree level on it.

## Primary experience

1. Browse to `Seafood › Fish › Raw` and see the species eaten raw, each showing the raw-preparation
   status.
2. Browse to `Seafood › Fish › Cooked` and see the same species showing their cooked status and their
   own mercury serving limit together.
3. Search `salmon` and get results already inside their preparation context, each with exactly one
   status, rather than one ambiguous entry.
4. Open `Salmon` and see one page listing every preparation it is eaten in, each with its own status,
   above the species-level limit that applies however it is prepared.
5. Filter to `OK to eat` and see cooked salmon without seeing raw salmon.
6. Open a food that is only eaten one way and still find the group's advice for the other
   preparations, clearly labelled as general group guidance rather than advice about that food.

## Required behaviour

- A **preparation state** is a record in a single global vocabulary with a stable id, label, slug,
  and sort order — for example `raw`, `cooked`, `smoked`, `dried`, `frozen`, `pasteurised`,
  `unpasteurised`, `home-made`, `store-bought`. One vocabulary keeps `raw` meaning the same thing
  under fish, meat, and eggs, and gives every surface one deterministic display order.
- A **food declares the preparation states it is actually eaten in.** This is a catalogue-structure
  fact about the food, not a guidance fact, so it may be proposed from general knowledge of how that
  food is eaten and is authored once a maintainer confirms it.
- A **category's preparation groupings are derived, never authored**: the union of the states its
  foods declare and the states that carry an authored category assessment. Adding a food that
  declares a new state makes that grouping appear with no second edit, so the tree cannot drift out
  of step with the foods in it.
- A category carries **at most one preparation axis**. Where a source distinguishes a food along a
  second axis — sushi by provenance *and* by whether its fish is raw — the second axis is expressed
  in the assessment's guidance scenarios and conditions, which already exist for exactly this.
- An **assessment may be qualified by a preparation state**, at food or category level. An
  unqualified assessment applies however the food is prepared. Resolution runs on two axes — the
  food-wide axis and the preparation being rendered — each walked nearest-subject-first and then
  combined, food-wide layers first, with the most cautious authored status governing. Assessment
  uniqueness extends to `(subject, preparation, guidanceList, source)`.
- **Browse renders `Category → … → Preparation → Food`.** The preparation level appears only where
  a grouping is derived, so groups with no preparation dimension are unchanged.
- **Every browse and search entry sits inside a preparation context and therefore shows exactly one
  authored status.** No status is ever collapsed, averaged, promoted, or synthesised across
  preparation states, because no surface asks a food for a single preparation-free status.
- **Filtering applies per preparation row.** Filtering to `OK to eat` returns the cooked row and not
  the raw row of the same food; each returned row is counted once.
- A **food page** shows every preparation state that food declares, each with its own status, plus any
  unqualified species-level guidance presented as applying however it is prepared. Preparation states
  the food does not declare are shown as **inherited group guidance, explicitly labelled as such**, so
  a reader asking about an unusual preparation gets the group's authored answer rather than silence.
- A food's canonical route stays `/food/{slug}`. A preparation context is carried as a query
  parameter, so a browse or search result links to the food in the preparation the reader was looking
  at, and both the bare and preparation-scoped URLs are shareable.
- **`fish-mercury-guidance` is retired.** Its species move under real food categories, and every
  mercury limit becomes an unqualified species-level assessment that applies in every preparation.
- The fourteen existing preparation, processing, provenance, and guidance-shaped category levels
  are **normalised onto the new dimension**, so the tree expresses food structure only.
- No reviewed status, summary, scenario, condition, citation, or locator wording changes. This feature
  moves authored guidance to a subject that can hold it; it does not reword or reassess any of it.
- The **`ai-guidance-list-curation` skill proposes preparation states alongside category placement**,
  and both remain maintainer-confirmed before any record is written. A curator adding a food today
  proposes where it sits in the catalogue and waits for confirmation; it must now also propose the
  preparation states that food is eaten in, and the preparation each drafted assessment is qualified
  by, with the same confirmation gate. Its evidence table gains the preparation a claim applies to, so
  a reviewer can see that "avoid raw fish" was read as preparation-specific rather than as advice
  about the species.
- **Catalogue structure and guidance are held to deliberately different evidentiary standards.** A
  food's preparation states describe how people eat that food, so the skill **proposes them from
  general knowledge of the world** and a maintainer confirms them. An assessment's preparation
  qualifier is health guidance, so it comes from the source's own words or is not authored at all.
  Where a source addresses only one preparation, the food still declares the others, and those others
  resolve through the ordinary rules rather than being covered by that source's advice.

## Non-goals

- Authoring the NHS content that exposed this problem. That is content work which resumes once this
  feature is `Done`, and it is deliberately excluded so a structural change and a guidance change are
  never reviewed as one diff.
- Authoring a preparation state, or a preparation-qualified assessment, without maintainer
  confirmation. General knowledge may *propose* how a food is eaten; only a maintainer's confirmation
  authors it.
- Inferring, merging, or promoting a status across preparation states.
- Nested preparation axes within one category.
- Changing `Food` to belong to more than one category. The single `primaryCategoryId` invariant is
  retained deliberately; preparation is a dimension that crosses the hierarchy, not a second parent.
- Duplicating a species into one food record per preparation state, which would fragment its identity,
  its URL, and its search result, and would duplicate the mercury text that this feature keeps
  single-sourced.
- Introducing a fifth outcome band, or list-specific wording meaning "it depends how you prepare it".
- Adding a cross-catalogue "show me everything raw" filter. The global vocabulary makes it possible
  later; it is not in scope here.
- Re-fetching or re-scraping any source.

## Assumptions and open questions

- **The ADR is accepted:** [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>).
  It records why preparation is a crossing dimension rather than a category or a second parent, why no
  status-collapse rule is specified, and how it amends the category-tree and category-assessment ADRs.
  Its questions for implementation are settled by the approved
  [F-18 implementation plan](<18-model-preparation-as-a-catalogue-dimension-plan.md>).
- Surfaced by the ADR: `filterFoods` returns `Food[]` and `foodsByCategoryId` groups by category, so
  per-row filtering makes both return `(food, preparation)` rows. This is a signature change rippling
  into the catalogue page rather than an additive field.
- Resolved with the maintainer: preparation is a **dimension that crosses the hierarchy**, not a
  category level and not a second parent. Rejected alternatives are recorded above as non-goals.
- Resolved with the maintainer: the browse layout keeps preparation **beneath** the category path, so
  the reader still navigates by what a food is before choosing how it is prepared.
- Resolved with the maintainer: **each food declares its own preparation states**, rather than
  inheriting every state its category offers. Honest listings were preferred over the smaller
  authoring cost, with the group-guidance fallback closing the resulting safety gap.
- Resolved with the maintainer: **general knowledge may propose a food's preparation states, but never
  its guidance.** Structure and guidance were deliberately separated: describing how salmon is eaten
  is ordinary knowledge a maintainer can confirm, while stating what an authority says about raw
  salmon is health guidance only a source can supply. A source addressing one preparation neither
  extends to the others nor suppresses them from the catalogue.
- Resolved with the maintainer: **category preparation groupings are derived from the foods**, not
  declared on the category. There is no scalability concern; the catalogue holds 109 static food
  records built once at module load.
- Resolved with the maintainer: an undeclared preparation on a food page shows the **inherited group
  rule, labelled as general group guidance**. Grey `not-assessed` was rejected there because the group
  rule *has* been assessed, and showing grey would understate the evidence.
- The catalogue-wide status collapse problem disappears under this model rather than being solved:
  because search filters the same tree that browse renders, every entry already carries a preparation
  context. This should be re-verified during implementation planning, as it is the load-bearing reason
  no collapse rule is specified.
- Open: whether retiring `fish-mercury-guidance` and the ten normalised categories breaks existing
  shareable URLs, and whether any redirect or slug-preservation strategy is warranted. The application
  is unreleased, so this is expected to be a documentation matter rather than a migration.
- Open: which food categories the roughly 60 species land in once `fish-mercury-guidance` is retired.
  A flat `Seafood › Fish` is sufficient for the model; whether finer grouping is wanted is a content
  decision for the maintainer.
- **Needs maintainer review before publication:** every declaration of which preparation states a
  species is eaten in. These are catalogue-structure judgements about roughly 60 species, and a missed
  state means a real preparation shows group guidance instead of species-specific advice.

## Acceptance criteria

- A species carries its mercury serving limit and its preparation advice at the same time, and both
  are displayed with their own scope statement, citation, and locator, neither reworded nor merged.
- Every browse and search entry displays exactly one authored status, and no code path computes a
  status for a food across its preparation states.
- Filtering to a single outcome band returns the preparation rows matching that band and no others,
  and each row is counted once.
- A food page displays each declared preparation state with its own status, any unqualified
  species-level guidance, and the group's guidance for undeclared preparations under a label that
  distinguishes it from advice about that food.
- A category's preparation groupings are derived; no data file authors a category's list of
  preparation states, and adding a food with a new declared state makes the grouping appear.
- `fish-mercury-guidance` no longer exists, and no category in the tree names a kind of guidance
  rather than a kind of food.
- The fourteen preparation, processing, provenance, and guidance-shaped category levels are
  normalised, and every food remains reachable by browse and by search.
- No reviewed status, summary, scenario, condition, citation, or locator wording differs from its
  pre-change value.
- Content validation rejects a food declaring an unknown preparation state, an assessment qualified by
  a preparation state its subject does not declare, and a duplicate
  `(subject, preparation, guidanceList, source)`.
- An accepted ADR records the decision, why preparation is a crossing dimension rather than a category
  or a second parent, and how it relates to the category-tree and category-assessment ADRs.
- The `ai-guidance-list-curation` skill proposes a food's preparation states from general knowledge as
  a structural suggestion, proposes an assessment's preparation qualifier only where the source states
  it, lists the two separately in its review packet, and holds both behind the existing maintainer
  confirmation gate. A drafted assessment qualified by a preparation the source did not address is a
  skill failure, not an authoring choice.

## Validation

Domain unit tests for preparation-qualified resolution, unqualified species-level guidance layering
onto preparation advice, derived category groupings, the group-guidance fallback for an undeclared
preparation, per-row filtering, and each new validation failure. React Testing Library tests for the
browse preparation level, a food page showing several preparations plus labelled group guidance, and a
filtered view returning one preparation row of a food but not another. Chromium Playwright coverage
for browsing to a preparation group, a preparation-scoped food URL, and a filtered URL containing a
preparation-varying food, with the existing axe-core WCAG 2.2 AA scans. Repository-wide 100%
statements, branches, functions, and lines coverage for application source is retained.

### Validation evidence

All gates green before merge: `npm run typecheck`, `npm run lint`, `npm run test:coverage` (223 tests,
100% statements/branches/functions/lines), `npm run build`, and `npm run test:e2e` (58 Chromium tests
including axe-core WCAG 2.2 AA scans on the preparation-scoped food page, the catalogue showing
preparation groupings, and a category page with per-preparation sections).

Two migration-specific safety nets prove nothing authored was lost: `src/test/preF18Resolution.ts`
captures every body each food resolved to before the migration, and `src/domain/wordingPreservation.test.ts`
asserts the union of bodies across a food's rows still contains every pre-migration body.

A subagent ran the `prepare` skill against the local diff against `main`. It raised three findings,
all documentation drift and all resolved: the ADR and this brief described unqualified guidance
layering through `relation: 'adds-to'` when the implementation combines two axes; both stated ten
retired category levels when fourteen were retired; and the architecture overview's project layout
omitted preparation records. No dependency-version or undocumented-architecture findings.

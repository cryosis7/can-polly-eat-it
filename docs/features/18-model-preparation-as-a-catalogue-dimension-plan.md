# F-18 Implementation Plan: Model Preparation as a Catalogue Dimension

**Feature:** [F-18](<18-model-preparation-as-a-catalogue-dimension.md>)
**Status:** Complete — tasks 1-15 done and validated; all gates green and `prepare` findings resolved

## Progress

Tasks 1-7 are implemented. `npm run typecheck`, `npm run lint`, `npm test` (208 passing),
`npm run test:coverage` (100% statements, branches, functions, and lines), `npm run build`, and
`npm run test:e2e` (49 passing) are all green. No authored guidance has been edited: every food
declares an empty `preparationIds` and no assessment carries a `preparationId`, so the shipped
catalogue renders exactly as it did before. Decisions 5 and 6 were amended during implementation and
are recorded below as amended.

**Task 8, the human gate, is complete and every part is confirmed.** Its outcomes are recorded as
decisions 9-12, and the blocking finding it surfaced as decision 13. The gate added two tasks before
the content migration and changed the shape of the migration itself: fourteen category levels retire
rather than ten, `seafood` gains three children, and the vocabulary holds thirteen states rather than
eleven.

**Tasks 9 and 10, the category-side mirror, are complete and validated.** `src/data/preparations.ts`
now holds the confirmed thirteen-state vocabulary. `categoryEntryRows` and `entryRowsByCategoryId`
derive a category's axes, `filterCategoryEntries` returns `CategoryRow[]` and resolves per row,
`CataloguePage` renders a preparation grouping when a category holds guidance for it even with no
foods, and `CategoryDetailPage` renders one section per preparation. All gates are green: typecheck,
lint, 220 unit tests, 100% coverage on all four metrics, build, and 49 Playwright tests.

Still no content has been migrated: no food declares a preparation and no assessment carries a
qualifier, so the shipped catalogue continues to render exactly as before.

One bug was found and fixed by the coverage gate rather than by a test: making a category expandable
whenever it held any guidance entry gave unqualified-only categories a toggle that expanded to
nothing, because an unqualified entry renders above the collapse. Only preparation-qualified entries
count towards expandability.

**Governing decisions:** [model preparation as a catalogue dimension](<../decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [accumulate inherited guidance through additive assessments](<../decisions/2026-08-07 ADR - accumulate inherited guidance through additive assessments.md>), and [model guidance sources as attributed peers within a guidance list](<../decisions/2026-08-08 ADR - model guidance sources as attributed peers within a guidance list.md>)

The accepted ADR settles the model. This plan sequences it and resolves the questions the ADR and the
brief leave to implementation.

## Design decisions settled by this plan

### 1. A preparation grouping is a rendering construct, never a `Category`

The derived preparation level is rendered as a heading and list inside a category group. It is not
inserted into `CategoryTree` as a synthetic category. Synthesising categories would put derived rows
into the category filter dropdown, mint `/category/<slug>` routes for things no source assessed, give
`categoryAndDescendantIds` a level nobody authored, and put derived structure into the same map as
authored structure. Keeping it a rendering construct means `flattenCategoryRows`,
`visibleCategoryRows`, `withAncestorIds`, the category filter, and the category routes are all
untouched.

### 2. A food declaring preparations appears only inside them, never also as a bare row

If a food declaring `raw` and `cooked` also rendered as a bare `Salmon` row, that row would need a
preparation-free status, which is exactly the collapse the ADR forbids. So a food with a non-empty
`preparationIds` contributes one row per declared preparation and no bare row. A food with an empty
`preparationIds` renders directly under its category exactly as it does today, and its category shows
no preparation level unless another food or a category assessment introduces one.

### 3. Preparation is a food-detail parameter, not part of the catalogue query state

`prep=<preparation-slug>` is parsed and built by a dedicated helper rather than being added to
`CatalogueQueryState`. The catalogue's canonical URL therefore never grows a `prep`, `returnSearch`
stays a pure catalogue state, and the back link from a preparation-scoped food page returns the
reader to the catalogue they came from rather than to a catalogue filtered by one preparation. An
unknown or unmatched `prep` value is stripped and the page renders as the bare food URL, matching how
every other invalid parameter behaves.

### 4. Without a preparation context, preparation-qualified assessments take no part in resolution

`resolveAssessment(subject, list, index)` with no preparation resolves from unqualified assessments
only. Including qualified ones would present advice about raw salmon as though it applied to salmon
however it is eaten, which is an inference the safety rules forbid. The food page therefore does not
show a single blended answer; it calls the resolver once per preparation and renders the results
side by side, with unqualified species-level guidance shown as applying however the food is prepared.

### 5. Food-wide guidance and preparation guidance are two axes, resolved separately and shown together

*Amended during implementation.* Nearest-subject-first measures nearness by category depth, which
made a food's own food-wide rule suppress its group's rule for a particular preparation. Neither is
more specific than the other, so they are resolved on two independent axes: the food-wide axis
considers only unqualified assessments, the preparation axis only assessments qualified by that
preparation, and each walks the tree by the existing rules.

The two are then shown together on the row, food-wide first because it holds however the subject is
prepared. Nothing is merged; every layer keeps its own wording, scope statement, and citations. The
governing status is the more cautious of the two authored statuses, and where sources disagree each
source's position carries its statements from both axes.

So a food-wide rule is restated under every preparation, which is deliberate: each preparation
section is then complete on its own and can be read out of order.

### 6. Undeclared preparations sit under a heading naming the group

A food page renders one section per declared preparation, then a section for the preparations the
food does not declare, headed:

> General guidance for Seafood › Fish applies:

Each undeclared preparation is listed beneath it with its resolution, which by decision 5 is the
group's rule for that preparation together with any food-wide rule. The heading names the group
rather than the food, stated in words rather than by colour or position. Grey `not-assessed` is not
used, because the group rule *has* been assessed and showing grey would understate the evidence.

### 7. The migration invariant becomes a wording-preservation check

`migrationInvariant.test.ts` currently pins each subject's resolution, but this feature retires
eleven categories and moves species between them, so a subject-keyed pin cannot survive by
construction. It is replaced by a stronger, honest check: for every food and every list, the union of
authored layer bodies across all of that food's rows — its declared preparations, or its bare
resolution where it declares none — must contain every authored body that food resolved to before the
change. Nothing may be lost, reworded, or reattributed; guidance may only become more precisely
scoped. The pre-change snapshot is regenerated into `src/test/preMigrationResolution.ts` before task 8
begins.

### 8. Preparation names are not added to search text

Searching `raw` would otherwise match every food declaring a raw preparation, including ones no
source assessed raw. Search continues to match food names, aliases, and category path terms, and the
rows it returns already sit in their preparation context per decision 2. A cross-catalogue
preparation filter is a stated non-goal.

### 9. The confirmed preparation vocabulary is thirteen states

*Settled at the task 8 gate.* `raw`, `fresh`, `frozen`, `dried`, `smoked`, `cooked`, `cold-cooked`,
`processed`, `pasteurised`, `unpasteurised`, `home-made`, `store-bought`, `soft-serve`, in that
display order.

Three states were added beyond the original draft because the `(subject, preparation, list, source)`
uniqueness key forces them: `cold-cooked` and `processed` because `cold-cooked-poultry` and
`processed-meats` are siblings of `cooked-meats` under `meat-and-poultry` carrying different authored
rules, and `soft-serve` because `soft-serve-ice-cream` is an avoid sitting beside packaged and
home-made ice cream. Without them the migration would merge separately authored assessments, which
the guidance rules forbid. `marinated` was dropped as unused; "marinated raw fish" remains an alias
on the raw seafood categories.

The order runs least-processed to most-processed, then pasteurisation, then provenance, with
`soft-serve` last at the maintainer's direction so ice cream reads home-made, store-bought, soft
serve — an escalation rather than an alphabet.

### 10. Fourteen category levels retire, and three scope decisions govern how

*Settled at the task 8 gate.* The ADR estimated ten; the real count is fourteen. Each retiring child
re-keys onto its surviving parent with no wording change.

Three cases could not be resolved mechanically:

- **`unpasteurised-milk-and-dairy-products` keys to `dairy`, not `milk`.** Its authored scope says
  "Applies to all unpasteurised milk **and dairy products**", so keying it to `milk` would silently
  narrow an avoid rule. On `dairy` the scope is preserved exactly, and cheese, cream, butter and
  yoghurt gain an unpasteurised line, which is correct and more cautious.
- **`imported-frozen-berries` keys to `fruit` + Frozen**, accepting that the rule widens from
  imported frozen berries to all frozen fruit while its scope statement still reads "imported". The
  widening is more cautious, and the alternative — rewording — is forbidden by the wording-
  preservation invariant.
- **Aliases on retiring categories move to the surviving parent.** `beef`, `pork`, `chicken`,
  `mince`, `sausages`, `ham`, `salami` and the rest are food names parked on preparation categories
  so search finds them, and they land on `meat-and-poultry` so no search term breaks. Turning them
  into real foods is separate work.

### 11. Seafood gains three real children

*Settled at the task 8 gate.* `fish-mercury-guidance` is a source's table wearing a category's
clothes and retires. Its 66 species move into `fish` (59), `shellfish` (8) and `crustacea` (1), which
match the source's own phrase "fish, shellfish and crustacea". The split is also forced: `raw-fish`
and `raw-shellfish` are separately authored rules and cannot both key to `seafood` + Raw.
`smoked-seafood` and `freshly-cooked-seafood` stay on `seafood`, because their scope statements name
all three groups together.

### 12. Every seafood species declares the preparations it is eaten in

*Settled at the task 8 gate, after four rounds of independent review.* All 68 species declare
`cooked`; 17 declare `raw`; 27 declare `smoked`. Seafood grows from 68 rows to 112.

The maintainer chose browsable per-species rows over the alternatives, accepting two consequences put
to them first: preparation names stay out of search text, so the gain is in browsing only; and since
no species has a preparation-specific rule, every row in a preparation group repeats its group's
sentence.

Two tests decide a declaration, and both are the maintainer's:

- **Everyday practice counts; a menu item does not.** Skipjack tuna declares raw because fresh bonito
  is everyday practice in Pacific communities, even though mainstream retail sells it canned. Hapuka
  does not declare raw, because its raw consumption is fine-dining only. Commercial sale and home
  preparation count equally, and every community's practice counts equally.
- **The question is what people eat, never whether they should.** A species that is risky to eat a
  given way still declares it. Excluding a food because eating it that way seems unwise would defeat
  the guide's purpose, since the guidance exists for exactly those foods.

**The methodological finding, which matters more than any single species.** Every error made while
assembling these lists came from reasoning about what people *should* eat — from flesh type,
oiliness, or culinary theory — rather than finding evidence of what they *do*. That reasoning
produced smoked hoki from nothing, then deleted it again, and wrongly excluded blue cod, snapper,
trevally, tarakihi, red cod, monkfish and rig; live fishmonger product listings and government food
surveys contradicted it in every case. No evidence-led finding was overturned in the other direction.
This is the lesson task 13 must carry into the `ai-guidance-list-curation` skill.

Three declarations are retained on judgement with the evidence gap recorded: sprats on smoked, and
striped marlin and rock lobster on raw. A missing citation is not counter-evidence, and leaving a
state undeclared is the recoverable direction, because the food page still shows the group's rule.

Eight species — anchovy, sprats, ghost sharks, silverside, orange perch, javelin fish, cardinal fish
and ribaldo — were flagged by a reviewer as possibly not eaten in New Zealand at all. They stay, and
none is removed: every one carries authored MPI mercury serving advice already in this catalogue, and
a serving recommendation is a statement that people eat the fish. Authored source content outranks
secondary evidence, and removing them would delete guidance the guide already gives.

### 13. Category guidance entries are preparation-aware, or the migration deletes 32 browsable pages

*Found while working the task 8 gate, and the reason tasks 9 and 10 exist.*

Fifty categories carry their own assessment and render in the catalogue as a guidance entry with a
resolved status and a `/category/<slug>` page. **Thirty-nine of them hold no foods at all** — being a
guidance entry is their entire reason to exist — and thirty-two of those retire under decision 10.
Migrating the content without this work would:

- render nothing in the catalogue for them, because `CataloguePage` renders a preparation grouping
  only where a food row sits in it;
- render `/category/meat-and-poultry` as **"Not assessed"** while the category holds four authored
  rules including an avoid, because `CategoryDetailPage` resolves without a preparation and decision 4
  deliberately excludes qualified assessments from a preparation-free resolution;
- break `/category/raw-meat` and 31 other shareable URLs.

The second of those is the serious one: it authors a `not-assessed` onto a subject that has been
assessed, which the safety rules forbid outright.

The fix mirrors on categories what tasks 5-7 did for foods — rows carrying an optional preparation,
resolution per row, and one rendered section per preparation. It also removes the need for any
special case elsewhere: `dairy` + Unpasteurised from decision 10 stays browsable with no unpasteurised
food authored anywhere, purely because a category's own guidance now creates a grouping.

## Affected areas

| Area | Change |
| --- | --- |
| `src/domain/schemas.ts` | Add `preparationSchema` (`{ id, slug, name, sortOrder }`). Add `preparationIds: string[]` to `foodSchema` and optional `preparationId` to `assessmentSchema`. |
| `src/data/preparations.ts` | New. The single global preparation vocabulary. |
| `src/data/index.ts` | Pass `preparations` into `validateContent`. |
| `src/domain/contentIndex.ts` | `findAssessments` gains a preparation argument selecting one axis: unqualified assessments without one, assessments qualified by that preparation with one. |
| `src/domain/contentValidation.ts` | `ContentData` gains `preparations`. Validate the vocabulary, unknown declared states, an assessment qualified by a state its subject does not declare, and the `(subject, preparation, list, source)` uniqueness key. |
| `src/domain/assessment.ts` | Two-axis resolution per decision 5, combined without merging. |
| `src/domain/filtering.ts` | `filterFoods` returns `CatalogueRow[]` (`{ food, preparationId? }`) and resolves per row. `filterCategoryEntries` returns `CategoryRow[]` (`{ category, preparationId? }`) and resolves per row, so an outcome filter returns a category's raw entry without its cooked entry. |
| `src/domain/categoryTree.ts` | `preparationIdsByCategoryId` derives each category's groupings from its foods' declarations **and its own preparation-qualified assessments**; `rowsByCategoryId` groups rows by category then preparation in vocabulary order. `createContentIndex` keeps its signature, so derivation stays a pure function rather than index state. |
| `src/app/catalogueQuery.ts` | `parsePreparationParam` and `withPreparation` helpers, kept out of `CatalogueQueryState`. |
| `src/features/catalogue/CataloguePage.tsx` | Render the derived preparation level; link each row to its preparation-scoped food URL; count rows. Render a preparation grouping when the category holds guidance for that preparation **even if no food declares it**, with the category's guidance entry inside it. |
| `src/features/food-detail/FoodDetailPage.tsx` | One section per declared preparation, the labelled undeclared-preparation section, and honouring `prep`. |
| `src/features/category-detail/CategoryDetailPage.tsx` | One guidance section per preparation the category holds, plus its unqualified guidance, mirroring `FoodDetailPage`. Without this a migrated category renders `not-assessed` while holding authored rules — see decision 13. |
| `src/components/GuidanceSection.tsx` | Accept an optional preparation label for the section heading; no change to layer or position rendering. |
| `src/data/categories.ts`, `foods.ts`, `assessments.ts` | The content migration of task 8. |
| `.agents/skills/ai-guidance-list-curation/SKILL.md` | Propose preparation states from general knowledge; propose a qualifier only where the source states it; list the two separately in the review packet. |
| `docs/architecture/overview.md`, `.github/copilot-instructions.md` | Describe preparation as a crossing dimension and assessments as keyed by subject, preparation, list, and source. |
| Tests | `contentValidation.test.ts`, `assessment.test.ts`, a new `preparationGuidance.test.ts`, `filtering.test.ts`, `categoryTree.test.ts`, `migrationInvariant.test.ts`, `CataloguePage.test.tsx`, `FoodDetailPage.test.tsx`, `catalogueQuery.test.ts`, and the e2e suite. |

No change to the guidance-list model, the outcome bands, the scope or outcome URL parameters, the
AND/OR filter semantics, `/category/<slug>` behaviour, or the multi-source dissent rules.

## Resolution model

`resolveAssessment(subjectRef, guidanceList, index, preparationId?)`.

1. **The food-wide axis** resolves using unqualified assessments only, by the existing walk: nearest
   subject level, per-source layers, ancestor accumulation, most-cautious selection across sources.
2. **The preparation axis** does the same using only assessments qualified by `preparationId`. It is
   skipped entirely without a preparation context, so preparation-free resolution is unchanged.
3. **The two are combined** per decision 5: layers are the food-wide layers then the preparation
   layers, the governing status is the more cautious of the two authored statuses, and positions are
   merged per source, contested only where sources still reach different statuses.
4. When neither axis finds anything, the list's not-assessed fallback resolves exactly as today.

## Constraints

- No authored status, summary, scope statement, scenario, condition, citation, or locator wording is
  reworded, merged, or reattributed by this feature.
- No code path derives a preparation from a food's name, category, tags, or siblings, and no code
  path computes a status for a food across its preparation states.
- Category preparation groupings are derived on every build; no data file authors one.
- `src/domain/` must not import React, router, or browser modules, and the walks stay iterative.
- The preparation level is conveyed by text, not by colour or position alone, and is reachable by
  keyboard and screen reader.
- Repository-wide 100% statements, branches, functions, and lines coverage for application source is
  retained.

## Tests

Validation, `src/domain/contentValidation.test.ts`:

1. Duplicate preparation IDs and duplicate preparation slugs each fail.
2. A food declaring an unknown preparation state fails.
3. An assessment qualified by a preparation its food subject does not declare fails.
4. An assessment qualified by a preparation no food in its category subject declares fails.
5. Two assessments for the same subject, preparation, list, and source fail; two for the same subject
   and list under different preparations validate.
6. A food declaring no preparation states validates, and an unqualified assessment on it validates.

Derivation, `src/domain/categoryTree.test.ts`:

7. A category's derived preparation states are the union of its foods' declarations and the states
   carrying an authored category assessment, ordered by vocabulary `sortOrder`, not authoring order.
8. Adding a food declaring a new state makes that grouping appear with no other edit.
9. A category whose foods declare nothing derives an empty set and renders no preparation level.

Resolution, `src/domain/assessment.test.ts` and `src/domain/preparationGuidance.test.ts`:

10. With a preparation context, a qualified assessment resolves and an assessment qualified by a
    different preparation does not.
11. Without a preparation context, qualified assessments take no part and only unqualified guidance
    resolves.
12. An unqualified species-level assessment and a preparation-qualified assessment from another
    source both appear as layers on that row, and the governing status is the more cautious authored
    one.
13. Where one source authors both a qualified and an unqualified assessment at a level, the qualified
    one supplies that source's status and the unqualified one is still rendered as a layer.
14. A category assessment qualified by a preparation layers onto that preparation's rows only.
15. A preparation with no applicable assessment at any level falls back to the list's not-assessed
    state with empty layers.
16. Resolution for a food declaring no preparations is byte-identical to today's.

Filtering, `src/domain/filtering.test.ts`:

17. A food whose cooked row is `okay` and whose raw row is `not-okay` appears once under an `okay`
    filter and once under a `not-okay` filter, never both, and each row is counted once.
18. A food declaring no preparations filters exactly as it does today.

Content, `src/domain/migrationInvariant.test.ts`:

19. Per decision 7, every food's post-change authored bodies contain every pre-change authored body,
    in both lists, with no wording difference.
20. No category in the tree names a kind of guidance, asserted by `fish-mercury-guidance` being
    absent and every food remaining reachable by browse and by search.

URL state, `src/app/catalogueQuery.test.ts`:

21. A known `prep` slug parses; an unknown one is stripped and reported as a removed filter.
22. `buildCatalogueQuery` never emits `prep`, so the catalogue's canonical URL is unchanged.

React Testing Library:

23. `CataloguePage.test.tsx`: a category with a derived grouping renders preparation headings with
    their foods beneath, each row showing exactly one status.
24. `CataloguePage.test.tsx`: a category with no derived grouping renders exactly as today.
25. `CataloguePage.test.tsx`: filtering to one outcome band shows one preparation row of a food and
    not another, and the announced count matches the rows shown.
26. `FoodDetailPage.test.tsx`: a food declaring several preparations renders a section per
    preparation plus its unqualified species-level guidance.
27. `FoodDetailPage.test.tsx`: an undeclared preparation renders under the labelled group-guidance
    sentence, distinguishable from advice about that food.
28. `FoodDetailPage.test.tsx`: a `prep` parameter opens the page focused on that preparation, and an
    unknown value renders the bare food page.

End-to-end, Chromium Playwright with the existing axe-core WCAG 2.2 AA scans:

29. Browse into a preparation grouping and open a food from it.
30. A preparation-scoped food URL loads directly and is shareable.
31. A filtered URL containing a preparation-varying food shows the expected row only.

Category-side, added for tasks 9 and 10 per decision 13:

32. `filtering.test.ts`: `filterCategoryEntries` returns one row per preparation a category holds
    guidance for, plus an unqualified row where it holds unqualified guidance.
33. `filtering.test.ts`: an outcome filter matches a category's raw entry without matching its cooked
    entry, and each row counts once.
34. `categoryTree.test.ts`: a category's derived groupings include a preparation carried only by its
    own assessment, with no food declaring it.
35. `CataloguePage.test.tsx`: a category holding preparation-qualified guidance and no foods renders a
    preparation grouping containing its guidance entry.
36. `CataloguePage.test.tsx`: that entry links to the category page and keeps `returnSearch`.
37. `CategoryDetailPage.test.tsx`: a category holding several preparation-qualified assessments
    renders one guidance section per preparation, each with its own authored wording and citations.
38. `CategoryDetailPage.test.tsx`: a category holding only preparation-qualified guidance never
    renders `not-assessed`.

## Ordered tasks

1. Add `preparationSchema`, `preparationIds`, and `preparationId` to the schemas, and add
   `src/data/preparations.ts` with the proposed vocabulary. Every existing food declares an empty
   `preparationIds`, so behaviour is unchanged.
2. Thread `foods` and `preparations` through `createContentIndex` and `validateContent`, extend
   `subjectKey` with the preparation, and add the derived `preparationIdsByCategoryId`. Add tests
   7-9. No behaviour change.
3. Add the validation rules of tests 1-6.
4. Extend `resolveAssessment` with the preparation context and the per-source reduction. Add tests
   10-16.
5. Move `filterFoods` and the category grouping to rows, and resolve per row. Add tests 17-18.
6. Add the `prep` URL helpers. Add tests 21-22.
7. Render the catalogue preparation level and the food page's per-preparation and
   undeclared-preparation sections. Add tests 23-28.
8. **Human gate — maintainer review before any content moves. Completed; every part confirmed.** The
   packet was presented in four parts rather than three, because the vocabulary could not be judged
   without seeing the category levels it had to absorb. Its outcomes are recorded in decisions 9-12
   below and are settled input to tasks 7a onwards.
9. **Make category guidance entries preparation-aware in the domain.** Add `CategoryRow`
   (`{ category, preparationId? }`), change `filterCategoryEntries` to return rows and resolve per
   row, and derive the preparations a category holds guidance for from its own qualified assessments.
   Add tests 32-34.
10. **Render category guidance inside preparation groupings.** `CataloguePage` renders a preparation
    grouping when the category holds guidance for that preparation even if no food declares it, with
    the category's guidance entry inside it. `CategoryDetailPage` renders one section per preparation
    the category holds plus its unqualified guidance, mirroring `FoodDetailPage`. Add tests 35-38.
11. Snapshot pre-change resolutions into `src/test/preMigrationResolution.ts`, then perform the
    content migration: retire `fish-mercury-guidance` and the fourteen preparation, processing, and
    provenance category levels, add the `fish`, `shellfish` and `crustacea` categories, move the
    species, and re-key the retired categories' assessments as preparation-qualified assessments on
    the surviving parent. No wording changes. Add tests 19-20.
12. Add the Playwright scenarios 29-31.
13. Update the `ai-guidance-list-curation` skill, `docs/architecture/overview.md`, and
    `.github/copilot-instructions.md`.
14. Run targeted validation, then the full gates.
15. Pre-merge verification: instruct a subagent to run the `prepare` skill against the branch diff,
    noting the repository has no remote so it reviews the local diff against `main`. Record its
    findings, or their resolution, in the feature brief before F-18 moves to `Done`.

## Validation

- `npm test -- src/domain/contentValidation.test.ts src/domain/assessment.test.ts src/domain/preparationGuidance.test.ts src/domain/filtering.test.ts src/domain/categoryTree.test.ts src/domain/migrationInvariant.test.ts src/app/catalogueQuery.test.ts src/features/catalogue/CataloguePage.test.tsx src/features/food-detail/FoodDetailPage.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test:coverage` — 100% thresholds retained
- `npm run test:e2e` — scenarios 29-31 added, with the existing WCAG 2.2 AA axe scans
- `npm run build`

## Risks

- **A missed preparation declaration silently downgrades a real preparation to group guidance.**
  Mitigation: the declarations are a human gate, presented per food, and the food page always shows
  the group rule for undeclared preparations under an explicit label rather than showing nothing.
- **Guidance reworded or lost while eleven categories are retired.** Mitigation: the wording-
  preservation invariant of decision 7 is written before the migration, and the migration is a
  separate task from every model change.
- **A preparation qualifier attributed to a source that did not state it.** Mitigation: validation
  cannot detect this, so it is held by the curation skill's two-standard review packet and by the
  migration re-keying only assessments that already sat on a preparation-shaped category.
- **Row multiplication making a large group unreadable.** Accepted: the collapsible hierarchy from
  F-11 already governs group size, and the preparation level is collapsible with its category.

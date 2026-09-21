# Architecture Overview

## Purpose

Polly's Food Guide is a responsive React single-page application (SPA) for answering the practical
question "can Polly eat this food?" It starts with pregnancy food-safety advice and supports
independently maintained lists, including vegetarian suitability, without changing the food
catalogue model.

The application presents a browsable, category-grouped catalogue; free-text search; composable
filters; and a food detail view that makes the rule, its conditions, and source clear.
It is a personal reference tool, not medical advice. It must link to its source material and direct
users to a health professional for personal advice.

## Product boundaries

### In scope for the first release

- A pregnancy food-safety list based on reviewed MPI guidance.
- An arbitrary-depth food category hierarchy.
- Food names, aliases, status, conditions, citations, and review metadata.
- Grouped browsing, search, category/status filtering, and shareable results.
- A detail route that explains conditions such as cooking, storage, serving temperature, and
  frequency limits.
- Responsive, keyboard-accessible, colour-independent presentation.

### Explicitly out of scope for the first release

- Personal health profiles, pregnancy dates, allergy management, meal planning, or medical
  recommendations.
- A user account, server-side database, administrative UI, analytics, or personalised tracking.
- Live scraping or automatic interpretation of government guidance.
- A claim that every food or product is covered. When no reviewed rule applies, the application must
  present "Not assessed" as a neutral state that is not safe.

## Design principles

1. **Safety and provenance before convenience.** Never infer a food's safety from its name, from a
   sibling food, or from an ancestor category that carries no authored assessment. Guidance may only
   come from explicitly reviewed assessments on the food itself or on assessed ancestor categories in
   the same guidance list. Replacement remains the default, while an assessment explicitly authored as
   additive can display inherited and specific guidance as separate, fully attributed layers. Every
   assessment is manually reviewed, and cited according to its guidance list's citation policy.
2. **Conditions are first-class.** "Safe only when cooked" is not equivalent to "safe"; the
   condition is displayed with the amber outcome.
3. **One food catalogue, many guidance lists.** Pregnancy safety and vegetarian suitability are
   separate assessments against the same food, not properties baked into the food record.
4. **No artificial hierarchy ceiling.** The user can add categories below categories as deeply as
   the content needs; the UI renders the derived tree.
5. **Static by default.** Small, reviewed data belongs in the repository and is validated during
   development. A backend is added only when the product needs collaboration, accounts, or
   frequently changing content.
6. **URL state is product state.** Search and filters belong in the URL so a useful result can be
   bookmarked or shared without a user account.
7. **Provenance is explicit.** Every guidance list states its evidentiary standard: either precise
   source locations for its guidance and unassessed notice, or, for a list whose claims rest on
   general knowledge, a displayed statement of that basis.

## Decision approval gate

The Accepted ADRs in [`docs/decisions/`](../decisions/) authorise the
implementation target in this document; subsequent changes that contradict an accepted decision
require a new ADR or an explicit amendment.

## Logical architecture

```text
Reviewed source material
        |
        v
Version-controlled content data --> schema and relationship validation
        |                                      |
        v                                      v
React domain/query layer ----------------> validation errors in local checks
        |
        +--> category tree builder
        +--> search index
        +--> assessment and filter predicates
        |
        v
React routes and accessible UI
  /                         grouped catalogue
  /food/:foodSlug           food detail
  /category/:categorySlug   assessed category detail
  URL query parameters      selected scopes, outcomes, search, and filters
```

The initial application is entirely client-side. It is deployed on Netlify as an HTTPS static site.
`public/_redirects` contains `/* /index.html 200` for deep routes, and `netlify.toml` sets a
short/no-cache policy for `index.html` while Vite's hashed `/assets/*` files use
`Cache-Control: public, max-age=31536000, immutable`. The router base path is `/`.

## Target project layout

The first implementation should use these boundaries:

```text
src/
  app/                 route composition, application shell, URL query parsing
  data/                reviewed category, food, preparation, list, assessment, and source records
  domain/              types, Zod schemas, validation, tree, search, and filter functions
  features/
    catalogue/         category-grouped list and result cards
    food-detail/       conditions, source citations, and empty/not-assessed states
    category-detail/   category-wide guidance and the foods that inherit it
    filters/           search and filter controls
  components/          shared presentational and accessibility primitives
  styles/              global tokens and application styles
  test/                shared test setup and factories
```

`src/domain/` must not import React, routing, or UI modules. It owns the deterministic operations
that make data safe to render and easy to test. `src/data/` is data only; it must not contain
rendered JSX or filtering logic.

## Domain model

### Categories and foods

Categories form an adjacency-list tree rather than a nested, fixed-depth document:

```ts
type Category = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  aliases: string[];
  sortOrder: number;
};

type Food = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  primaryCategoryId: string;
  preparationIds: string[];
  tags: string[];
  sortOrder: number;
};
```

`parentId: null` identifies a root category. A food may be attached to any category, including an
intermediate category, so the catalogue can represent both a category such as "Cheese" and a named
food under a more specific branch such as `Dairy -> Cheese -> Hard cheese`. Categories can have
both child categories and direct food records.

The content validator must reject duplicate IDs or slugs, unknown parents/categories, self-parent
links, and cycles. Multiple root categories are valid; every category must terminate at exactly one
root. The runtime tree builder must be iterative or otherwise safe for arbitrary authored depth; it
must not contain a product-defined maximum depth.

The initial static catalogue budget is 2,000 foods and 500 categories. The tree builder emits
flattened display rows with a full category breadcrumb so that rendering does not recurse through
the authored depth, and visual indentation is capped without hiding the full path. A content change
that exceeds either budget requires a measured performance review and a new ADR before publishing.

### Preparation as a crossing dimension

Preparation is a dimension that crosses the category tree, not a shape the tree takes. A food is
filed once, under what it *is*, and declares the preparation states it is actually eaten in
through `preparationIds`. The catalogue must not carry preparation-shaped categories such as
"Raw eggs" or "Cooked eggs"; those became the `eggs` category assessed once per preparation.

```ts
type Preparation = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};
```

A declaration answers one question and one only: **do people in New Zealand eat this food in this
state, commercially or home-prepared?** Everyday community practice counts; a single fine-dining
menu item does not. A declaration must never be inferred from a food's name, its siblings, or any
theory about the food itself, and it never expresses risk — risk lives in the assessment.

A preparation grouping is a rendering construct derived from the declarations and the
preparation-qualified assessments a category holds. It is never a synthetic category: it does not
appear in the category filter, has no route, and is absent from `categoryAndDescendantIds`.

Where a food does not declare a state its group is assessed in, the food page still shows the
group's authored rule under a heading naming the group, so a reader asking about that state gets
the authored answer rather than silence, labelled as the group's rule rather than as advice about
that food.

### Guidance lists and assessments

A **guidance list** is a named perspective over foods and categories. The initial lists are
`pregnancy-food-safety` and `vegetarian-suitability`; every list uses exactly the same shape.

```ts
type GuidanceList = {
  id: string;
  slug: string;
  title: string;
  description: string;
  citationPolicy: "required" | "optional";
  sourceIds: string[];
  evidentiaryBasis?: string;
  unassessedStatusId: string;
  statuses: StatusDefinition[];
  unassessedNotice: UnassessedNotice;
};

type Source = {
  id: string;
  slug: string;
  name: string;
  organisation: string;
  homeUrl?: string;
};

type StatusDefinition = {
  id: string;
  slug: string;
  label: string;
  tone: "green" | "amber" | "red" | "grey";
  outcomeBand: "okay" | "maybe" | "not-okay" | "not-assessed";
  sortOrder: number;
  filterLabel: string;
  summary: string;
};

type UnassessedNotice = {
  description: string;
  citations: SourceCitation[];
};

type AssessmentSubject =
  | { kind: "food"; foodId: string }
  | { kind: "category"; categoryId: string };

type Assessment = {
  id: string;
  subject: AssessmentSubject;
  guidanceListId: string;
  preparationId?: string;
  sourceId?: string;
  relation?: "replaces" | "adds-to";
  statusId: string;
  summary?: string;
  scopeStatement?: string;
  guidanceScenarios: GuidanceScenario[];
  reasonLinks: AssessmentReasonLink[];
  citations: SourceCitation[];
};

type AssessmentReasonLink = {
  kind: "contains" | "derived-from" | "made-with" | "other";
  targetFoodId: string;
  statement: string;
};
```

An assessment is unique for a `(subject, preparationId, guidanceListId, sourceId)` tuple, where the
subject is exactly one food or one category. A food's status resolves nearest-subject-first: its own
assessments; otherwise the nearest ancestor category assessed in the same guidance list, walking the
category path from the nearest parent to the root; otherwise the list-owned grey
`unassessedStatusId`. The fallback status must not be authored on an assessment.

Resolution runs on exactly one axis at a time. The **food-wide axis** holds assessments carrying no
`preparationId`; a **preparation axis** holds those carrying one. Each axis is walked
nearest-subject-first independently, then the two are combined: food-wide layers first, the more
cautious authored status governing, and each source's position merged. Nothing is ever merged
textually. Resolving on a single axis matters because measuring nearness by depth alone would let a
food's own food-wide rule suppress its group's rule for one preparation.

Because food-wide guidance applies to the food however it is prepared, it is repeated inside every
preparation section rather than stated once above them, so each section reads standalone.

A category is a first-class assessment subject in its own right, including when every rule it holds
is preparation-qualified. Resolving such a category without a preparation would otherwise return
`not-assessed` over authored rules, which is forbidden: `not-assessed` never implies safety.

A **source** is the authority that stands behind a statement, and is distinct from a citation, which
is a link to a passage. Provenance is never inferred from a citation's URL, title, or array position.
A guidance list declares the sources it draws on; a list standing on its `evidentiaryBasis` declares
none. Attribution is required only where it carries meaning: a list declaring two or more sources
must name a `sourceId` on every assessment. A single-source list may omit the redundant ID or name
its one declared source; a no-source list authors none.

Where several sources assessed the same subject and agree on a status, the guide shows one status and
one ordered set of attributed layers; two sources whose whole authored body is identical collapse
into one layer carrying both names and both citations. Where they disagree, the most cautious
authored status governs the chip, the outcome band, filtering, and the count — selected by generic
outcome band, never by `sortOrder`, and never averaged, blended, or invented — and each source's
position is shown whole as a competing alternative rather than stacked. Wherever a contested status
appears, including the catalogue overview, the guide states in text which source concluded otherwise,
what it concluded, and where to read it, without relying on colour. A source that has not assessed a
subject is silent: it never counts as agreeing or dissenting.

Where an assessment authors no `summary`, the list's canonical wording for its resolved status is
displayed. A source-specific summary stays authored on the assessment and is attributed to its source.

`relation` states how an assessment relates to inherited guidance. An absent value means
`"replaces"`, preserving the total-override behaviour for existing records. An assessment authored as
`"adds-to"` keeps its own status as the resolved status while the guidance body also collects assessed
ancestors in the same guidance list, stopping at and including the first `"replaces"` assessment. The
UI renders the collected guidance broadest ancestor first and then the nearest assessment, as
discrete layers with their own summaries, scenarios, scope statements, and citations.

Inherited assessments are applied whole. Statuses, summaries, scenarios, conditions, and citations
are never merged across subject levels or across sources, and inheritance never crosses guidance
lists. Wherever guidance is inherited or accumulated, the interface names the origin category, shows
its `scopeStatement`, and shows that layer's source if it has one. An `adds-to` assessment may
accumulate onto an ancestor rule stated by a *different* source, and each layer keeps its own source
label. A category assessment requires a `scopeStatement`; a food assessment must not have one.
Validators must reject an additive assessment with no same-list ancestor assessment, or one whose
generic outcome band is less restrictive than the *same source's* assessment it adds to. The
restrictiveness comparison is within a source only: across sources it would let one authority's
caution invalidate another authority's authored record.

A category that carries its own authored assessment is a **guide entry**: it is searchable,
filterable, counted in results, and addressable at `/category/<slug>`. Categories that merely inherit
remain plain browse headings.

Validators must ensure unique status IDs, slugs, and labels per list, one list-owned grey
not-assessed fallback status, valid subject references, unique source IDs and slugs, list source
references that resolve, and unique subject/list/source triples.

Citation requirements are owned by the list, not the application. A list declares
`citationPolicy: "required" | "optional"` with no default. A `required` list, such as
`pregnancy-food-safety`, fails validation when any assessment or its unassessed notice omits a
citation. An `optional` list, such as `vegetarian-suitability`, may hold uncited assessments and an
uncited unassessed notice because its claims are largely definitional rather than risk judgements; it
must instead declare an `evidentiaryBasis` that is displayed once per view. No per-assessment "no
source attached" marker is rendered, and no view may assume a citation exists. Manual review remains
mandatory for every list, and content drafted by the AI curation skill is always cited regardless of
policy.

`tone` controls the visual RAG indicator only; each list defines its own labels and meaning. For
example, pregnancy uses "OK to eat", "Only with conditions", "Avoid", "Limit", and "Not assessed",
whereas vegetarian suitability can use "Vegetarian", "Contains animal-derived ingredients", "Check
ingredients", and "Not assessed". Each list-owned status maps to one generic `outcomeBand` for
filtering. `okay`, `maybe`, and `not-okay` are the primary user-facing outcome filters; the
`not-assessed` fallback band remains a neutral domain state and is never a safe outcome.

### Assessment reason links

An assessment may cite a canonical catalogue food as a structured reason for its outcome. For
example, an assessment for a dessert can state "Contains gelatin" and link its `targetFoodId` to
the Gelatin food record. This relationship is authored evidence for the assessed food; it does not
inherit, calculate, or infer status from the target food's assessments.

Reason links are intentionally restricted to existing `Food` records in the first release. They do
not create standalone abstract concerns such as "contamination risk", do not replace the
assessment's own citation, and do not change which food's assessment is displayed. Validators must
reject an unknown target food, duplicate `(kind, targetFoodId)` links within an assessment, or an
empty statement. A link from a food assessment must not target that same food. The target food may be
unassessed in the active list; the link still renders as a navigation aid, not proof of a particular
outcome.

### Conditions and citations

Guidance scenarios preserve alternatives and ordering. Every scenario has a complete authoritative
instruction; individual conditions are ordered supporting steps and never imply that conditions from
another scenario also apply:

```ts
type GuidanceScenario = {
  id: string;
  applicability: string;
  instruction: string;
  conditions: AdviceCondition[];
};

type AdviceCondition = {
  id: string;
  kind: "preparation" | "storage" | "serving" | "frequency" | "composition" | "other";
  instruction: string;
  facts?: Array<{
    label: string;
    valueText: string;
  }>;
};

type SourceCitation = {
  title: string;
  url: string;
  locator: string;
};
```

The prose instruction remains the authoritative display text. `facts` are optional display metadata
only: their `valueText` deliberately retains ranges and qualifiers such as "1 serving every 1 to
2 weeks"; the application must not calculate, filter, or generate advice from them. A citation, where
one is authored, must identify both a durable URL and a locator such as a table heading and row.
Source material is manually reviewed and paraphrased; the application does not scrape, infer, or
silently update advice.

## Catalogue, search, and filters

The standard view renders depth-first category rows in editorial order. A category is shown when it
or one of its descendants contains a food that matches the current query, or when it is itself a
matching guide entry. Each visible group exposes its full breadcrumb; headings are not mapped
one-to-one to arbitrary category depth.

A **guide entry** is a food, or a category carrying its own authored assessment. Search, filters, and
the result count operate over guide entries, and the count announces results rather than foods.

Filtering, counting, and rendering operate on **rows**, not foods. A food that declares several
preparation states contributes one row per state, and each row resolves and filters independently:
an outcome filter can match a food's raw row without matching its cooked row. Rows are grouped under
their preparation heading inside the category group.

A rule may be authored higher in the tree than the foods it governs, because a source can state one
rule for all seafood while the species stay filed under what they are. Each preparation band
therefore carries a **callout** stating the rule that governs it — resolved, toned by its status,
and naming the scope it was authored at with a link to its origin category — so it reads as the
group's advice about that preparation rather than as a category of its own. Where a descendant band
carries a rule beside its foods, the ancestor's own food-less band is dropped from the catalogue and
from the count together, rather than showing a rule with no foods directly above foods with no rule.

**Every view renders every layer in `resolved.layers`.** A card, a callout, and a detail section may
differ in how much of each layer they show, but never in *which* layers they show: selecting a
subset by origin, depth, or novelty understates authored guidance. A status label is a summary of
the guidance and never a substitute for it, so no view shows a status without the words behind it.

A **collapsed row** — a nested category heading or a preparation band, never a root group — carries an
**aggregate chip** summarising what the collapse hides, so a reader can skip a group without opening
it. Collapsing a category hides its own guidance along with its descendants, exactly as collapsing a
preparation band hides its callout, so the chip is the row's whole answer rather than a summary
sitting above a restatement of it. It is not a status: no guidance list authors it, it is never persisted, and it disappears on
expansion so it never sits beside the statuses it stands for. It is derived in two folds over
statuses `resolveAssessment` has already produced. First, each hidden entry's outcome is combined
across the active scopes, most cautious first, where an entry unassessed on one scope but assessed on
another reads as a caution rather than deferring to the real answer — silence is not evidence of
safety. Second, those per-entry outcomes are compared: identical everywhere yields that outcome's own
chip, and any difference yields the neutral "mixed, open it" chip. The row's own guidance participates
as one more entry rather than being merged into its descendants, so a food that replaces its
category's rule shows up as a disagreement. Because the chip is a uniformity check rather than a
second most-cautious pass, a uniformly conditional group and a genuinely mixed one render alike; both
correctly tell the reader the group needs attention. A chip never summarises a filtered subset, so
none renders while a search, category, or outcome filter is active. Selecting a further dietary scope
is not such a filter: it changes which guidance is shown rather than which entries qualify, leaving
the result count and the reader's collapse state untouched.

Search normalises case, diacritics, punctuation, and whitespace, then matches every query token
against food names, aliases, and the labels/aliases on the food's category path. A category entry is
matched against its own name, its aliases, and its ancestor path labels. It must not guess
equivalent foods from a model or an external service. Empty search returns the normal catalogue.

Filter rules are predictable:

- A category filter includes its entire descendant subtree.
- The default selected dietary scopes are pregnancy food safety and vegetarian suitability.
- Selected dietary scopes are cumulative (AND): a food must satisfy every selected scope.
- Selected generic outcome bands are alternatives (OR) within each selected scope.
- When no primary outcome is selected, scopes do not narrow foods by outcome; cards still render the
  selected scopes' list-specific status labels and guidance.
- Resolved `not-assessed` fallback outcomes are neutral, never safe outcomes, and are not primary RAG
  filters.
- Every active scope and outcome filter is shown as a labelled chip so users can tell why a food is
  present or excluded.

The URL query contract is versioned with `v=1`. `scope=<comma-separated-guidance-list-slugs>`
selects dietary constraints, defaulting to `pregnancy-food-safety,vegetarian-suitability`; `outcome=<comma-separated-outcome-bands>`
selects generic outcomes; `q=<text>` and `category=<category-slug>` control search and category.
For example,
`/food/cheddar?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=okay,maybe`
preserves the catalogue's selected dietary constraints when opening detail guidance, and
`/category/<slug>` does the same for an assessed category. `prep=<preparation-slug>` carries the
preparation a reader opened a detail page from; the page still shows every state the subject is
assessed in and marks the one they were looking at. Unknown version, scope, category, or outcome values are removed while valid constraints remain, and
the UI announces that unavailable shared filters were removed. An unknown detail-only preparation
value is ignored, highlights no preparation, and is omitted from links generated from the parsed
state without triggering the shared-filter announcement.

## Trust, accessibility, and privacy

- Show the list name, status label, meaningful icon/text, and neutral state wherever an assessment or
  fallback is shown. The food-detail view lists every citation behind the displayed guidance; the
  catalogue names no "primary source", because the order of a citation array carries no authored
  meaning. For a list whose citation policy is optional, show its declared evidentiary basis once per
  view. Colour must never be the only status signal, and a disagreement between sources is always
  stated in words.
- Where guidance is inherited from an ancestor category, including as one layer of accumulated
  guidance, name that category, show its scope statement, and link to it, so inherited advice is never
  presented as food-specific.
- Show assessment reason links on the food-detail view with their authored statement and canonical
  food label; keep catalogue cards concise and do not show reason links there in the first release.
- Put the medical-information disclaimer in the application shell, food detail page, and category
  detail page; source guidance remains authoritative.
- Use native form labels, semantic headings/lists, keyboard-operable controls, visible focus,
  logical screen-reader announcements for result count, and responsive layouts that do not rely on
  hover.
- Enforce the accessible presentation automatically: `e2e/accessibility.spec.ts` runs `axe-core`
  through `@axe-core/playwright` against every route and key interaction state at a 320px and a
  desktop viewport, failing the pre-commit gate on any WCAG 2.2 AA violation with no allowlist or
  baseline. Automated scanning is a floor, not proof of conformance, so the hand-written assertions
  for visible focus, announcement text, and textual status labels remain necessary.
- Store no personal or health information. Local UI preferences are optional and must not be needed
  for correct behaviour.

## Initial source baseline

The first list is based on MPI's [Food and pregnancy](https://www.mpi.govt.nz/food-safety-home/food-pregnancy)
and [List of safe food in pregnancy](https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy)
pages. These sources demonstrate the required content shapes: category-level sections; individual
foods such as hard cheese; conditional preparation; refrigeration/time limits; and consumption
frequency limits. The user-provided pullout guide is retained as a starting reference, but the
editorial process must cite the currently reviewed authoritative URL and exact locator for every
implemented assessment.

### Tea and herbal drinks

`pregnancy-food-safety` also draws on three reviewed tea sources, because New Zealand Food Safety
does not address tea: the [Medeniyet Medical Journal review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7384490/),
the [American Pregnancy Association](https://americanpregnancy.org/pregnancy/herbal-tea/), and
[BabyCenter](https://www.babycenter.com/pregnancy/diet-and-fitness/herbal-teas-during-pregnancy_3537).
They are peers of New Zealand Food Safety inside the one list rather than a list of their own,
because they answer the same question about the same reader.

Tea is filed under `Drinks > Tea`, split into `Caffeinated tea` and `Herbal tea`. That split is what
every source makes: caffeine governs one branch and unstudied plant compounds govern the other. Tea
declares no preparation states, because no source distinguishes a cup of tea by how it was made.

Every tea in the catalogue is there because a reviewed source named it, and carries that source's own
assessment. A tea is not listed merely because people drink it, so when a source is dropped, the teas
only it named are dropped with it. `src/domain/teaGuidance.test.ts` enforces this.

These sources disagree often, and the disagreement is authored rather than resolved: each source's
advice is its own assessment, the most cautious authored status governs the entry, and the dissenting
positions are named and linked. Where they agree on a status but differ in detail — BabyCenter sets a
200 mg daily caffeine limit where the American Pregnancy Association declines to name a figure — each
position stays inside the sentence of the source that stated it, and no reconciled figure is shown.

Adding these sources made the pregnancy list multi-source, so every pre-existing pregnancy assessment
now names `new-zealand-food-safety` and the guide renders attribution on content that previously
spoke in an unattributed voice.

### `Not enough evidence`

The pregnancy list owns a fifth status, `pregnancy-insufficient-evidence` (amber, `maybe` band), for
a source that declines to judge. The American Pregnancy Association rates several herbs "insufficient
reliable information available", which is not a conditional verdict, and rendering it as
`Only with conditions` would attribute to that source a conclusion it did not reach. It shares the
`maybe` outcome band with `pregnancy-conditions`, so the catalogue's outcome filter groups the two
and only the authored words separate them; that filtering imprecision was accepted deliberately in
preference to misattribution. Like every other authored status it is never the fallback, which stays
`pregnancy-not-assessed`.

## Deployment and operations

- Deploy the Vite bundle to Netlify using `netlify.toml` and `public/_redirects`; verify the root and
  direct `/food/<slug>` and `/category/<slug>` routes with the local production preview before
  merging into `main`.
- Commit the package lockfile and content data with every release.
- Run type-checking, data validation, unit tests, UI tests, and a production build locally before
  merging into `main`.
- Review and update citations, assessments, and unassessed notices whenever a source changes.

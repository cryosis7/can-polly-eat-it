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
- A claim that every food or product is covered. The application must distinguish a food inside a
  list's reviewed scope that is "Not assessed" from a food that is outside that list's current
  coverage; neither is safe.

## Design principles

1. **Safety and provenance before convenience.** Never infer a food's safety from its name or from
   a parent category. Each displayed assessment must be explicitly reviewed and cited.
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
7. **Coverage and provenance are explicit.** Every guidance list declares what it currently covers
   and cites precise source locations for its guidance.

## Decision approval gate

The five ADRs in [`docs/decisions/`](../decisions/) are **Accepted**. They authorise the
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
React domain/query layer ----------------> validation errors in CI
        |
        +--> category tree builder
        +--> search index
        +--> assessment and filter predicates
        |
        v
React routes and accessible UI
  /                         grouped catalogue
  /food/:foodSlug           food detail
  URL query parameters      selected lists, search, and filters
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
  data/                reviewed category, food, list, assessment, and source records
  domain/              types, Zod schemas, validation, tree, search, and filter functions
  features/
    catalogue/         category-grouped list and result cards
    food-detail/       conditions, source citations, and empty/not-assessed states
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
  tags: string[];
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

### Guidance lists and assessments

A **guidance list** is a named perspective over foods. The initial active list is
`pregnancy-food-safety`; a future `vegetarian-suitability` list uses exactly the same shape.

```ts
type GuidanceList = {
  id: string;
  slug: string;
  title: string;
  description: string;
  unassessedStatusId: string;
  outOfCoverageStatusId: string;
  statuses: StatusDefinition[];
  coverage: CoverageDeclaration;
};

type StatusDefinition = {
  id: string;
  slug: string;
  label: string;
  tone: "green" | "amber" | "red" | "grey";
  sortOrder: number;
  filterLabel: string;
};

type CoverageDeclaration = {
  mode: "all-catalogue" | "category-subtrees-and-foods";
  categoryIds: string[];
  foodIds: string[];
  description: string;
  citations: SourceCitation[];
};

type FoodAssessment = {
  id: string;
  foodId: string;
  guidanceListId: string;
  statusId: string;
  summary: string;
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

An assessment is unique for a `(foodId, guidanceListId)` pair. When it is absent, the resolver first
checks the list's coverage declaration: a food inside coverage resolves to the list-owned grey
`unassessedStatusId`, while a food outside coverage resolves to the distinct grey
`outOfCoverageStatusId`. Neither fallback status may be authored on an assessment.

`mode: "all-catalogue"` ignores `categoryIds` and `foodIds`; the other mode covers the union of
the listed category subtrees and individual food IDs. Validators must ensure unique status IDs,
slugs, and labels per list, distinct list-owned grey fallback statuses, valid coverage references,
and at least one coverage citation. `tone`
controls the visual RAG indicator only; each list defines its own labels and meaning. For example, pregnancy uses
"OK to eat", "Only with conditions", "Avoid", "Limit", "Not assessed", and "Outside current
coverage", whereas vegetarian suitability can use "Vegetarian", "Contains animal-derived
ingredients", "Check ingredients", "Not assessed", and "Outside current coverage".

### Assessment reason links

An assessment may cite a canonical catalogue food as a structured reason for its outcome. For
example, an assessment for a dessert can state "Contains gelatin" and link its `targetFoodId` to
the Gelatin food record. This relationship is authored evidence for the assessed food; it does not
inherit, calculate, or infer status from the target food's assessments.

Reason links are intentionally restricted to existing `Food` records in the first release. They do
not create standalone abstract concerns such as "contamination risk", do not replace the
assessment's own citation, and do not change which food's assessment is displayed. Validators must
reject an unknown target food, a self-link, duplicate `(kind, targetFoodId)` links within an
assessment, or an empty statement. The target food may be unassessed in the active list; the link
still renders as a navigation aid, not proof of a particular outcome.

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
2 weeks"; the application must not calculate, filter, or generate advice from them. A citation must
identify both a durable URL and a locator such as a table heading and row. Source material is
manually reviewed and paraphrased; the application does not scrape, infer, or silently update
advice.

## Catalogue, search, and filters

The standard view renders depth-first category rows in editorial order. A category is shown only
when it or one of its descendants contains a food that matches the current query. Each visible
group exposes its full breadcrumb; headings are not mapped one-to-one to arbitrary category depth.

Search normalises case, diacritics, punctuation, and whitespace, then matches every query token
against food names, aliases, and the labels/aliases on the food's category path. It must not guess
equivalent foods from a model or an external service. Empty search returns the normal catalogue.

Filter rules are predictable:

- A category filter includes its entire descendant subtree.
- Multiple selected statuses in one guidance list are alternatives (OR).
- Predicates from different guidance lists, category, tags, and condition kinds are cumulative
  (AND).
- An active guidance list with no assessment includes a food only if its selected status includes
  the resolved "Not assessed" or "Outside current coverage" fallback.
- The display list is separate from constraint-only list filters. Every active filter is shown as a
  labelled chip, including its list name, so users can tell why a food is present.

The URL query contract is versioned with `v=1`. `list=<list-slug>` selects the display list on both
catalogue and detail routes. `q=<text>` and `category=<category-slug>` control search and category;
each constraint list uses `status.<list-slug>=<comma-separated-status-slugs>`. For example,
`/food/cheddar?v=1&list=pregnancy-food-safety` opens the pregnancy assessment, while a catalogue
can add `status.vegetarian-suitability=vegetarian`. Unknown version, list, category, or status
parameters fall back to the default display list and drop only invalid constraints; the UI announces
that unavailable shared filters were removed. The initial catalogue defaults to pregnancy safety.

## Trust, accessibility, and privacy

- Show the list name, status label, meaningful icon/text, coverage state, and a direct
  primary-source link wherever an assessment or fallback is shown. Colour must never be the only
  status signal.
- Show assessment reason links on the food-detail view with their authored statement and canonical
  food label; keep catalogue cards concise and do not show reason links there in the first release.
- Put the medical-information disclaimer in the application shell and food detail page; source
  guidance remains authoritative.
- Use native form labels, semantic headings/lists, keyboard-operable controls, visible focus,
  logical screen-reader announcements for result count, and responsive layouts that do not rely on
  hover.
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

## Deployment and operations

- Deploy the Vite bundle to Netlify using `netlify.toml` and `public/_redirects`; test the root and
  a direct `/food/<slug>` route in a Netlify deploy preview before production.
- Commit the package lockfile and content data with every release.
- Run type-checking, data validation, unit tests, and UI tests in continuous integration before
  deployment.
- Review and update citations and coverage whenever a source changes.

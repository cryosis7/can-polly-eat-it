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

1. **Safety and provenance before convenience.** Never infer a food's safety from its name, from a
   sibling food, or from an ancestor category that carries no authored assessment. Guidance may only
   come from an explicitly reviewed assessment on the food itself or on its nearest assessed ancestor
   category, and inherited guidance is always displayed with its origin and breadth. Every assessment
   is manually reviewed, and cited according to its guidance list's citation policy.
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
   and states its evidentiary standard: either precise source locations for its guidance, or, for a
   list whose claims rest on general knowledge, a displayed statement of that basis.

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
  data/                reviewed category, food, list, assessment, and source records
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

A **guidance list** is a named perspective over foods and categories. The initial lists are
`pregnancy-food-safety` and `vegetarian-suitability`; every list uses exactly the same shape.

```ts
type GuidanceList = {
  id: string;
  slug: string;
  title: string;
  description: string;
  citationPolicy: "required" | "optional";
  evidentiaryBasis?: string;
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
  outcomeBand: "okay" | "maybe" | "not-okay" | "not-assessed" | "outside-coverage";
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

type AssessmentSubject =
  | { kind: "food"; foodId: string }
  | { kind: "category"; categoryId: string };

type Assessment = {
  id: string;
  subject: AssessmentSubject;
  guidanceListId: string;
  statusId: string;
  summary: string;
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

An assessment is unique for a `(subject, guidanceListId)` pair, where the subject is exactly one food
or one category. A food's guidance resolves in three steps: its own assessment; otherwise the nearest
ancestor category assessed in the same guidance list, walking the category path from the nearest
parent to the root; otherwise the coverage declaration, where a food inside coverage resolves to the
list-owned grey `unassessedStatusId` and a food outside coverage resolves to the distinct grey
`outOfCoverageStatusId`. Neither fallback status may be authored on an assessment.

An inherited assessment is applied whole. Statuses, summaries, scenarios, conditions, and citations
are never merged across subject levels, and inheritance never crosses guidance lists. A food-level
assessment replaces an ancestor's completely. Wherever guidance is inherited, the interface names the
origin category, shows its `scopeStatement`, and shows that category's source if it has one. A
category assessment requires a `scopeStatement`; a food assessment must not have one. Every assessed
subject must fall within its list's declared coverage, so a category rule cannot reach foods the list
does not claim to cover.

A category that carries its own authored assessment is a **guide entry**: it is searchable,
filterable, counted in results, and addressable at `/category/<slug>`. Categories that merely inherit
remain plain browse headings.

`mode: "all-catalogue"` ignores `categoryIds` and `foodIds`; the other mode covers the union of
the listed category subtrees and individual food IDs. Validators must ensure unique status IDs,
slugs, and labels per list, distinct list-owned grey fallback statuses, valid coverage references,
and unique subject/list pairs.

Citation requirements are owned by the list, not the application. A list declares
`citationPolicy: "required" | "optional"` with no default. A `required` list, such as
`pregnancy-food-safety`, fails validation when any assessment or its coverage declaration omits a
citation. An `optional` list, such as `vegetarian-suitability`, may hold uncited assessments because
its claims are largely definitional rather than risk judgements; it must instead declare an
`evidentiaryBasis` that is displayed once per view. No per-assessment "no source attached" marker is
rendered, and no view may assume a citation exists. Manual review remains mandatory for every list,
and content drafted by the AI curation skill is always cited regardless of policy.

`tone`
controls the visual RAG indicator only; each list defines its own labels and meaning. For example, pregnancy uses
"OK to eat", "Only with conditions", "Avoid", "Limit", "Not assessed", and "Outside current
coverage", whereas vegetarian suitability can use "Vegetarian", "Contains animal-derived
ingredients", "Check ingredients", "Not assessed", and "Outside current coverage". Each
list-owned status maps to one generic `outcomeBand` for filtering. `okay`, `maybe`, and `not-okay`
are the primary user-facing outcome filters; the two fallback bands remain distinct neutral domain
states and are never safe outcomes.

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

Search normalises case, diacritics, punctuation, and whitespace, then matches every query token
against food names, aliases, and the labels/aliases on the food's category path. A category entry is
matched against its own name, its aliases, and its ancestor path labels. It must not guess
equivalent foods from a model or an external service. Empty search returns the normal catalogue.

Filter rules are predictable:

- A category filter includes its entire descendant subtree.
- The default selected dietary scope is pregnancy food safety.
- Selected dietary scopes are cumulative (AND): a food must satisfy every selected scope.
- Selected generic outcome bands are alternatives (OR) within each selected scope.
- When no primary outcome is selected, scopes do not narrow foods by outcome; cards still render the
  selected scopes' list-specific status labels and guidance.
- Resolved `not-assessed` and `outside-coverage` fallback bands are distinct neutral states, never
  safe outcomes, and are not primary RAG filters.
- Every active scope and outcome filter is shown as a labelled chip so users can tell why a food is
  present or excluded.

The URL query contract is versioned with `v=1`. `scope=<comma-separated-guidance-list-slugs>`
selects dietary constraints, defaulting to `pregnancy-food-safety`; `outcome=<comma-separated-outcome-bands>`
selects generic outcomes; `q=<text>` and `category=<category-slug>` control search and category.
For example,
`/food/cheddar?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=okay,maybe`
preserves the catalogue's selected dietary constraints when opening detail guidance, and
`/category/<slug>` does the same for an assessed category. Unknown version,
scope, category, or outcome values are removed while valid constraints remain, and the UI announces
that unavailable shared filters were removed.

## Trust, accessibility, and privacy

- Show the list name, status label, meaningful icon/text, and coverage state wherever an assessment or
  fallback is shown, with a direct primary-source link whenever a citation exists. For a list whose
  citation policy is optional, show its declared evidentiary basis once per view instead. Colour must
  never be the only status signal.
- Where guidance is inherited from an ancestor category, name that category, show its scope statement,
  and link to it, so inherited advice is never presented as food-specific.
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

## Deployment and operations

- Deploy the Vite bundle to Netlify using `netlify.toml` and `public/_redirects`; test the root, a
  direct `/food/<slug>` route, and a direct `/category/<slug>` route in a Netlify deploy preview
  before production.
- Commit the package lockfile and content data with every release.
- Run type-checking, data validation, unit tests, and UI tests in continuous integration before
  deployment.
- Review and update citations and coverage whenever a source changes.

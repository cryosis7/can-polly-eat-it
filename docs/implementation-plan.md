# Implementation Plan

## Delivery strategy

Build the smallest trustworthy pregnancy-guide experience first, but establish the category and
assessment abstractions before adding real content. The first release is static, client-side, and
does not require accounts or a backend.

Each phase ends with a usable, verifiable increment. Later phases do not duplicate data or UI for
vegetarian suitability; they extend the shared guidance-list model.

## Decision baseline

The five ADRs in [`docs/decisions/`](decisions/) are Accepted and govern this implementation plan.
Create a new ADR or explicitly amend an existing decision before adopting a conflicting approach.

## Phase 0: Establish the application foundation

1. Scaffold a Vite React TypeScript application and commit its generated package manifest and lockfile.
2. Enable strict TypeScript, ESLint, and the Vite build command.
3. Add unit-test support with Vitest and React Testing Library.
4. Add React Router and configure `/` and `/food/:foodSlug` routes with a `/` base path.
5. Add Netlify deployment configuration: `public/_redirects` with `/* /index.html 200` and
   `netlify.toml` headers that do not cache `index.html` while caching hashed `/assets/*` files
   immutably.
6. Create the directories defined in the architecture overview and a minimal accessible shell with
   the disclaimer.

**Done when:** a clean install can lint, type-check, test, build, and load both routes directly in
a Netlify deploy preview.

## Phase 1: Define and validate the content contract

1. Implement the `Category`, `Food`, `GuidanceList`, `CoverageDeclaration`, `FoodAssessment`,
   `GuidanceScenario`, `AdviceCondition`, and `SourceCitation` schemas in `src/domain/`.
2. Use Zod to parse authored data at development/test time and expose typed data to the application.
3. Implement validation for IDs, slugs, category parents, category cycles, food category references,
   assessment uniqueness, status ownership, distinct grey fallback statuses, coverage references,
   citation URLs, reason-link targets/duplicates, review-due dates, and ISO dates.
4. Implement a category-tree builder and category-path helper independent of React.
5. Add small fixture data that covers:
   - 1,000 category levels in a domain-only adversarial tree test, plus a readable UI fixture;
   - direct foods and child categories under the same category;
   - green, amber, red, in-scope unassessed, and outside-coverage outcomes;
   - 75°C, refrigeration, two-day, range/frequency, mutually exclusive, and chained guidance;
   - a composite food with a cited `contains` reason link to a canonical ingredient food;
   - two guidance lists against a shared food.

**Done when:** invalid fixtures fail with useful errors, valid fixtures yield a stable arbitrary-depth
tree, and coverage resolution distinguishes unassessed from outside current coverage.

## Phase 2: Deliver the standard catalogue

1. Render flattened category rows as an accessible, grouped catalogue with full breadcrumb paths
   and depth-safe visual indentation.
2. Render a food card with the selected list's text status, non-colour indicator, short summary, and
   links to its detail route and primary source.
3. Preserve editorial category and food sort order.
4. Add clear loading-free empty states for categories with no matching foods and for no data.
5. Make the layout usable at narrow mobile widths and desktop widths; do not use heading levels to
   encode category depth.

**Done when:** the fixture catalogue visibly proves the hierarchy is not capped and all cards expose
the selected assessment, "Not assessed", or "Outside current coverage" with a source link.

## Phase 3: Add search, filters, and shareable state

1. Implement the pure normalisation, token search, category-subtree, and assessment predicates.
2. Add a labelled search field, category control, guidance-list selector, status filters, and clear
   filters action.
3. Implement the versioned URL contract: `v=1`, `list=<display-list-slug>`, `q`,
   `category`, and `status.<list-slug>` values. Initialise controls from the URL and update it
   without a full page reload.
4. Announce result changes and dropped invalid shared parameters accessibly; render labelled
   cross-list filter chips and retain an understandable no-results state.
5. Test the documented OR-within-list and AND-across-dimensions semantics, direct links for every
   list, and safe fallback for stale URL values.

**Done when:** copying a filtered URL into a new browser session reproduces the same catalogue
result and search/filter unit tests cover aliases, punctuation, category descendants, and unassessed
foods.

## Phase 4: Explain a food decision

1. Build the food-detail route and a not-found route; resolve its display list from `v=1&list=`.
2. Display the list-specific status, summary, and each guidance scenario's applicability,
   authoritative instruction, ordered conditions, optional display facts, review date, and citation
   links. Display each authored reason link as its statement and a link to the target food detail.
   Never combine conditions from separate scenarios, infer status from a reason-link target, or
   derive advice from facts.
3. Preserve active list/filter context when navigating back to the catalogue.
4. Display the medical-information disclaimer adjacent to detail guidance.

**Done when:** mutually exclusive and chained amber fixture scenarios remain distinct, a composite
fixture renders "Contains [Gelatin]" as a food-detail-only link, each assessment links to a precise
citation, each accepted list opens directly by URL, and missing food slugs fail safely with a helpful
route state.

## Phase 5: Curate the initial pregnancy content

1. Create a content editorial checklist: source URL, locator, accessed date, source-version
   evidence, reviewer, coverage declaration, verification date, review due date, paraphrased
   summary, applicable guidance scenarios, and status.
2. Transcribe reviewed entries from MPI's safe-food guidance into the data contract, beginning with
   all top-level table categories and high-value conditional examples.
3. Reconcile every entry and any reason link against its source; do not mark an uncited item green
   or derive its status from a linked ingredient.
4. Add data-specific tests for cited examples and a CI gate that fails for missing citations,
   invalid coverage, or a `reviewDueOn` before the build date.
5. Obtain a human review of the curated data before publishing it.

**Done when:** every published pregnancy assessment has a status, review date, and citation; the
list declares whether every catalogue food is covered; a reviewer can trace each rule and the source
version evidence back to an official source.

## Phase 6: Add vegetarian suitability as a second list

1. Define vegetarian status definitions as data, including distinct grey "Not assessed" and
   "Outside current coverage" fallbacks and an amber ingredient-check outcome.
2. Add reviewed vegetarian assessments to existing foods; do not add `isVegetarian` to `Food`.
3. Test the combined-list filtering semantics and the UI's status labels.
4. Audit composite foods for ambiguity and use "Check ingredients" rather than a confident verdict
   when a generic name is insufficient. Where a cited reason is a canonical catalogue food, add an
   assessment reason link; do not infer suitability merely because an ingredient is linked.

**Done when:** a single food can display both pregnancy and vegetarian assessments, and selecting
either list does not duplicate the catalogue.

## Quality gates

Every pull request that changes application or content code should run:

- package-manager clean install;
- linting and strict TypeScript checking;
- the full Vitest suite with the enforced 90% global branch-coverage threshold for application
  source;
- domain/schema/tree/search/filter unit tests;
- React Testing Library tests for catalogue, filters, and detail rendering;
- a browser-level smoke test for direct detail-route loading and a filtered URL;
- coverage resolution, review-due date, mutually exclusive-scenario, and 1,000-level tree tests;
- Netlify deploy-preview smoke tests for direct detail routes and cache/rewrite configuration;
- build output generation.

## Deferred decisions

Do not introduce a backend, CMS, authentication, personal recommendations, third-party search,
analytics, or offline-first caching until a concrete product requirement requires it. If editorial
collaboration or frequent live changes become necessary, create a new ADR that evaluates a CMS or
backend against the version-controlled-data approach.

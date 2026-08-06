# Implementation Plan

## Delivery strategy

Build the smallest trustworthy pregnancy-guide experience first, but establish the category and
assessment abstractions before adding real content. The first release is static, client-side, and
does not require accounts or a backend.

Each phase ends with a usable, verifiable increment. Later phases do not duplicate data or UI for
vegetarian suitability; they extend the shared guidance-list model.

## Relationship to feature planning

This document sequences high-level product delivery. The [Feature Register](features/README.md) is
the source of truth for an individual feature's outcome, status, dependencies, non-goals, acceptance
criteria, and feature-specific implementation-plan link. Do not infer a feature's current delivery
status from a phase alone.

Feature-specific implementation plans should inherit the quality gates below and add a pre-PR
verification task that instructs a subagent to run the `prepare` skill after implementation and
targeted validation. Resolve or record any `prepare` findings before opening a PR or marking the
feature `Done`.

The features map to this roadmap as follows:

| Feature | Delivery phase |
| --- | --- |
| F-01: Browse the Food Guide | Phase 2 |
| F-02: Search and Filter Foods | Phase 3 |
| F-03: Explain Food Guidance | Phase 4 |
| F-04: Maintain Trustworthy Guidance Content | Phases 1 and 5 |
| F-05: Add Independent Guidance Lists | Phase 6 |
| F-06: Improve the Mobile-First Accessible Guide Experience | Phase 7 |
| F-08: Rework Guidance-Scope Filtering | Phase 8 |

## Decision baseline

The Accepted ADRs in [`docs/decisions/`](decisions/) govern this implementation plan. Create a new
ADR or explicitly amend an existing decision before adopting a conflicting approach.

## Phase 0: Establish the application foundation

1. Scaffold a Vite React TypeScript application and commit its generated package manifest and lockfile.
2. Enable strict TypeScript, ESLint, and the Vite build command.
3. Add unit-test support with Vitest and React Testing Library, plus a Chromium Playwright browser
   suite and Husky pre-commit hook that runs the coverage and browser-test commands.
4. Add React Router and configure `/` and `/food/:foodSlug` routes with a `/` base path.
5. Add Netlify deployment configuration: `public/_redirects` with `/* /index.html 200` and
   `netlify.toml` headers that do not cache `index.html` while caching hashed `/assets/*` files
   immutably.
6. Create the directories defined in the architecture overview and a minimal accessible shell with
   the disclaimer.

**Done when:** a clean install can lint, type-check, run unit coverage and Chromium browser tests,
build, and load both routes directly in a Netlify deploy preview. The local pre-commit hook rejects
changes when either test suite fails.

## Phase 1: Define and validate the content contract

1. Implement the `Category`, `Food`, `GuidanceList`, `CoverageDeclaration`, `FoodAssessment`,
   `GuidanceScenario`, `AdviceCondition`, and `SourceCitation` schemas in `src/domain/`.
2. Use Zod to parse authored data at development/test time and expose typed data to the application.
3. Implement validation for IDs, slugs, category parents, category cycles, food category references,
   assessment uniqueness, status ownership, distinct grey fallback statuses, coverage references,
   citation URLs and reason-link targets/duplicates.
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

## Phase 2: Deliver the standard catalogue (F-01)

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

## Phase 3: Add search, filters, and shareable state (F-02)

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

## Phase 4: Explain a food decision (F-03)

1. Build the food-detail route and a not-found route; resolve its display list from `v=1&list=`.
2. Display the list-specific status, summary, and each guidance scenario's applicability,
   authoritative instruction, ordered conditions, optional display facts, and citation
   links. Display each authored reason link as its statement and a link to the target food detail.
   Never combine conditions from separate scenarios, infer status from a reason-link target, or
   derive advice from facts.
3. Preserve active list/filter context when navigating back to the catalogue.
4. Display the medical-information disclaimer adjacent to detail guidance.

**Done when:** mutually exclusive and chained amber fixture scenarios remain distinct, a composite
fixture renders "Contains [Gelatin]" as a food-detail-only link, each assessment links to a precise
citation, each accepted list opens directly by URL, and missing food slugs fail safely with a helpful
route state.

## Phase 5: Curate the initial pregnancy content (F-04)

1. Create a content editorial checklist: source URL, locator, reviewer, coverage declaration,
   paraphrased summary, applicable guidance scenarios, and status.
2. Transcribe reviewed entries from MPI's safe-food guidance into the data contract, beginning with
   all top-level table categories and high-value conditional examples.
3. Reconcile every entry and any reason link against its source; do not mark an uncited item green
   or derive its status from a linked ingredient.
4. Add data-specific tests for cited examples and a CI gate that fails for missing citations or
   invalid coverage.
5. Obtain a human review of the curated data before publishing it.

**Done when:** every published pregnancy assessment has a status and citation; the list declares
whether every catalogue food is covered; a reviewer can trace each rule to an authoritative source.

## Phase 6: Add vegetarian suitability as a second list (F-05)

1. Define vegetarian status definitions as data, including distinct grey "Not assessed" and
   "Outside current coverage" fallbacks and an amber ingredient-check outcome.
2. Add reviewed vegetarian assessments to existing foods; do not add `isVegetarian` to `Food`.
3. Test the combined-list filtering semantics and the UI's status labels.
4. Audit composite foods for ambiguity and use "Check ingredients" rather than a confident verdict
   when a generic name is insufficient. Where a cited reason is a canonical catalogue food, add an
   assessment reason link; do not infer suitability merely because an ingredient is linked.

**Done when:** a single food can display both pregnancy and vegetarian assessments, and selecting
either list does not duplicate the catalogue.

## Phase 7: Improve the mobile-first accessible guide experience (F-06)

1. Apply a local warm editorial CSS system to the shared shell, catalogue, filters, and cards.
2. Keep search, active filters, and results feedback visible while placing detailed native controls
   in an initially mobile-collapsed `details` disclosure that is open initially at wider viewports.
3. Add the skip link, labelled landmarks, keyboard focus treatment, path-aware category control,
   and separate native status facets for each guidance list.
4. Test the focused desktop and mobile filter experiences without changing URL semantics.

**Done when:** the F-06 acceptance criteria and its feature-specific validation plan are complete.

## Phase 8: Rework guidance-scope filtering (F-08)

1. Add a generic outcome-band mapping to each list-owned status, retaining list-specific labels and
   the distinct neutral fallback states.
2. Replace the unreleased display-list URL contract with `scope` and `outcome` query parameters,
   defaulting absent scope to pregnancy food safety.
3. Replace the primary list selector and list-specific status facets with selected dietary scopes and
   generic Okay, Maybe - see notes, and Not okay outcome controls.
4. Render the selected scopes' list-specific guidance on cards and food detail pages.
5. Test default pregnancy scope, combined pregnancy and vegetarian filtering, URL recovery, fallback
   states, and direct filtered routes.

**Done when:** F-08's acceptance criteria and validation plan are complete.

## Quality gates

Every pull request that changes application or content code should run:

- package-manager clean install;
- linting and strict TypeScript checking;
- the full Vitest suite with enforced 100% global statements, branches, functions, and lines for
  application source;
- domain/schema/tree/search/filter unit tests;
- React Testing Library tests for catalogue, filters, and detail rendering;
- Chromium Playwright end-to-end tests for every implemented user-facing flow, including direct
  detail-route loading when Feature 03 is delivered and a filtered URL;
- a Husky pre-commit hook that runs the coverage and Playwright commands before every local commit;
- coverage resolution, mutually exclusive-scenario, and 1,000-level tree tests;
- Netlify deploy-preview smoke tests for direct detail routes and cache/rewrite configuration;
- build output generation;
- a subagent `prepare` skill run for feature implementation work, with findings resolved or recorded
  before PR readiness.

## Deferred decisions

Do not introduce a backend, CMS, authentication, personal recommendations, third-party search,
analytics, or offline-first caching until a concrete product requirement requires it. If editorial
collaboration or frequent live changes become necessary, create a new ADR that evaluates a CMS or
backend against the version-controlled-data approach.

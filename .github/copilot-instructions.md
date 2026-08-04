# Copilot Instructions

## Current tooling

Use the scripts declared in `package.json`.

## Test commands

- Full suite: `npm test`
- Single test file: `npm test -- src/domain/categoryTree.test.ts`

## Architecture baseline

- The accepted ADRs in `docs/decisions/` are binding. Before changing architecture, dependencies, data storage, routing, deployment, or domain patterns, read `docs/decisions/index.md` and the relevant accepted ADRs. A change that conflicts with one needs an explicit amendment or a new ADR.
- Build a client-only React 19 + TypeScript 5 + Vite 7 SPA with React Router 7, deployed as a Netlify static site. There is no backend, database, CMS, account, analytics, server session, or live content API in the first release.
- Keep the layers one-way:
  - `src/data/` contains authored, reviewed static records only.
  - `src/domain/` owns types, Zod validation, category-tree derivation, search, coverage resolution, and filter predicates. It must not import React, router, browser, or UI modules.
  - `src/app/` composes routes, shell, and URL state; feature directories render catalogue, filters, and food detail; shared components remain presentational.
- Use `public/_redirects` to rewrite `/*` to `/index.html` and configure `netlify.toml` so `index.html` revalidates promptly while hashed Vite assets are immutable. Verify direct `/food/<slug>` loads in a Netlify deploy preview.

## Domain and content conventions

- Food categories are an adjacency-list forest (`parentId`), not nested authored documents or fixed-depth fields. Foods are separate records that reference exactly one existing primary category; a category can contain both direct foods and child categories.
- Validate duplicate IDs/slugs, unknown parents and category references, self-parent links, cycles, and orphaned categories. Derive paths, trees, and flattened display rows without a product-defined depth limit or recursive UI rendering. Preserve authored sort order and test a 1,000-level domain-only tree.
- Food suitability is list-specific. Model it as one `FoodAssessment` per `(foodId, guidanceListId)` with list-owned statuses; never add contextual fields such as `isVegetarian` to `Food` or create duplicate catalogues.
- When an assessment is absent, resolve it from the guidance list's coverage: use the list's distinct grey in-coverage `Not assessed` state or out-of-coverage `Outside current coverage` state. Neither means safe, and fallback statuses must never be authored on an assessment.
- Maintain explicit coverage, source-version evidence, verification/review-due dates, citations, and assessment review dates. Parse all authored records with Zod during development/CI; overdue review dates, missing citations, invalid references, malformed dates, invalid status ownership, and duplicate assessment pairs must fail validation.
- In production builds, Zod parse failures on static data records must throw at module load time so the deploy fails fast rather than serving corrupt data silently.
- Guidance text is manually reviewed and succinctly paraphrased from authoritative sources. Do not scrape, fetch, infer, or automatically update advice. A citation needs a durable HTTPS URL, exact locator, and access date.
- Guidance scenarios are alternatives: render each scenario's complete authoritative instruction with its own ordered conditions. Do not combine conditions across scenarios or compute advice from optional display facts.
- Reason links are typed (`contains`, `derived-from`, `made-with`, `other`) links to existing non-self food records, with an authored statement and no duplicate kind/target pair. Render them only on food detail pages; keep the assessed food's citation and status independent of the target food.

## Query, UI, and accessibility conventions

- URL state is the product state. Use the versioned `v=1` contract: `list=<display-list-slug>`, `q`, `category`, and `status.<list-slug>=<comma-separated-status-slugs>`. Initialise controls from it and preserve useful context when returning from a food detail.
- Search normalises case, diacritics, punctuation, and whitespace; match every token against food names, aliases, and category-path labels. Do not use fuzzy/AI/external search.
- Category filters include descendant foods.
- Within a single guidance list, selected statuses are ORed.
- Across different guidance lists, category, tags, and condition kinds, all predicates are ANDed.
- The display list controls rendering only and must not act as a filter constraint.
- Every active filter chip must be labelled with its guidance list slug.
- For unknown URL versions, lists, categories, or statuses, select the default display list, remove only invalid constraints, and announce the removal accessibly.
- Never use colour as the only status signal. Use semantic headings/lists, native labels, keyboard-operable controls, visible focus, result-count announcements, responsive layouts without hover reliance, and the medical-information disclaimer in the app shell and food detail.

## Scope and validation

- Treat 2,000 foods and 500 categories as the initial catalogue budget. A change beyond either requires a measured performance review and a new ADR.
- The first releasable slice is a small, fully cited pregnancy guide covering browsing, search/filtering, and explanation. Vegetarian suitability extends the same guidance-list model later.
- For application/content changes, the intended quality gates are strict type checking, data validation, domain unit tests, React Testing Library tests, browser smoke tests for a direct detail route and filtered URL, Netlify deploy-preview checks, and a production build. Run the narrowest relevant existing command after the project is scaffolded.

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
- Use `public/_redirects` to rewrite `/*` to `/index.html` and configure `netlify.toml` so `index.html` revalidates promptly while hashed Vite assets are immutable. Verify direct `/food/<slug>` and `/category/<slug>` loads in a Netlify deploy preview.

## Domain and content conventions

- Food categories are an adjacency-list forest (`parentId`), not nested authored documents or fixed-depth fields. Foods are separate records that reference exactly one existing primary category; a category can contain both direct foods and child categories.
- Validate duplicate IDs/slugs, unknown parents and category references, self-parent links, cycles, and orphaned categories. Derive paths, trees, and flattened display rows without a product-defined depth limit or recursive UI rendering. Preserve authored sort order and test a 1,000-level domain-only tree.
- Food suitability is list-specific. Model it as one `Assessment` per `(subject, guidanceListId)`, where the subject is exactly one food or one category, with list-owned statuses and generic outcome-band mappings; never add contextual fields such as `isVegetarian` to `Food` or create duplicate catalogues.
- Resolve a food's guidance in this order: its own assessment, then the nearest ancestor category assessed in the same guidance list, then the list's coverage fallback. Apply an inherited assessment whole and disclose its origin category, scope statement, and source; never merge guidance across subject levels or across guidance lists, and never infer from an unassessed ancestor, a sibling, or a name.
- When no assessment applies, resolve from the guidance list's coverage: use the list's distinct grey in-coverage `Not assessed` state or out-of-coverage `Outside current coverage` state. Neither means safe, and fallback statuses must never be authored on an assessment.
- A category assessment requires an authored `scopeStatement`; a food assessment must not have one. Every assessed subject must fall inside its guidance list's declared coverage.
- Maintain explicit coverage. Parse all authored records with Zod during development/CI; invalid references, invalid status ownership, and duplicate subject/list pairs must fail validation.
- In production builds, Zod parse failures on static data records must throw at module load time so the deploy fails fast rather than serving corrupt data silently.
- Citation requirements are list-owned, not global. Each `GuidanceList` declares `citationPolicy: 'required' | 'optional'` with no default. A `required` list fails validation on any uncited assessment or coverage declaration; an `optional` list may leave records uncited but must declare an `evidentiaryBasis` that is displayed once per view. Never render a per-assessment "no source attached" marker, and never index into a citation array without checking it is non-empty.
- Guidance text is manually reviewed and succinctly paraphrased. Manual review is mandatory for every list regardless of citation policy. Do not scrape, fetch, infer, or automatically update advice. A citation, wherever one exists, needs a durable HTTPS URL and exact locator.
- Guidance scenarios are alternatives: render each scenario's complete authoritative instruction with its own ordered conditions. Do not combine conditions across scenarios or compute advice from optional display facts.
- Reason links are typed (`contains`, `derived-from`, `made-with`, `other`) links to existing non-self food records, with an authored statement and no duplicate kind/target pair. Render them only on food detail pages; keep the assessed food's citation and status independent of the target food.

## Query, UI, and accessibility conventions

- URL state is the product state. Use the versioned `v=1` contract: `scope=<comma-separated-guidance-list-slugs>`, `outcome=<comma-separated-outcome-bands>`, `q`, and `category`. Default an absent scope to pregnancy food safety, initialise controls from it, and preserve scope/outcome context when returning from food detail.
- A guide entry is a food, or a category that carries its own authored assessment. Categories that merely inherit remain plain browse headings. Search, filters, and the result count operate over guide entries, and the count announces results rather than foods.
- Search normalises case, diacritics, punctuation, and whitespace; match every token against food names, aliases, and category-path labels, and match a category entry against its own name, aliases, and ancestor path labels. Do not use fuzzy/AI/external search.
- Category filters include descendant foods.
- Selected generic outcome bands are ORed within every selected guidance scope.
- Selected guidance scopes, category, tags, and condition kinds are ANDed. A food must satisfy every selected scope.
- Render list-specific labels, guidance, and any citation that exists for selected scopes; do not use a primary display-list selector.
- Keep `not-assessed` and `outside-coverage` distinct neutral fallback bands. Neither is safe and neither is a primary RAG filter.
- Every active filter chip must be labelled with its dietary scope or generic outcome.
- For unknown URL versions, scopes, categories, or outcomes, default to pregnancy scope, remove only invalid constraints, and announce the removal accessibly.
- Never use colour as the only status signal. Use semantic headings/lists, native labels, keyboard-operable controls, visible focus, result-count announcements, responsive layouts without hover reliance, and the medical-information disclaimer in the app shell, food detail, and category detail.

## Scope and validation

- Treat 2,000 foods and 500 categories as the initial catalogue budget. A change beyond either requires a measured performance review and a new ADR.
- The first releasable slice is a small, fully cited pregnancy guide covering browsing, search/filtering, and explanation. Vegetarian suitability extends the same guidance-list model without duplicating the catalogue, and declares its own citation policy.
- For application/content changes, the intended quality gates are strict type checking, data validation, domain unit tests, React Testing Library tests, browser smoke tests for a direct detail route and filtered URL, WCAG 2.2 AA Playwright accessibility scans, Netlify deploy-preview checks, and a production build. Run the narrowest relevant existing command after the project is scaffolded.
- For feature implementation work, include a pre-PR verification step that instructs a subagent to run the `prepare` skill after targeted validation and before marking the feature `Done`.

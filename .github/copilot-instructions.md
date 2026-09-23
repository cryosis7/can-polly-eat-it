# Copilot Instructions

You are the engineer building this product. I am the product owner with an engineering and architectural background.
When communicating to me, assume I can understand technical details, and can inform on architectural direction, but I have never seen this codebase before. I understand the domain and the product and those decisions should come through me. Always use worked examples when pitching questions, use callouts to demo how the UI would render each option - don't make me work to understand you, walk me through it.

## Where the rules actually live

Read these rather than assuming; they are authoritative and current.

- `docs/architecture/overview.md` describes the domain model, catalogue, search, filtering, URL contract, and accessibility behaviour. Read the relevant section before changing any of them, and do not act on a second-hand summary of it.
- The accepted ADRs in `docs/decisions/` are binding. Read `docs/decisions/index.md` and the relevant accepted ADRs before changing architecture, dependencies, data storage, routing, deployment, or domain patterns. A change that conflicts with one needs an explicit amendment or a new ADR.
- `docs/features/README.md` is the feature register and owns the feature lifecycle and its status rules.

## Non-negotiable constraints

- This is a client-only SPA. There is no backend, database, CMS, account, analytics, server session, or live content API. Do not introduce one.
- Keep the layers one-way. `src/data/` holds authored, reviewed static records; `src/domain/` owns types, Zod validation, derivation, search, and filter predicates, and must not import React, router, browser, or UI modules; `src/app/` and the feature directories compose routes, URL state, and rendering.
- This product gives health guidance, so never infer a food status. Do not derive one from a food name, a sibling, or an unassessed ancestor. Resolve nearest-subject-first, then fall back to the guidance list's not-assessed state. An assessment is keyed by subject, preparation, guidance list, and source.
- Preparation is a dimension that crosses the catalogue, not a shape the tree takes. A food is filed once under what it is and declares the states it is actually eaten in; declaring a state answers "do people in New Zealand eat this food this way" on evidence, never on culinary theory, and never expresses risk.
- Apply each guidance layer whole. Never merge statuses, summaries, scenarios, conditions, or citations across subject levels, across preparation states, across sources, or across guidance lists. Where sources disagree, the most cautious authored status governs and the dissent is stated in words.
- `not-assessed` is a neutral fallback. It never means safe, and must never be authored onto an assessment.
- Guidance text is manually reviewed. Source-backed guidance is paraphrased from cited sources;
  uncited guidance is permitted only when its list makes citations optional and displays an
  evidentiary basis. Do not scrape, fetch, infer, or automatically update advice.
- Use en-NZ spelling in code, content, and documentation.

## Delivery

- **Application work is integrated by merging into `main` locally.** Do not run `git push`, `git fetch`, or `git pull`, check a remote's state, or open or update a pull request from this workspace. The only hosted automation is [the production-promotion workflow](../.github/workflows/promote-production.yml), which merges `main` into the `production` release branch daily at 20:00 UTC or when manually dispatched. Where a skill or document says "pre-PR", read it as "before merging into `main`".
- Application source under `src/` is held at 100% statements, branches, functions, and lines. The pre-commit hook runs coverage and the Playwright suite, so a change that lowers coverage fails the commit rather than review. Write the tests as you go.
- While working, run the narrowest relevant existing command rather than the full suite.
- For feature work, a subagent must run the `prepare` skill after targeted validation and before the feature moves to `Done`.

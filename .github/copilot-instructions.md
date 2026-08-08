# Copilot Instructions

You are the engineer building this product. I am the product owner with an engineering and architectural background.
When communicating to me, assume I can understand technical details, and can inform on architectural direction, but I have never seen this codebase before. I understand the domain and the product and those decisions should come through me.

## Where the rules actually live

Read these rather than assuming; they are authoritative and current.

- `docs/architecture/overview.md` describes the domain model, catalogue, search, filtering, URL contract, and accessibility behaviour. Read the relevant section before changing any of them, and do not act on a second-hand summary of it.
- The accepted ADRs in `docs/decisions/` are binding. Read `docs/decisions/index.md` and the relevant accepted ADRs before changing architecture, dependencies, data storage, routing, deployment, or domain patterns. A change that conflicts with one needs an explicit amendment or a new ADR.
- `docs/features/README.md` is the feature register and owns the feature lifecycle and its status rules.

## Non-negotiable constraints

- This is a client-only SPA. There is no backend, database, CMS, account, analytics, server session, or live content API. Do not introduce one.
- Keep the layers one-way. `src/data/` holds authored, reviewed static records; `src/domain/` owns types, Zod validation, derivation, search, and filter predicates, and must not import React, router, browser, or UI modules; `src/app/` and the feature directories compose routes, URL state, and rendering.
- This product gives health guidance, so never infer a food status. Do not derive one from a food name, a sibling, or an unassessed ancestor. Resolve nearest-subject-first, then fall back to the guidance list's not-assessed state.
- Apply each guidance layer whole. Never merge statuses, summaries, scenarios, conditions, or citations across subject levels or across guidance lists.
- `not-assessed` is a neutral fallback. It never means safe, and must never be authored onto an assessment.
- Guidance text is manually reviewed and paraphrased from cited sources. Do not scrape, fetch, infer, or automatically update advice.
- Use en-NZ spelling in code, content, and documentation.

## Delivery

- **This repository is local-only. There is no git remote, no `origin`, no pull requests, and no CI.** Never run `git push`, `git fetch`, or `git pull`, never check a remote's state, and never try to open or update a PR. Work is integrated by merging into `main` locally. Where a skill or document says "pre-PR", read it as "before merging into `main`".
- Application source under `src/` is held at 100% statements, branches, functions, and lines. The pre-commit hook runs coverage and the Playwright suite, so a change that lowers coverage fails the commit rather than review. Write the tests as you go.
- While working, run the narrowest relevant existing command rather than the full suite.
- For feature work, a subagent must run the `prepare` skill after targeted validation and before the feature moves to `Done`.

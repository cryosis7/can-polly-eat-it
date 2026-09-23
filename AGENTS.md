# Repository instructions

Act as the engineer building this product. The user is the product owner: comfortable with technical
and architectural detail, authoritative on product and domain decisions, and unfamiliar with this
codebase. Supply the codebase context needed to make each decision.

Use worked examples when asking for direction. For visual choices, show how each option would render.

## Agent skills

### Issue tracker

Repository issues and specs use local Markdown under `.scratch/`. Before reading, acting on,
creating, or updating one, read [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).

### Triage labels

Triage uses two category roles and five state roles as local issue fields. Before triaging an issue,
read [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).

### Domain docs

This is a single-context repository whose architecture, decisions, and feature lifecycle live under
`docs/`. Before work or review concerning the domain model, catalogue, search, filtering, URL
contract, accessibility, architecture, technical dependencies, data storage, routing, deployment,
domain patterns, feature behaviour, outcome, scope, status, feature dependencies, acceptance
criteria, or delivery, read
[`docs/agents/domain.md`](docs/agents/domain.md).

## Product constraints

- Keep the product a client-only SPA: no backend, database, CMS, account, analytics, server session,
  or live content API.
- Keep imports one-way. `src/data/` holds authored, reviewed static records. `src/domain/` owns
  types, Zod validation, derivation, search, and filter predicates without importing React, router,
  browser, or UI modules. `src/app/` and feature directories compose routes, URL state, and
  rendering.
- Resolve health guidance independently for food-wide guidance and each preparation. Use the food's
  matching assessment, otherwise the nearest assessed ancestor in the same guidance list, otherwise
  the list's neutral `not-assessed` fallback. Never derive status from a name, sibling, or
  unassessed ancestor. Key each assessment by subject, preparation, guidance list, and source.
- Model preparation as a catalogue-wide dimension. File each food once under what it is and declare
  only preparation states supported by evidence of how people in New Zealand eat it; a preparation
  state never expresses risk.
- Apply each authored guidance layer whole. Never merge statuses, summaries, scenarios, conditions,
  or citations across subjects, preparation states, sources, or guidance lists. Where sources
  disagree, use the most cautious authored status and state the dissent.
- Treat `not-assessed` as neutral, never safe, and never author it onto an assessment.
- Guidance text is manually reviewed. Source-backed guidance is paraphrased from cited sources;
  uncited guidance is allowed only when its list makes citations optional and displays an
  evidentiary basis. Never scrape, fetch, infer, or automatically update advice.
- Use en-NZ spelling in code, content, and documentation.

## Delivery

- Integrate application work by merging into `main` locally. Do not open or update pull requests or
  run `git push`, `git fetch`, or `git pull`; leave remote state unchecked. The only hosted
  automation is the [production-promotion workflow](.github/workflows/promote-production.yml),
  which merges `main` into `production` daily at 20:00 UTC or on manual dispatch. Treat "pre-PR" as
  "before merging into `main`".
- Keep application source under `src/` at 100% statements, branches, functions, and lines. Write
  tests with the change; the pre-commit hook runs coverage and Playwright.
- While working, run the narrowest relevant existing command rather than the full suite.
- For feature work, have a subagent run the `prepare` skill after targeted validation and before the
  feature moves to `Done`.

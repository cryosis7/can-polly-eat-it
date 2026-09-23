# 2026-09-21 ADR: enforce local quality gates

**Status:** Superseded
**Date:** 2026-09-21
**Deciders:** Product owner

## Context and Problem Statement

This repository was originally delivered and integrated locally without a remote, pull requests, or
CI. The application contains safety-relevant branching and accessibility requirements, so its
quality gates must be reproducible and enforced before local commits and merges.

## Considered Options

- Enforce unit coverage and browser journeys through local scripts and a Husky pre-commit hook.
- Rely on unmeasured tests run at developer discretion.
- Move validation to hosted CI.

## Decision Outcome

Chosen option: "enforce unit coverage and browser journeys through local scripts and a Husky
pre-commit hook", because the checks run at the point this repository actually integrates work.

Vitest with V8 coverage enforces 100% global statements, branches, functions, and lines for
application source under `src/`. Playwright exercises implemented user journeys in Chromium.
`@axe-core/playwright` scans key routes and responsive states against WCAG 2.2 AA with no allowlist,
disabled rule, or accepted baseline. Husky runs coverage and Playwright before each commit.
Type-checking, linting, and a production build remain required before merging into `main`.

### Consequences

- Good, because a local commit cannot silently reduce measured source coverage or break a core
  browser journey.
- Good, because accessibility regressions fail alongside functional regressions.
- Bad, because commits take longer and require the managed Chromium browser.
- Bad, because 100% coverage does not prove content correctness; human editorial review remains
  mandatory.

## Implementation Plan

- **Affected paths:** `package.json`, `vite.config.ts`, `playwright.config.ts`, `.husky/pre-commit`,
  `src/**/*.test.*`, and `e2e/`.
- **Pattern to follow:** Add focused behavioural tests with each source change; do not lower
  thresholds, exclude application behaviour, or suppress axe findings.
- **Tests:** `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run test:e2e`, and
  `npm run build`.

## Confirmation

- [x] Coverage fails below 100% in any configured metric.
- [x] The pre-commit hook runs coverage and the Chromium Playwright suite.
- [x] Axe scans enforce WCAG 2.2 AA without exceptions.
- [x] Local merge preparation includes lint, type-check, tests, and a production build.

## More Information

Superseded by
[2026-09-23 ADR: enforce local quality gates and fixed-UTC production promotions](<2026-09-23 ADR - enforce local quality gates and fixed-UTC production promotions.md>),
which retains the local quality gates and adds a limited GitHub Actions release-promotion workflow.

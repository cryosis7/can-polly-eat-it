# Polly's Food Guide

A static React guide for browsing reviewed pregnancy food-safety information. It is general
information, not medical advice.

## Feature planning

The [Feature Register](docs/features/README.md) records each product feature's outcome, lifecycle
status, dependencies, and acceptance criteria. The [implementation plan](docs/implementation-plan.md)
sequences high-level delivery; create a detailed technical plan only when a feature is `Planned`.
Feature-specific plans include targeted validation and a subagent `prepare` check before merging.

## Development

```sh
npm install
npm run dev
```

Before running browser tests for the first time, install Playwright's managed Chromium browser:

```sh
npm run test:e2e:install
```

## Checks

```sh
npm run lint
npm run typecheck
npm run test:coverage
npm run test:e2e
npm run build
```

`npm install` configures the Husky pre-commit hook. Each commit runs `npm run test:precommit`, which
requires both 100% Vitest coverage and the Chromium Playwright suite to pass.

## Accessibility

`e2e/accessibility.spec.ts` scans every route and key interaction state with `axe-core` via
`@axe-core/playwright`, at both a 320px mobile viewport and the desktop default. The scans enforce
WCAG 2.2 AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) and fail on any violation.

There is deliberately no allowlist, no disabled rule, and no recorded violation baseline. Fix a
finding in the application rather than excluding it from the scan. Automated scanning catches only a
minority of accessibility barriers, so it supplements rather than replaces keyboard and
screen-reader review.

# Polly's Food Guide

A static React guide for browsing reviewed pregnancy food-safety information. It is general
information, not medical advice.

## Feature planning

The [Feature Register](docs/features/README.md) records each product feature's outcome, lifecycle
status, dependencies, and acceptance criteria. The [implementation plan](docs/implementation-plan.md)
sequences high-level delivery; create a detailed technical plan only when a feature is `Planned`.

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

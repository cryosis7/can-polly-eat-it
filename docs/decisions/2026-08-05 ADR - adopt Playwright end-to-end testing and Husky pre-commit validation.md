# 2026-08-05 ADR: Adopt Playwright End-to-End Testing and Husky Pre-Commit Validation

**Status:** Proposed
**Date:** 2026-08-05
**Deciders:** Project owner (requester)

## Context and Problem Statement

Vitest and React Testing Library provide complete application-source coverage, but they do not prove
that the Vite application starts, accepts user input, applies URL state, and renders the catalogue in
a browser. The repository is local-only with no CI configuration, so the local commit boundary must
prevent new user-facing work from bypassing both unit and browser validation.

## Considered Options

- Use Playwright with managed Chromium and Husky to run Vitest coverage and browser tests before
  each commit.
- Retain unit/component coverage only and rely on manual browser checks.
- Use an unmanaged native Git hook with no package-managed installation.

## Decision Outcome

Chosen option: "use Playwright with managed Chromium and Husky to run Vitest coverage and browser
tests before each commit", because it exercises the real Vite application with a reproducible browser
while making the required local gate available after `npm install`.

### Consequences

- Good, because implemented catalogue and filtering workflows are checked end to end before local
  commits, alongside the existing 100% coverage requirement.
- Good, because future user-facing features have a documented browser-test authoring requirement.
- Bad, because contributors must install Playwright Chromium and wait for browser tests when
  committing.
- Bad, because this local repository has no CI enforcement; a future CI system must explicitly run
  the same commands.

## Decision Drivers

- The accepted static-SPA ADR requires browser smoke coverage for direct routes.
- The accepted coverage ADR must remain enforced rather than be replaced by end-to-end testing.
- The repository has no existing Git hook tooling or CI workflow.
- Browser execution should use a known managed browser instead of each developer's installed browser.

## Pros and Cons of the Options

### Playwright, managed Chromium, and Husky

- Good, because Playwright starts the Vite application and drives the rendered UI through a pinned
  Chromium browser.
- Good, because Husky is installed from the committed package manifest and can block failed commits.
- Bad, because the browser download is a separate first-time developer setup step.

### Unit/component coverage only

- Good, because it keeps commit checks fast and has no browser dependency.
- Bad, because it cannot verify browser routing, user interaction, or direct URL loading end to end.

### Unmanaged native Git hook

- Good, because it introduces no package dependency.
- Bad, because Git does not version or automatically install hooks from the repository by default.

## Implementation Plan

- **Affected paths:** `package.json`, `package-lock.json`, `playwright.config.ts`, `e2e/`,
  `.husky/pre-commit`, `.gitignore`, `README.md`, `docs/implementation-plan.md`, and
  `docs/features/`.
- **Pattern to follow:** Keep browser specs under `e2e/`; use Playwright's Vite `webServer` and
  Chromium project; run `npm run test:coverage` before `npm run test:e2e` via
  `npm run test:precommit`; install Chromium explicitly with `npm run test:e2e:install`; add focused
  browser scenarios for every implemented user-facing feature rather than duplicating unit tests.
- **Tests:** `npm run test:e2e` covers the default catalogue, alias search, filtering and clearing,
  and direct filtered URLs. `npm run test:precommit` must pass before a commit.

## Confirmation

- [x] `npm install` configures the version-controlled Husky pre-commit hook.
- [x] `npm run test:e2e:install` installs the Chromium browser required by the suite.
- [x] `npm run test:e2e` starts the Vite application and passes the catalogue and filtering scenarios.
- [x] `npm run test:precommit` runs the 100%-coverage Vitest command before Playwright and returns a
  non-zero result if either command fails.
- [x] Future implemented user-facing feature documents name their Playwright scenarios.
- [ ] The requester explicitly accepts this ADR before its status changes from Proposed.

## More Information

This proposal complements the accepted decisions to use a static TypeScript React SPA and enforce
complete application-source coverage. It does not replace either decision and does not introduce CI.

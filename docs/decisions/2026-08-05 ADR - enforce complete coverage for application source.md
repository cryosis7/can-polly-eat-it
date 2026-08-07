# 2026-08-05 ADR: Enforce Complete Coverage for Application Source

**Status:** Accepted
**Date:** 2026-08-05
**Deciders:** Project owner (requester)

## Context and Problem Statement

The current Vitest suite exercises important domain and catalogue behaviour, but it does not produce
coverage measurements or fail when conditional paths become untested. As the static guide adds
filters, detail views, data validation, and future guidance lists, a measurable confidence floor is
needed for all application source rather than relying only on the count of passing tests.

## Considered Options

- Use Vitest's V8 coverage provider with 100% global thresholds for statements, branches, functions,
  and lines in application source.
- Use Vitest's Istanbul coverage provider with the same threshold.
- Continue with passing-test requirements without an enforced coverage threshold.

## Decision Outcome

Chosen option: "use Vitest's V8 coverage provider with 100% global thresholds for statements,
branches, functions, and lines in application source", because it integrates with the existing
Vitest 3 suite, uses native V8 instrumentation, and requires every executable application path to
be covered without adopting a second test framework.

### Consequences

- Good, because pull requests cannot silently lower any configured coverage metric below the agreed
  confidence floor.
- Good, because test reports identify unexercised statements, functions, and conditionals in the
  domain, application, and UI layers.
- Bad, because changes may require additional tests or deliberate refactoring before they can merge.
- Bad, because coverage metrics cannot establish that the reviewed food guidance is medically
  correct; editorial review and the existing validation checks remain required.

## Decision Drivers

- The project already uses Vitest 3 and React Testing Library.
- URL parsing, fallback resolution, and guidance rendering contain safety-relevant conditional
  branches.
- The policy must apply consistently across all application source under `src/`, not only the domain
  layer.
- Test files and Vite's entry/type-declaration files are not application behaviour and must not
  dilute the measurement.

## Pros and Cons of the Options

### Vitest V8 coverage provider

- Good, because it is Vitest's native coverage integration and avoids Istanbul source
  instrumentation.
- Good, because it reports every required coverage metric and can fail the existing test command.
- Bad, because it adds a development dependency and must be configured with explicit source
  inclusion/exclusion rules.

### Vitest Istanbul coverage provider

- Good, because Istanbul reporting is familiar in many JavaScript projects.
- Bad, because it adds instrumentation complexity without a project requirement that V8 coverage
  cannot meet.

### No enforced coverage threshold

- Good, because no test configuration or new dependency is needed.
- Bad, because coverage regressions remain invisible and the requested confidence floor cannot be
  verified.

## Implementation Plan

- **Affected paths:** `package.json`, `package-lock.json`, `vite.config.ts`, `src/**/*.test.*`,
  `docs/implementation-plan.md`, and `docs/features/*.md`.
- **Pattern to follow:** Add and lock `@vitest/coverage-v8` at a version compatible with the existing
  Vitest installation. Configure Vitest coverage to include application files in `src/` and exclude
  `src/**/*.test.*`, `src/test/**`, `src/main.tsx`, and `src/vite-env.d.ts`. Configure global
  `statements`, `branches`, `functions`, and `lines` thresholds of `100` that fail the coverage
  command when unmet. Add an `npm` script that runs the full suite with coverage; do not lower a
  threshold, exclude application modules, or use coverage output as a substitute for meaningful
  behavioural tests.
- **Tests:** Run the coverage script after application or content changes. It must exit successfully
  only when the complete suite passes and reports 100% statements, branches, functions, and lines
  for the configured application source.

## Confirmation

- [x] `@vitest/coverage-v8` is locked in the development dependencies at a version compatible with
  the installed Vitest.
- [x] A documented `npm` coverage command runs the complete suite and produces a report for
  statements, branches, functions, and lines.
- [x] The configured scope includes all application source in `src/` and excludes only tests,
  `src/main.tsx`, and `src/vite-env.d.ts`.
- [x] The command fails when any global coverage metric is below 100%.
- [x] The current repository meets 100% statements, branches, functions, and lines before the
  policy is marked Accepted.
- [x] Feature plans and the repository quality gates require this command for application or content
  changes.

## More Information

This Accepted decision strengthens the validation expectations in
[`docs/implementation-plan.md`](../implementation-plan.md) and applies alongside the Accepted ADRs
for the static React SPA and version-controlled reviewed content. It does not supersede those
decisions.

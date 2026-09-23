# 2026-09-23 ADR: enforce local quality gates and fixed-UTC production promotions

**Status:** Accepted
**Date:** 2026-09-23
**Deciders:** Product owner

## Context and Problem Statement

The static application currently deploys every change merged to `main`, which can exhaust the
Netlify free-tier deployment allowance. Development still needs deterministic local quality gates,
but the released branch must advance only once per day or when deliberately promoted by a
maintainer. The release workflow must be easy to inspect and maintain.

## Considered Options

- Keep `main` as the Netlify production branch and deploy every merged change.
- Promote `main` through a GitHub Actions workflow at 08:00 Pacific/Auckland time, following
  daylight saving changes.
- Promote `main` through a GitHub Actions workflow at one fixed UTC time.

## Decision Outcome

Chosen option: "promote `main` through a GitHub Actions workflow at 20:00 UTC daily, or on manual
dispatch", because a single schedule is simpler and adequate for the release cadence. This runs at
08:00 NZST and 09:00 NZDT.

The workflow uses the repository `GITHUB_TOKEN` with `contents: write` permission to create
`production` from `main` when the release branch is first needed, then merges `main` only when the
release branch does not already contain it. A conflicting merge fails rather than overwriting
release history. Manual dispatch uses the same no-op and merge rules.

Local validation remains mandatory: Vitest coverage, Playwright, axe, type-checking, linting, and a
production build continue to run before local commits and merges to `main`. GitHub Actions is not a
hosted replacement for these quality gates and introduces no deployment secret, runtime service,
pull-request workflow, or live content API.

### Consequences

- Good, because multiple `main` changes produce at most one normal daily production deployment.
- Good, because the scheduling configuration is one cron entry with no timezone guard.
- Good, because a maintainer can release a validated change before the next scheduled promotion.
- Good, because `production` retains its history and the workflow does nothing when it already
  contains `main`.
- Bad, because a release runs one hour later during NZDT.
- Bad, because a merge conflict between `main` and `production` requires maintainer intervention
  before a release can proceed.
- Bad, because the workflow requires GitHub Actions write permissions to be enabled for the
  repository's `GITHUB_TOKEN`.

## Implementation Plan

- **Affected paths:** `.github/workflows/promote-production.yml`, `AGENTS.md`, `README.md`, and
  `docs/decisions/`.
- **Pattern to follow:** Keep application validation local. The workflow must authenticate only with
  the automatic `GITHUB_TOKEN`, use the single `0 20 * * *` cron expression, and use a normal Git
  merge; it must never force-push `production`.
- **Tests:** Parse the workflow YAML, check the diff for whitespace errors, and review the
  workflow's branch-existence, no-op, successful-promotion, conflict, and manual-dispatch paths.

## Confirmation

- [x] `production` is created from `main` when it does not exist.
- [x] The scheduled run starts at 20:00 UTC every day, which is 08:00 NZST and 09:00 NZDT.
- [x] A manual run can promote immediately.
- [x] A run exits without pushing when `production` already contains `main`.
- [x] The workflow never force-pushes a release branch and fails on merge conflicts.
- [x] Local coverage, browser, accessibility, type-checking, linting, and build checks remain
  required before merging to `main`.

## More Information

This ADR supersedes
[2026-09-21 ADR: enforce local quality gates](<2026-09-21 ADR - enforce local quality gates.md>).
Netlify must be configured to treat `production`, rather than `main`, as its production branch.

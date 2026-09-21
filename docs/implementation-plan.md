# Implementation Guidance

## Purpose

The [Feature Register](features/README.md) describes the product's current capabilities and their
acceptance criteria. The [Architecture Decision Register](decisions/index.md) describes the durable
technical choices that constrain implementation. This document defines how future work moves from
an approved outcome to a locally merged change; it is not a delivery history or backlog.

## Planning and delivery

1. Update an existing feature brief when work strengthens the same independently valuable outcome.
   Create a new feature only when the user or maintainer receives a distinct new capability.
2. Move a feature to `Planned` only after its outcome, boundaries, dependencies, acceptance criteria,
   and feature-specific implementation plan are approved.
3. In the implementation plan, name the affected surfaces, governing ADRs, observable tests, and a
   final task for a subagent to run the `prepare` skill after targeted validation.
4. Move the feature to `In progress` when implementation begins.
5. Resolve or record `prepare` findings, complete the quality gates below, merge locally into
   `main`, and only then mark the feature `Done`.
6. Fold delivered behaviour into the durable feature brief and remove the obsolete implementation
   plan so the register remains current-state documentation.

## Decision baseline

Accepted ADRs in [`docs/decisions/`](decisions/) are binding. Refine an ADR when the current choice
is unchanged. Write a self-contained replacement before implementing a conflicting choice, update
all references, and remove the wholly obsolete record once Git history is its only remaining value.

## Local quality gates

Run the narrowest relevant checks while implementing. Before a local merge that changes application
or content behaviour, complete:

- `npm run lint`;
- `npm run typecheck`;
- `npm run test:coverage`, retaining 100% global statements, branches, functions, and lines for
  application source;
- `npm run test:e2e`, including focused Chromium journeys and WCAG 2.2 AA axe scans for changed
  user-facing behaviour;
- `npm run build`;
- the Husky pre-commit gate, which reruns coverage and Playwright;
- a subagent `prepare` skill run for feature work, with every finding resolved or recorded.

The repository is local-only. Do not add remote, pull-request, hosted-CI, or deploy-preview steps to
feature plans.

## Deferred decisions

A backend, CMS, authentication, personal recommendations, third-party search, analytics, or
offline-first caching requires a concrete product need and a replacement or additional ADR before
implementation.

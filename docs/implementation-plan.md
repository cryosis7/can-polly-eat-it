# Implementation Plan

## Delivery strategy

Build the smallest trustworthy pregnancy-guide experience first, but establish the category and
assessment abstractions before adding real content. The first release is static, client-side, and
does not require accounts or a backend.

Each delivered feature ends with a usable, verifiable increment. Later features do not duplicate data
or UI for a new dietary perspective; they extend the shared guidance-list model.

## Relationship to feature planning

This document records the high-level delivery sequence across the product, the quality gates every
change inherits, and the decisions deliberately deferred. It does not restate how any feature is
built.

The [Feature Register](features/README.md) is the source of truth for an individual feature's
outcome, status, dependencies, non-goals, acceptance criteria, and feature-specific
implementation-plan link. A feature-specific implementation plan is the source of truth for how that
feature lands in code. Do not infer a feature's current delivery status from this document, and do
not add per-feature task detail here.

Feature-specific implementation plans inherit the quality gates below and add a pre-PR verification
task that instructs a subagent to run the `prepare` skill after implementation and targeted
validation. Resolve or record any `prepare` findings before opening a PR or marking the feature
`Done`.

## Delivery sequence

1. F-01: Browse the Food Guide
2. F-02: Search and Filter Foods
3. F-03: Explain Food Guidance
4. F-04: Maintain Trustworthy Guidance Content
5. F-05: Add Independent Guidance Lists
6. F-06: Improve the Mobile-First Accessible Guide Experience
7. F-07: Add AI-Assisted Guidance-List Curation
8. F-08: Rework Guidance-Scope Filtering
9. F-10: Vary Citation Expectations by Guidance List
10. F-09: Assess and Browse Food Categories
11. F-11: Make the Browse Hierarchy Legible and Collapsible
12. F-12: Lift Group-Level Guidance onto Categories

F-11 precedes F-12 because retiring a mirror food would visibly lose its summary and source from the
browse view until an assessed category renders them as a food does.

F-10 precedes F-09 so that the vegetarian guidance content is migrated to categories once, under its
final citation policy, rather than in two passes.

## Decision baseline

The Accepted ADRs in [`docs/decisions/`](decisions/) govern this implementation plan. Create a new
ADR or explicitly amend an existing decision before adopting a conflicting approach.

## Quality gates

Every pull request that changes application or content code should run:

- package-manager clean install;
- linting and strict TypeScript checking;
- the full Vitest suite with enforced 100% global statements, branches, functions, and lines for
  application source;
- domain/schema/tree/search/filter unit tests;
- React Testing Library tests for catalogue, filters, and detail rendering;
- Chromium Playwright end-to-end tests for every implemented user-facing flow, including direct
  detail-route loading and a filtered URL;
- WCAG 2.2 AA `axe-core` scans in Playwright for key routes and responsive states, with zero
  violations and no allowlist or baseline;
- a Husky pre-commit hook that runs the coverage and Playwright commands before every local commit;
- coverage resolution, mutually exclusive-scenario, and 1,000-level tree tests;
- Netlify deploy-preview smoke tests for direct detail routes and cache/rewrite configuration;
- build output generation;
- a subagent `prepare` skill run for feature implementation work, with findings resolved or recorded
  before PR readiness.

## Deferred decisions

Do not introduce a backend, CMS, authentication, personal recommendations, third-party search,
analytics, or offline-first caching until a concrete product requirement requires it. If editorial
collaboration or frequent live changes become necessary, create a new ADR that evaluates a CMS or
backend against the version-controlled-data approach.

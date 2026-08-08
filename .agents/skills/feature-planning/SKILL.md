---
name: feature-planning
description: Define, refine, status, defer, resume, sequence, or document product features in this repository. Use this skill whenever the user asks to plan or scope a feature, write a feature brief, identify feature dependencies, prioritise or defer work, turn a feature into an implementation plan, or update feature status, even if they do not say "feature planning".
---

# Feature Planning

Use this workflow to keep product intent, delivery status, and dependencies clear for people and
coding agents. Feature briefs live in `docs/features/`; the index in `docs/features/README.md` is
the portfolio view and must agree with every brief.

## Distinguish the artefact

- Use a **feature brief** for an independently valuable user outcome: why it matters, scope,
  non-goals, acceptance criteria, current status, and dependencies.
- Use `docs/implementation-plan.md` for the high-level sequence across the product.
- Create a **feature-specific implementation plan** only after the feature is `Planned`. It explains
  how the approved outcome lands in code and produces executable tasks.
- Use an **ADR** for an architectural, dependency, infrastructure, data-model, API-contract, or
  other durable technical decision with meaningful alternatives. Read accepted ADRs before planning;
  invoke `adr-writer` if a new decision is needed.
- Do not use a feature brief as a substitute for a bug ticket, a one-off task, or a code-change plan.

## Lifecycle

`docs/features/README.md` owns the lifecycle definitions and transition rules. Read it before
changing any status; do not restate or reinterpret it here. In short: statuses are `Idea`,
`Proposed`, `Planned`, `In progress`, `Done`, and `Deferred`, and a feature cannot reach `Planned` or
`In progress` while a dependency is not `Done` unless its brief records an approved exception.

Never mark a feature `Done` from an intention or an unverified placeholder.

## Discovery before editing

1. Read `docs/features/README.md`, every related feature brief, `docs/implementation-plan.md`, and
   `docs/architecture/overview.md`.
2. Read `docs/decisions/index.md`, then the relevant accepted ADRs in full. Follow their constraints.
3. Inspect implementation and tests when establishing the current status of existing work. Infer only
   what the repository proves; otherwise record an open question.
4. Identify whether an existing feature should be updated instead of creating a near-duplicate.
5. Identify direct and transitive dependencies. A dependency is a completed prerequisite, not merely
   a related area. Reject self-dependencies and dependency cycles.

## Refining a feature

If any essential information is unresolved, ask one focused question at a time. Prefer questions in
this order:

1. Who has the problem, what do they need, and why?
2. What observable outcome proves the feature is valuable?
3. What is in scope and explicitly out of scope?
4. What assumptions, safety concerns, and open questions remain?
5. Which completed features, technical decisions, or external prerequisites does it depend on?
6. What acceptance criteria and proportionate validation prove it is done?
7. What lifecycle status and priority are appropriate now?

Do not ask questions answered by repository evidence. Summarise the intended brief and ask for
confirmation before adding a new feature or making a material scope/status change.

## Creating or updating a brief

Use a stable, zero-padded ID and filename such as `06-mobile-filter-disclosure.md`. Add the feature
and its one-sentence user outcome to the index in the same change.

Follow the structure of an existing brief — [`docs/features/01-browse-food-guide.md`](../../../docs/features/01-browse-food-guide.md)
is a good model. Every brief carries a `Status`, `Depends on`, and `Governing decisions` header, then
the goal as a user story, primary experience, required behaviour, non-goals, assumptions and open
questions, acceptance criteria, and validation.

For a deferred feature, state the deferral rationale and the condition for resuming it. For a planned
or in-progress feature, link its approved implementation plan from `Assumptions and open questions`
or an `Implementation plan` section. Preserve existing accepted requirements when normalising a
legacy brief; do not rewrite product intent merely to fit the template.

## Dependency and index checks

Before finishing:

1. Confirm each index row has a matching feature file and matching ID, title, status, dependencies,
   and outcome.
2. Confirm every dependency link resolves, has a valid feature ID, is not self-referential, and
   cannot lead back to the feature.
3. Confirm each status transition is allowed and prerequisites are `Done` for `Planned` or
   `In progress`.
4. Ensure that acceptance criteria are observable outcomes, not a list of implementation steps.
5. For feature-specific implementation plans, ensure the verification steps include instructing a
   subagent to run the `prepare` skill after implementation and targeted validation, before merging
   into `main` or marking the feature `Done`.
6. Ensure a feature governed by an ADR links to it rather than duplicating or contradicting it.
7. State what changed and any unresolved decisions in the final response.

## Implementation hand-off

When a feature is approved for delivery:

1. Confirm it is `Planned`, dependencies are `Done`, and its acceptance criteria are stable.
2. Create or update its technical implementation plan with affected areas, constraints, tests, and
   rollout/validation steps. Include a verification task, to run before merging into `main`, that
   instructs a subagent to run the `prepare` skill so documentation drift, dependency-version issues,
   and undocumented architecture changes are checked independently. Do not change architecture
   without the relevant ADR workflow.
3. Break the plan into ordered tasks and mark the feature `In progress` only when work actually
   begins.
4. Mark it `Done` only after its acceptance criteria and validation evidence are complete, including
   the subagent `prepare` result or the recorded resolution of any findings, then update the index
   and dependent briefs.

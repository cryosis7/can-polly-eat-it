---
name: delivery-cycle
description: Identify where this repository's delivery cycle currently stands and run it through to the end - plan, implement, prepare, address prepare comments, commit, merge into main, then summarise. Use whenever the user asks what to do next, says "next", "carry on", "continue", "what's the next piece of work", "keep going", "next logical step", or hands over without naming a specific task, even if they do not mention the delivery cycle.
---

# Delivery Cycle

Work in this repository moves through a fixed cycle. Your job is to determine which stage the
repository is actually in **from evidence**, then run the cycle from there through to the end.

```text
plan -> implement -> prepare -> address prepare comments -> commit -> merge into main -> summarise
```

Never assume the stage from the conversation alone, and never skip a stage. Enter the cycle at the
stage the evidence proves, then continue through every remaining stage in order without asking
permission between them. Stop only at a stop condition (see below), or when you reach `summarise`.

## Stop conditions

Stop, say which stage you are in and why, and ask for what you need when any of these is true:

- A **human gate** in the plan is reached, such as a content or editorial review that a plan marks as
  not delegable to an agent.
- **Validation fails** and the fix is not obvious, or a fix would change product intent.
- An **unanswered product question** blocks the work, or the plan is silent on a decision that
  changes the outcome.
- A **dependency is not `Done`**, or a change would contradict an accepted ADR.
- A **prepare finding** needs a judgement call rather than a mechanical fix.
- The work is **large enough that continuing would bury a decision** you should see first.

Otherwise keep going. A stage completing is not a reason to stop.


## Step 1: Establish the current state

Gather evidence before deciding. Run these checks together:

1. `git status --short --branch` and `git --no-pager log --oneline -10` - current branch, whether it
   is `main` or an `agents/*` branch, and whether there are uncommitted changes.
2. `docs/features/README.md` - the feature register and every feature's status.
3. Any feature brief that is `Planned` or `In progress`, plus its `*-plan.md` implementation plan.
4. `docs/decisions/index.md` when the candidate work touches architecture, dependencies, data
   storage, routing, deployment, or domain patterns.

## Step 2: Choose the entry stage

Apply these rules in order and take the **first** match. That is where you enter the cycle, not where
you finish.

| Evidence | Stage | Meaning |
| --- | --- | --- |
| No feature is `Planned` or `In progress`, or the highest-priority feature is `Idea`/`Proposed`/`Deferred` with no approved plan | **plan** | Shape the next feature and its implementation plan. |
| A feature is `Planned` or `In progress` with an approved plan and unfinished plan tasks | **implement** | Build the next unfinished task in the plan. |
| Plan tasks are complete, targeted validation passes, and `prepare` has not run for these changes | **prepare** | Run the pre-PR review. |
| `prepare` has reported findings that are neither fixed nor explicitly accepted | **address prepare comments** | Resolve or record each finding. |
| Work is complete and reviewed, but the worktree has uncommitted changes | **commit** | Commit the change set. |
| The branch is an `agents/*` branch, is committed, and is ahead of `main` | **merge into main** | Fast-forward or merge the branch into `main`. |
| The branch is merged into `main` with a clean worktree | **summarise** | Report what shipped and what is next. |

If two stages look equally plausible, or the evidence contradicts the user's expectation, ask one
focused question with `ask_user` naming the two candidate stages rather than guessing.

## Step 3: Run the cycle from that stage

Announce the entry stage and the evidence for it in one or two sentences. Then work forward through
the remaining stages, posting a short progress update as you enter each one. Do not ask "shall I
continue?" between stages.

### plan

Invoke the `feature-planning` skill. Consult accepted ADRs first via `adr-reader`; if the work needs
a new durable technical decision, invoke `adr-writer` before writing the plan. Produce or update the
feature brief, its row in `docs/features/README.md`, and a feature-specific `*-plan.md` whose
verification steps include instructing a subagent to run `prepare` before the feature moves to
`Done`. Do not start writing application code in this stage; finish the plan, then move to
`implement`.

If planning surfaces a decision the brief does not settle and that changes the outcome, stop and ask
rather than choosing for the user.

### implement

Work the approved plan **to completion**, one ordered task at a time, without stopping between
tasks. Follow `.github/copilot-instructions.md` and the accepted ADRs; a change that conflicts with
an ADR needs an amendment or a new ADR first. After each task run the narrowest relevant command -
`npm test -- <file>` for a single suite, then `npm run typecheck`, `npm run lint`,
`npm run test:coverage`, and `npm run test:e2e` when the change warrants them. Update the feature
status to `In progress` when work actually begins.

If the plan marks a task as a human gate, complete every task up to it, then stop and hand the gate
to the user with what they need to judge it. Do not perform the gate yourself and do not skip past
it.

### prepare

Instruct a subagent to run the `prepare` skill on the branch. Do not run it inline in this
conversation and do not review the branch yourself in its place. Report its findings verbatim
enough that each one is actionable.

### address prepare comments

Take each `prepare` finding in turn. Fix it, or record an explicit rationale for accepting it in the
feature brief or plan. Re-run the targeted validation affected by each fix. Do not close this stage
while a finding is unresolved and unrecorded. If a finding needs a judgement call about product
intent rather than a mechanical fix, stop and ask.

### commit

Invoke the `commit` skill so the message matches the repository's existing style. Confirm the
worktree is clean afterwards. Never commit secrets, and never commit while validation is failing.

### merge into main

Merge the `agents/*` branch into `main` locally, resolving conflicts with the
`resolving-merge-conflicts` skill if any arise. Before merging, confirm the feature brief and the
register both record the feature as `Done` with its validation and `prepare` evidence. After
merging, verify `main` is clean and the tests still pass.

### summarise

Report, briefly: what shipped, which feature IDs changed status, which validation ran and its
result, any accepted `prepare` findings, and the single next logical piece of work with its stage.

This is the end of the cycle. Stop here rather than rolling straight into planning the next feature.

## Guardrails

- Do not mark a feature `Done` from intention. Require observable acceptance criteria, recorded
  validation, and the `prepare` result.
- Do not move a feature to `Planned` or `In progress` while a dependency is not `Done` unless the
  brief records an approved exception.
- Do not merge unreviewed or unvalidated work into `main`.
- If a stage cannot proceed - a blocked dependency, a failing gate, an unanswered product question -
  stop, say which stage is blocked and why, and ask for the decision you need.

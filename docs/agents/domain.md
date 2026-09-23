# Domain docs

This is a single-context repository. Its domain context is
[`docs/architecture/overview.md`](../architecture/overview.md), accepted decisions are registered in
[`docs/decisions/index.md`](../decisions/index.md), and feature lifecycle is registered in
[`docs/features/README.md`](../features/README.md).

## Route the task

Read every row that matches the task:

| Task concerns | Read before acting |
| --- | --- |
| Domain model, catalogue, search, filtering, URL contract, or accessibility | The relevant section of [`docs/architecture/overview.md`](../architecture/overview.md) |
| Architecture, dependencies, data storage, routing, deployment, or domain patterns | [`docs/decisions/index.md`](../decisions/index.md), then every relevant Accepted ADR in full |
| Feature behaviour, outcome, scope, status, dependencies, acceptance criteria, or delivery | [`docs/features/README.md`](../features/README.md), then every related feature brief |

For each matching row, reading is complete when you can name the governing section, feature brief,
or Accepted ADR, or confirm from that row's source or register that none exists.

## Use the project's vocabulary

When an output names a domain concept in an issue title, refactor proposal, hypothesis, or test name,
use the term defined by the sources above.

If the concept is not documented, either reconsider whether it belongs to the project or note the
gap for `/domain-modeling`.

## Flag ADR conflicts

If an output contradicts an existing Accepted ADR, surface the conflict explicitly rather than
silently overriding it. Name the ADR, state the conflicting decision, and ask whether to conform to
it, explicitly amend it, or create a superseding decision.

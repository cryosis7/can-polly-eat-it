# ADR Template

Copy the fenced block below into `docs/decisions/YYYY-MM-DD ADR - imperative-name.md`, replacing the title with an imperative verb phrase (for example "Cache tax
form definitions in memory"). It is a lean [MADR](https://adr.github.io/madr/) variant.

**Fill in every placeholder with specific content. A template with `<...>` placeholders left in is
not a finished ADR.** The sections above the divider are **required**. The sections below it are
**optional**: keep the ones that add value for this decision and delete the rest. A small or
already-implemented decision may only need the required sections; a weighty upfront decision will
use most of them.

```markdown
# YYYY-MM-DD ADR: <imperative decision title>

**Status:** Proposed
**Date:** YYYY-MM-DD
**Deciders:** <names, or TBD>

## Context and Problem Statement

<The situation that forced a decision, in enough detail that someone unfamiliar with the project
understands the stakes. Two or three sentences, or an illustrative story. You may phrase the problem
as a question.>

## Considered Options

- <Option 1>
- <Option 2>
- <Option 3>

<For a decision you already made while implementing, this can be as short as the chosen option plus
the one alternative you rejected, but still name that alternative so the tradeoff is on record.>

## Decision Outcome

Chosen option: "<option>", because <the justification, why this option won over the others>.

### Consequences

- Good, because <what becomes easier / a benefit gained>.
- Bad, because <what becomes harder / a risk or cost accepted>.

<!-- ---------- Optional sections below. Keep what helps, delete the rest. ---------- -->

## Decision Drivers

- <A force or criterion that shaped the decision: a constraint, requirement, or priority>

## Pros and Cons of the Options

### <Option 1>

- Good, because <argument>.
- Bad, because <argument>.

### <Option 2>

- Good, because <argument>.
- Bad, because <argument>.

## Implementation Plan

<What the next agent needs to act on this decision correctly.>

- **Affected paths**: <files and directories this decision governs, e.g. `src/db/`, `src/config/`>
- **Pattern to follow**: <the convention new code must follow>
- **Tests**: <which suite proves it works>

<For a decision already implemented, point at the code that now embodies it rather than listing
future work.>

## Confirmation

<How compliance with this ADR will be confirmed: a checkbox list an agent or reviewer can walk.>

- [ ] <checkable criterion>

## More Information

<Links to the spike, related ADRs, Jira tickets, Slack threads, or design docs. Note any ADR this
supersedes or is superseded by.>
```

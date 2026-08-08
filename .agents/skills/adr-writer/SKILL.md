---
name: adr-writer
description: Write and refine Architecture Decision Records (ADRs) stored in the current project's docs/decisions folder, optimized for agentic coding workflows. Use when you need to propose, write, update, accept/reject, deprecate, or supersede an ADR - at any stage in the workflow. Use this skill when you are considering introducing new dependencies, architectural patterns, infrastructure choices, api contract changes, or finding yourself writing long code comments explaining "why".
---

# ADR Writer

This skill **writes and refines** ADRs. It does not cover consulting, enforcing, or auditing
existing ADRs. Its only job is producing a good decision record.

## Philosophy

ADRs created with this skill are **executable specifications for coding agents**. A human approves
the decision; an agent implements it. The ADR must contain everything the agent needs to write
correct code without asking follow-up questions: explicit constraints, a specific decision ("use
PostgreSQL 16 with pgvector", not "use a database"), stated non-goals, and **how it lands in code** —
which files and patterns it governs and how to verify it.

## There are two ways a decision arrives

The workflow below adapts to whichever one you are in:

1. **Deciding before you build (ADR-first).** The decision is still open. You weigh real
   alternatives, pick one, and the approved ADR becomes the brief an agent implements against. Lean
   hard on the Socratic options analysis in Phase 1.
2. **Capturing a decision made while implementing (in-flight).** You were mid-build, hit a fork,
   chose a path, and now you register it so the reasoning is not lost. The choice is already made, so
   Phase 1 is lighter. You are recording *what* you chose and *why*, and where relevant, naming the alternative you
   rejected, rather than re-opening the question. The ADR still must be self-contained for any future coding agents encountering it.

Either way the record lives in the repo under `docs/decisions/` and follows the same template.

## When to Write an ADR

Write an ADR when a decision changes how the system is built or operated (new dependency,
architecture pattern, infrastructure choice, API design), is hard to reverse once code is written
against it, affects the people or agents who work here later, or has real alternatives that were
considered and rejected.

While coding, **stop and propose an ADR** the moment you are about to:

- introduce a new dependency that doesn't already exist in the project
- create a new architectural pattern (error handling, data access, API convention) other code must follow
- choose between two or more real alternatives where the tradeoffs are non-obvious
- change something that contradicts an existing accepted ADR
- write a long code comment explaining "why" — that reasoning belongs in an ADR

Do NOT write an ADR for:

- Routine implementation choices within an established pattern
- Bug fixes or typo corrections
- Decisions already captured in an existing ADR (update it instead)
- Style preferences already covered by linters or formatters

**How to propose**: Tell the human what decision you've hit, why it matters, and ask if they want to capture it as an ADR. If yes, run the full four-phase workflow. If no, do nothing and move on.

## Creating an ADR: Four-Phase Workflow

Every ADR goes through four phases. Do not skip phases.

### Phase 0: Scan the Codebase

Before asking any questions, gather context from the repo:

1. **Read the existing decisions.** Use the **adr-reader** skill to scan `docs/decisions/index.md`
   and read the ADRs relevant to this decision. Note which ones constrain it, and which it might
   supersede.
2. **Check the tech stack and related code.** Read `package.json` and the implementation of the area
   the decision touches, so the ADR can name the specific files and patterns it will govern.
3. **Note what you found.** Carry this context into Phase 1 — it will sharpen your questions and
   prevent the ADR from contradicting existing decisions.

### Phase 1: Capture Intent (Socratic Questioning)

Grill the human to understand the decision space. Ask questions **one at a time**, building on previous answers. Do not dump a list of questions.

**First, establish which situation you are in** (see "Two ways a decision arrives"). Is the decision still open, or already made while implementing? If it is already made, do not re-litigate it: skip the "what's your lean" probing, keep the options questions light (just enough to record the rejected alternative), and focus on capturing the chosen path, the reasoning, and what the next agent needs.

**Core questions** (ask in roughly this order, skip what's already clear from context or Phase 0):

1. **What are you deciding?** — Get a short, specific title. Push for a verb phrase ("Choose X", "Adopt Y", "Replace Z with W").
2. **Why now?** — What broke, what's changing, or what will break if you do nothing? This is the trigger.
3. **What constraints exist?** — Tech stack, timeline, budget, team size, existing code, compliance. Be concrete. Reference what you found in Phase 0 ("I see you're already using X — does that constrain this?").
4. **What does success look like?** — Measurable outcomes. Push past "it works" to specifics (latency, throughput, DX, maintenance burden).
5. **What options have you considered?** — At least two. For each: what's the core tradeoff? If they only have one option, help them articulate why alternatives were rejected.
6. **What's your current lean?** — Capture gut intuition early. Often reveals unstated priorities.
7. **Who needs to know or approve?** — Decision-makers, consulted experts, informed stakeholders.
8. **What would an agent need to implement this?** — Which files/directories are affected? What existing patterns should it follow? What should it avoid? What tests would prove it's working? This directly feeds the Implementation Plan.

**Adaptive follow-ups**: Based on answers, probe deeper where the decision is fuzzy. Common follow-ups:

- "What's the worst-case outcome if this decision is wrong?"
- "What would make you revisit this in 6 months?"
- "Is there anything you're explicitly choosing NOT to do?"
- "What prior art or existing patterns in the codebase does this relate to?"
- "I found [existing ADR/pattern] — does this new decision interact with it?"

**When to stop**: You have enough when you can fill every section of the ADR — including the Implementation Plan — without making things up. If you're guessing at any section, ask another question.

**Intent Summary Gate**: Before moving to Phase 2, present a structured summary of what you captured and ask the human to confirm or correct it:

> **Here's what I'm capturing for the ADR:**
>
> - **Title**: {title}
> - **Trigger**: {why now}
> - **Constraints**: {list}
> - **Options**: {option 1} vs {option 2} [vs ...]
> - **Lean**: {which option and why}
> - **Non-goals**: {what's explicitly out of scope}
> - **Related ADRs/code**: {what exists that this interacts with}
> - **Affected files/areas**: {where in the codebase this lands}
> - **Verification**: {how we'll know it's implemented correctly}
>
> **Does this capture your intent? Anything to add or correct?**

Do NOT proceed to Phase 2 until the human confirms the summary.

### Phase 2: Draft the ADR

1. **Choose the ADR directory.** Use `docs/decisions/`.

2. **Choose a filename.** Follow the established Windows-safe format:
   `YYYY-MM-DD ADR - imperative-name.md`.

3. **Use the template.** Copy the block from [references/template.md](references/template.md) into
   that path. Its required sections cover every decision; keep the optional sections that add value
   and delete the rest. A straightforward or already-implemented decision may only need the required
   ones.

4. **Fill every section from the confirmed intent summary.** No placeholder text: every section
   holds real content, or is deleted (optional sections only).

5. **Say how it lands in code.** For a decision made up front, write a forward Implementation Plan
   naming the files and patterns to touch and the tests that prove it. For a decision already built,
   point at the code that now embodies it. This is what makes the ADR actionable for the next agent.
   Write the verification criteria as checkboxes specific enough to actually check.

6. **Update the ADR index.** Add or update this ADR's row so a reader can find it without opening
   every file. See [Maintaining the ADR Index](#maintaining-the-adr-index).

After drafting, review the ADR against this agent-readiness checklist:

- **Self-contained**. A new agent could act on it without tribal knowledge.
- **Specific decision**. Names concrete tech, versions, and patterns, not vague direction.
- **Real alternative recorded**. At least the rejected option is named, with its tradeoff.
- **Consequences stated**. Both the benefit gained and the cost or risk accepted.
- **Lands in code**. The reader knows which files and patterns the decision governs (a forward plan for an open decision, or a pointer to the implementing code for one already built).
- **Verifiable**. There is a way to confirm the decision was implemented (checkable criteria).
- **No placeholders**. Every `{...}` is filled and unused optional sections are deleted.

Report only the gaps you found and any notable strengths, not every passing checkbox. For each gap,
propose a specific fix rather than just flagging it, and end with a recommendation: ship it, fix the
gaps first, or go back to Phase 1.

Do not finalize until the ADR passes the checklist or the human explicitly accepts the gaps.

## Maintaining the ADR Index

The ADR directory carries an **index** so agents can triage which decisions are relevant without
opening every file. It lives at `docs/decisions/index.md` and maps each ADR to a one-line summary of
its decision. **The adr-reader skill scans this
index first, so keep it accurate whenever you add an ADR or change a status; a stale index quietly
hides decisions from every future reader.**

Format is a Markdown table, newest first:

```markdown
# Architecture Decisions

This index maps each ADR to a one-line summary so agents can find relevant decisions without opening
every file. Keep it in sync whenever an ADR is added or its status changes.

| ADR | Status | Summary |
| --- | --- | --- |
| [2025-06-15 ADR: cache tax form definitions in memory](<2025-06-15 ADR - cache tax form definitions in memory.md>) | Accepted | Tax form definitions are held in an in-process cache to avoid repeated DB reads; governs `src/config/` and `src/db/`. |
```

Notes:

- Wrap the link target in angle brackets (`[title](<file name.md>)`) so filenames with spaces
  resolve correctly.
- The **summary** is one sentence: what was decided plus the area it governs, so a reader can judge
  relevance without opening the file. It is a pointer, not a substitute for the ADR.
- Order rows newest first and keep the `Status` column in step with each ADR's real status.

Update the index whenever:

- **A new ADR is added** — add its row. If no index exists, bootstrap one with the header above plus
  the single row for this ADR.
- **A status changes** (accept, reject, supersede, deprecate) — update the row's `Status` cell. On
  supersede or deprecate, point the summary at the replacement ADR.
- **A decision is retitled** — keep the row's link text and target in sync with the file.

## Formatting Rules

- Use en-NZ spelling.
- Titles are a short **imperative verb phrase** naming the decision, e.g. "Cache tax form
  definitions in memory", not a bare topic like "Caching".


## Metadata defaults

- **Status**: default new ADRs to `Proposed`. Never set `Accepted` without explicit user
  confirmation — ratifying a decision is a real checkpoint, not a formatting detail. Valid values:
  `Proposed`, `Accepted`, `Rejected`, `Superseded`, `Deprecated`.
- **Date**: today, in `YYYY-MM-DD` format.
- **Deciders**: default to the requesting user unless told otherwise; use `[TBD]` if genuinely
  unknown. Don't invent names.

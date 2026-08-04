---
name: adr-reader
description: Reads, consults, and enforces existing Architecture Decision Records (ADRs) for the current project. Use before implementing a change that touches architecture, when you wonder why the code is structured a certain way, to follow the patterns an accepted ADR mandates, to detect when a change would contradict an existing decision, when you find an ADR reference in a code comment, or when a human says "check the ADRs". This is a read-only skill and does not draft or refine ADRs.
---

# ADR Reader

This skill helps with **reading, consulting, and enforcing** existing ADRs. It does not draft or refine them, that
is the job of the sibling **adr-writer** skill. Its only job is making sure the decisions already
recorded in the repo are found, understood, and respected.

ADRs generally live under `docs/decisions/` (or sometimes `contributing/decisions/`, `adr/`, `docs/adr/`, `decisions/`) with one file per decision. Each has a **Status** (`Proposed`,
`Accepted`, `Rejected`, `Superseded`, `Deprecated`) and sections including **Context and Problem
Statement**, **Considered Options**, **Decision Outcome** with **Consequences**, and sometimes an
**Implementation Plan** and **Confirmation** checklist.

The directory usually also has an **index** (an `index.md`) that maps each ADR to a
one-line summary of its decision. **Scan the index first and open only the ADRs it flags as relevant,
rather than reading every file.** That is the whole point of the index.

## Why This Matters

An ADR is an executable specification: a human approved a decision, and agents are expected to build
code that honours it. Reading ADRs before you act keeps the codebase coherent and stops you from
silently undoing a deliberate choice. If you skip this step you risk reintroducing a rejected option,
contradicting an accepted decision, or duplicating a pattern that already has a mandated home.

## When to Consult ADRs

Consult the ADRs when any of these are true:

- Before starting work on a feature that touches architecture (auth, data layer, API design,
  infrastructure, caching, error handling)
- When you encounter a pattern in the code and wonder "why is it done this way?"
- Before proposing a change that might contradict an existing decision
- When a human says "check the ADRs" or "there's a decision about this"
- When you find an ADR reference in a code comment or PR description
- Before introducing a new dependency or architectural pattern (an ADR may already govern it, or one
  may need to be written first with adr-writer)

## How to Consult ADRs

1. **Find the ADR directory and its index.** Check `docs/decisions/` first (the repo default). If
   that is absent, also check `contributing/decisions/`, `adr/`, `docs/adr/`, and `decisions/`. Look
   for the ADR index, an `index.md` in that directory that maps each ADR to a one-line
   summary and its status.

2. **Scan the index first, then shortlist only what is relevant.** Read the index and use its per-ADR
   summaries and statuses to decide which records actually bear on your task. Triage from the
   summaries instead of opening every file. Shortlist the ADRs whose summary touches the area you are
   working in, focusing on **`Accepted`** ones (the active decisions). Treat `Superseded` and
   `Deprecated` entries as history and follow their pointer to the replacement; `Proposed` entries
   are not yet binding but signal work in flight.

   If there is no index, fall back to scanning filenames and titles (they carry the dated, imperative
   title, e.g. `2025-06-15 ADR - cache tax form definitions in memory.md`), and consider asking the
   adr-writer skill to bootstrap an index so future reads are cheaper.

3. **Read the shortlisted ADRs in full.** The index summary is a pointer, not the decision itself,
   never enforce or contradict a decision based on the summary alone. Open each shortlisted ADR and
   read the **Context and Problem Statement**, the **Decision Outcome** and its justification, the
   **Consequences**, the **Considered Options** (so you know which alternatives were already rejected
   and why), and especially the **Implementation Plan** and **Confirmation** sections. The
   Implementation Plan tells you which files, directories, and patterns the decision governs.

4. **Respect the decisions.** If an accepted ADR says "use PostgreSQL", do not propose switching to
   another database without first writing a new ADR (via adr-writer) that supersedes it. Do not
   reintroduce an option the ADR explicitly rejected.

5. **Follow the Implementation Plan.** When you write code in an area governed by an ADR, follow the
   pattern it specifies. If the plan says "all new queries go through the data-access layer in
   `src/db/`", do exactly that rather than inventing a parallel path.

6. **Flag conflicts, do not silently resolve them.** If the code already contradicts an accepted ADR,
   or the change you have been asked to make would contradict one, stop and surface it to the human.
   Name the ADR, quote the relevant decision, and describe the conflict. Offer two paths: bring the
   change into line with the ADR, or write a superseding ADR (with adr-writer) if the decision itself
   should change. Do not pick one unilaterally.

7. **Check the Confirmation criteria.** If the ADR has a **Confirmation** checklist, use it to verify
   that your work (or the existing code) actually satisfies the decision. These criteria are written
   to be checkable.

8. **Reference the ADR in your work.** When your change is guided by an ADR, cite it in code comments
   and in the PR description (see below).

## Code and ADR Linking

ADRs should be discoverable from the code they govern, and vice versa. When reading, use these links
to navigate; when writing code guided by an ADR, add them.

### ADR to Code (in the Implementation Plan)

The **Implementation Plan** section of an ADR names the specific files, directories, and patterns the
decision governs. Use it as your map: it tells you where a decision lands and what convention new code
in that area must follow.

### Code to ADR (in comments)

When you implement or modify code guided by an ADR, add a lightweight comment referencing it so the
next agent can find the reasoning:

```csharp
// ADR: Cache tax form definitions in memory
// See: docs/decisions/2025-06-15 ADR - cache tax form definitions in memory.md
```

Keep these lightweight: one comment at the entry point of the governed area, not on every line. The
goal is discoverability, not noise. When you spot such a comment while reading code, open the
referenced ADR before changing that code.

### Why bidirectional links matter

- An agent working in a governed area (e.g. `src/db/`) can find which ADRs constrain it.
- An agent reading an ADR can jump to the code that implements it.
- When an ADR is superseded, the code references make it easy to find every place that needs updating.

## Handing Off to the Writer

This skill stops at reading and enforcing. The moment the task shifts to **recording a new decision**,
**changing an ADR's status**, **superseding**, **deprecating**, or **refining** a record, hand off to
the **adr-writer** skill. Typical triggers for the handoff:

- You found a conflict that should be resolved by changing the decision, not the code.
- There is no ADR for a decision that clearly warrants one (new dependency, new architectural
  pattern, non-obvious tradeoff between real alternatives).
- An accepted ADR is now outdated and needs to be deprecated or superseded.

# Local issue tracker

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at
  `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, never a combined tickets file
- Triage records exactly one `Category:` and one `Status:` line near the top of each issue; use the
  role strings in [`triage-labels.md`](triage-labels.md)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Operations

### Publish to the issue tracker

Choose the spec or issue path from the conventions above, create missing parent directories, and
follow the nearest existing file's headings. A publish is complete when the new file has one
canonical path, an unambiguous title, and every applicable convention above; an implementation issue
must include both `Category:` and `Status:`.

### Fetch the relevant ticket

Read the referenced path directly. For an issue number, search filenames under `.scratch/`; for a
title or description, search issue headings and bodies. Fetching is complete when exactly one
matching file has been read. Ask the user to choose when several files remain plausible.

### Update a ticket

Integrate confirmed changes into the description so it remains current and append dated conversation
or implementation history under `## Comments`. An update is complete when the requested content and
dated history are recorded.

## Wayfinding operations

Used by `/wayfinder`. A **map** has one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` with Destination, Notes, Decisions so far, Not yet specified,
  and Out of scope sections
- **Child**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the
  body; `Type:` is `research`, `prototype`, `grilling`, or `task`, and `Status:` is `claimed` or
  `resolved`
- **Blocking**: `Blocked by: NN, NN`; a child is unblocked when every listed child is `resolved`
- **Frontier**: the first numbered child that is open, unblocked, and unclaimed
- **Claim**: set `Status: claimed` and save before working
- **Resolve**: append the answer under `## Answer`, set `Status: resolved`, then append a context
  pointer (gist and link) to the map's Decisions so far section

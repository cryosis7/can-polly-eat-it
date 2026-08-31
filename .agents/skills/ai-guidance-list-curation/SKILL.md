---
name: ai-guidance-list-curation
description: Curate a new or extended food guidance list in Polly's Food Guide from a maintainer-supplied source URL. Use whenever a maintainer asks to add a food list, vegetarian/dietary guidance, or source-backed food assessments from a supplied URL, even if they do not call it a skill. Produces a local, review-ready static-data draft and never commits or publishes health guidance.
---

# AI-assisted guidance-list curation

Use this when a maintainer provides a credible source URL and asks for a local draft of a new or
extended food guidance list. This skill prepares a review-ready static-data draft only; it never
commits, publishes, or approves guidance.

Before authoring any assessment, read the **Guidance lists and assessments** and **Preparation as a
crossing dimension** sections of [the architecture overview](../../../docs/architecture/overview.md).
They own the record shape and the resolution rules; this skill does not restate them.

## Purpose and guardrails

- Use only the supplied source URL and same-domain pages directly linked from it.
- Do not broad-search, infer a status from silence, or turn a brand-specific or ambiguous statement
  into a favourable assessment.
- Preserve the shared food catalogue and list-owned assessments; do not add list-specific fields to
  `Food`.
- Keep one assessment per subject, preparation, guidance list, and source. A source disagreement is a
  separate assessment, not a reason to merge or hide the other one.
- Paraphrase the source; do not copy it into the product as-is.
- Never commit, publish, deploy, or approve content from this workflow.

Changing any guardrail above means amending the
[curation ADR](../../../docs/decisions/2026-08-05%20ADR%20-%20adopt%20AI-assisted%20local%20draft%20curation%20for%20official%20sources.md).

## Before drafting

Confirm these, one at a time if needed:

1. The source URL.
2. The list being extended or the new list name and purpose.
3. The draft scope: the whole catalogue or a named subset.
4. For a new list only: its list status wording, citation policy, and any required evidence basis.

If the source does not support the requested perspective, say no draft was produced and ask for a
source that does.

## Drafting workflow

1. Read the supplied source and any directly linked same-domain pages only.
2. Reuse the existing food/category catalogue before adding a new record.
3. Record every proposed claim with the source URL and the exact locator used.
4. Add list-specific assessments keyed by subject, preparation, guidance list, and source.
5. Keep conditions and scenarios separate; do not merge them into a single instruction.
6. Keep `not-assessed` as a neutral fallback and never author it as an implied safe status.
7. Stop and ask for clarification when the source is inaccessible, incomplete, ambiguous, branded, or
   unsupported by the evidence.

### Authoring decisions

The overview owns the record shape; these are the judgement calls it does not make for you.

- **`relation`** — when a food beneath an assessed category needs its own assessment, choose
  deliberately. `replaces` (the default) supersedes the ancestor's guidance entirely; `adds-to` keeps
  the nearest assessment's status and shows the inherited guidance as a separate attributed layer.
- **Reason links** — use one only where the source supports the assessed food's own conclusion. It
  must target an existing canonical food, and never supplies a status or citation by itself.
- **`sourceId`** — required on every assessment in a list declaring two or more sources; absent
  entirely in a single-source or no-source list, where the list supplies the attribution.
- **Merging siblings** — propose one category assessment with a `scopeStatement` only where the
  source treats the items identically. Differing conditions, scenarios, or strength of wording are
  distinct advice: keep them as separate records and let the maintainer decide.

## Known pitfalls

- **Fetches fail.** Government health sites block agents or time out; fall back to an archived
  snapshot of the same URL. Cite the canonical URL in the data — a reader following it is not subject
  to the blocks an agent hits — and tell the maintainer in the review packet that a snapshot was used.
- **Markdown conversion flattens tables.** Merged `rowspan`/`colspan` headers detach from the rows
  they govern, so read the raw HTML wherever grouping carries meaning.
- **Alias collisions break unrelated tests.** A new name or alias containing a term an existing search
  test asserts on changes that test's count, so the failure names a food you never touched.

## Validation

Run the smallest relevant existing tests for the data change and report the commands and outcomes.
Expect `src/domain/contentValidation.test.ts` totals to need updating; confirm the new numbers are the
ones you intended. A draft is not ready if validation fails or if the evidence is incomplete.

## Review packet

End with a succinct review packet that includes:

- Draft status: ready for review or blocked
- Sources consulted: URL and locators used, noting where an archived snapshot was read instead of the
  live page
- Claim-by-claim evidence: subject, proposed status, source URL, locator, paraphrase/condition
- Proposed content changes: list, food, category, preparation, assessment updates
- Open questions or unresolved items
- Validation commands and results
- Approval boundary: no commit, publication, or approval has occurred yet

This workflow exists to create a reviewable local draft from a supplied source. The maintainer reviews
and approves the content before anything is committed or published.

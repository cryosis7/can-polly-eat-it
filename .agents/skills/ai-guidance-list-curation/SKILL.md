---
name: ai-guidance-list-curation
description: Safely curate a new or extended food guidance list from a maintainer-provided credible website in Polly's Food Guide. Use this skill whenever a maintainer asks to add a food list, vegetarian/vegan/dietary guidance, or source-backed food assessments from a supplied URL, even if they do not call it a skill. It creates a local, review-ready static-data draft and never commits, publishes, or automatically approves health or suitability guidance.
---

# AI-assisted guidance-list curation

This skill prepares reviewed-content changes for Polly's Food Guide. It is a local drafting workflow,
not a publishing workflow: the maintainer owns the final editorial decision.

Follow [the accepted curation ADR](../../../docs/decisions/2026-08-05%20ADR%20-%20adopt%20AI-assisted%20local%20draft%20curation%20for%20official%20sources.md),
[the static-content ADR](../../../docs/decisions/2026-08-04%20ADR%20-%20store%20reviewed%20guide%20content%20as%20version-controlled%20static%20data.md),
and [F-07](../../../docs/features/07-ai-assisted-guidance-list-curation.md).

## Safety boundary

- Accept only a maintainer-supplied HTTPS source URL. Do not search the web for alternative or
  corroborating sources.
- You may read the supplied page and pages directly linked from it on the same official domain. Do
  not follow another link depth or any off-domain link. Record every page you use.
- Do not add a network request, scraper, content API, CMS, browser editor, runtime mutation, commit,
  publication, or deployment.
- Do not infer an assessment from a food name, category, ingredient, reason link, common knowledge,
  or a source's omission. Do not turn ambiguity into a favourable result.
- Paraphrase source material concisely; do not copy substantive source prose into the application.
- Stop and ask the maintainer for guidance when the source is inaccessible, conflicting, ambiguous,
  incomplete, brand-specific, unsupported, or does not establish the requested list's authority.

## Required input

Before editing, establish all of the following:

1. The supplied HTTPS source URL and why its publisher is authoritative for the requested
   guidance perspective.
2. The list title and purpose, or the existing list being extended.
3. The intended list-owned status vocabulary for a new list.
4. The intended coverage: all catalogue foods or named categories and/or foods.

Ask one focused question at a time for any missing input. A credible URL alone is not proof that it
supports the requested perspective; for example, pregnancy guidance cannot establish vegetarian
suitability unless it explicitly does so.

Do not retrieve the source or attempt a draft until the required input is complete. In an initial
response with missing input, ask for the first missing item rather than claiming that the source is
inaccessible or that you cannot fetch it. When a source cannot support the requested list, state
that no content was drafted, committed, or published, then ask for a source that explicitly supports
the requested perspective.

## Drafting workflow

1. Read `docs/decisions/index.md`, the accepted decisions named above,
   `docs/features/07-ai-assisted-guidance-list-curation.md`, `src/domain/schemas.ts`,
   `src/domain/contentValidation.ts`, and the relevant `src/data/` files.
2. Retrieve the supplied page. Before using any directly linked page, confirm it remains on the same
   official domain and record its URL and the link that led to it.
3. Build an evidence table before writing data. For each proposed list, coverage declaration, and
   food assessment, record:
   - source URL and exact locator;
   - access date;
   - the source-version evidence;
   - the source-supported status and concise paraphrase;
   - conditions or alternative scenarios;
   - uncertainties requiring maintainer review.
   Treat a proposed review-due date as a maintainer decision unless the source or the maintainer
   supplies a review cadence.
4. Check whether each named item already exists in `src/data/foods.ts`. Reuse the canonical food
   record where possible. Add a food or category only when the source and the intended coverage
   require it; do not duplicate the catalogue for a new list.
5. Create or update `GuidanceList` data with list-owned statuses, distinct grey `Not assessed` and
   `Outside current coverage` fallbacks, explicit coverage, citations, source-version evidence,
   verification date, and review-due date. Do not use a fallback status on an assessment.
6. Create only source-supported `FoodAssessment` records. Each requires an independent citation,
   a list-owned non-fallback status, review date, concise paraphrase, and separate guidance
   scenarios for alternatives. Keep uncertain in-scope foods unassessed or use an explicit,
   source-supported review/check-ingredients outcome.
7. Use a reason link only when the source supports the assessed food's own conclusion and its target
   is an existing canonical food. A reason link never supplies a status or citation by itself.
8. Update focused domain, rendering, and browser tests when the draft adds a visible list or changes
   an assessment outcome. Run the narrowest existing relevant checks first, then `npm run
   test:coverage`, `npm run test:e2e`, and `npm run build` for user-visible content. Report each
   command and its outcome; surface a failure rather than treating the draft as validated.

## Review gate

After drafting and validation, stop. Do not commit or publish the changes. Ask the maintainer to
review the source evidence and working-tree diff, specifically confirming each list status, coverage
claim, assessment, citation locator, date, paraphrase, review-due date, and unresolved item. Do not
silently omit an unsupported item from the review packet: identify it as excluded or unassessed and
explain why.

## Required final response

End every invocation with this review packet:

```markdown
## Curation review packet

### Draft status
- Ready for maintainer review, or
- Blocked — explain why no draft was produced

### Sources consulted
- [URL] — exact locator(s) used

### Claim-by-claim evidence
| Record | Proposed status or coverage | Source URL and exact locator | Paraphrase or condition | Date evidence |
| --- | --- | --- | --- | --- |
| ... | ... | ... | ... | accessed, verified, reviewed, and review-due dates |

### Proposed content changes
- Lists:
- Foods/categories:
- Assessments:

### Items needing a maintainer decision
- ...

### Validation
- Command — result

### Approval boundary
No commit, publication, deployment, or human approval has occurred. Please review the source
evidence and working-tree diff before accepting this draft. The proposed review-due date also
requires maintainer approval unless a supplied source or instruction established it.
```

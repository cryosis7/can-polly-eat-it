# F-04: Maintain trustworthy guidance content

**Status:** Done

**Depends on:** None

**Governing decisions:** [Validated static guidance](<../decisions/2026-09-21 ADR - store reviewed guidance as validated static data.md>), [catalogue subjects and preparation](<../decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md>), [independent guidance lists and sources](<../decisions/2026-09-21 ADR - model guidance as independent lists and sources.md>), [conservative resolution](<../decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md>), [review-gated AI drafting](<../decisions/2026-09-21 ADR - permit review-gated AI guidance drafting.md>), and [local quality gates](<../decisions/2026-09-21 ADR - enforce local quality gates.md>)

## Goal

Let a maintainer curate catalogue and guidance changes as reviewable static data, with automated
validation and optional AI drafting that never replaces human judgement.

## Editorial workflow

1. Select a credible source and define the intended list and catalogue scope.
2. Edit typed records directly or ask the curation skill for a local review-ready draft.
3. Review every subject, preparation, status, source, paraphrase, scenario, condition, and citation.
4. Run schema, relationship, domain, rendering, and relevant browser validation.
5. Accept the change only after human review of both source evidence and rendered guidance.

## Required behaviour

- Keep categories, foods, preparations, lists, sources, and assessments as declarative typed records
  under `src/data/`.
- Reject invalid schemas, identifiers, parent cycles, dangling references, duplicate assessment
  keys, invalid status ownership, fallback statuses on assessments, invalid attribution, impossible
  additive rules, and missing required citations.
- Require each list to own its statuses, neutral fallback, unassessed notice, source set, and citation
  policy or evidentiary basis.
- Preserve every source position, category origin, preparation state, scenario, condition, reason
  link, citation, and authored wording whole.
- Manually review and paraphrase source material; never scrape, automatically update, or infer
  guidance.
- Treat inaccessible, ambiguous, brand-dependent, incomplete, or unsupported material as blocked or
  unresolved rather than favourable.
- Permit the AI curation skill to prepare only a local draft from a supplied credible source, its
  directly linked same-domain pages, and a disclosed snapshot of that URL when the live page is
  inaccessible.
- Keep the draft uncommitted and unpublished until a human approves every claim.
- Review content and tests together in source control.

## Non-goals

- A CMS, database, content API, or in-app authoring workflow.
- Runtime scraping, automatic ingestion, or automatic publication.
- Treating a citation as proof without a human content review.
- Silently extending a list's coverage because a food appears in the catalogue.

## Assumptions and open questions

- Content scale remains within the catalogue budget in the catalogue-model ADR.
- User-visible changes require focused rendering and Playwright coverage in addition to content
  validation.
- No open question blocks this implemented capability.

## Acceptance criteria

- Invalid authored content fails with a useful validation error before rendering.
- Every published rule is traceable to its attributed authority and precise citations, or to a
  citation-optional list's displayed evidentiary basis.
- A source-backed AI draft identifies every locator and unresolved item, changes only local data and
  tests, and stops before commit or publication.
- A maintainer can verify the exact catalogue, resolver, and rendered outcomes affected by a content
  change.

## Validation

Content and domain tests parse the complete dataset and exercise affected invariants. Rendering and
Chromium Playwright tests prove changed user-visible outcomes, wording, attribution, and citations.
The curation skill's own structural and scenario tests remain part of its maintenance. All
application changes retain the repository-wide coverage and accessibility gates.

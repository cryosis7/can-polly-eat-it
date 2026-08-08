# 2026-08-05 ADR: Adopt AI-assisted local draft curation for official sources

**Status:** Accepted
**Date:** 2026-08-05
**Deciders:** Project owner (requester)

## Context and Problem Statement

The guide's static data contract already supports independently maintained guidance lists, but adding
a list from a credible source is a detailed editorial task. The existing static-content decision
forbids automated source ingestion so that unreviewed or inferred advice cannot be published. The
project needs a bounded AI workflow that speeds up preparation while keeping the maintainer's source
review and approval as the publication gate.

## Considered Options

- Permit a repository skill to prepare a validated local working-tree draft from a
  maintainer-provided official source and directly linked first-party pages, then require human
  review.
- Restrict the skill to a proposed content plan and source evidence; require a human to apply every
  data change.
- Allow automatic ingestion and publication of source-derived guidance.

## Decision Outcome

Chosen option: "permit a repository skill to prepare a validated local working-tree draft from a
maintainer-provided official source and directly linked first-party pages, then require human
review", because it reduces repetitive transcription while keeping every assessment, status, and
citation reviewable before the guide changes.

### Consequences

- Good, because maintainers can turn a specified credible source into a schema-valid, testable draft
  without manually reproducing every static-data record.
- Good, because the draft remains an ordinary source-control change that a reviewer can compare
  against the retrieved evidence.
- Bad, because the maintainer must still review each proposed claim, citation locator, coverage
  declaration, and ambiguous item before accepting the change.
- Bad, because the skill must stop or request clarification when source material is inaccessible,
  ambiguous, incomplete, branded, conditional, or unsupported by the retrieved evidence.

## Decision Drivers

- Published food guidance must remain traceable, explicit, and manually approved.
- New lists must reuse the existing shared catalogue and list-owned assessment model.
- The application remains a static client-side deployment with no runtime source fetching, CMS, or
  content API.
- A maintainer may deliberately give an AI agent a credible source URL, but the agent must not turn
  that authority into a broad web-search or automatic-publishing permission.

## Pros and Cons of the Options

### Local draft curation with human review

- Good, because it produces a concrete, validated change set that a maintainer can inspect and amend.
- Good, because direct first-party pages can supply necessary tables or definitions that the supplied
  page links to.
- Bad, because it still requires editorial expertise and a review step before the data is accepted.

### Evidence-only curation

- Good, because it minimises the chance of an AI-authored data change.
- Bad, because it leaves the maintainer to perform the repetitive schema and data transcription that
  the workflow is intended to accelerate.

### Automatic ingestion and publication

- Good, because updates could appear quickly with minimal maintainer effort.
- Bad, because source wording, scope, conditions, or future website changes could create uncited,
  unsupported, or unsafe guidance without a human approval checkpoint.

## Implementation Plan

- **Affected paths:** a new repository skill under `.agents/skills/`, authored data in `src/data/`,
  domain and rendering tests that cover added lists or assessments, and
  `docs/features/07-ai-assisted-guidance-list-curation.md`.
- **Pattern to follow:** The skill accepts a maintainer-supplied source URL, declared list purpose,
  and coverage intent. It may retrieve only that HTTPS URL and pages directly linked from it on the
  same official domain. It may edit the local working tree with new or updated typed static records
  and focused tests. It must preserve the `GuidanceList`/`FoodAssessment` model, authored citations,
  independent assessments, separate guidance scenarios, not-assessed fallback notices, and the data
  validator.
  It must identify every source locator, access date, source-version evidence, review date, and
  unresolved item in its final review summary.
- **Review boundary:** The skill must not commit, publish, deploy, silently omit uncertainty, use a
  source from another domain, perform a broad web search, or add a runtime fetch/scraper. It stops
  after validation and explicitly asks the maintainer to review the source evidence and working-tree
  diff. A human accepts or rejects the proposed content before it can be published.
- **Tests:** Run existing type checking, focused data/domain tests, and the required rendering and
  Chromium Playwright scenarios when a visible list or assessment changes. Content changes must
  retain the repository-wide coverage threshold and complete production build checks before release.

## Confirmation

- [ ] The curation skill accepts only an explicitly supplied HTTPS source URL and same-domain pages
  directly linked from that source.
- [ ] The skill produces only local working-tree draft changes and does not commit, publish, deploy,
  or mutate content at runtime.
- [ ] Every proposed list and assessment includes the required source evidence, citations, dates,
  coverage, and list-owned status data.
- [ ] The skill flags ambiguous, conditional, brand-specific, missing, or unsupported guidance for
  human resolution rather than inferring a favourable status.
- [ ] New content conforms to the existing shared catalogue and independent-assessment model.
- [ ] The skill runs the applicable existing validation and test commands and presents their results
  with the source evidence and diff for human review.
- [ ] A human approval is recorded in the review workflow before the content is committed or
  published.

## More Information

This proposal extends the editorial workflow in
[F-04: Maintain Trustworthy Guidance Content](<../features/04-maintain-trustworthy-guidance-content.md>)
and enables [F-07: Add AI-assisted guidance-list curation](<../features/07-ai-assisted-guidance-list-curation.md>).
If accepted, it supplements rather than supersedes the version-controlled static-content and
independent-guidance-list decisions.

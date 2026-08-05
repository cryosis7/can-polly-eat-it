# F-04: Maintain Trustworthy Guidance Content

**Status:** Done

**Depends on:** None

**Governing decisions:** [version-controlled static content](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), [unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), and [independent guidance lists](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>)

## Goal

Allow a maintainer to add and review food guidance safely through version-controlled data and
automated validation.

## Editorial workflow

1. Select an authoritative source and locate the exact section or table row.
2. Add or update the category and food record without changing unrelated IDs/slugs.
3. Declare each list's explicit coverage, source-version evidence, verification date, and review due
   date. Add a guidance-list assessment with a named status, concise summary, complete guidance
   scenarios, citation URL/locator/access date, and review date.
4. Run schema and relationship validation, then review the rendered card and detail page when
   applicable.
5. Obtain human review before publishing a material health-guidance change.

## Required behaviour

- Data validation rejects dangling references, category cycles, duplicate assessment pairs, invalid
  list statuses, malformed dates, invalid coverage, overdue reviews, and missing citations.
- Every published assessment is traceable to its source.
- Coverage resolution distinguishes an in-scope food that is "Not assessed" from one that is
  "Outside current coverage".
- Source text is manually reviewed and succinctly paraphrased; the product does not scrape or
  automatically infer guidance.
- Each guidance scenario retains its authoritative prose instruction and ordered supporting
  conditions. Alternative scenarios must remain separate.
- An assessment reason link targets an existing canonical food, has an authored statement such as
  "Contains gelatin", is supported by the assessed food's citation, and never substitutes for it.
- Uncertain in-scope items remain unassessed or use an explicit amber/review status as defined by
  the list.
- Content changes are reviewable in source control alongside their tests.

## Non-goals

- A CMS or in-app authoring workflow.
- Automated ingestion from PDFs or web pages.
- Treating a citation as proof without a human content review.
- Silently extending a list's coverage because a food appears in the catalogue.

## Assumptions and open questions

- Initial reviewed pregnancy content is intentionally small; scaling the content set remains an
  editorial activity governed by this workflow, not an automatic import.
- Material future changes should include rendering tests when they alter visible catalogue or detail
  outcomes.

## Acceptance criteria

- Invalid authored content fails validation with useful errors before it can be rendered.
- Every published assessment has a status, review date, and citation with a durable URL, exact
  locator, and access date.
- A reviewer can trace each published rule and source-version evidence to an authoritative source.

## Validation

Tests retain the repository-wide 100% global statements, branches, functions, and lines coverage
thresholds for application source. When content changes alter a user-visible catalogue or detail
outcome, add or update Chromium Playwright scenarios that prove the reviewed data renders with its
expected status and source link.

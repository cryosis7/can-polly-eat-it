# Feature 04: Maintain Trustworthy Guidance Content

## Goal

Allow a maintainer to add and review food guidance safely through version-controlled data and
automated validation.

## Editorial workflow

1. Select an authoritative source and locate the exact section or table row.
2. Add or update the category and food record without changing unrelated IDs/slugs.
3. Declare each list's explicit coverage, source-version evidence, verification date, and review due
   date. Add a guidance-list assessment with a named status, concise summary, complete guidance
   scenarios, citation URL/locator/access date, and review date.
4. Run schema and relationship validation, then review the rendered card and detail page.
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

## Initial source scope

Start with MPI's food-and-pregnancy guidance, including its safe-food table and clear conditional
examples. The user-provided pullout guide is a starting reference; use the current reviewed MPI URL
and locator in each published record.

## Not in this feature

- A CMS or in-app authoring workflow.
- Automated ingestion from PDFs or web pages.
- Treating a citation as proof without a human content review.
- Silently extending a list's coverage because a food appears in the catalogue.

## Test confidence

Tests for this feature must retain the repository-wide 100% global statements, branches, functions,
and lines coverage thresholds for application source.

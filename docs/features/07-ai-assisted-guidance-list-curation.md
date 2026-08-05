# F-07: Add AI-assisted guidance-list curation

**Status:** In progress

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>)

**Governing decisions:** [version-controlled static content](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>) and [AI-assisted local draft curation for official sources](<../decisions/2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>).

## Goal

As a guide maintainer, I need an AI-assisted workflow that turns a credible source I provide into
reviewable food-list content so that I can add independently maintained guidance lists efficiently
without losing provenance or editorial control.

## Primary experience

1. Provide the source URL and identify the guidance list and its intended coverage.
2. Ask the AI curation skill to examine the source and prepare a draft of list, food, assessment,
   citation, and test changes.
3. Review every proposed status, paraphrase, citation locator, coverage declaration, and source
   version before accepting any content change.
4. Run the existing content validation and relevant rendering tests before publishing the reviewed
   list.

## Required behaviour

- The workflow must preserve one shared food catalogue and create list-specific assessments rather
  than context-specific fields on foods.
- Every proposed assessment must retain the source URL, exact locator, access date, review date, and
  a concise human-reviewed paraphrase.
- The AI must flag ambiguous, brand-dependent, incomplete, or unsupported source material for human
  resolution instead of inferring a favourable outcome.
- The workflow must make additions and changes visible as ordinary version-controlled data and test
  changes.
- A new list must declare its own statuses, distinct grey fallback states, coverage, source-version
  evidence, verification date, review-due date, and citations.
- No proposed content may be published until a human has reviewed and approved it.

## Non-goals

- A runtime scraper, content API, CMS, or in-app authoring interface.
- Automatically publishing source-derived guidance without human review.
- Inferring a composite food's status from an ingredient or reason link.
- Replacing the existing manual curation workflow for small, one-off updates.

## Assumptions and open questions

- A repository skill, invoked when a maintainer supplies a credible source, is the expected delivery
  mechanism rather than a new application-screen feature.
- The accepted AI-assisted-capture ADR governs the workflow.
- The skill may prepare local draft data changes but must stop before a human approval, commit, or
  publication.

## Implementation plan

Implement according to [the F-07 implementation plan](<07-ai-assisted-guidance-list-curation-plan.md>).

## Acceptance criteria

- Given a credible source and a named new guidance list, a maintainer can use the skill to produce
  a reviewable draft that conforms to the existing content schemas and identifies every source
  locator needed for approval.
- The draft never treats absent, ambiguous, or brand-specific guidance as a safe or favourable
  assessment.
- A reviewer can trace every accepted list-level and food-level claim to the supplied source and
  see the corresponding version-controlled change and validation evidence.
- A new list created through the workflow renders through the existing shared catalogue model
  without adding a list-specific property to `Food`.

## Validation

Before the feature can be marked done, exercise the skill with representative official web guidance,
including conditional and ambiguous items. Verify its proposed changes with schema/content
validation, strict type checking, relevant unit and rendering tests, and the repository-wide
coverage, Chromium Playwright, and production-build checks required for user-visible list changes.

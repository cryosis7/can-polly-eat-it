# F-07: Add AI-assisted guidance-list curation

**Status:** Done

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
- The ready-for-review path was validated with a maintainer-supplied saved copy of MPI's official
  safe-food-in-pregnancy page. The source-backed run used the Dairy table, including explicit
  favourable, avoid, and conditional entries, and left the saved source bundle outside the committed
  product changes.

## Implementation plan

Implement according to [the F-07 implementation plan](<07-ai-assisted-guidance-list-curation-plan.md>).

## Acceptance criteria

- Given a credible source and a named new guidance list, a maintainer can use the skill to produce
  a reviewable draft that conforms to the existing content schemas and identifies every source
  locator needed for approval.
- The draft never treats absent, ambiguous, or brand-specific guidance as a safe or favourable
  assessment.
- A reviewer can trace every proposed list-level and food-level claim in the review packet to the
  supplied source and see the corresponding local draft change or explicit blocked/no-change
  decision with validation evidence.
- A new list created through the workflow renders through the existing shared catalogue model
  without adding a list-specific property to `Food`.

## Validation

- `python C:\Users\ScottDacre-Curtis\.agents\skills\skill-creator\scripts\quick_validate.py .agents\skills\ai-guidance-list-curation`
  passed for the repository skill structure.
- The skill evaluation file contains five scenarios covering unsupported perspective changes,
  missing required input, prohibited broad search/publication, source-backed Dairy drafting, and
  source-omission/brand ambiguity.
- Read-only source-backed exercise: the maintainer-supplied saved MPI page identified the official
  `List of safe food in pregnancy` source, its pregnancy purpose, and Dairy table locators. The
  evidence included hard cheese as favourable, low-acid soft pasteurised cheese as avoid-unless-cooked,
  and pasteurised cottage/cream cheese as conditional. The simulated review packet preserved the
  shared food catalogue, proposed list-specific assessment evidence only, and stopped before commit,
  publication, deployment, or approval.
- Read-only ambiguity exercise: a request to assign favourable assessments to every unmentioned
  cheese brand/product was blocked; no draft content was produced from source omission or brand
  ambiguity.
- No application or published content data changed as part of this feature, so schema/content,
  rendering, coverage, Playwright, and production-build gates are deferred to each future
  user-visible curation draft produced by the skill.

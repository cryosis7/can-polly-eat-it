# F-07 implementation plan: AI-assisted guidance-list curation

## Scope and constraints

Create a repository skill that turns a maintainer-provided credible source into a local,
review-ready draft of a new or extended guidance list. Follow the accepted
[AI-assisted local draft curation decision](<../decisions/2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>),
the static-content decision, and the independent-guidance-list decision.

The skill must not introduce a runtime fetcher, CMS, data API, browser authoring interface, automatic
commit, deployment, or publication. It must not perform a broad web search, follow off-domain links,
or convert uncertainty into a favourable assessment.

## Ordered delivery

1. Create `.agents/skills/ai-guidance-list-curation/SKILL.md` with a trigger description covering
   requests to add a guidance list or source-backed food guidance from a maintainer-provided source.
2. Require the skill to obtain a supplied HTTPS source URL, desired list purpose, and coverage intent
   before editing. It may inspect only the supplied page and pages directly linked from it on the
   same official domain.
3. Make the skill inspect existing `src/data/` records and domain schemas before drafting. It must
   preserve the shared `Food` catalogue and add list-specific `GuidanceList` and `FoodAssessment`
   records, rather than a list-specific food field or a duplicate catalogue.
4. Make the skill preserve source evidence for each proposed list and assessment: durable URL, exact
   locator, and an authored paraphrase. Require separate scenarios for alternatives and separate
   citations/statuses for every assessment.
5. Require the skill to flag inaccessible, conflicting, ambiguous, conditional, brand-dependent,
   incomplete, or unsupported material for maintainer resolution. It must use "Not assessed",
   "Outside current coverage", or an explicit list-owned review outcome when appropriate.
6. Require data, focused unit/rendering, and applicable Chromium Playwright test updates. The skill
   must run the narrowest existing commands that validate the draft, then the repository's required
   quality gates for a user-visible list change.
7. End each invocation with a review packet: pages consulted, records added/changed, evidence for
   every claim, unresolved items, commands/results, and an explicit statement that no commit,
   publication, or human approval has occurred.

## Validation

- Exercise the skill against an official source containing both an explicit food status and an
  ambiguous or conditional item.
- Confirm its draft satisfies the existing content schemas and validation tests.
- Confirm it neither adds a list-specific property to `Food` nor derives a food assessment from a
  reason link.
- Confirm its final response presents the required review packet and stops before committing or
  publishing.
- Run the skill's focused evaluation prompts before marking F-07 `In progress`.

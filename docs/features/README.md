# Feature Register

This directory is the source of truth for independently valuable product features. A feature brief
records the user outcome and its boundaries; it is not an ADR, a technical implementation plan, or a
backlog task.

## Lifecycle

Features move through `Idea`, `Proposed`, `Planned`, `In progress`, and `Done`. A feature may be
`Deferred` from any non-terminal state; resume it at `Proposed` when it is reconsidered.

- **Idea**: a captured opportunity that has not been shaped or prioritised.
- **Proposed**: the problem, desired outcome, scope, and non-goals are clear enough to discuss.
- **Planned**: dependencies are complete and an approved, feature-specific implementation plan
  exists.
- **In progress**: implementation has started against the approved plan.
- **Done**: the acceptance criteria and documented validation have been met, the pre-PR `prepare`
  review has completed, and any findings are resolved or recorded.
- **Deferred**: intentionally paused; the brief explains why and what must change to resume it.

A feature cannot move to `Planned` or `In progress` while one of its dependencies is not `Done`
unless its brief records an approved exception and rationale. Dependencies must use the stable
feature IDs below, must not reference the feature itself, and must not form a cycle.

## Index

| ID | Feature | Status | Depends on | Outcome |
| --- | --- | --- | --- | --- |
| F-01 | [Browse the food guide](<01-browse-food-guide.md>) | Done | None | Browse reviewed foods in their natural category hierarchy. |
| F-02 | [Search and filter foods](<02-search-and-filter-foods.md>) | Done | F-01 | Find a food or narrow the catalogue without losing shareable context. |
| F-03 | [Explain food guidance](<03-explain-food-guidance.md>) | Done | F-01 | Understand a food status, its conditions, and source. |
| F-04 | [Maintain trustworthy guidance content](<04-maintain-trustworthy-guidance-content.md>) | Done | None | Safely curate and validate reviewed pregnancy guidance data. |
| F-05 | [Add independent guidance lists](<05-add-independent-guidance-lists.md>) | Done | F-01, F-02, F-03, F-04 | Add vegetarian suitability and future lists to the same catalogue. |
| F-06 | [Improve the mobile-first accessible guide experience](<06-improve-mobile-first-accessible-guide-experience.md>) | Done | F-01, F-02 | Browse and refine food guidance confidently on phone or desktop. |
| F-07 | [Add AI-assisted guidance-list curation](<07-ai-assisted-guidance-list-curation.md>) | Done | F-04 | Turn a maintainer-provided credible source into reviewable new guidance-list content. |
| F-08 | [Rework guidance-scope filtering](<08-rework-guidance-scope-filtering.md>) | Done | F-05 | Narrow one catalogue by selected dietary scopes and generic outcomes. |
| F-09 | [Assess and browse food categories](<09-assess-and-browse-food-categories.md>) | Done | F-04, F-05, F-08, F-10 | Apply a source's group-level guidance to every food in that group, and browse the group itself. |
| F-10 | [Vary citation expectations by guidance list](<10-vary-citation-expectations-by-list.md>) | Done | F-04, F-05 | Let each guidance list set its own source expectation instead of one global citation rule. |
| F-11 | [Make the browse hierarchy legible and collapsible](<11-make-browse-hierarchy-legible.md>) | Done | F-01, F-09 | See every entry under the group it belongs to, and collapse the groups you do not need. |
| F-12 | [Lift group-level guidance onto categories](<12-lift-group-guidance-onto-categories.md>) | Done | F-04, F-09, F-11 | Show a group-wide rule once against its group instead of repeating it on near-identical entries. |
| F-13 | [Surface raw-egg foods where people browse for them](<13-surface-raw-egg-foods.md>) | Done | F-04, F-12 | Find raw-egg sauces, desserts, and drinks in the categories you browse, not only under eggs. |
| F-14 | [Retire the animal-derived ingredients category](<14-retire-animal-derived-foods-category.md>) | Proposed | F-04, F-12, F-13, F-15 | Find every food under what it is, not under why it was assessed. |
| F-15 | [Retire the outside-coverage state](<15-retire-outside-coverage-state.md>) | Done | F-08, F-12, F-13 | Get one plain answer when a guide has nothing to say about a food. |
| F-16 | [Express guidance that accumulates across subject levels](<16-express-accumulating-guidance.md>) | Done | F-04, F-09 | See every instruction a source gives about a food, not only its most specific one. |

## Maintaining this register

1. Read the accepted ADRs, architecture overview, this register, related feature briefs, and the
   high-level implementation roadmap before creating or changing a feature.
2. Add or update the feature brief and its row in this index in the same change.
3. Keep the index summary to one outcome-focused sentence. Put rationale, scope, acceptance
   criteria, dependencies, and delivery detail in the feature brief.
4. Link a dependency by ID and relative Markdown link in the dependent feature's `Depends on`
   section. Update its status when the prerequisite changes.
5. Create a technical implementation plan only after a feature is `Planned`; link it from the brief
   and keep implementation tasks outside this register.
6. Include a pre-PR verification task in each feature-specific implementation plan that instructs a
   subagent to run the `prepare` skill after implementation and targeted validation. Record the
   result or the resolution of any findings before moving the feature to `Done`.

Every application or content change must retain the repository-wide 100% global statements,
branches, functions, and lines coverage threshold for application source. Implemented user-facing
features must also include focused Chromium Playwright scenarios for their primary experience and
relevant direct URLs.


# Feature Register

This register describes the durable user and maintainer capabilities the product provides now. It is
not a chronological delivery log. An implementation change belongs in an existing feature brief
when it strengthens the same outcome; create a new feature only for a new independently valuable
outcome.

## Lifecycle

Features move through `Idea`, `Proposed`, `Planned`, `In progress`, and `Done`. A feature may be
`Deferred` from any non-terminal state; resume it at `Proposed` when it is reconsidered.

- **Idea**: a captured opportunity that has not been shaped or prioritised.
- **Proposed**: the problem, desired outcome, scope, and non-goals are clear enough to discuss.
- **Planned**: dependencies are complete and an approved, feature-specific implementation plan
  exists.
- **In progress**: implementation has started against the approved plan.
- **Done**: the acceptance criteria and documented validation have been met, the `prepare`
  review has completed, and any findings are resolved or recorded.
- **Deferred**: intentionally paused; the brief explains why and what must change to resume it.

A feature cannot move to `Planned` or `In progress` while one of its dependencies is not `Done`
unless its brief records an approved exception and rationale. Dependencies must use the stable
feature IDs below, must not reference the feature itself, and must not form a cycle.

## Index

| ID | Feature | Status | Depends on | Outcome |
| --- | --- | --- | --- | --- |
| F-01 | [Browse the food guide](<01-browse-food-guide.md>) | Done | None | Browse reviewed guide entries in their natural hierarchy and preparation context. |
| F-02 | [Find, filter, and share guide entries](<02-find-filter-and-share-guide-entries.md>) | Done | F-01 | Reach a relevant subset quickly and reproduce it from its URL. |
| F-03 | [Understand reviewed guidance](<03-understand-reviewed-guidance.md>) | Done | F-01 | Understand what each reviewed authority says, why it applies, and where it came from. |
| F-04 | [Maintain trustworthy guidance content](<04-maintain-trustworthy-guidance-content.md>) | Done | None | Curate, validate, and review catalogue and guidance changes before publication. |

## Maintaining this register

1. Read the accepted ADRs, architecture overview, this register, and related feature briefs before
   creating or changing a feature.
2. Add or update the feature brief and its row in this index in the same change.
3. Keep the index summary to one outcome-focused sentence. Put rationale, scope, acceptance
   criteria, dependencies, and delivery detail in the feature brief.
4. Link a dependency by ID and relative Markdown link in the dependent feature's `Depends on`
   section. Update its status when the prerequisite changes.
5. Create a technical implementation plan only after a feature is `Planned`; keep implementation
   tasks outside this register and remove obsolete plans once the delivered capability is documented
   by its current-state brief.
6. Include a verification task in each feature-specific implementation plan, to run before merging
   into `main`, that instructs a subagent to run the `prepare` skill after implementation and
   targeted validation. Record the result or the resolution of any findings before moving the
   feature to `Done`.

Every application or content change must retain the repository-wide 100% global statements,
branches, functions, and lines coverage threshold for application source. User-facing changes must
also retain focused Chromium Playwright scenarios for their primary experience and relevant direct
URLs.

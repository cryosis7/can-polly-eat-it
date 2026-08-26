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
  not follow another link depth or any off-domain link.
- Do not infer an assessment from a food name, category, ingredient, reason link, common knowledge,
  or a source's omission. Do not turn ambiguity into a favourable result.
- Paraphrase source material concisely; do not copy substantive source prose into the application.
- Stop and ask the maintainer for guidance when the source is inaccessible, ambiguous, incomplete,
  brand-specific, or unsupported, or when it does not establish the requested list's authority. A
  source that disagrees with another already in the list is not a reason to stop: author it as its
  own attributed assessment.

## Required input

Before editing, establish all of the following:

1. The supplied HTTPS source URL
2. The list title and purpose, or the existing list being extended.
3. For a new list: its status vocabulary, its `citationPolicy`, and, when that policy is
   `optional`, its `evidentiaryBasis`.
4. The intended scope of the draft: all catalogue foods, or named categories and/or foods.

A list owns its own status labels, but the vocabulary is not free-form. Every status maps to exactly
one generic outcome band (`okay`, `maybe`, `not-okay`, `not-assessed`), and each list must own one
grey `not-assessed` status, referenced by `unassessedStatusId`, with an authored `unassessedNotice`.
A new list therefore proposes list-specific wording for the existing bands; it never proposes a new
band. Confirm the band mapping with the maintainer before drafting.

Ask one focused question at a time for any missing input. A credible URL alone is not proof that it
supports the requested perspective; for example, pregnancy guidance cannot establish vegetarian
suitability unless it explicitly does so.

Do not retrieve the source or attempt a draft until the required input is complete. In an initial
response with missing input, ask for the first missing item rather than claiming that the source is
inaccessible or that you cannot fetch it. When a source cannot support the requested list, state
that no content was drafted, committed, or published, then ask for a source that explicitly supports
the requested perspective.

## Drafting workflow

1. Retrieve the supplied page, record its URL and the link that led to it.
2. Build an evidence table before writing data. For each proposed list and food assessment, record:
   - source URL and exact locator;
   - the source-supported status, its generic outcome band, and a concise paraphrase;
   - conditions or alternative scenarios;
   - uncertainties requiring maintainer review.
3. Check whether each named food item already exists in `src/data/foods.ts`. Reuse the canonical food
   record where possible. Add a food or category only when the source does not have a suitable place to slot the new item.
4. Create or update `GuidanceList` data with list-owned statuses mapped to generic outcome bands.
5. Author one `Assessment` per `(subject, preparationId, guidanceListId)`, where the subject is exactly
   one food or one category. A category assessment requires an authored `scopeStatement`; a food
   assessment must not have one. Attach a citation with a durable HTTPS URL and exact locator whenever
   the list's `citationPolicy` is `required`. Never merge statuses, summaries, scenarios, conditions, or
   citations across subject levels, across preparation states, or across guidance lists.
5a. Where the source's advice depends on how a food is prepared, qualify the assessment with a
   `preparationId` rather than creating a preparation-shaped category. "Raw fish" is the `fish`
   category assessed for the `raw` preparation, not a category of its own.
6. When adding a food beneath a category that is already assessed, confirm the inherited outcome is
   correct for that specific food. If it is not, author a food-level assessment and choose its
   `relation` deliberately: the default `replaces` supersedes the ancestor's guidance entirely, while
   `adds-to` keeps the nearest assessment's status and displays the inherited guidance as a separate,
   fully attributed layer.
7. Use a reason link only when the source supports the assessed food's own conclusion and its target
   is an existing canonical food. A reason link never supplies a status or citation by itself.
8. Prefer the smallest set of records that expresses the source faithfully:
   - A `(subject, preparationId, guidanceListId, sourceId)` tuple may only be assessed once. When the
     *same* source
     repeats advice already assessed for that subject and list, cite the additional locator on the
     existing assessment instead of authoring a second one, and surface any wording change for
     maintainer review rather than silently rewriting reviewed guidance.
   - When a *different* source in the same list also assesses that subject, author its advice as its
     own assessment naming that source. Never attach one authority's locator to another authority's
     sentence. Where the sources reach different statuses, that disagreement is authored and
     displayed, not resolved by you and not a reason to halt.
   - In a list declaring two or more sources, every assessment must name its `sourceId`. In a
     single-source or no-source list, author no `sourceId` at all; the list supplies the attribution.
   - When several sibling foods share genuinely identical advice, propose one category assessment
     with a `scopeStatement` rather than repeating per-food assessments.
   - Merge only where the source treats the items identically. Differing conditions, scenarios, or
     strength of wording are distinct advice: keep them as separate records and let the maintainer
     decide.
   - Never merge across guidance lists, and never reuse one food record for two foods the source
     distinguishes.
9. Update focused domain, rendering, and browser tests when the draft adds a visible list or changes
   an assessment outcome. Run the narrowest relevant existing checks first, then the repository's
   coverage, end-to-end, and build commands for user-visible content. Report each command and its
   outcome; surface a failure rather than treating the draft as validated.

## Declaring preparation states

A food declares the preparation states it is eaten in. This is a **separate judgement from the
assessment**, and it answers one question only:

> Do people in New Zealand eat this food in this state, commercially or home-prepared?

- It is never a risk judgement. Whether a state is safe is the assessment's job, and a state being
  risky is never a reason to leave it undeclared.
- **Find evidence of what people do; never reason about what they should do.** In practice every
  wrong declaration came from culinary theory — flesh type, oiliness, "that species isn't smoked" —
  and every evidence-led finding survived. Live retail product listings, fishmonger and supermarket
  catalogues, and government consumption studies settle it; plausibility does not.
- Everyday community practice counts, including the practice of a particular community. A single
  fine-dining menu item does not.
- A missing citation is not counter-evidence. Where a state rests on judgement, declare it, and
  record the evidence gap for the maintainer.
- Prefer the recoverable direction: an undeclared state still shows the reader the group's authored
  rule, whereas a wrongly declared one presents group advice as advice about that food.
- Authored source content in this repository outranks secondary web evidence. If our own cited
  guidance already gives serving advice for a food, that settles whether it is eaten.

Two tests must pass before you declare a state:

1. **Evidence test** — can you point to a source showing people eat it that way here?
2. **Everyday test** — is it ordinary practice for some community, rather than a novelty?

## Retrieving the source

Getting the bytes is not the easy part of this workflow. Two failures have both happened in
practice, and both are silent unless you look for them.

- **The live page may not be fetchable.** Government health sites time out or block agent fetches.
  An archived snapshot *of the maintainer-supplied URL* (for example the Wayback Machine) is an
  acceptable retrieval path for the same document — it is not a different source. But
  "inaccessible" is one of the stop-and-ask triggers above, so treat the fallback as a disclosure,
  not a silent workaround: tell the maintainer you are using it, and record the snapshot URL and its
  timestamp in the review packet alongside the canonical citation URL. Cite the canonical URL in the
  data; the snapshot is evidence of retrieval, not the address readers should be sent to. It is
  never a licence to substitute a *different* page, domain, or source.
- **Markdown conversion silently destroys table structure.** These sources present their advice as
  a table where merged header cells (`rowspan`/`colspan`) carry the meaning. Converting to markdown
  flattens those groups, so rows detach from the heading that governs them and a locator built from
  the flattened view can attribute advice to the wrong food group. Where a source's meaning depends
  on which row sits under which group header, fetch the **raw HTML** and read the table markup
  directly.

  Worked example: the NSW Food Authority pregnancy table renders `Poultry` as one `rowspan="3"`
  header spanning "Cold chicken or turkey", "Hot take-away chicken" and "Home cooked" — three rows
  with three *different* statuses. The markdown rendering dropped the `Poultry` cell entirely, so
  the three rows appeared as unparented siblings. Recovering the real grouping is what let the
  locators read `Other foods: Soy` rather than a guess at which section a row belonged to.

## What validation will actually touch

Step 9 says to update focused tests. In practice a content-only addition changes **more test files
than data files**, because the guide holds deliberate tripwires against silent content drift. Budget
for these rather than being surprised by them:

- **Fixed content totals.** `src/domain/contentValidation.test.ts` asserts exact category, food and
  assessment counts. They exist so content cannot change unnoticed, so updating them is expected —
  but confirm the new numbers are the ones you intended before you change them, since that
  assertion is the tripwire doing its job.
- **Alias and search collisions.** A new food whose name or alias contains a term an existing test
  searches for will change that test's result count. This is the least obvious failure, because the
  failing test names a food you never touched.

  Worked example: adding `soy-yoghurt` with the alias `soy yogurt` broke one unit test and one e2e
  test that searched `yogurt` and asserted exactly `1 result in the guide`. Nothing about yoghurt
  changed; those tests had been silently relying on there being only one `yogurt`-matching entry in
  the whole catalogue. The fix is to assert the new, correct count and name the newly-matching entry
  explicitly, so the next collision fails loudly rather than drifting.

Run the narrowest relevant checks first, then the repository's coverage, e2e and build commands.
Report each command and its outcome; surface a failure rather than treating the draft as validated.

## Review gate

After drafting and validation, stop. Do not commit or publish the changes. Present the maintainer with a 
summary of the proposed changes, the evidence table, and any items needing a decision. Ask for explicit approval before committing or publishing.

## Required final response

End every invocation with this review packet:

```markdown
## Curation review packet

### Draft status
- Ready for maintainer review, or
- Blocked — explain why no draft was produced

### Sources consulted
- [URL] — exact locator(s) used
- Retrieval path — direct fetch, or the archived snapshot URL and timestamp used and why

### Claim-by-claim evidence
| Record | Proposed status | Outcome band | Source URL and exact locator | Paraphrase or condition | Inherited advice |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... |

### Proposed content changes
- Lists:
- Foods/categories:
- Preparation declarations (with the evidence for each):
- Assessments:

### Items needing a maintainer decision
- ...

### Validation
- Command — result

### Approval boundary
No commit, publication, deployment, or human approval has occurred. Please review the source
evidence and working-tree diff before accepting this draft.
```

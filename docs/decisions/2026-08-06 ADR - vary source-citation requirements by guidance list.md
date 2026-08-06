# 2026-08-06 ADR: Vary Source-Citation Requirements by Guidance List

**Status:** Accepted
**Date:** 2026-08-06
**Deciders:** Project owner (requester)

## Context and Problem Statement

Every assessment and every coverage declaration must currently carry at least one citation with a
title, durable HTTPS URL, and exact locator. That rule was written for pregnancy food safety, where
the guide's entire value is that a claim can be traced back to New Zealand Food Safety.

It fits the vegetarian list badly. "Animal rennet is not vegetarian" is definitional, not a
risk judgement, and a maintainer should not need to produce a URL to record it. The rule has already
distorted the content: `vegetarian-suitability` declares its coverage as "only foods explicitly named
in the reviewed Veggy Malta article", so the list can only ever describe the fifteen foods that one
article happened to mention. A rule such as "hard cheese may be set with animal rennet, so check the
label" cannot be authored at all, even though it is common knowledge and more useful than any of the
fifteen.

Should the citation requirement be a property of the whole application, or of each guidance list?

## Considered Options

- Make citation requirements a per-list policy.
- Keep citations mandatory everywhere.
- Drop the citation requirement everywhere.
- Require citations per generic outcome band, for example only for `okay` outcomes.

## Decision Outcome

Chosen option: "make citation requirements a per-list policy", because the evidentiary standard is a
property of the perspective a list represents, not of the application. A `GuidanceList` declares
`citationPolicy: 'required' | 'optional'`. Pregnancy food safety stays `required` and is unchanged in
every respect. Vegetarian suitability becomes `optional`.

Under an `optional` policy, an assessment may omit citations entirely, and no per-assessment "no
source attached" marker is rendered: the absence of a source is the list's normal condition, so
marking every card would be noise rather than disclosure. Instead, an `optional` list must state its
evidentiary basis in its own description, and that statement is shown wherever the list's guidance is
presented. Citations remain first-class when they exist and always render.

### Consequences

- Good, because the vegetarian list can record what a reasonable person already knows, so its
  usefulness stops being capped by one article's table of contents.
- Good, because pregnancy guidance keeps its full citation discipline, which is where traceability
  actually protects the reader.
- Good, because the evidentiary standard is declared once per list and displayed, instead of being
  implied by the presence or absence of a link on each card.
- Good, because it unblocks the group-level vegetarian rule that motivated category assessments.
- Bad, because two lists now behave differently, so validation, rendering, and authoring guidance
  must all be policy-aware and tested in both modes.
- Bad, because uncited claims cannot be re-verified from the record; the mitigation is that a list
  choosing `optional` is asserting that its claims are checkable by general knowledge.
- Bad, because it weakens a blanket invariant that was easy to reason about, so the ADR must be
  explicit that `optional` is a deliberate per-list choice and never a default.

## Decision Drivers

- Pregnancy food safety is risk advice; vegetarian suitability is largely definitional. One rule
  cannot serve both without either bureaucracy or unsafety.
- The mandatory-citation rule is already producing content distortion, not just friction.
- Disclosure should be honest but proportionate: a reader should know a list's evidentiary standard
  without every card repeating a negative.
- Machine-generated content must never benefit from the relaxation, because an uncited AI-drafted
  claim is fabrication rather than maintainer knowledge.
- The application is unreleased, so schema and data can change without migration.

## Pros and Cons of the Options

### Per-list citation policy

- Good, because it matches the existing design, in which a list already owns its statuses, coverage,
  labels, and fallbacks.
- Good, because adding a future list is a data change that also declares its own evidentiary
  standard.
- Bad, because validation branches on policy, so both branches need coverage.

### Keep citations mandatory everywhere

- Good, because the invariant is simple and uniformly enforced.
- Bad, because it caps the vegetarian list at whichever foods a citable article listed, which is the
  problem that prompted this decision.
- Bad, because it encourages the worse workaround of citing a weak source to satisfy a validator.

### Drop the citation requirement everywhere

- Good, because authoring is frictionless.
- Bad, because it removes the traceability that justifies the pregnancy guide's existence, and
  contradicts the accepted static-content and AI-curation ADRs without cause.

### Require citations per outcome band

- Good, because it targets the asymmetry that an uncited `okay` is an assurance while an uncited
  `maybe` is a caution.
- Bad, because it splits one list's content into two evidentiary standards, which is harder to
  explain to a reader than a single per-list statement.
- Bad, because for the vegetarian list the `okay` entries are precisely the counter-intuitive
  "actually this one is fine" claims, so the rule would bite hardest exactly where the maintainer's
  own knowledge is most likely to be the real source.

## Implementation Plan

- **Affected paths:** `src/domain/schemas.ts`, `src/domain/contentValidation.ts`,
  `src/data/guidanceLists.ts`, `src/data/assessments.ts`, `src/features/catalogue/`,
  `src/features/food-detail/`, `.agents/skills/ai-guidance-list-curation/SKILL.md`,
  `docs/architecture/overview.md`, `.github/copilot-instructions.md`, and the corresponding tests.

- **Pattern to follow:** Add `citationPolicy: z.enum(['required', 'optional'])` to
  `guidanceListSchema`. It has no default; every list states its policy explicitly. Relax
  `citations` on the assessment and coverage schemas from `.min(1)` to a possibly empty array, and
  enforce the minimum in `contentValidation.ts` for lists whose policy is `required`. A citation, when
  present, keeps its existing shape: title, durable HTTPS URL, and exact locator. Set
  `pregnancy-food-safety` to `required` and `vegetarian-suitability` to `optional`.

- **Evidentiary basis:** A list with `citationPolicy: 'optional'` must carry an
  `evidentiaryBasis` statement, for example "Reflects general vegetarian knowledge; sources are
  attached where a useful one exists." Validation requires it for `optional` lists and rejects it on
  `required` lists, whose citations already carry that meaning. Render it wherever that list's
  guidance is presented, at least once per view rather than once per card.

- **Rendering:** Do not render a per-assessment "no source attached" marker. Render the citation
  affordance only when a citation exists; the current catalogue fallback to
  `guidanceList.coverage.citations[0]` must therefore become conditional rather than an index into a
  possibly empty array. Keep list-specific labels, non-colour status signals, and the
  medical-information disclaimer exactly as they are.

- **AI curation:** The `ai-guidance-list-curation` skill must continue to require a citation for
  every record it drafts, whatever the target list's policy, because it works from a
  maintainer-supplied source. `optional` exists for a human recording their own knowledge, not for
  relaxing generated output.

- **Tests:** Assert that a `required` list still fails validation when an assessment or coverage
  omits a citation; that an `optional` list parses with no citations and renders no citation
  affordance; that a citation present on an `optional` list still renders with its locator; that an
  `optional` list without an `evidentiaryBasis`, and a `required` list with one, both fail
  validation; and that the catalogue no longer assumes a coverage citation exists. `npm test` must
  keep the 100% coverage gate green.

## Confirmation

- [ ] Every guidance list declares `citationPolicy` explicitly, with no schema default.
- [ ] `pregnancy-food-safety` is `required` and every one of its assessments still carries a title,
      HTTPS URL, and locator.
- [ ] Validation fails when a `required` list has an assessment or coverage declaration without a
      citation.
- [ ] An assessment on an `optional` list validates and renders with no citations and no "no source
      attached" marker.
- [ ] A citation authored on an `optional` list still renders with its title, link, and locator.
- [ ] An `optional` list declares an `evidentiaryBasis` that is displayed wherever its guidance
      appears; a `required` list declares none.
- [ ] No rendering path indexes into a citation array without checking that it is non-empty.
- [ ] The `ai-guidance-list-curation` skill still refuses to draft an uncited record for any list.
- [ ] `docs/architecture/overview.md` and `.github/copilot-instructions.md` describe citation
      requirements as list-owned rather than global.

## More Information

This decision amends
[2026-08-04 ADR: store reviewed guide content as version-controlled static data](<2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>).
That ADR's requirement that every assessment carry "at least one citation containing title, HTTPS
URL, locator" and that "validation fails for a missing citation" now applies to lists whose
`citationPolicy` is `required`. Everything else in it stands: static version-controlled content, Zod
validation, reference integrity, manual review, and no scraping.

It also amends design principle 1 and the trust section of
[`docs/architecture/overview.md`](../architecture/overview.md), where "each displayed assessment must
be explicitly reviewed and cited" becomes "explicitly reviewed, and cited according to its guidance
list's citation policy". Manual review remains mandatory for every list; only the citation
requirement varies.

It preserves
[2026-08-05 ADR: adopt AI-assisted local draft curation for official sources](<2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>)
unchanged: AI-assisted drafts remain fully cited and human-reviewed.

It unblocks the vegetarian group-level content in
[F-09: Assess and Browse Food Categories](<../features/09-assess-and-browse-food-categories.md>) and
should be delivered before F-09's vegetarian migration so that content lands in one pass.

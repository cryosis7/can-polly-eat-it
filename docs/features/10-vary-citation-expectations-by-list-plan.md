# F-10 Implementation Plan: Vary Citation Expectations by Guidance List

**Status:** Approved, complete

**Feature:** [F-10: Vary Citation Expectations by Guidance List](<10-vary-citation-expectations-by-list.md>)

**Governing decision:** [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>)

## Constraints

- Pregnancy food safety keeps every existing citation, locator, and rendered source link. Its only
  data change in this feature is declaring `citationPolicy: 'required'`, which the schema now
  requires explicitly of every list.
- The citation policy is declared per list with no schema default, so adding a list is a deliberate
  evidentiary choice.
- Minimum-citation enforcement moves from the Zod schemas into `contentValidation.ts`, because the
  rule now depends on the owning list. Production builds must still throw at module load on a
  violation.
- `src/domain/` stays free of React, router, and browser imports.
- No new dependencies, no change to statuses, outcome bands, coverage semantics, the `v=1` URL
  contract, or the medical-information disclaimer.
- The repository-wide 100% statements, branches, functions, and lines coverage threshold must hold.

## Delivery tasks

1. **Schema.** In `src/domain/schemas.ts`, add `citationPolicy: z.enum(['required', 'optional'])` and
   an optional `evidentiaryBasis` string to `guidanceListSchema`. Relax `citations` on
   `foodAssessmentSchema` and `coverageDeclarationSchema` from `.min(1)` to a plain array so the
   policy check can own the rule.

2. **Validation.** In `src/domain/contentValidation.ts`:
   - in `validateGuidanceLists`, fail when a `required` list's coverage has no citation, when an
     `optional` list has no `evidentiaryBasis`, and when a `required` list declares one;
   - in `validateAssessments`, fail when an assessment belonging to a `required` list has no
     citation.
   Keep every existing invariant, including status ownership, fallback distinctness, coverage
   reference integrity, and reason-link rules.

3. **Data.** In `src/data/guidanceLists.ts`, set `pregnancy-food-safety` to `required` and
   `vegetarian-suitability` to `optional`, and give the vegetarian list an `evidentiaryBasis` such as
   "Reflects general vegetarian knowledge; sources are attached where a useful one exists." Leave
   both lists' existing citations and coverage in place; rewording the vegetarian coverage
   description belongs to F-09.

4. **Catalogue rendering.** In `src/features/catalogue/CataloguePage.tsx`, replace the unchecked
   `resolved.assessment?.citations[0] ?? guidanceList.coverage.citations[0]` lookup with a
   nullable-safe resolution that renders the "Primary source" link only when a citation exists.
   Render the list's `evidentiaryBasis` once per view for each selected scope that declares one,
   never per card.

5. **Detail rendering.** In `src/features/food-detail/FoodDetailPage.tsx`, render the "Sources"
   section only when the resolved citation list is non-empty, so an uncited assessment does not
   produce an empty heading and list. Show the list's `evidentiaryBasis` in its guidance section
   instead.

6. **Curation skill.** In `.agents/skills/ai-guidance-list-curation/SKILL.md`, state explicitly that
   a drafted record always carries a citation regardless of the target list's `citationPolicy`,
   because the skill works from a maintainer-supplied source.

7. **Documentation.** Update the trust section and design principle 1 in
   `docs/architecture/overview.md`, its `GuidanceList` and `CoverageDeclaration` type blocks, and the
   citation bullet in `.github/copilot-instructions.md`, so citation requirements are described as
   list-owned rather than global. Manual review stays mandatory for every list.

## Tests

- `src/domain/contentValidation.test.ts`: a `required` list rejects an uncited assessment and uncited
  coverage; an `optional` list accepts both; an `optional` list without `evidentiaryBasis` fails; a
  `required` list with `evidentiaryBasis` fails; a citation authored on an `optional` list still
  parses and retains its locator.
- `src/features/catalogue/CataloguePage.test.tsx`: a cited scope renders its primary-source link; an
  uncited scope renders no source affordance and no empty link; the evidentiary basis appears once
  rather than per card.
- `src/features/food-detail/FoodDetailPage.test.tsx`: the Sources section is absent for an uncited
  assessment, present with title and locator for a cited one, and the evidentiary basis renders for
  an optional-policy list.
- `e2e/catalogue.spec.ts`: a pregnancy source link renders correctly on a filtered URL, alongside the
  vegetarian list's evidentiary basis (implemented in place of an uncited vegetarian entry, since
  every currently authored vegetarian assessment remains cited; see the deviation recorded in F-10's
  `Validation` section).

## Validation

- `npm test -- src/domain/contentValidation.test.ts` for the fastest feedback on the validation
  change, then the targeted component suites.
- `npm run test:coverage`
- `npm run test:e2e -- e2e/catalogue.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Pre-PR verification

After implementation and the targeted validation above, instruct a subagent to run the `prepare`
skill against this branch. It checks dependency versions, documentation the change has made untrue,
and undocumented new architecture, independently of the implementer. Record its result, or the
resolution of each finding, in F-10's `Validation` section before opening the pull request and before
moving the feature to `Done`.

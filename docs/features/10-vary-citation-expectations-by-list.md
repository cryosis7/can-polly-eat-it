# F-10: Vary Citation Expectations by Guidance List

**Status:** Done

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-05: Add Independent Guidance Lists](<05-add-independent-guidance-lists.md>)

**Governing decisions:** [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [adopt AI-assisted local draft curation for official sources](<../decisions/2026-08-05 ADR - adopt AI-assisted local draft curation for official sources.md>)

## Goal

As the guide's maintainer, I need each guidance list to set its own expectation about sources, so
that pregnancy advice stays fully traceable while I can record a plainly factual vegetarian
judgement such as "hard cheese may be set with animal rennet" without hunting for an article that
happens to say it.

## Primary experience

1. Read pregnancy guidance and reach its exact source location from every assessment, exactly as
   today.
2. Read vegetarian guidance and see, once in the view, what the list is based on: general vegetarian
   knowledge, with sources attached where a useful one exists.
3. Read a vegetarian assessment that does have a source and follow that link as normal.
4. Read a vegetarian assessment that has none without being shown an empty source affordance or a
   "no source" label on every card.

## Required behaviour

- Every guidance list explicitly declares whether citations are required or optional; there is no
  implicit default.
- Pregnancy food safety remains a citation-required list, with no change to any of its assessments,
  coverage, or source links.
- A citation-optional list may hold assessments with no citation, and content validation accepts
  them.
- A citation-optional list states its evidentiary basis, and that statement is shown wherever the
  list's guidance is presented.
- A citation-required list continues to fail validation when any assessment or coverage declaration
  omits a citation.
- A citation, wherever one exists, still renders with its title, durable link, and exact locator.
- No view assumes a citation exists.
- Guidance drafted by the AI curation skill still carries a citation for every record, whatever the
  target list's policy.

## Non-goals

- Relaxing citation requirements for pregnancy food safety, or for any future risk-advice list.
- Requiring or relaxing citations per outcome band, per status, or per food.
- Rendering a per-assessment "no source attached" marker; the list's evidentiary basis carries that
  disclosure.
- Removing manual review, which stays mandatory for every list regardless of policy.
- Changing statuses, outcome bands, coverage semantics, or the medical-information disclaimer.
- Broadening the vegetarian list's actual content, which is F-09's concern.

## Implementation plan

[F-10 Implementation Plan](<10-vary-citation-expectations-by-list-plan.md>), approved and complete.

## Assumptions and open questions

- The vegetarian list's coverage description, currently "only foods explicitly named in the reviewed
  Veggy Malta article are covered", will need rewording once its content is no longer bounded by that
  article. The wording itself is a content decision for whoever performs the F-09 migration.
- Open question: whether any future list will want a third policy, such as "cited where the claim is
  contested". Nothing needs it now, so the enum stays at two values.

## Acceptance criteria

- Pregnancy assessments and coverage still fail validation if a citation is missing, and all existing
  pregnancy source links still render.
- A vegetarian assessment with no citation passes validation, renders its status, label, and summary,
  and shows no source affordance.
- A vegetarian assessment that does carry a citation renders it with its title, link, and locator.
- The vegetarian list's evidentiary basis is visible to a reader of its guidance without being
  repeated on every card.
- Validation fails when a citation-optional list omits its evidentiary basis, and when a
  citation-required list declares one.
- The AI curation skill refuses to produce an uncited record for any list.

## Validation

- Domain unit tests for both policies across assessments and coverage, the evidentiary-basis rules,
  and the removal of any unchecked index into a citation array — added to
  `src/domain/contentValidation.test.ts` (`enforces citation policy per guidance list`) and the
  updated fixture-acceptance assertions. Result: pass (`npm test -- src/domain/contentValidation.test.ts`,
  11/11 tests).
- React Testing Library tests for a cited assessment, an uncited assessment, and the displayed
  evidentiary basis — added to `src/features/catalogue/CataloguePage.test.tsx` and
  `src/features/food-detail/FoodDetailPage.test.tsx` using a synthetic uncited vegetarian assessment,
  since deliberately not altering any existing citation (see the deviation note below). Result: pass.
- Chromium Playwright coverage: `e2e/catalogue.spec.ts` gained
  `shows a cited pregnancy source and the vegetarian evidentiary basis on a filtered URL`, confirming
  the pregnancy citation link and the vegetarian list's evidentiary-basis statement both render on a
  combined-scope filtered URL. Result: pass (14/14 e2e tests).
  - **Deviation from the plan's wording:** the plan asked for "a pregnancy source link and an uncited
    vegetarian entry" in this e2e scenario. Every currently authored vegetarian assessment is cited to
    the Veggy Malta article, and the plan's own constraint says to "leave both lists' existing
    citations and coverage in place" and not broaden vegetarian content (that is F-09's concern).
    Fabricating a new uncited food entry in real content would have broadened that content and is a
    maintainer/editorial decision this implementation task should not make unilaterally. The uncited
    rendering path (no source affordance, status/summary still shown) is instead fully covered by the
    RTL tests above using synthetic content, consistent with how other edge cases not present in real
    content (for example an added guidance-list scope) are already tested in this codebase. The e2e
    scenario instead verifies the real, currently-true evidentiary-basis disclosure in a browser.
- `npm run test:coverage`: 47/47 tests pass, 100% statements/branches/functions/lines retained across
  all application source.
- `npm run lint`: no errors.
- `npm run typecheck`: no errors.
- `npm run build`: succeeds.
- `npm run test:e2e`: all 14 Chromium scenarios pass.
- **Pre-PR `prepare` skill:** the `prepare` skill failed to load when invoked directly and via a
  background subagent (`Failed to read skill file "prepare"`), so a background subagent first
  performed an independent manual-equivalent review; those findings were fixed as described below.
  The `prepare` skill subsequently became available (as a tagged file) and was run properly: no
  dependency-bearing file changed in this diff, so the dependency-versions check was dropped;
  doc-drift and missing-docs checks ran as parallel subagents against the full pending diff (base
  `5bd75ee`, 13 files, no untracked files, nothing yet committed). Findings and resolutions, in the
  order they were caught:
  1. (Manual pre-pass) `CataloguePage.tsx` computed `citations[0]` before its non-empty check —
     tightened to check `citations.length > 0` before indexing, matching the ADR's wording and the
     `FoodDetailPage.tsx` pattern. Fixed.
  2. (Manual pre-pass) `docs/features/04-maintain-trustworthy-guidance-content.md` (F-04, `Done`)
     still stated every assessment requires a citation and is traceable to its source — now amended
     to note the citation-optional path and link to this feature, since F-10 makes the unqualified
     claim inaccurate. Fixed.
  3. (`prepare` doc-drift, should-fix) This plan's own "No pregnancy data record changes in this
     feature" constraint was contradicted by `src/data/guidanceLists.ts` adding
     `citationPolicy: 'required'` to the pregnancy record. Narrowed the constraint to scope it to
     citations/locators/source links and note the schema-mandated field addition. Fixed.
  4. (`prepare` doc-drift, should-fix) `docs/features/05-add-independent-guidance-lists.md` (F-05,
     `Done`) stated a new list unconditionally supplies "source citation" — now qualified to describe
     the `citationPolicy` choice and link to this feature. Fixed.
  5. (`prepare` doc-drift, note) This plan's `Tests` section still described the `e2e/catalogue.spec.ts`
     scenario as covering "an uncited vegetarian entry"; the implemented test covers the vegetarian
     evidentiary basis instead, per the deviation already recorded above. Reworded to match. Fixed.
  6. (`prepare` missing-docs) No findings — the subagent independently confirmed the
     `citationPolicy`/`evidentiaryBasis` validation rules and the "evidentiary basis renders once per
     view, not per card" convention were already documented in the governing ADR,
     `docs/architecture/overview.md`, and `.github/copilot-instructions.md` before this implementation
     began.
  No dependency-version drift: `package.json`/`package-lock.json` are unchanged in this diff.
  All targeted and full validation commands above were re-run after every fix and remain green.

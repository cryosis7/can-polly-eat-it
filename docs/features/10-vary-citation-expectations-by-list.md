# F-10: Vary Citation Expectations by Guidance List

**Status:** Planned

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

[F-10 Implementation Plan](<10-vary-citation-expectations-by-list-plan.md>), approved and not yet
started.

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
  and the removal of any unchecked index into a citation array.
- React Testing Library tests for a cited assessment, an uncited assessment, and the displayed
  evidentiary basis.
- Chromium Playwright coverage confirming a pregnancy source link and an uncited vegetarian entry
  render correctly in the catalogue.
- `npm run test:coverage` retaining the 100% global threshold, plus `npm run lint`,
  `npm run typecheck`, and `npm run build`.
- A subagent runs the `prepare` skill after implementation and targeted validation, before the pull
  request is opened and before this feature moves to `Done`.

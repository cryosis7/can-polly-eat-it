# F-08: Rework Guidance-Scope Filtering

**Status:** Done

**Depends on:** [F-05: Add Independent Guidance Lists](<05-add-independent-guidance-lists.md>)

**Governing decisions:** [independent guidance lists](<../decisions/2026-08-04 ADR - use independent guidance lists for food assessments.md>), [version-controlled static content](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), [show scoped guidance with generic outcome filters](<../decisions/2026-08-06 ADR - show scoped guidance with generic outcome filters.md>), and [default the catalogue to pregnancy and vegetarian scopes](<../decisions/2026-08-25 ADR - default the catalogue to pregnancy and vegetarian scopes.md>)

## Goal

As Polly, I need to narrow one catalogue by the dietary scopes that matter to me so that I can find
foods that satisfy pregnancy and vegetarian suitability together without translating separate
list-specific status filters.

## Primary experience

1. Open the guide with pregnancy and vegetarian suitability selected by default.
2. Remove a dietary scope, or add a further one, when only some constraints matter.
3. Narrow selected scopes with "Okay", "Maybe - see notes", or "Not okay".
4. Read each result's list-specific labels, summaries, sources, conditions, and review details.

```text
Polly's Food Guide

Dietary scopes
  [x] Pregnancy
  [x] Vegetarian

Outcome
  [ ] Okay
  [ ] Maybe - see notes
  [ ] Not okay

Cheddar
  Pregnancy: OK to eat
  Vegetarian: Vegetarian
```

Adding "Okay" and "Maybe - see notes" to the default Pregnancy plus Vegetarian selection shows only
foods whose resolved outcome is Okay or Maybe - see notes in both scopes.

| Food | Pregnancy | Vegetarian | Shows? |
| --- | --- | --- | --- |
| Cheddar | Okay | Okay | Yes |
| Brie | Not okay | Okay | No |
| Leftovers | Maybe - see notes | Okay | Yes |
| Yoghurt | Not assessed | Okay | No |

```mermaid
classDiagram
  class Food {
    id
    slug
    name
    primaryCategoryId
  }

  class Category {
    id
    slug
    name
    parentId
  }

  class GuidanceList {
    id
    slug
    statuses
    unassessedNotice
  }

  class StatusDefinition {
    id
    label
    tone
    outcomeBand
  }

  class Assessment {
    subject
    guidanceListId
    statusId
  }

  Assessment --> Food : assesses (subject.kind = food)
  Assessment --> Category : assesses (subject.kind = category)
  Food --> Category : primary category
  Assessment --> GuidanceList : belongs to
  GuidanceList --> StatusDefinition : owns
  Assessment --> StatusDefinition : maps to outcome band
```

## Required behaviour

- Keep `Food` and `Category` free from pregnancy, vegetarian, or global-status fields.
- Map every list-owned status to exactly one generic outcome band: `okay`, `maybe`, `not-okay`, or
  `not-assessed`.
- Default an absent URL scope to pregnancy food safety and vegetarian suitability.
- OR selected outcome bands within every selected scope and AND selected scopes with category/search
  predicates.
- Keep `not-assessed` as a neutral fallback; it is not safe nor a primary RAG filter.
- Replace the unreleased `list=` and `status.<list-slug>` URL shape with `scope=` and `outcome=`.
- Show list-specific labels, citations, conditions, and non-colour status signals on cards and
  detail pages.

## Non-goals

- Changing the reviewed vegetarian data or its citations.
- Adding recipe/ingredient analysis, user profiles, or further dietary lists.
- Treating missing assessment or outside coverage as safe.

## Implementation notes

- The accepted ADR defines the replacement URL contract and filtering semantics.
- F-05 supplies the existing pregnancy and vegetarian assessments required to validate combined
  scopes.
- The accepted ADR's implementation plan governed the completed work across schemas, domain
  filtering, URL state, catalogue and detail rendering, and browser coverage.
- The [2026-08-25 ADR](<../decisions/2026-08-25 ADR - default the catalogue to pregnancy and vegetarian scopes.md>)
  superseded the default-scope clause: the no-`scope` catalogue default now selects both
  `pregnancy-food-safety` and `vegetarian-suitability` rather than pregnancy alone.

## Acceptance criteria

- The catalogue defaults to pregnancy food safety and vegetarian suitability scopes when its URL has
  no scope.
- Pregnancy plus vegetarian with Okay and Maybe - see notes includes only foods matching those bands
  in both scopes.
- The primary outcome controls do not expose Not assessed as a normal RAG choice, while missing
  guidance remains visibly neutral wherever it is rendered.
- A copied filtered URL reproduces the scopes and outcomes in a fresh browser session.
- The same food continues to use one food record and independently resolved list assessments.

## Validation

Completed 2026-08-06:

- `npm run test:coverage`
- `npm run test:e2e -- e2e/catalogue.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Default-scope amendment completed 2026-08-25 ([2026-08-25 ADR](<../decisions/2026-08-25 ADR - default the catalogue to pregnancy and vegetarian scopes.md>)):

- `npx vitest run src/app/catalogueQuery.test.ts src/features/catalogue/CataloguePage.test.tsx`
- `npx playwright test e2e/catalogue.spec.ts e2e/accessibility.spec.ts e2e/tea-guidance.spec.ts`

import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import { getStatusById, validateContent } from './contentValidation'
import type { Assessment } from './schemas'

const index = createContentIndex(content.categories, content.assessments)

describe('guide content validation', () => {
  it('accepts the authored fixture content', () => {
    expect(content.categories).toHaveLength(54)
    expect(content.foods).toHaveLength(145)
    expect(content.assessments).toHaveLength(186)
    expect(content.guidanceLists.map((list) => list.id)).toEqual(['pregnancy-food-safety', 'vegetarian-suitability'])
    expect(content.guidanceLists[0].statuses.map((status) => status.outcomeBand)).toEqual([
      'okay',
      'maybe',
      // `Not enough evidence` shares the `maybe` band with `Only with conditions`: the outcome
      // filter groups them, and only the authored words tell a reader that one source set
      // conditions while another declined to judge at all.
      'maybe',
      'not-okay',
      'not-assessed',
    ])
    expect(content.guidanceLists.map((list) => list.citationPolicy)).toEqual(['required', 'optional'])
    expect(content.guidanceLists[0].evidentiaryBasis).toBeUndefined()
    expect(content.guidanceLists[1].evidentiaryBasis).toBeTruthy()
  })

  it('rejects duplicate category slugs', () => {
    expect(() => validateContent({
      ...content,
      categories: [...content.categories, { ...content.categories[0], id: 'another-dairy' }],
    })).toThrow('duplicate category slug')
  })

  it('resolves every missing assessment to the list single not-assessed state', () => {
    const list = content.guidanceLists[0]
    const yellowfinTuna = content.foods.find((food) => food.id === 'yellowfin-tuna')!
    const applePie = content.foods.find((food) => food.id === 'apple-pie')!

    expect(resolveAssessment({ kind: 'food', food: yellowfinTuna }, list, index).status.label).toBe('Not assessed')
    expect(resolveAssessment({ kind: 'food', food: applePie }, list, index).status.label).toBe('Not assessed')
    expect(yellowfinTuna).not.toHaveProperty('pregnancyStatus')
  })

  it('resolves category guidance inherited by descendant foods, overridden by a food-level assessment', () => {
    const pregnancyList = content.guidanceLists[0]
    const vegetarianList = content.guidanceLists[1]
    const gouda = content.foods.find((food) => food.id === 'gouda')!
    const parmesan = content.foods.find((food) => food.id === 'parmesan')!
    const hardCheese = content.categories.find((category) => category.id === 'hard-cheese')!

    const goudaPregnancy = resolveAssessment({ kind: 'food', food: gouda }, pregnancyList, index)
    expect(goudaPregnancy.status.label).toBe('OK to eat')
    expect(goudaPregnancy.origin).toEqual({ kind: 'inherited', category: hardCheese })
    expect(goudaPregnancy.assessment?.scopeStatement).toBe('Applies to all hard cheese.')

    const goudaVegetarian = resolveAssessment({ kind: 'food', food: gouda }, vegetarianList, index)
    expect(goudaVegetarian.status.label).toBe('Check ingredients')
    expect(goudaVegetarian.origin).toEqual({ kind: 'inherited', category: hardCheese })

    const parmesanVegetarian = resolveAssessment({ kind: 'food', food: parmesan }, vegetarianList, index)
    expect(parmesanVegetarian.status.label).toBe('Contains animal-derived ingredients')
    expect(parmesanVegetarian.origin).toEqual({ kind: 'own' })

    const hardCheeseOwn = resolveAssessment({ kind: 'category', category: hardCheese }, pregnancyList, index)
    expect(hardCheeseOwn.origin).toEqual({ kind: 'own' })
    expect(index.assessedCategoryIds.has('hard-cheese')).toBe(true)
    expect(index.assessedCategoryIds.has('cheese')).toBe(false)
  })

  it('rejects invalid category relationships and food category references', () => {
    expect(() => validateContent({
      ...content,
      categories: content.categories.map((category) => category.id === 'dairy'
        ? { ...category, parentId: 'dairy' }
        : category),
    })).toThrow('cannot be its own parent')

    expect(() => validateContent({
      ...content,
      foods: [...content.foods, { ...content.foods[0], id: 'unknown-category-food', slug: 'unknown-category-food', primaryCategoryId: 'unknown-category' }],
    })).toThrow('unknown primary category')
  })

  it('rejects a fallback status that is not a list-owned grey not-assessed status', () => {
    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        unassessedStatusId: 'not-a-status-this-list-owns',
      })),
    })).toThrow('must own a grey not-assessed fallback status')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        statuses: list.statuses.map((status) => (
          status.id === list.unassessedStatusId ? { ...status, tone: 'amber' as const } : status
        )),
      })),
    })).toThrow('must own a grey not-assessed fallback status')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        unassessedStatusId: list.statuses.find((status) => status.outcomeBand === 'okay')!.id,
      })),
    })).toThrow('must own a grey not-assessed fallback status')
  })

  it('rejects invalid assessment subject references and fallback statuses', () => {
    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, {
        ...content.assessments[0],
        id: 'unknown-food-assessment',
        subject: { kind: 'food', foodId: 'unknown-food' },
      }],
    })).toThrow('references an unknown food')

    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, {
        ...content.assessments.find((assessment) => assessment.subject.kind === 'category')!,
        id: 'unknown-category-assessment',
        subject: { kind: 'category', categoryId: 'unknown-category' },
      }],
    })).toThrow('references an unknown category')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => ({
        ...assessment,
        statusId: 'pregnancy-not-assessed',
      })),
    })).toThrow('must use a non-fallback status')
  })

  it('rejects category assessments without a scopeStatement, and food assessments with one', () => {
    const categoryAssessment = content.assessments.find((assessment) => assessment.subject.kind === 'category')!
    const foodAssessment = content.assessments.find((assessment) => assessment.subject.kind === 'food')!

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.id === categoryAssessment.id ? { ...assessment, scopeStatement: undefined } : assessment
      )),
    })).toThrow('must declare a scopeStatement')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.id === foodAssessment.id ? { ...assessment, scopeStatement: 'Should not be allowed.' } : assessment
      )),
    })).toThrow('must not declare a scopeStatement')
  })

  it('rejects duplicate subject/list pairs across food and category subjects', () => {
    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, { ...content.assessments[0] }],
    })).toThrow('duplicate assessment ID')

    const categoryAssessment = content.assessments.find((assessment) => assessment.subject.kind === 'category')!
    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, { ...categoryAssessment, id: 'duplicate-category-subject' }],
    })).toThrow('duplicate subject/preparation/list/source assessment pair')
  })

  it('resolves an assessed subject the same wherever it sits, with no containment rule to satisfy', () => {
    const pregnancyList = content.guidanceLists[0]
    const gouda = content.foods.find((food) => food.id === 'gouda')!
    const before = resolveAssessment({ kind: 'food', food: gouda }, pregnancyList, index)
    const moved = resolveAssessment(
      { kind: 'food', food: { ...gouda, primaryCategoryId: 'miscellaneous' } },
      pregnancyList,
      index,
    )

    expect(before.status.label).toBe('OK to eat')
    expect(moved.status.label).toBe('Not assessed')
    expect(() => validateContent({
      ...content,
      foods: content.foods.map((food) => (
        food.id === 'gouda' ? { ...food, primaryCategoryId: 'miscellaneous' } : food
      )),
    })).not.toThrow()
  })

  it('rejects an additive assessment with nothing to add to, or one less restrictive than its target', () => {
    // Confectionery carries no guidance anywhere on its path, so nothing inherits onto a sweet on
    // any axis. Yellowfin tuna would no longer serve: it declares raw and cooked, and its group
    // carries a rule on both, which is exactly what the additive relation is entitled to add to.
    const danglingAssessment: Assessment = {
      id: 'gummy-bears-pregnancy',
      subject: { kind: 'food', foodId: 'gummy-bears' },
      guidanceListId: 'pregnancy-food-safety',
      sourceId: 'new-zealand-food-safety',
      statusId: 'pregnancy-avoid',
      summary: 'Adds to guidance that does not exist.',
      relation: 'adds-to',
      guidanceScenarios: [],
      reasonLinks: [],
      citations: content.assessments[0].citations,
    }

    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, danglingAssessment],
    })).toThrow('no ancestor is assessed in its guidance list')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.id === 'mousse-pregnancy'
          ? { ...assessment, relation: 'adds-to' as const, statusId: 'pregnancy-ok' }
          : assessment
      )),
    })).toThrow('more restrictive than itself')
  })

  it('accepts an additive category assessment that adds to an assessed ancestor on the same axis', () => {
    // Built rather than borrowed: after the migration no authored category happens to sit beneath an
    // ancestor assessed on its own preparation axis, and the rule under test is about that axis.
    const ancestorRule: Assessment = {
      ...content.assessments[0],
      id: 'desserts-frozen-pregnancy',
      subject: { kind: 'category', categoryId: 'desserts' },
      preparationId: 'frozen',
      statusId: 'pregnancy-conditions',
      scopeStatement: 'Applies to all frozen desserts.',
      relation: undefined,
    }
    const additiveChild: Assessment = {
      ...content.assessments[0],
      id: 'ice-cream-frozen-pregnancy',
      subject: { kind: 'category', categoryId: 'ice-cream' },
      preparationId: 'frozen',
      statusId: 'pregnancy-avoid',
      scopeStatement: 'Applies to all frozen ice cream.',
      relation: 'adds-to',
    }

    const validated = validateContent({
      ...content,
      assessments: [...content.assessments, ancestorRule, additiveChild],
    })

    expect(validated.assessments.find((assessment) => assessment.id === 'ice-cream-frozen-pregnancy')?.relation)
      .toBe('adds-to')
  })

  it('rejects duplicate identifiers, invalid hierarchy relationships, and duplicate foods', () => {
    expect(() => validateContent({
      ...content,
      categories: [...content.categories, { ...content.categories[0] }],
    })).toThrow('duplicate category ID')

    expect(() => validateContent({
      ...content,
      categories: content.categories.map((category) => category.id === 'dairy'
        ? { ...category, parentId: 'unknown-parent' }
        : category),
    })).toThrow('unknown parent')

    expect(() => validateContent({
      ...content,
      categories: content.categories.map((category) => category.id === 'seafood'
        ? { ...category, parentId: 'fish' }
        : category),
    })).toThrow('part of a cycle')

    expect(() => validateContent({
      ...content,
      foods: [...content.foods, { ...content.foods[0] }],
    })).toThrow('duplicate food ID')
  })

  it('rejects invalid source records and unknown source references', () => {
    expect(() => validateContent({
      ...content,
      sources: [...content.sources, { ...content.sources[0] }],
    })).toThrow('duplicate source ID')

    expect(() => validateContent({
      ...content,
      sources: [...content.sources, { ...content.sources[0], id: 'another-authority' }],
    })).toThrow('duplicate source slug')

    expect(() => validateContent({
      ...content,
      sources: content.sources.map((source) => ({ ...source, homeUrl: 'http://insecure.test/' })),
    })).toThrow('Source URL must use HTTPS')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({ ...list, sourceIds: ['no-such-authority'] })),
    })).toThrow('references an unknown source')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        sourceIds: ['new-zealand-food-safety', 'new-zealand-food-safety'],
      })),
    })).toThrow('duplicate source reference')
  })

  it('requires attribution only in a list that declares more than one source', () => {
    // The pregnancy list now declares five sources, so an assessment that names none is rejected.
    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.id === 'mousse-pregnancy'
          ? { ...assessment, sourceId: undefined }
          : assessment
      )),
    })).toThrow('must name its source')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.id === 'mousse-pregnancy'
          ? { ...assessment, sourceId: 'an-authority-this-list-does-not-declare' }
          : assessment
      )),
    })).toThrow('does not declare')

    // Vegetarian suitability declares no source, so its assessments carry no attribution and the
    // authored content as a whole still validates.
    expect(content.assessments.filter((assessment) => assessment.guidanceListId === 'vegetarian-suitability')
      .every((assessment) => assessment.sourceId === undefined)).toBe(true)
    expect(() => validateContent(content)).not.toThrow()
  })

  it('rejects invalid guidance-list ownership', () => {
    expect(() => validateContent({
      ...content,
      guidanceLists: [...content.guidanceLists, { ...content.guidanceLists[0] }],
    })).toThrow('duplicate guidance-list ID')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        statuses: [...list.statuses, { ...list.statuses[0] }],
      })),
    })).toThrow('duplicate status ID')
  })

  it('rejects duplicate, unknown, and invalid assessment links', () => {
    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, {
        ...content.assessments[0],
        id: 'unknown-list-assessment',
        guidanceListId: 'unknown-list',
      }],
    })).toThrow('unknown guidance list')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => ({
        ...assessment,
        reasonLinks: [
          { kind: 'contains', targetFoodId: 'brie', statement: 'Contains brie.' },
          { kind: 'contains', targetFoodId: 'brie', statement: 'Contains brie again.' },
        ],
      })),
    })).toThrow('duplicate reason link')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.subject.kind === 'food'
          ? { ...assessment, reasonLinks: [{ kind: 'contains', targetFoodId: assessment.subject.foodId, statement: 'Self reference.' }] }
          : assessment
      )),
    })).toThrow('invalid reason-link target')
  })

  it('enforces citation policy per guidance list', () => {
    const pregnancyId = 'pregnancy-food-safety'
    const vegetarianId = 'vegetarian-suitability'

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.guidanceListId === pregnancyId ? { ...assessment, citations: [] } : assessment
      )),
    })).toThrow('belongs to a guidance list that requires citations')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === pregnancyId ? { ...list, unassessedNotice: { ...list.unassessedNotice, citations: [] } } : list
      )),
    })).toThrow('must include at least one citation')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === vegetarianId ? { ...list, evidentiaryBasis: undefined } : list
      )),
    })).toThrow('must declare an evidentiary basis')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === pregnancyId ? { ...list, evidentiaryBasis: 'Should not be allowed.' } : list
      )),
    })).toThrow('must not declare an evidentiary basis')

    const uncitedVegetarian = validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === vegetarianId ? { ...list, unassessedNotice: { ...list.unassessedNotice, citations: [] } } : list
      )),
      assessments: content.assessments.map((assessment) => (
        assessment.guidanceListId === vegetarianId ? { ...assessment, citations: [] } : assessment
      )),
    })
    expect(uncitedVegetarian.assessments.filter((assessment) => assessment.guidanceListId === vegetarianId)
      .every((assessment) => assessment.citations.length === 0)).toBe(true)
  })

  it('resolves statuses through its public helper', () => {
    const list = content.guidanceLists[0]

    expect(getStatusById(list, 'pregnancy-ok').label).toBe('OK to eat')
    expect(() => getStatusById(list, 'unknown-status')).toThrow('does not own status')
  })

  it('leaves no coverage declaration or outside-coverage state anywhere in the content', () => {
    for (const list of content.guidanceLists) {
      expect(list).not.toHaveProperty('coverage')
      expect(list).not.toHaveProperty('outOfCoverageStatusId')
      expect(list.statuses.filter((status) => status.tone === 'grey')).toHaveLength(1)
      expect(list.unassessedNotice.description).toBeTruthy()
    }
  })
})

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
describe('preparation validation', () => {
  const assessedFood = content.foods[0]
  const raw = { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 }

  const withPreparations = (overrides: Partial<typeof content>) => validateContent({
    ...content,
    ...overrides,
  })

  const declaring = (foodId: string, preparationIds: string[]) => content.foods.map((food) => (
    food.id === foodId ? { ...food, preparationIds } : food
  ))

  it('rejects duplicate preparation IDs and slugs', () => {
    expect(() => withPreparations({ preparations: [raw, { ...raw, slug: 'raw-again' }] }))
      .toThrow('duplicate preparation ID')
    expect(() => withPreparations({ preparations: [raw, { ...raw, id: 'raw-again' }] }))
      .toThrow('duplicate preparation slug')
  })

  it('rejects a food declaring an unknown or repeated preparation state', () => {
    expect(() => withPreparations({ foods: declaring(assessedFood.id, ['grilled']) }))
      .toThrow('declares an unknown preparation state')
    expect(() => withPreparations({ foods: declaring(assessedFood.id, ['raw', 'raw']) }))
      .toThrow(`duplicate preparation state on food "${assessedFood.id}"`)
  })

  it('rejects an assessment qualified by an unknown preparation state', () => {
    const qualified: Assessment = {
      ...content.assessments[0],
      id: 'unknown-preparation',
      subject: { kind: 'food', foodId: assessedFood.id },
      preparationId: 'grilled',
      scopeStatement: undefined,
    }

    expect(() => withPreparations({
      foods: declaring(assessedFood.id, ['raw']),
      assessments: [...content.assessments, qualified],
    })).toThrow('qualified by an unknown preparation state')
  })

  it('rejects an assessment qualified by a preparation its food does not declare', () => {
    const qualified: Assessment = {
      ...content.assessments[0],
      id: 'undeclared-preparation',
      subject: { kind: 'food', foodId: assessedFood.id },
      preparationId: 'raw',
      scopeStatement: undefined,
    }

    expect(() => withPreparations({ assessments: [...content.assessments, qualified] }))
      .toThrow('qualified by a preparation its food does not declare')
  })

  it('accepts a category assessment qualified by a preparation no food beneath it declares', () => {
    const ancestor = index.tree.pathByCategoryId.get(assessedFood.primaryCategoryId)![0]
    const qualified: Assessment = {
      ...content.assessments[0],
      id: 'undeclared-category-preparation',
      subject: { kind: 'category', categoryId: ancestor.id },
      preparationId: 'raw',
      scopeStatement: `Applies to all ${ancestor.name}.`,
    }

    // A category is a first-class subject, so its own guidance establishes the grouping. `Ice cream`
    // holds three authored rules and no foods at all; requiring a food to declare the state would
    // reject the very content the grouping exists to show.
    expect(() => withPreparations({ assessments: [...content.assessments, qualified] })).not.toThrow()
  })

  it('separates assessments by preparation in the uniqueness key', () => {
    const base = content.assessments.find((assessment) => assessment.subject.kind === 'food')!
    const qualify = (id: string, preparationId?: string): Assessment => ({ ...base, id, preparationId })
    const foodId = (base.subject as { kind: 'food', foodId: string }).foodId

    expect(() => withPreparations({
      foods: declaring(foodId, ['raw']),
      assessments: [...content.assessments, qualify('same-key')],
    })).toThrow('duplicate subject/preparation/list/source assessment pair')
    expect(() => withPreparations({
      foods: declaring(foodId, ['raw']),
      assessments: [...content.assessments, qualify('raw-key', 'raw')],
    })).not.toThrow()
  })

  it('accepts the migrated content, where preparation states carry real authored guidance', () => {
    expect(content.preparations.length).toBeGreaterThan(0)
    expect(content.foods.some((food) => food.preparationIds.length > 0)).toBe(true)
    expect(content.assessments.some((assessment) => assessment.preparationId !== undefined)).toBe(true)
    // Every declared state and every qualifier names a state in the one global vocabulary.
    const known = new Set(content.preparations.map((preparation) => preparation.id))
    for (const food of content.foods) {
      expect(food.preparationIds.every((id) => known.has(id)), food.id).toBe(true)
    }
    for (const assessment of content.assessments) {
      expect(assessment.preparationId === undefined || known.has(assessment.preparationId), assessment.id).toBe(true)
    }
  })
})

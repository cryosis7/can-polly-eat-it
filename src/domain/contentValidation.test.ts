import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import { getStatusById, isCategoryCovered, isFoodCovered, validateContent } from './contentValidation'

const index = createContentIndex(content.categories, content.assessments)

describe('guide content validation', () => {
  it('accepts the authored fixture content', () => {
    expect(content.categories).toHaveLength(76)
    expect(content.foods).toHaveLength(110)
    expect(content.assessments).toHaveLength(142)
    expect(content.guidanceLists.map((list) => list.id)).toEqual(['pregnancy-food-safety', 'vegetarian-suitability'])
    expect(content.guidanceLists[0].statuses.map((status) => status.outcomeBand)).toEqual([
      'okay',
      'maybe',
      'not-okay',
      'not-assessed',
      'outside-coverage',
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

  it('resolves in-coverage and outside-coverage missing assessments differently', () => {
    const list = content.guidanceLists[0]
    const yellowfinTuna = content.foods.find((food) => food.id === 'yellowfin-tuna')!
    const applePie = content.foods.find((food) => food.id === 'apple-pie')!

    expect(resolveAssessment({ kind: 'food', food: yellowfinTuna }, list, index).status.label).toBe('Not assessed')
    expect(resolveAssessment({ kind: 'food', food: applePie }, list, index).status.label).toBe('Outside current coverage')
    expect(resolveAssessment({ kind: 'food', food: yellowfinTuna }, {
      ...list,
      coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: [] },
    }, index).status.label).toBe('Outside current coverage')
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

  it('rejects invalid guidance-list coverage and fallback status definitions', () => {
    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        unassessedStatusId: list.outOfCoverageStatusId,
      })),
    })).toThrow('distinct fallback statuses')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        coverage: { ...list.coverage, categoryIds: ['unknown-category'] },
      })),
    })).toThrow('covers an unknown category')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        statuses: list.statuses.map((status) => (
          status.id === list.unassessedStatusId ? { ...status, outcomeBand: 'outside-coverage' } : status
        )),
      })),
    })).toThrow('distinct neutral outcome bands')
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
    })).toThrow('duplicate subject/list assessment pair')
  })

  it('rejects an assessed subject outside its guidance list declared coverage', () => {
    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === 'pregnancy-food-safety'
          ? { ...list, coverage: { ...list.coverage, categoryIds: list.coverage.categoryIds.filter((id) => id !== 'dairy') } }
          : list
      )),
    })).toThrow("outside its guidance list's declared coverage")

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === 'vegetarian-suitability'
          ? { ...list, coverage: { ...list.coverage, categoryIds: [] } }
          : list
      )),
    })).toThrow("outside its guidance list's declared coverage")
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
        ? { ...category, parentId: 'fish-mercury-guidance' }
        : category),
    })).toThrow('part of a cycle')

    expect(() => validateContent({
      ...content,
      foods: [...content.foods, { ...content.foods[0] }],
    })).toThrow('duplicate food ID')
  })

  it('rejects invalid guidance-list ownership and coverage', () => {
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

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        unassessedStatusId: list.statuses[0].id,
      })),
    })).toThrow('fallback statuses must be list-owned grey statuses')

    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => ({
        ...list,
        coverage: { ...list.coverage, foodIds: ['unknown-food'] },
      })),
    })).toThrow('covers an unknown food')

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
        list.id === pregnancyId ? { ...list, coverage: { ...list.coverage, citations: [] } } : list
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
        list.id === vegetarianId ? { ...list, coverage: { ...list.coverage, citations: [] } } : list
      )),
      assessments: content.assessments.map((assessment) => (
        assessment.guidanceListId === vegetarianId ? { ...assessment, citations: [] } : assessment
      )),
    })
    expect(uncitedVegetarian.assessments.filter((assessment) => assessment.guidanceListId === vegetarianId)
      .every((assessment) => assessment.citations.length === 0)).toBe(true)
  })

  it('resolves statuses and coverage declarations through its public helpers', () => {
    const list = content.guidanceLists[0]
    const cheddar = content.foods.find((food) => food.id === 'cheddar')!
    const yellowfinTuna = content.foods.find((food) => food.id === 'yellowfin-tuna')!
    const hardCheese = content.categories.find((category) => category.id === 'hard-cheese')!

    expect(getStatusById(list, 'pregnancy-ok').label).toBe('OK to eat')
    expect(() => getStatusById(list, 'unknown-status')).toThrow('does not own status')
    expect(isFoodCovered(cheddar, {
      ...list,
      coverage: { ...list.coverage, mode: 'all-catalogue', categoryIds: [], foodIds: [] },
    }, index)).toBe(true)
    expect(isFoodCovered(cheddar, list, index)).toBe(true)
    expect(isFoodCovered(yellowfinTuna, list, index)).toBe(true)
    expect(isFoodCovered(yellowfinTuna, {
      ...list,
      coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: ['yellowfin-tuna'] },
    }, index)).toBe(true)
    expect(isFoodCovered({
      ...yellowfinTuna,
      primaryCategoryId: 'unknown-category',
    }, {
      ...list,
      coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: [] },
    }, index)).toBe(false)

    expect(isCategoryCovered(hardCheese, {
      ...list,
      coverage: { ...list.coverage, mode: 'all-catalogue', categoryIds: [], foodIds: [] },
    }, index)).toBe(true)
    expect(isCategoryCovered(hardCheese, list, index)).toBe(true)
    expect(isCategoryCovered(hardCheese, {
      ...list,
      coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [] },
    }, index)).toBe(false)
    expect(isCategoryCovered({
      ...hardCheese,
      id: 'unknown-category',
    }, {
      ...list,
      coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [] },
    }, index)).toBe(false)
  })
})

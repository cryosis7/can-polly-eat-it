import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { getStatusById, isFoodCovered, validateContent } from './contentValidation'

describe('guide content validation', () => {
  it('accepts the authored fixture content', () => {
    expect(content.foods).toHaveLength(19)
    expect(content.guidanceLists).toHaveLength(2)
    expect(content.guidanceLists.flatMap((list) => list.statuses.map((status) => status.outcomeBand))).toEqual([
      'okay',
      'maybe',
      'not-okay',
      'not-assessed',
      'outside-coverage',
      'okay',
      'not-okay',
      'maybe',
      'not-assessed',
      'outside-coverage',
    ])
  })

  it('rejects duplicate category slugs', () => {
    expect(() => validateContent({
      ...content,
      categories: [...content.categories, { ...content.categories[0], id: 'another-dairy' }],
    })).toThrow('duplicate category slug')
  })

  it('resolves in-coverage and outside-coverage missing assessments differently', () => {
    const list = content.guidanceLists[0]
    const yoghurt = content.foods.find((food) => food.id === 'yoghurt')!
    const kombucha = content.foods.find((food) => food.id === 'kombucha')!

    expect(resolveAssessment(yoghurt, list, content.assessments, content.categories).status.label).toBe('Not assessed')
    expect(resolveAssessment(kombucha, list, content.assessments, content.categories).status.label).toBe('Outside current coverage')
  })

  it('resolves vegetarian coverage without changing food records', () => {
    const list = content.guidanceLists.find((candidate) => candidate.id === 'vegetarian-suitability')!
    const yoghurt = content.foods.find((food) => food.id === 'yoghurt')!
    const cheddar = content.foods.find((food) => food.id === 'cheddar')!
    const assessmentsWithoutYoghurt = content.assessments.filter(
      (assessment) => assessment.id !== 'yoghurt-vegetarian',
    )

    expect(resolveAssessment(yoghurt, list, content.assessments, content.categories).status.label).toBe('Check ingredients')
    expect(resolveAssessment(yoghurt, list, assessmentsWithoutYoghurt, content.categories).status.label).toBe('Not assessed')
    expect(resolveAssessment(cheddar, list, content.assessments, content.categories).status.label).toBe('Outside current coverage')
    expect(cheddar).not.toHaveProperty('isVegetarian')
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

  it('rejects invalid assessment references and fallback statuses', () => {
    expect(() => validateContent({
      ...content,
      assessments: [...content.assessments, {
        ...content.assessments[0],
        id: 'unknown-food-assessment',
        foodId: 'unknown-food',
      }],
    })).toThrow('references an unknown food')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => ({
        ...assessment,
        statusId: 'pregnancy-not-assessed',
      })),
    })).toThrow('must use a non-fallback status')
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
      categories: content.categories.map((category) => category.id === 'dairy'
        ? { ...category, parentId: 'cheese' }
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
      assessments: [...content.assessments, { ...content.assessments[0] }],
    })).toThrow('duplicate assessment ID')

    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => ({
        ...assessment,
        guidanceListId: 'unknown-list',
      })),
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
      assessments: content.assessments.map((assessment) => ({
        ...assessment,
        reasonLinks: [{ kind: 'contains', targetFoodId: assessment.foodId, statement: 'Self reference.' }],
      })),
    })).toThrow('invalid reason-link target')
  })

  it('resolves statuses and coverage declarations through its public helpers', () => {
    const list = content.guidanceLists[0]
    const yoghurt = content.foods.find((food) => food.id === 'yoghurt')!
    const kombucha = content.foods.find((food) => food.id === 'kombucha')!

    expect(getStatusById(list, 'pregnancy-ok').label).toBe('OK to eat')
    expect(() => getStatusById(list, 'unknown-status')).toThrow('does not own status')
    expect(isFoodCovered(yoghurt, list, content.categories)).toBe(true)
    expect(isFoodCovered(kombucha, list, content.categories)).toBe(false)
    expect(isFoodCovered(kombucha, {
      ...list,
      coverage: { ...list.coverage, mode: 'all-catalogue' },
    }, content.categories)).toBe(true)
    expect(isFoodCovered(kombucha, {
      ...list,
      coverage: { ...list.coverage, foodIds: ['kombucha'] },
    }, content.categories)).toBe(true)
    expect(isFoodCovered({
      ...kombucha,
      primaryCategoryId: 'unknown-category',
    }, list, content.categories)).toBe(false)
  })
})

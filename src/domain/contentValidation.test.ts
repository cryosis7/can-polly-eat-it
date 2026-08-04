import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { validateContent } from './contentValidation'

describe('guide content validation', () => {
  it('accepts the authored fixture content', () => {
    expect(content.foods).toHaveLength(5)
    expect(content.guidanceLists).toHaveLength(1)
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
})

import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { buildCategoryTree } from './categoryTree'
import { createContentIndex } from './contentIndex'
import { validateContent } from './contentValidation'
import { filterCategoryEntries, filterFoods } from './filtering'

const index = createContentIndex(content.categories, content.assessments)
const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const RETIRED_CATEGORY_ID = 'foods-that-may-contain-animal-derived-ingredients'

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const categoryById = (id: string) => content.categories.find((category) => category.id === id)
const resolveFood = (id: string, list = pregnancy) =>
  resolveAssessment({ kind: 'food', food: foodById(id) }, list, index)

const entriesMatching = (query: string) => [...new Set([
  ...filterFoods(content.foods, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `food:${row.food.id}`),
  ...filterCategoryEntries(content.categories, content.assessments, content.preparations, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `category:${row.category.id}`),
])]

/**
 * Every food the retired root held, with the food group it now belongs to. The retired root was the
 * source article's table of contents rather than a food group, so each food is filed under what it
 * is.
 */
const migratedFoods: [string, string][] = [
  ['apple-pie', 'baked-desserts'],
  ['french-fries', 'miscellaneous'],
  ['gelatin', 'ingredients-and-additives'],
  ['gummy-bears', 'confectionery'],
  ['jelly', 'confectionery'],
  ['marshmallows', 'confectionery'],
  ['orange-juice', 'fruit-juice-kombucha-and-cider'],
  ['starburst', 'confectionery'],
  ['tortillas', 'breads'],
  ['vegetable-soup', 'soups'],
  ['white-sugar', 'ingredients-and-additives'],
  ['wine-and-beer', 'alcoholic-drinks'],
  ['worcestershire-sauce', 'sauces-dressings-and-spreads'],
]

describe('retired animal-derived ingredients category', () => {
  it('leaves no category, food, or assessment referencing the retired root', () => {
    expect(categoryById(RETIRED_CATEGORY_ID)).toBeUndefined()
    expect(content.categories.some((category) => category.parentId === RETIRED_CATEGORY_ID)).toBe(false)
    expect(content.foods.some((food) => food.primaryCategoryId === RETIRED_CATEGORY_ID)).toBe(false)
    expect(content.assessments.some((assessment) =>
      assessment.subject.kind === 'category' && assessment.subject.categoryId === RETIRED_CATEGORY_ID,
    )).toBe(false)
  })

  it('files every migrated food under the food group it belongs to', () => {
    for (const [foodId, categoryId] of migratedFoods) {
      expect(foodById(foodId).primaryCategoryId, foodId).toBe(categoryId)
    }
  })

  it('rejects a food left pointing at the retired category', () => {
    expect(() => validateContent({
      ...content,
      foods: content.foods.map((food) => (
        food.id === 'gelatin' ? { ...food, primaryCategoryId: RETIRED_CATEGORY_ID } : food
      )),
    })).toThrow()
  })

  it('authors every new browse heading without an assessment of its own', () => {
    for (const categoryId of ['confectionery', 'ingredients-and-additives', 'soups', 'baked-desserts', 'alcoholic-drinks']) {
      const category = categoryById(categoryId)!
      expect(category, categoryId).toBeDefined()
      expect(index.assessedCategoryIds.has(categoryId), categoryId).toBe(false)
      expect(category.aliases, categoryId).toEqual([])
      expect(resolveAssessment({ kind: 'category', category }, pregnancy, index).status.outcomeBand, categoryId)
        .toBe('not-assessed')
    }
  })

  it('orders every root by name with a unique, contiguous sort order', () => {
    const roots = content.categories.filter((category) => category.parentId === null)
    const sorted = [...roots].sort((left, right) => left.sortOrder - right.sortOrder)

    expect(sorted.map((root) => root.sortOrder)).toEqual(roots.map((_, position) => position + 1))
    expect(sorted.map((root) => root.name))
      .toEqual([...roots.map((root) => root.name)].sort((left, right) => left.localeCompare(right)))
  })

  it('places the three new roots among the existing food groups', () => {
    for (const categoryId of ['confectionery', 'ingredients-and-additives', 'soups']) {
      expect(categoryById(categoryId)!.parentId, categoryId).toBeNull()
    }
    expect(categoryById('baked-desserts')!.parentId).toBe('desserts')
    expect(categoryById('alcoholic-drinks')!.parentId).toBe('drinks')
  })

  it('shows every migrated food its new ancestry on its category path', () => {
    const { pathByCategoryId } = buildCategoryTree(content.categories)

    expect(pathByCategoryId.get('baked-desserts')!.map((category) => category.name)).toEqual(['Desserts', 'Baked desserts'])
    expect(pathByCategoryId.get('alcoholic-drinks')!.map((category) => category.name)).toEqual(['Drinks', 'Alcoholic drinks'])
    expect(pathByCategoryId.get('confectionery')!.map((category) => category.name)).toEqual(['Confectionery'])
    for (const path of pathByCategoryId.values()) {
      expect(path.some((category) => category.id === RETIRED_CATEGORY_ID)).toBe(false)
    }
  })

  it('keeps orange juice on the juice group itself rather than either pasteurisation child', () => {
    const orangeJuice = resolveFood('orange-juice')

    expect(foodById('orange-juice').primaryCategoryId).toBe('fruit-juice-kombucha-and-cider')
    expect(orangeJuice.status.outcomeBand).toBe('not-assessed')
    expect(resolveFood('orange-juice', vegetarian).origin).toEqual({ kind: 'own' })
    expect(entriesMatching('orange juice').filter((match) => match.startsWith('food:'))).toEqual(['food:orange-juice'])
  })

  it('shows the pregnancy not-assessed state for every migrated food with no reviewed rule', () => {
    const withoutReviewedPregnancyRule = migratedFoods
      .map(([foodId]) => foodId)
      .filter((foodId) => !['tortillas', 'worcestershire-sauce'].includes(foodId))

    for (const foodId of withoutReviewedPregnancyRule) {
      const resolved = resolveFood(foodId)
      expect(resolved.status.outcomeBand, foodId).toBe('not-assessed')
      expect(resolved.status.label, foodId).toBe('Not assessed')
      expect(resolved.assessment, foodId).toBeUndefined()
    }
  })

  it('still reaches every migrated food by its authored name and aliases', () => {
    const queries: [string, string][] = [
      ['Apple pie', 'apple-pie'],
      ['chips', 'french-fries'],
      ['gelatine', 'gelatin'],
      ['Gummy bears', 'gummy-bears'],
      ['jello', 'jelly'],
      ['Marshmallows', 'marshmallows'],
      ['Orange juice', 'orange-juice'],
      ['Starburst', 'starburst'],
      ['Tortillas', 'tortillas'],
      ['vegetable soups', 'vegetable-soup'],
      ['White sugar', 'white-sugar'],
      ['wine', 'wine-and-beer'],
      ['beer', 'wine-and-beer'],
      ['Worcestershire sauce', 'worcestershire-sauce'],
    ]

    for (const [query, foodId] of queries) {
      expect(entriesMatching(query), `"${query}" should reach ${foodId}`).toContain(`food:${foodId}`)
    }
  })
})

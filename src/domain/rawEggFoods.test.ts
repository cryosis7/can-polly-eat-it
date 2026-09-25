import { describe, expect, it } from 'vitest'
import { content, contentIndex as index } from '../data'
import { resolveAssessment } from './assessment'
import { validateContent } from './contentValidation'
import { filterCategoryEntries, filterFoods } from './filtering'

const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const categoryById = (id: string) => content.categories.find((category) => category.id === id)!
const resolveFood = (id: string, list = pregnancy, preparationId?: string) => resolveAssessment({ kind: 'food', food: foodById(id) }, list, index, preparationId)

const entriesMatching = (query: string) => [...new Set([
  ...filterFoods(content.foods, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `food:${row.food.id}`),
  ...filterCategoryEntries(content.categories, content.assessments, content.preparations, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `category:${row.category.id}`),
])]

describe('raw-egg foods surfaced where people browse for them', () => {
  it('files the new dessert and drinks subtrees where a browser would look for them', () => {
    expect(categoryById('cold-desserts').parentId).toBe('desserts')
    expect(categoryById('drinks').parentId).toBeNull()
    expect(categoryById('ice-cream').parentId).toBe('cold-desserts')
    expect(categoryById('fruit-juice-kombucha-and-cider').parentId).toBe('drinks')
  })

  it('rejects an amber group rule authored without a scope statement', () => {
    expect(() => validateContent({
      ...content,
      assessments: content.assessments.map((assessment) => (
        assessment.subject.kind === 'category' && assessment.subject.categoryId === 'cold-desserts'
          ? { ...assessment, scopeStatement: undefined }
          : assessment
      )),
    })).toThrow('must declare a scopeStatement')
  })

  it('inherits the amber home-made drinks rule for an unassessed drink, with its origin disclosed', () => {
    const smoothies = resolveFood('smoothies', pregnancy, 'home-made')

    expect(smoothies.status.id).toBe('pregnancy-conditions')
    expect(smoothies.origin).toEqual({ kind: 'inherited', category: categoryById('drinks') })
    expect(smoothies.assessment?.scopeStatement).toBe(
      'Applies to all home-made drinks, because only some of them contain raw egg.',
    )
    expect(smoothies.assessment?.citations[0].locator).toBe('Eggs: Raw eggs')
  })

  it('lets a named raw-egg food keep its own red rule without merging in the group rule', () => {
    for (const foodId of ['mayonnaise', 'hollandaise-sauce', 'caesar-dressing', 'mousse', 'tiramisu', 'eggnog', 'egg-flips']) {
      const resolved = resolveFood(foodId)
      expect(resolved.status.id, foodId).toBe('pregnancy-avoid')
      expect(resolved.origin, foodId).toEqual({ kind: 'own' })
      expect(resolved.assessment?.scopeStatement, foodId).toBeUndefined()
      expect(resolved.assessment?.summary, foodId).toBe(
        'The guide names this among the foods containing raw eggs that it says not to eat.',
      )
    }
  })

  it('gives panna cotta the inherited cold-dessert rule while its vegetarian guidance is untouched', () => {
    const pregnancyResolved = resolveFood('panna-cotta')
    expect(pregnancyResolved.status.id).toBe('pregnancy-conditions')
    expect(pregnancyResolved.origin).toEqual({ kind: 'inherited', category: categoryById('cold-desserts') })

    const vegetarianResolved = resolveFood('panna-cotta', vegetarian)
    expect(vegetarianResolved.status.id).toBe('vegetarian-animal-derived')
    expect(vegetarianResolved.origin).toEqual({ kind: 'own' })
  })

  it('keeps the packaged ice-cream rule and its locator beneath the amber cold-desserts ancestor', () => {
    const packaged = resolveAssessment({ kind: 'category', category: categoryById('ice-cream') }, pregnancy, index, 'store-bought')

    // The store-bought rule says okay, and the cold-desserts raw-egg check still applies however the
    // ice cream was bought. Neither is merged, and the more cautious of the two authored statuses
    // governs the row, so the reader is not told "okay" while an amber check is outstanding.
    expect(packaged.status.id).toBe('pregnancy-conditions')
    expect(packaged.layers.map((layer) => layer.assessment.citations[0].locator))
      .toContain('Dairy: Butter; Ice cream — Packaged')
    expect(packaged.layers.map((layer) => layer.assessment.citations[0].locator))
      .toContain('Eggs: Raw eggs')
  })

  it('leaves the raw-eggs entry unchanged and moves its migrated aliases onto one entry each', () => {
    const rawEggs = resolveAssessment({ kind: 'category', category: categoryById('eggs') }, pregnancy, index, 'raw')
    expect(rawEggs.origin).toEqual({ kind: 'own' })
    expect(rawEggs.status.id).toBe('pregnancy-avoid')
    expect(rawEggs.assessment?.summary).toBe('The guide says not to eat raw eggs or foods made with them.')
    expect(rawEggs.assessment?.citations[0].locator).toBe('Eggs: Raw eggs')

    for (const alias of ['hollandaise', 'caesar dressing', 'tiramisu', 'dressings containing mayonnaise', 'mousse', 'eggnog', 'egg flips']) {
      expect(entriesMatching(alias), `alias "${alias}" should reach exactly one guide entry`).toHaveLength(1)
    }
  })
})

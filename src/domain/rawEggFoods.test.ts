import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import { validateContent } from './contentValidation'
import { filterCategoryEntries, filterFoods } from './filtering'

const index = createContentIndex(content.categories, content.assessments)
const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const categoryById = (id: string) => content.categories.find((category) => category.id === id)!
const resolveFood = (id: string, list = pregnancy) => resolveAssessment({ kind: 'food', food: foodById(id) }, list, index)

const entriesMatching = (query: string) => [
  ...filterFoods(content.foods, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((food) => `food:${food.id}`),
  ...filterCategoryEntries(content.categories, content.guidanceLists, index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((category) => `category:${category.id}`),
]

describe('raw-egg foods surfaced where people browse for them', () => {
  it('places the new dessert and drinks subtrees inside the pregnancy coverage', () => {
    expect(pregnancy.coverage.categoryIds).toContain('desserts')
    expect(pregnancy.coverage.categoryIds).toContain('drinks')
    expect(categoryById('ice-cream').parentId).toBe('cold-desserts')
    expect(categoryById('fruit-juice-kombucha-and-cider').parentId).toBe('drinks')
  })

  it('fails coverage containment for the moved ice-cream rules when desserts leaves the coverage', () => {
    expect(() => validateContent({
      ...content,
      guidanceLists: content.guidanceLists.map((list) => (
        list.id === pregnancy.id
          ? { ...list, coverage: { ...list.coverage, categoryIds: list.coverage.categoryIds.filter((id) => id !== 'desserts') } }
          : list
      )),
    })).toThrow("outside its guidance list's declared coverage")
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
    const smoothies = resolveFood('smoothies')

    expect(smoothies.status.id).toBe('pregnancy-conditions')
    expect(smoothies.origin).toEqual({ kind: 'inherited', category: categoryById('home-made-drinks') })
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
    const packaged = resolveAssessment({ kind: 'category', category: categoryById('packaged-ice-cream') }, pregnancy, index)

    expect(packaged.status.id).toBe('pregnancy-ok')
    expect(packaged.origin).toEqual({ kind: 'own' })
    expect(packaged.assessment?.citations[0].locator).toBe('Dairy: Butter; Ice cream — Packaged')
  })

  it('leaves the raw-eggs entry unchanged and moves its migrated aliases onto one entry each', () => {
    const rawEggs = resolveAssessment({ kind: 'category', category: categoryById('raw-eggs') }, pregnancy, index)
    expect(rawEggs.origin).toEqual({ kind: 'own' })
    expect(rawEggs.status.id).toBe('pregnancy-avoid')
    expect(rawEggs.assessment?.summary).toBe('The guide says not to eat raw eggs or foods made with them.')
    expect(rawEggs.assessment?.citations[0].locator).toBe('Eggs: Raw eggs')

    for (const alias of ['hollandaise', 'caesar dressing', 'tiramisu', 'dressings containing mayonnaise', 'mousse', 'eggnog', 'egg flips']) {
      expect(entriesMatching(alias), `alias "${alias}" should reach exactly one guide entry`).toHaveLength(1)
    }
  })
})

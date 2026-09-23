import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'

const index = createContentIndex(content.categories, content.assessments)
const vegetarian = content.guidanceLists.find((list) => list.id === 'vegetarian-suitability')!

const expectedFoodAssessments = [
  ['sour-cream', 'cream', 'vegetarian-check-ingredients'],
  ['curry-paste', 'sauces-dressings-and-spreads', 'vegetarian-check-ingredients'],
  ['caesar-dressing', 'sauces-dressings-and-spreads', 'vegetarian-check-ingredients'],
  ['pesto', 'sauces-dressings-and-spreads', 'vegetarian-check-ingredients'],
  ['gravy', 'sauces-dressings-and-spreads', 'vegetarian-check-ingredients'],
  ['kimchi', 'miscellaneous', 'vegetarian-check-ingredients'],
  ['miso-soup', 'soups', 'vegetarian-check-ingredients'],
  ['refried-beans', 'miscellaneous', 'vegetarian-check-ingredients'],
  ['instant-noodles-and-flavour-sachets', 'cereals', 'vegetarian-check-ingredients'],
  ['risotto-and-prepared-rice-dishes', 'cereals', 'vegetarian-check-ingredients'],
  ['fresh-filled-pasta', 'cereals', 'vegetarian-check-ingredients'],
  ['flavoured-potato-chips-and-savoury-snacks', 'miscellaneous', 'vegetarian-check-ingredients'],
  ['breakfast-cereals', 'cereals', 'vegetarian-check-ingredients'],
  ['mousse', 'cold-desserts', 'vegetarian-check-ingredients'],
  ['cheesecake', 'cold-desserts', 'vegetarian-check-ingredients'],
  ['doughnuts-and-pastries', 'breads', 'vegetarian-check-ingredients'],
  ['stock-cubes-and-powdered-stock', 'ingredients-and-additives', 'vegetarian-check-ingredients'],
  ['animal-derived-rennet', 'ingredients-and-additives', 'vegetarian-animal-derived'],
  ['rennet', 'ingredients-and-additives', 'vegetarian-check-ingredients'],
  ['isinglass', 'ingredients-and-additives', 'vegetarian-animal-derived'],
  ['lard', 'ingredients-and-additives', 'vegetarian-animal-derived'],
  ['suet', 'ingredients-and-additives', 'vegetarian-animal-derived'],
] as const

describe('maintainer-reviewed vegetarian guidance', () => {
  it.each(expectedFoodAssessments)('authors %s under its natural catalogue group', (foodId, categoryId, statusId) => {
    const food = content.foods.find((candidate) => candidate.id === foodId)
    expect(food).toBeDefined()
    expect(food!.primaryCategoryId).toBe(categoryId)

    const resolved = resolveAssessment({ kind: 'food', food: food! }, vegetarian, index)
    expect(resolved.origin).toEqual({ kind: 'own' })
    expect(resolved.status.id).toBe(statusId)
    expect(resolved.assessment?.citations).toEqual([])
  })

  it.each([
    ['stuffing', 'vegetarian-check-ingredients', 'Applies to all stuffing.'],
    ['ice-cream', 'vegetarian-check-ingredients', 'Applies to all ice cream.'],
    ['soups', 'vegetarian-check-ingredients', 'Applies to all soups.'],
  ] as const)('authors %s as a category-wide guide entry', (categoryId, statusId, scopeStatement) => {
    const category = content.categories.find((candidate) => candidate.id === categoryId)!
    const resolved = resolveAssessment({ kind: 'category', category }, vegetarian, index)

    expect(resolved.origin).toEqual({ kind: 'own' })
    expect(resolved.status.id).toBe(statusId)
    expect(resolved.assessment?.scopeStatement).toBe(scopeStatement)
    expect(resolved.assessment?.citations).toEqual([])
  })

  it('keeps generic soups guidance while retaining miso soup’s specific rule', () => {
    const soups = content.categories.find((category) => category.id === 'soups')!
    const misoSoup = content.foods.find((food) => food.id === 'miso-soup')!

    const soupsGuidance = resolveAssessment({ kind: 'category', category: soups }, vegetarian, index)
    const misoSoupGuidance = resolveAssessment({ kind: 'food', food: misoSoup }, vegetarian, index)

    expect(content.foods.some((food) => food.id === 'vegetable-soup')).toBe(false)
    expect(soupsGuidance.origin).toEqual({ kind: 'own' })
    expect(soupsGuidance.assessment?.summary).toBe(
      'Soups can be made with meat or fish stock, so check the stock used.',
    )
    expect(misoSoupGuidance.origin).toEqual({ kind: 'own' })
    expect(misoSoupGuidance.assessment?.summary).toBe('Miso soup can be made with fish-based dashi, so check the ingredients.')
  })

  it('uses the maintainer-approved fresh filled pasta wording', () => {
    const assessment = content.assessments.find((candidate) => candidate.id === 'fresh-filled-pasta-vegetarian')

    expect(assessment?.summary).toBe(
      'Fresh filled pasta can contain cheese made with animal-derived rennet, so check the ingredients.',
    )
  })

  it('links composite foods to canonical animal-derived ingredients without inferring status', () => {
    const cheesecake = content.assessments.find((assessment) => assessment.id === 'cheesecake-vegetarian')!
    const doughnuts = content.assessments.find((assessment) => assessment.id === 'doughnuts-and-pastries-vegetarian')!

    expect(cheesecake.reasonLinks.map((link) => link.targetFoodId)).toEqual(['gelatin', 'animal-derived-rennet'])
    expect(doughnuts.reasonLinks.map((link) => link.targetFoodId)).toEqual(['lard', 'suet'])
  })

  it('does not add the rejected colour and glazing ingredients', () => {
    expect(content.foods.some((food) => ['cochineal', 'carmine', 'shellac'].includes(food.id))).toBe(false)
    expect(content.assessments.some((assessment) => /cochineal|carmine|shellac/.test(assessment.id))).toBe(false)
  })
})

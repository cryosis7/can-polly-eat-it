import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
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

const resolveMatch = (match: string) => {
  const [kind, id] = match.split(/:(.*)/s)
  return kind === 'food'
    ? resolveAssessment({ kind: 'food', food: foodById(id) }, pregnancy, index)
    : resolveAssessment({ kind: 'category', category: categoryById(id) }, pregnancy, index)
}

describe('guidance lifted onto categories', () => {
  it('makes the merged pasteurised cheese foods inherit one rule with its origin disclosed', () => {
    for (const foodId of ['cottage-cheese', 'cream-cheese']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'inherited', category: categoryById('pasteurised-cottage-and-cream-cheese') })
      expect(resolved.assessment?.scopeStatement).toBe(
        'Applies to pasteurised cottage cheese, cream cheese and similar pasteurised cheese.',
      )
      expect(resolved.assessment?.citations[0].locator).toBe('Dairy: Cheese — Pasteurised cottage cheese, cream cheese, etc')
      expect(resolved.assessment?.subject).toEqual({ kind: 'category', categoryId: 'pasteurised-cottage-and-cream-cheese' })
    }
  })

  it('inherits the open-ended cereals rule while fresh filled pasta keeps its own override', () => {
    for (const foodId of ['breakfast-cereals', 'rice', 'pasta']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'inherited', category: categoryById('cereals') })
      expect(resolved.status.id).toBe('pregnancy-ok')
    }

    const freshFilledPasta = resolveFood('fresh-filled-pasta')
    expect(freshFilledPasta.origin).toEqual({ kind: 'own' })
    expect(freshFilledPasta.status.id).toBe('pregnancy-conditions')
    expect(freshFilledPasta.assessment?.citations[0].locator).toBe('Breads and cereals: Cereals')
  })

  it('lifts the freshly cooked seafood group rule onto its category so the footnote can add to it', () => {
    expect(content.foods.some((food) => food.id === 'freshly-cooked-seafood')).toBe(false)
    expect(index.assessedCategoryIds.has('freshly-cooked-seafood')).toBe(true)

    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'own' })
      expect(resolved.assessment?.citations[0].locator).toBe('Seafood footnote: Bluff and Pacific oysters and queen scallops')
    }
  })

  it('keeps the migrated pasteurised yoghurt entry independent in each guidance list', () => {
    const category = categoryById('pasteurised-yoghurt')

    const pregnancyResolved = resolveAssessment({ kind: 'category', category }, pregnancy, index)
    expect(pregnancyResolved.origin).toEqual({ kind: 'own' })
    expect(pregnancyResolved.status.id).toBe('pregnancy-conditions')
    expect(pregnancyResolved.assessment?.citations[0].title).toContain('New Zealand Food Safety')

    const vegetarianResolved = resolveAssessment({ kind: 'category', category }, vegetarian, index)
    expect(vegetarianResolved.origin).toEqual({ kind: 'own' })
    expect(vegetarianResolved.status.id).toBe('vegetarian-check-ingredients')
    expect(vegetarianResolved.assessment?.citations[0].title).toContain('Veggy Malta')
  })

  it('splits the sprouts mirror into two foods that both inherit the single authored rule', () => {
    for (const foodId of ['seed-sprouts', 'enoki-mushrooms']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'inherited', category: categoryById('sprouts-and-enoki-mushrooms') })
      expect(resolved.assessment?.summary).toBe('Do not eat these raw; cook them first.')
    }
  })

  it('keeps the commercial sauces rule on its own qualified child category', () => {
    const commercial = categoryById('commercial-sauces-dressings-and-spreads')
    expect(commercial.parentId).toBe('sauces-dressings-and-spreads')
    expect(resolveAssessment({ kind: 'category', category: commercial }, pregnancy, index).origin).toEqual({ kind: 'own' })
    expect(index.assessedCategoryIds.has('sauces-dressings-and-spreads')).toBe(false)
  })

  it('reaches each migrated alias on one assessed entry, and never on entries with differing guidance', () => {
    const migratedAliases = [
      'mince',
      'raw chicken',
      'cold smoked fish',
      'cooked leftovers',
      'Chicken or turkey stuffing',
      'commercial mayonnaise',
      'karengo',
      'alfalfa sprouts',
      'pasteurised yogurt',
    ]

    for (const alias of migratedAliases) {
      const matches = entriesMatching(alias)
      expect(matches.length, `alias "${alias}" should reach at least one guide entry`).toBeGreaterThan(0)

      const assessedMatches = matches.filter((match) => resolveMatch(match).origin.kind === 'own')
      expect(assessedMatches.length, `alias "${alias}" should reach no more than one assessed guide entry`)
        .toBeLessThanOrEqual(1)

      const guidance = matches.map((match) => {
        const resolved = resolveMatch(match)
        return `${resolved.status.id}|${resolved.assessment?.summary ?? ''}`
      })
      expect(new Set(guidance).size, `alias "${alias}" reaches entries with differing guidance`).toBe(1)
    }
  })

  it('retires every mirror food while keeping its guidance on the category it mirrored', () => {
    const retiredWithCategoryEntry: [string, string][] = [
      ['butter', 'butter'],
      ['cooked-eggs', 'cooked-eggs'],
      ['leftover-cooked-foods', 'leftover-cooked-foods'],
      ['raw-eggs-and-raw-egg-foods', 'raw-eggs'],
      ['chicken-or-turkey-stuffing', 'stuffing'],
    ]

    for (const [retiredFoodId, categoryId] of retiredWithCategoryEntry) {
      expect(content.foods.some((food) => food.id === retiredFoodId)).toBe(false)
      expect(index.assessedCategoryIds.has(categoryId)).toBe(true)
    }
  })
})

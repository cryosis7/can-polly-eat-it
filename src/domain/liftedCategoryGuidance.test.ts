import { describe, expect, it } from 'vitest'
import { content, contentIndex as index } from '../data'
import { resolveAssessment } from './assessment'
import { filterCategoryEntries, filterFoods } from './filtering'

const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const categoryById = (id: string) => content.categories.find((category) => category.id === id)!
const resolveFood = (id: string, list = pregnancy) => resolveAssessment({ kind: 'food', food: foodById(id) }, list, index)

const entriesMatching = (query: string) => [...new Set([
  ...filterFoods(index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `food:${row.food.id}`),
  ...filterCategoryEntries(index, { query, guidanceListIds: [], outcomeBands: [] })
    .map((row) => `category:${row.category.id}`),
])]

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
    expect(content.foods.some((food) => food.id === 'seafood')).toBe(false)
    expect(index.isCategoryAssessed('seafood')).toBe(true)

    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'own' })
      expect(resolved.assessment?.citations[0].locator).toBe('Seafood footnote: Bluff and Pacific oysters and queen scallops')
    }
  })

  it('keeps the migrated pasteurised yoghurt entry independent in each guidance list', () => {
    const category = categoryById('yoghurt')

    // Both authorities scoped their yoghurt rule to the pasteurised state, so each is reached on
    // that axis. They stay independent: neither list's wording or citation leaks into the other.
    const pregnancyResolved = resolveAssessment({ kind: 'category', category }, pregnancy, index, 'pasteurised')
    expect(pregnancyResolved.origin).toEqual({ kind: 'own' })
    expect(pregnancyResolved.status.id).toBe('pregnancy-conditions')
    expect(pregnancyResolved.assessment?.citations[0].title).toContain('New Zealand Food Safety')

    const vegetarianResolved = resolveAssessment({ kind: 'category', category }, vegetarian, index, 'pasteurised')
    expect(vegetarianResolved.origin).toEqual({ kind: 'own' })
    expect(vegetarianResolved.status.id).toBe('vegetarian-check-ingredients')
    expect(vegetarianResolved.assessment?.citations).toEqual([])
  })

  it('splits the sprouts mirror into two foods that both inherit the single authored rule', () => {
    for (const foodId of ['seed-sprouts', 'enoki-mushrooms']) {
      const resolved = resolveFood(foodId)
      expect(resolved.origin).toEqual({ kind: 'inherited', category: categoryById('sprouts-and-enoki-mushrooms') })
      expect(resolved.assessment?.summary).toBe('Do not eat these raw; cook them first.')
    }
  })

  it('keeps the commercial and home-made sauce rules apart on the surviving parent', () => {
    const sauces = categoryById('sauces-dressings-and-spreads')
    expect(sauces.parentId).toBe('miscellaneous')

    const commercial = resolveAssessment({ kind: 'category', category: sauces }, pregnancy, index, 'store-bought')
    const homeMade = resolveAssessment({ kind: 'category', category: sauces }, pregnancy, index, 'home-made')

    expect(commercial.origin).toEqual({ kind: 'own' })
    expect(homeMade.origin).toEqual({ kind: 'own' })
    expect(commercial.assessment?.summary).toContain('manufacturer storage')
    expect(homeMade.assessment?.summary).toContain('raw egg')
  })

  it('reaches each migrated alias on one assessed entry, and never on entries with differing guidance', () => {
    // Aliases that named a whole food group. An alias moved onto a broad surviving parent, such as
    // the seafood smoking aliases, now reaches every food beneath it and is covered separately.
    const migratedAliases = [
      'mince',
      'raw chicken',
      'cooked leftovers',
      'Chicken or turkey stuffing',
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

  it('retires every mirror food while keeping its guidance on the subject it mirrored', () => {
    const retiredWithCategoryEntry: [string, string][] = [
      ['butter', 'butter'],
      ['cooked-eggs', 'eggs'],
      ['leftover-cooked-foods', 'leftover-cooked-foods'],
      ['raw-eggs-and-raw-egg-foods', 'eggs'],
      ['chicken-or-turkey-stuffing', 'stuffing'],
    ]

    for (const [retiredFoodId, categoryId] of retiredWithCategoryEntry) {
      expect(content.foods.some((food) => food.id === retiredFoodId)).toBe(false)
      expect(index.isCategoryAssessed(categoryId), categoryId).toBe(true)
    }
  })
})

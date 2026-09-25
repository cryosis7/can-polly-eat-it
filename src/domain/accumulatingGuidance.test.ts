import { describe, expect, it } from 'vitest'
import { content, contentIndex as index } from '../data'
import { resolveAssessment } from './assessment'

const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const resolveFood = (id: string, list = pregnancy, preparationId?: string) =>
  resolveAssessment({ kind: 'food', food: foodById(id) }, list, index, preparationId)

describe('guidance that accumulates across subject levels', () => {
  // The group's cooking rule is now scoped to the cooked state, so the accumulation happens on the
  // cooked row rather than on a preparation-free answer. Both layers still appear whole, which is
  // what the footnote's `adds-to` relation exists to guarantee.
  it('gives the footnoted shellfish both the group cooking rule and their own serving limit', () => {
    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      const resolved = resolveFood(foodId, pregnancy, 'cooked')

      expect(resolved.layers.map((layer) => layer.assessment.citations[0].locator), foodId).toEqual([
        'Seafood footnote: Bluff and Pacific oysters and queen scallops',
        'Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc',
      ])
      expect(resolved.layers.flatMap((layer) =>
        layer.assessment.guidanceScenarios.flatMap((scenario) =>
          scenario.conditions.map((condition) => condition.instruction))), foodId)
        .toEqual(['Have no more than one serving per month.', 'Cook above 75°C throughout.'])
      expect(resolved.status.id, foodId).toBe('pregnancy-conditions')
    }
  })

  it('keeps the retired seafood group rule authored once, now scoped to the cooked state', () => {
    expect(content.foods.some((food) => food.id === 'seafood')).toBe(false)

    const category = content.categories.find((candidate) => candidate.id === 'seafood')!
    const resolved = resolveAssessment({ kind: 'category', category }, pregnancy, index, 'cooked')
    expect(resolved.origin).toEqual({ kind: 'own' })
    expect(resolved.assessment?.scopeStatement).toBe(
      'Applies to all freshly cooked fish, mussels, oysters, crayfish and scallops.',
    )
  })

  it('keeps every non-additive override a single layer, including Parmesan in the vegetarian scope', () => {
    const parmesan = resolveFood('parmesan', vegetarian)
    expect(parmesan.layers).toHaveLength(1)
    expect(parmesan.origin).toEqual({ kind: 'own' })

    expect(resolveFood('mussels').layers).toHaveLength(1)
    expect(resolveFood('fresh-filled-pasta').layers).toHaveLength(1)
  })

  it('accumulates only within one guidance list', () => {
    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      for (const layer of resolveFood(foodId).layers) {
        expect(layer.assessment.guidanceListId, foodId).toBe(pregnancy.id)
      }
    }
  })
})

import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'

const index = createContentIndex(content.categories, content.assessments)
const pregnancy = content.guidanceLists[0]
const vegetarian = content.guidanceLists[1]

const foodById = (id: string) => content.foods.find((food) => food.id === id)!
const resolveFood = (id: string, list = pregnancy) => resolveAssessment({ kind: 'food', food: foodById(id) }, list, index)

describe('guidance that accumulates across subject levels', () => {
  it('gives the footnoted shellfish both the group cooking rule and their own serving limit', () => {
    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      const resolved = resolveFood(foodId)

      expect(resolved.layers.map((layer) => layer.assessment.citations[0].locator), foodId).toEqual([
        'Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc',
        'Seafood footnote: Bluff and Pacific oysters and queen scallops',
      ])
      expect(resolved.layers[0].assessment.guidanceScenarios[0].conditions[0].instruction, foodId)
        .toBe('Cook above 75°C throughout.')
      expect(resolved.layers[1].assessment.guidanceScenarios[0].conditions[0].instruction, foodId)
        .toBe('Have no more than one serving per month.')
      expect(resolved.status.id, foodId).toBe('pregnancy-conditions')
      expect(resolved.origin, foodId).toEqual({ kind: 'own' })
    }
  })

  it('leaves the retired mirror food behind, with its rule authored once on the category', () => {
    expect(content.foods.some((food) => food.id === 'freshly-cooked-seafood')).toBe(false)

    const category = content.categories.find((candidate) => candidate.id === 'freshly-cooked-seafood')!
    const resolved = resolveAssessment({ kind: 'category', category }, pregnancy, index)
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

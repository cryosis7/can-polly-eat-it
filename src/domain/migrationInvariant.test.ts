import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { preMigrationResolution } from '../test/preMigrationResolution'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'

type ResolvedOutcome = {
  statusId: string
  summary: string | null
  scenarios: { applicability: string, instruction: string, conditions: { kind: string, instruction: string }[] }[]
  citations: { title: string, url: string, locator: string }[]
}

/**
 * Foods retired by the F-12 migration, whose guidance moved onto the category they mirrored.
 */
const retiredFoodIds = [
  'brown-seaweed',
  'butter',
  'canned-foods',
  'chicken-or-turkey-stuffing',
  'chilled-smoked-or-pre-cooked-seafood',
  'cold-cooked-poultry',
  'commercial-sauces-dressings-and-spreads',
  'cooked-eggs',
  'cooked-meat-and-poultry',
  'cream',
  'dried-herbs',
  'fresh-fruit',
  'fresh-herbs',
  'fresh-vegetables',
  'frozen-vegetables',
  'home-made-custard',
  'home-made-salads',
  'home-made-sushi',
  'hummus-and-tahini-dips',
  'imported-frozen-berries',
  'leftover-cooked-foods',
  'packaged-ice-cream',
  'pasteurised-fruit-juice-kombucha-and-cider',
  'pasteurised-milk',
  'pasteurised-yoghurt',
  'pre-packaged-and-ready-made-salads',
  'processed-meats',
  'raw-eggs-and-raw-egg-foods',
  'raw-fish',
  'raw-meat-and-poultry',
  'raw-shellfish',
  'ready-made-chilled-custard',
  'red-and-green-seaweed',
  'seed-sprouts-and-enoki-mushrooms',
  'soft-serve-ice-cream',
  'store-bought-sushi',
  'unpasteurised-fruit-juice-kombucha-and-cider',
  'unpasteurised-milk-and-dairy-products',
]

/**
 * Foods introduced by the F-12 migration, each inheriting the rule of the mirror food it replaces.
 */
const introducedFoodIds: { id: string, inheritsFrom: string }[] = [
  { id: 'enoki-mushrooms', inheritsFrom: 'seed-sprouts-and-enoki-mushrooms' },
  { id: 'seed-sprouts', inheritsFrom: 'seed-sprouts-and-enoki-mushrooms' },
]

const baseline: Record<string, Record<string, ResolvedOutcome>> = preMigrationResolution

const index = createContentIndex(content.categories, content.assessments)

const resolveForFood = (foodId: string): Record<string, ResolvedOutcome> => {
  const food = content.foods.find((candidate) => candidate.id === foodId)!
  const outcomes: Record<string, ResolvedOutcome> = {}
  for (const guidanceList of content.guidanceLists) {
    const resolved = resolveAssessment({ kind: 'food', food }, guidanceList, index)
    outcomes[guidanceList.id] = {
      statusId: resolved.status.id,
      summary: resolved.assessment?.summary ?? null,
      scenarios: (resolved.assessment?.guidanceScenarios ?? []).map((scenario) => ({
        applicability: scenario.applicability,
        instruction: scenario.instruction,
        conditions: scenario.conditions.map((condition) => ({
          kind: condition.kind,
          instruction: condition.instruction,
        })),
      })),
      citations: (resolved.assessment?.citations ?? []).map((citation) => ({
        title: citation.title,
        url: citation.url,
        locator: citation.locator,
      })),
    }
  }
  return outcomes
}

describe('guidance migration invariant', () => {
  const currentFoodIds = new Set(content.foods.map((food) => food.id))
  const baselineFoodIds = Object.keys(baseline)

  it('resolves every retained food to its pre-migration guidance, ignoring synthetic record ids', () => {
    for (const foodId of baselineFoodIds) {
      if (!currentFoodIds.has(foodId)) {
        continue
      }
      expect(resolveForFood(foodId), `guidance changed for "${foodId}"`).toEqual(baseline[foodId])
    }
  })

  it('retires exactly the expected foods and introduces exactly the expected replacements', () => {
    const departed = baselineFoodIds.filter((foodId) => !currentFoodIds.has(foodId))
    const arrived = [...currentFoodIds].filter((foodId) => !(foodId in baseline))
    expect([...departed].sort()).toEqual([...retiredFoodIds].sort())
    expect([...arrived].sort()).toEqual(introducedFoodIds.map((entry) => entry.id).sort())
  })

  it('gives each introduced food the guidance of the mirror food it replaces', () => {
    for (const { id, inheritsFrom } of introducedFoodIds) {
      expect(resolveForFood(id), `guidance changed for introduced food "${id}"`).toEqual(baseline[inheritsFrom])
    }
  })
})

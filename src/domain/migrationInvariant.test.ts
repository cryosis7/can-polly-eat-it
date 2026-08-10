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
  'freshly-cooked-seafood',
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

/**
 * Foods introduced by F-13, which surfaces the raw-egg foods the source names as browsable
 * entries. They have no pre-migration baseline, because each existed only as an alias string.
 */
const rawEggFoodIds = [
  'caesar-dressing',
  'egg-flips',
  'eggnog',
  'hollandaise-sauce',
  'mayonnaise',
  'mousse',
  'smoothies',
  'tiramisu',
]

/**
 * Foods whose guidance F-13, F-14 and F-16 deliberately change. Panna cotta moves from a root outside
 * pregnancy coverage into `Cold desserts`, which is inside it. The two footnoted shellfish gain the
 * group's cooking instruction as a second layer, which F-16 exists to surface. Tortillas and
 * Worcestershire sauce leave the retired animal-derived root for real food groups that carry their
 * own cited pregnancy rule, so each inherits that rule instead of the not-assessed fallback. Every
 * one of these changes is asserted explicitly below rather than merely exempted.
 */
const intentionallyChangedFoodIds = [
  'panna-cotta',
  'bluff-and-pacific-oysters',
  'queen-scallops',
  'tortillas',
  'worcestershire-sauce',
]

/**
 * Statuses retired by F-15, which collapsed the two grey fallback states into one. A baseline entry
 * naming one of these recorded "this list has no rule for this food", which is exactly what the
 * surviving `not-assessed` status now says. Normalising here keeps the invariant meaningful, rather
 * than exempting the hundred-odd foods the collapse touches; the collapse itself is proven by the
 * dedicated test below.
 */
const retiredFallbackStatusIds: Record<string, string> = {
  'pregnancy-outside-coverage': 'pregnancy-not-assessed',
  'vegetarian-outside-coverage': 'vegetarian-not-assessed',
}

const normaliseBaseline = (outcomes: Record<string, ResolvedOutcome>): Record<string, ResolvedOutcome> =>
  Object.fromEntries(Object.entries(outcomes).map(([listId, outcome]) => [
    listId,
    { ...outcome, statusId: retiredFallbackStatusIds[outcome.statusId] ?? outcome.statusId },
  ]))

const baseline: Record<string, Record<string, ResolvedOutcome>> = Object.fromEntries(
  Object.entries(preMigrationResolution).map(([foodId, outcomes]) => [foodId, normaliseBaseline(outcomes)]),
)

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
      if (!currentFoodIds.has(foodId) || intentionallyChangedFoodIds.includes(foodId)) {
        continue
      }
      expect(resolveForFood(foodId), `guidance changed for "${foodId}"`).toEqual(baseline[foodId])
    }
  })

  it('retires exactly the expected foods and introduces exactly the expected replacements', () => {
    const departed = baselineFoodIds.filter((foodId) => !currentFoodIds.has(foodId))
    const arrived = [...currentFoodIds].filter((foodId) => !(foodId in baseline))
    expect([...departed].sort()).toEqual([...retiredFoodIds].sort())
    expect([...arrived].sort()).toEqual([...introducedFoodIds.map((entry) => entry.id), ...rawEggFoodIds].sort())
  })

  it('gives each introduced food the guidance of the mirror food it replaces', () => {
    for (const { id, inheritsFrom } of introducedFoodIds) {
      expect(resolveForFood(id), `guidance changed for introduced food "${id}"`).toEqual(baseline[inheritsFrom])
    }
  })

  it('changes panna cotta only in the way F-13 declares, leaving its vegetarian guidance intact', () => {
    const before = baseline['panna-cotta']
    const after = resolveForFood('panna-cotta')

    expect(before['pregnancy-food-safety'].statusId).toBe('pregnancy-not-assessed')
    expect(after['pregnancy-food-safety'].statusId).toBe('pregnancy-conditions')
    expect(after['vegetarian-suitability']).toEqual(before['vegetarian-suitability'])
  })

  it('changes the footnoted shellfish only by adding the group layer F-16 exists to surface', () => {
    for (const foodId of ['bluff-and-pacific-oysters', 'queen-scallops']) {
      const before = baseline[foodId]['pregnancy-food-safety']
      const after = resolveForFood(foodId)['pregnancy-food-safety']

      expect(after.statusId, foodId).toBe(before.statusId)
      expect(after.summary, foodId).toBe(before.summary)
      expect(after.scenarios, foodId).toEqual(before.scenarios)
      expect(after.citations, foodId).toEqual(before.citations)
    }
  })

  it('changes the two F-14 foods only by inheriting their new group rule, leaving vegetarian guidance intact', () => {
    // Worcestershire sauce now declares `store-bought`, so its inherited rule lives on that row
    // rather than on a preparation-free resolution. F-18's wordingPreservation.test.ts proves the
    // rule itself is unchanged; this asserts it is still reached.
    const inheritedPregnancyRule: Record<string, { statusId: string, locator: string, preparationId?: string }> = {
      tortillas: { statusId: 'pregnancy-ok', locator: 'Breads and cereals: Breads' },
      'worcestershire-sauce': {
        statusId: 'pregnancy-conditions',
        locator: 'Miscellaneous: Sauces, dressings and spreads',
        preparationId: 'store-bought',
      },
    }

    for (const [foodId, expected] of Object.entries(inheritedPregnancyRule)) {
      const before = baseline[foodId]
      const food = content.foods.find((candidate) => candidate.id === foodId)!
      const list = content.guidanceLists.find((candidate) => candidate.id === 'pregnancy-food-safety')!
      const after = resolveAssessment({ kind: 'food', food }, list, index, expected.preparationId)

      expect(before['pregnancy-food-safety'].statusId, foodId).toBe('pregnancy-not-assessed')
      expect(after.status.id, foodId).toBe(expected.statusId)
      expect(after.layers.flatMap((layer) => layer.citations.map((citation) => citation.locator)), foodId)
        .toContain(expected.locator)
      expect(resolveForFood(foodId)['vegetarian-suitability'], foodId).toEqual(before['vegetarian-suitability'])
    }
  })

  it('leaves every other F-14 migrated food resolving exactly as it did before the move', () => {
    const unchangedByTheMove = [
      'apple-pie',
      'french-fries',
      'gelatin',
      'gummy-bears',
      'jelly',
      'marshmallows',
      'orange-juice',
      'starburst',
      'vegetable-soup',
      'white-sugar',
      'wine-and-beer',
    ]

    for (const foodId of unchangedByTheMove) {
      expect(resolveForFood(foodId), `guidance changed for migrated food "${foodId}"`)
        .toEqual(baseline[foodId])
      expect(resolveForFood(foodId)['pregnancy-food-safety'].statusId, foodId)
        .toBe('pregnancy-not-assessed')
    }
  })

  it('retires the animal-derived root without leaving any reference to it', () => {
    const retiredCategoryId = 'foods-that-may-contain-animal-derived-ingredients'

    expect(content.categories.some((category) => category.id === retiredCategoryId)).toBe(false)
    expect(content.categories.some((category) => category.parentId === retiredCategoryId)).toBe(false)
    expect(content.foods.some((food) => food.primaryCategoryId === retiredCategoryId)).toBe(false)
    expect(content.assessments.some((assessment) =>
      assessment.subject.kind === 'category' && assessment.subject.categoryId === retiredCategoryId,
    )).toBe(false)
  })

  it('collapses the retired outside-coverage state onto not-assessed and nothing else', () => {
    const retiredIds = Object.keys(retiredFallbackStatusIds)
    const affected = Object.entries(preMigrationResolution).filter(([, outcomes]) =>
      Object.values(outcomes).some((outcome) => retiredIds.includes(outcome.statusId)),
    )
    expect(affected.length).toBeGreaterThan(0)

    for (const list of content.guidanceLists) {
      expect(list.statuses.some((status) => retiredIds.includes(status.id))).toBe(false)
      expect(list.statuses.filter((status) => status.outcomeBand === 'not-assessed')).toHaveLength(1)
    }

    for (const food of content.foods) {
      for (const list of content.guidanceLists) {
        const resolved = resolveAssessment({ kind: 'food', food }, list, index)
        expect(retiredIds, food.id).not.toContain(resolved.status.id)
      }
    }
  })
})

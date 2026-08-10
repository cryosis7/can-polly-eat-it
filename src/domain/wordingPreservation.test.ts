import { describe, expect, it } from 'vitest'
import { content } from '../data'
import { preF18Resolution } from '../test/preF18Resolution'
import { resolveAssessment, type GuidanceLayer } from './assessment'
import { createContentIndex } from './contentIndex'

/**
 * The F-18 wording-preservation invariant.
 *
 * F-18 retires fifteen categories and moves species between them, so a subject-keyed pin of the
 * kind `migrationInvariant.test.ts` holds cannot survive by construction: the migration exists to
 * re-scope which layer applies to which row. What must not change is what the layers *say*.
 *
 * So this checks the stronger, honest thing. For every food and every guidance list, the union of
 * authored bodies across all of that food's rows — its declared preparations, or its bare
 * resolution where it declares none — must still contain every authored body that food resolved to
 * before the migration. Guidance may become more precisely scoped; it may never be lost, reworded,
 * or reattributed.
 */

const index = createContentIndex(content.categories, content.assessments)

const bodiesOf = (layers: GuidanceLayer[]): string[] => layers.flatMap((layer) => [
  ...(layer.assessment.summary === undefined ? [] : [`summary:${layer.assessment.summary}`]),
  ...(layer.assessment.scopeStatement === undefined ? [] : [`scope:${layer.assessment.scopeStatement}`]),
  ...layer.assessment.guidanceScenarios.flatMap((scenario) => [
    `scenario:${scenario.applicability}|${scenario.instruction}`,
    ...scenario.conditions.map((condition) => `condition:${condition.kind}|${condition.instruction}`),
  ]),
  ...layer.citations.map((citation) => `citation:${citation.title}|${citation.url}|${citation.locator}`),
])

/** Every authored body a food carries today, unioned across all the rows it now contributes. */
const bodiesAcrossRows = (foodId: string, guidanceListId: string): Set<string> => {
  const food = content.foods.find((candidate) => candidate.id === foodId)!
  const guidanceList = content.guidanceLists.find((candidate) => candidate.id === guidanceListId)!
  const axes: (string | undefined)[] = food.preparationIds.length === 0
    ? [undefined]
    : food.preparationIds

  return new Set(axes.flatMap((preparationId) =>
    bodiesOf(resolveAssessment({ kind: 'food', food }, guidanceList, index, preparationId).layers),
  ))
}

describe('F-18 wording preservation', () => {
  it('keeps every authored body every food resolved to before the migration', () => {
    for (const [foodId, byList] of Object.entries(preF18Resolution)) {
      if (!content.foods.some((food) => food.id === foodId)) {
        throw new Error(`food "${foodId}" disappeared; F-18 retires categories, never foods`)
      }
      for (const [guidanceListId, expectedBodies] of Object.entries(byList)) {
        const actual = bodiesAcrossRows(foodId, guidanceListId)
        const lost = expectedBodies.filter((body) => !actual.has(body))
        expect(lost, `guidance lost for "${foodId}" in "${guidanceListId}"`).toEqual([])
      }
    }
  })

  it('retires no food, because F-18 moves categories rather than removing guidance subjects', () => {
    const before = new Set(Object.keys(preF18Resolution))
    const after = new Set(content.foods.map((food) => food.id))

    expect([...before].filter((foodId) => !after.has(foodId))).toEqual([])
  })

  it('never authors a preparation qualifier onto an assessment whose subject cannot be eaten that way', () => {
    for (const assessment of content.assessments) {
      const { subject, preparationId } = assessment
      if (preparationId === undefined || subject.kind !== 'food') {
        continue
      }
      const food = content.foods.find((candidate) => candidate.id === subject.foodId)!
      expect(food.preparationIds, `"${food.id}" is assessed for a state it does not declare`)
        .toContain(preparationId)
    }
  })
})

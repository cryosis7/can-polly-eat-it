import { findAssessment, type ContentIndex } from './contentIndex'
import { getStatusById } from './contentValidation'
import type { Assessment, Category, Food, GuidanceList, StatusDefinition } from './schemas'

export type AssessmentSubjectRef =
  | { kind: 'food', food: Food }
  | { kind: 'category', category: Category }

export type AssessmentOrigin =
  | { kind: 'own' }
  | { kind: 'inherited', category: Category }
  | { kind: 'not-assessed' }

export type GuidanceLayer = {
  assessment: Assessment
  origin: AssessmentOrigin
}

export type ResolvedAssessment = {
  status: StatusDefinition
  assessment?: Assessment
  origin: AssessmentOrigin
  /**
   * Every authored assessment that applies, broadest ancestor first and ending with the nearest
   * one. Length 1 unless an assessment declares `relation: 'adds-to'`, and empty when nothing
   * applies. Layers are never merged; each keeps its own summary, scenarios, and citations.
   */
  layers: GuidanceLayer[]
}

export const isAdditive = (assessment: Assessment) => assessment.relation === 'adds-to'

/**
 * Walks towards the root collecting each assessed ancestor, stopping at and including the first
 * one that replaces rather than adds to the guidance it inherits.
 */
const collectAncestorLayers = (
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
): GuidanceLayer[] => {
  const layers: GuidanceLayer[] = []
  for (let position = ancestors.length - 1; position >= 0; position -= 1) {
    const category = ancestors[position]
    const assessment = findAssessment(index, guidanceList.id, { kind: 'category', categoryId: category.id })
    if (assessment) {
      layers.push({ assessment, origin: { kind: 'inherited', category } })
      if (!isAdditive(assessment)) {
        break
      }
    }
  }
  return layers
}

const resolveWithAncestors = (
  own: Assessment | undefined,
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
): ResolvedAssessment => {
  const nearest: GuidanceLayer[] = own ? [{ assessment: own, origin: { kind: 'own' } }] : []
  const ancestorLayers = own && !isAdditive(own)
    ? []
    : collectAncestorLayers(ancestors, guidanceList, index)
  const collected = [...nearest, ...ancestorLayers]

  if (collected.length === 0) {
    return {
      status: getStatusById(guidanceList, guidanceList.unassessedStatusId),
      origin: { kind: 'not-assessed' },
      layers: [],
    }
  }

  const nearestLayer = collected[0]
  return {
    status: getStatusById(guidanceList, nearestLayer.assessment.statusId),
    assessment: nearestLayer.assessment,
    origin: nearestLayer.origin,
    layers: [...collected].reverse(),
  }
}

export const resolveAssessment = (
  subjectRef: AssessmentSubjectRef,
  guidanceList: GuidanceList,
  index: ContentIndex,
): ResolvedAssessment => {
  if (subjectRef.kind === 'food') {
    const { food } = subjectRef
    return resolveWithAncestors(
      findAssessment(index, guidanceList.id, { kind: 'food', foodId: food.id }),
      index.tree.pathByCategoryId.get(food.primaryCategoryId) ?? [],
      guidanceList,
      index,
    )
  }

  const { category } = subjectRef
  return resolveWithAncestors(
    findAssessment(index, guidanceList.id, { kind: 'category', categoryId: category.id }),
    (index.tree.pathByCategoryId.get(category.id) ?? []).slice(0, -1),
    guidanceList,
    index,
  )
}

import { findAssessment, type ContentIndex } from './contentIndex'
import { getStatusById, isCategoryCovered, isFoodCovered } from './contentValidation'
import type { Assessment, Category, Food, GuidanceList, StatusDefinition } from './schemas'

export type AssessmentSubjectRef =
  | { kind: 'food', food: Food }
  | { kind: 'category', category: Category }

export type AssessmentOrigin =
  | { kind: 'own' }
  | { kind: 'inherited', category: Category }
  | { kind: 'coverage-fallback' }

export type ResolvedAssessment = {
  status: StatusDefinition
  assessment?: Assessment
  origin: AssessmentOrigin
}

const resolveFromAncestors = (
  ancestors: Category[],
  guidanceList: GuidanceList,
  index: ContentIndex,
): ResolvedAssessment | undefined => {
  for (let position = ancestors.length - 1; position >= 0; position -= 1) {
    const category = ancestors[position]
    const assessment = findAssessment(index, guidanceList.id, { kind: 'category', categoryId: category.id })
    if (assessment) {
      return { status: getStatusById(guidanceList, assessment.statusId), assessment, origin: { kind: 'inherited', category } }
    }
  }
  return undefined
}

export const resolveAssessment = (
  subjectRef: AssessmentSubjectRef,
  guidanceList: GuidanceList,
  index: ContentIndex,
): ResolvedAssessment => {
  if (subjectRef.kind === 'food') {
    const { food } = subjectRef
    const own = findAssessment(index, guidanceList.id, { kind: 'food', foodId: food.id })
    if (own) {
      return { status: getStatusById(guidanceList, own.statusId), assessment: own, origin: { kind: 'own' } }
    }
    const ancestors = index.tree.pathByCategoryId.get(food.primaryCategoryId) ?? []
    const inherited = resolveFromAncestors(ancestors, guidanceList, index)
    if (inherited) {
      return inherited
    }
    const statusId = isFoodCovered(food, guidanceList, index)
      ? guidanceList.unassessedStatusId
      : guidanceList.outOfCoverageStatusId
    return { status: getStatusById(guidanceList, statusId), origin: { kind: 'coverage-fallback' } }
  }

  const { category } = subjectRef
  const own = findAssessment(index, guidanceList.id, { kind: 'category', categoryId: category.id })
  if (own) {
    return { status: getStatusById(guidanceList, own.statusId), assessment: own, origin: { kind: 'own' } }
  }
  const ancestors = (index.tree.pathByCategoryId.get(category.id) ?? []).slice(0, -1)
  const inherited = resolveFromAncestors(ancestors, guidanceList, index)
  if (inherited) {
    return inherited
  }
  const statusId = isCategoryCovered(category, guidanceList, index)
    ? guidanceList.unassessedStatusId
    : guidanceList.outOfCoverageStatusId
  return { status: getStatusById(guidanceList, statusId), origin: { kind: 'coverage-fallback' } }
}

import { buildCategoryTree, type CategoryTree } from './categoryTree'
import type { Assessment, AssessmentSubject, Category } from './schemas'

export type ContentIndex = {
  tree: CategoryTree
  assessmentsBySubjectKey: Map<string, Assessment[]>
  assessedCategoryIds: Set<string>
}

export const subjectKey = (subject: AssessmentSubject): string =>
  subject.kind === 'food' ? `food:${subject.foodId}` : `category:${subject.categoryId}`

const groupAssessments = (assessments: Assessment[]): Map<string, Assessment[]> => {
  const grouped = new Map<string, Assessment[]>()
  for (const assessment of assessments) {
    const key = `${assessment.guidanceListId}:${subjectKey(assessment.subject)}`
    const existing = grouped.get(key)
    if (existing) {
      existing.push(assessment)
    } else {
      grouped.set(key, [assessment])
    }
  }
  return grouped
}

export const createContentIndex = (categories: Category[], assessments: Assessment[]): ContentIndex => ({
  tree: buildCategoryTree(categories),
  assessmentsBySubjectKey: groupAssessments(assessments),
  assessedCategoryIds: new Set(
    assessments
      .filter((assessment) => assessment.subject.kind === 'category')
      .map((assessment) => (assessment.subject as { kind: 'category', categoryId: string }).categoryId),
  ),
})

/**
 * Every authored assessment for a subject in a list on one axis, in authored order.
 *
 * Without a preparation, this is the unqualified guidance that holds however the subject is
 * prepared. With one, it is the guidance qualified by that preparation. The two are deliberately
 * separate axes: a food's own food-wide rule must not suppress its group's rule for a particular
 * preparation, and a preparation rule must not suppress a food-wide rule, because neither is more
 * specific than the other. Callers resolve each axis and show both whole.
 */
export const findAssessments = (
  index: ContentIndex,
  guidanceListId: string,
  subject: AssessmentSubject,
  preparationId?: string,
): Assessment[] => (index.assessmentsBySubjectKey.get(`${guidanceListId}:${subjectKey(subject)}`) ?? [])
  .filter((assessment) => assessment.preparationId === preparationId)

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
 * Every authored assessment for a subject in a list — one per source that assessed it, in authored
 * order. Empty when no source has assessed the subject.
 */
export const findAssessments = (
  index: ContentIndex,
  guidanceListId: string,
  subject: AssessmentSubject,
): Assessment[] => index.assessmentsBySubjectKey.get(`${guidanceListId}:${subjectKey(subject)}`) ?? []

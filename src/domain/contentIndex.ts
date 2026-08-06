import { buildCategoryTree, type CategoryTree } from './categoryTree'
import type { Assessment, AssessmentSubject, Category } from './schemas'

export type ContentIndex = {
  tree: CategoryTree
  assessmentsBySubjectKey: Map<string, Assessment>
  assessedCategoryIds: Set<string>
}

export const subjectKey = (subject: AssessmentSubject): string =>
  subject.kind === 'food' ? `food:${subject.foodId}` : `category:${subject.categoryId}`

export const createContentIndex = (categories: Category[], assessments: Assessment[]): ContentIndex => ({
  tree: buildCategoryTree(categories),
  assessmentsBySubjectKey: new Map(
    assessments.map((assessment) => [`${assessment.guidanceListId}:${subjectKey(assessment.subject)}`, assessment]),
  ),
  assessedCategoryIds: new Set(
    assessments
      .filter((assessment) => assessment.subject.kind === 'category')
      .map((assessment) => (assessment.subject as { kind: 'category', categoryId: string }).categoryId),
  ),
})

export const findAssessment = (
  index: ContentIndex,
  guidanceListId: string,
  subject: AssessmentSubject,
): Assessment | undefined => index.assessmentsBySubjectKey.get(`${guidanceListId}:${subjectKey(subject)}`)

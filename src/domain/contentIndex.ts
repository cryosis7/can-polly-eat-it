import { buildCategoryTree, preparationIdsByCategoryId, type CategoryTree } from './categoryTree'
import type { ContentData, ValidatedContent } from './contentValidation'
import type { Assessment, AssessmentSubject, Category, Food, GuidanceList, Preparation, Source } from './schemas'

export type ContentIndex = {
  tree: CategoryTree
  assessmentsBySubjectKey: Map<string, Assessment[]>
  assessedCategoryIds: Set<string>
  foods: readonly Food[]
  categories: readonly Category[]
  guidanceLists: readonly GuidanceList[]
  sources: readonly Source[]
  /** The preparation vocabulary in display order. */
  preparations: readonly Preparation[]
  foodById: (id: string) => Food
  categoryById: (id: string) => Category
  sourceById: (id: string) => Source
  preparationById: (id: string) => Preparation
  foodBySlug: (slug: string) => Food | undefined
  categoryBySlug: (slug: string) => Category | undefined
  guidanceListBySlug: (slug: string) => GuidanceList | undefined
  preparationBySlug: (slug: string) => Preparation | undefined
  /**
   * Every authored assessment for a subject in a list on one axis, in authored order.
   *
   * Without a preparation, this is the unqualified guidance that holds however the subject is
   * prepared. With one, it is the guidance qualified by that preparation. The two are deliberately
   * separate axes: a food's own food-wide rule must not suppress its group's rule for a particular
   * preparation, and a preparation rule must not suppress a food-wide rule, because neither is more
   * specific than the other. Callers resolve each axis and show both whole.
   */
  assessmentsFor: (guidanceListId: string, subject: AssessmentSubject, preparationId?: string) => Assessment[]
  /** The union of the states its own foods declare and its own qualified assessments, in vocabulary order. */
  preparationStatesFor: (categoryId: string) => readonly Preparation[]
  isCategoryAssessed: (categoryId: string) => boolean
}

const lookupById = <T extends { id: string }>(items: readonly T[], label: string) => {
  const itemsById = new Map(items.map((item) => [item.id, item]))
  return (id: string): T => {
    const item = itemsById.get(id)
    if (item === undefined) {
      throw new Error(`Unknown ${label} "${id}".`)
    }
    return item
  }
}

const lookupBySlug = <T extends { slug: string }>(items: readonly T[]) => {
  const itemsBySlug = new Map(items.map((item) => [item.slug, item]))
  return (slug: string): T | undefined => itemsBySlug.get(slug)
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

export function createContentIndex(content: ValidatedContent): ContentIndex
/** Retiring: builds over partly validated content and holds no foods, preparations, sources, or lists. */
export function createContentIndex(categories: Category[], assessments: Assessment[]): ContentIndex
export function createContentIndex(first: ValidatedContent | Category[], legacyAssessments?: Assessment[]): ContentIndex {
  const content: ContentData = Array.isArray(first)
    ? { categories: first, assessments: legacyAssessments!, foods: [], preparations: [], sources: [], guidanceLists: [] }
    : first
  const { categories, assessments } = content
  const preparations = [...content.preparations].sort((left, right) => left.sortOrder - right.sortOrder)
  const preparationById = lookupById(preparations, 'preparation')
  const assessmentsBySubjectKey = groupAssessments(assessments)
  const assessedCategoryIds = new Set(
    assessments
      .filter((assessment) => assessment.subject.kind === 'category')
      .map((assessment) => (assessment.subject as { kind: 'category', categoryId: string }).categoryId),
  )
  const preparationStatesByCategoryId = new Map(
    [...preparationIdsByCategoryId(content.foods, assessments, preparations)].map(([categoryId, preparationIds]) => [
      categoryId,
      preparationIds.map(preparationById),
    ]),
  )

  return {
    tree: buildCategoryTree(categories),
    assessmentsBySubjectKey,
    assessedCategoryIds,
    foods: content.foods,
    categories,
    guidanceLists: content.guidanceLists,
    sources: content.sources,
    preparations,
    foodById: lookupById(content.foods, 'food'),
    categoryById: lookupById(categories, 'category'),
    sourceById: lookupById(content.sources, 'source'),
    preparationById,
    foodBySlug: lookupBySlug(content.foods),
    categoryBySlug: lookupBySlug(categories),
    guidanceListBySlug: lookupBySlug(content.guidanceLists),
    preparationBySlug: lookupBySlug(preparations),
    assessmentsFor: (guidanceListId, subject, preparationId) =>
      (assessmentsBySubjectKey.get(`${guidanceListId}:${subjectKey(subject)}`) ?? [])
        .filter((assessment) => assessment.preparationId === preparationId),
    preparationStatesFor: (categoryId) => preparationStatesByCategoryId.get(categoryId) ?? [],
    isCategoryAssessed: (categoryId) => assessedCategoryIds.has(categoryId),
  }
}

export const findAssessments = (
  index: ContentIndex,
  guidanceListId: string,
  subject: AssessmentSubject,
  preparationId?: string,
): Assessment[] => index.assessmentsFor(guidanceListId, subject, preparationId)

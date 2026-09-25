import { buildCategoryTree, type CategoryTree } from './categoryTree'
import type { ValidatedContent } from './contentValidation'
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

const assessmentKey = (guidanceListId: string, subject: AssessmentSubject) => `${guidanceListId}:${subjectKey(subject)}`

const groupAssessments = (assessments: Assessment[]): Map<string, Assessment[]> => {
  const grouped = new Map<string, Assessment[]>()
  for (const assessment of assessments) {
    const key = assessmentKey(assessment.guidanceListId, assessment.subject)
    const existing = grouped.get(key)
    if (existing) {
      existing.push(assessment)
    } else {
      grouped.set(key, [assessment])
    }
  }
  return grouped
}

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
/**
 * The preparation states in play for each category: the union of the states its foods declare and
 * the states carrying an authored category assessment for it, in vocabulary order. Derived on every
 * build rather than authored, so a category cannot drift out of step with the foods in it and adding
 * a food needs one edit rather than two. A category with no preparation dimension is absent and
 * renders no preparation level. Filtering the vocabulary rather than looking states up means
 * validation can build an index before it has checked every preparation qualifier.
 */
const derivePreparationStates = (
  foods: readonly Food[],
  assessments: readonly Assessment[],
  vocabulary: readonly Preparation[],
): Map<string, Preparation[]> => {
  const idsByCategory = new Map<string, Set<string>>()
  const add = (categoryId: string, preparationId: string) => {
    const existing = idsByCategory.get(categoryId) ?? new Set<string>()
    existing.add(preparationId)
    idsByCategory.set(categoryId, existing)
  }

  for (const food of foods) {
    for (const preparationId of food.preparationIds) {
      add(food.primaryCategoryId, preparationId)
    }
  }
  for (const assessment of assessments) {
    if (assessment.subject.kind === 'category' && assessment.preparationId !== undefined) {
      add(assessment.subject.categoryId, assessment.preparationId)
    }
  }

  return new Map([...idsByCategory].map(([categoryId, ids]) => [
    categoryId,
    vocabulary.filter((preparation) => ids.has(preparation.id)),
  ]))
}

export const createContentIndex = (content: ValidatedContent): ContentIndex => {
  const { categories, assessments } = content
  const preparations = [...content.preparations].sort((left, right) => left.sortOrder - right.sortOrder)
  const preparationById = lookupById(preparations, 'preparation')
  const assessmentsBySubjectKey = groupAssessments(assessments)
  const assessedCategoryIds = new Set(
    assessments
      .filter((assessment) => assessment.subject.kind === 'category')
      .map((assessment) => (assessment.subject as { kind: 'category', categoryId: string }).categoryId),
  )
  const preparationStatesByCategoryId = derivePreparationStates(content.foods, assessments, preparations)

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
      (assessmentsBySubjectKey.get(assessmentKey(guidanceListId, subject)) ?? [])
        .filter((assessment) => assessment.preparationId === preparationId),
    preparationStatesFor: (categoryId) => preparationStatesByCategoryId.get(categoryId) ?? [],
    isCategoryAssessed: (categoryId) => assessedCategoryIds.has(categoryId),
  }
}

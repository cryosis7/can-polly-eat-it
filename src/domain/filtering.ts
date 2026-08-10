import { resolveAssessment, type AssessmentSubjectRef } from './assessment'
import { catalogueRows, categoryEntryRows, type CatalogueRow, type CategoryRow } from './categoryTree'
import type { ContentIndex } from './contentIndex'
import { matchesCategoryQuery, matchesSearchQuery } from './search'
import type { Assessment, Category, Food, GuidanceList, OutcomeBand, Preparation } from './schemas'

export type FoodFilterState = {
  query: string
  categoryId?: string
  guidanceListIds: string[]
  outcomeBands: OutcomeBand[]
}

export const categoryAndDescendantIds = (index: ContentIndex, categoryId: string) => {
  const ids = new Set<string>()
  const pending = [categoryId]

  while (pending.length > 0) {
    const currentId = pending.pop()!
    ids.add(currentId)
    pending.push(...(index.tree.childIdsByParentId.get(currentId) ?? []))
  }

  return ids
}

const matchesGuidanceFilters = (
  subjectRef: AssessmentSubjectRef,
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
  preparationId?: string,
) => {
  const guidanceListsById = new Map(guidanceLists.map((list) => [list.id, list]))

  return filters.guidanceListIds.every((guidanceListId) => {
    const guidanceList = guidanceListsById.get(guidanceListId)
    if (!guidanceList) {
      return false
    }
    if (filters.outcomeBands.length === 0) {
      return true
    }
    return filters.outcomeBands.includes(
      resolveAssessment(subjectRef, guidanceList, index, preparationId).status.outcomeBand,
    )
  })
}

/**
 * Filtering is per row, so an outcome filter returns the cooked row of a food without its raw row,
 * and each returned row is counted once.
 */
export const filterFoods = (
  foods: Food[],
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
): CatalogueRow[] => {
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return catalogueRows(foods).filter(({ food, preparationId }) => {
    if (!matchesSearchQuery(food, index.tree, filters.query)) {
      return false
    }
    if (selectedCategoryIds && !selectedCategoryIds.has(food.primaryCategoryId)) {
      return false
    }

    return matchesGuidanceFilters({ kind: 'food', food }, guidanceLists, index, filters, preparationId)
  })
}

/**
 * Filtering is per row here too, so an outcome filter returns a category's raw entry without its
 * cooked entry, and each returned row is counted once.
 */
export const filterCategoryEntries = (
  categories: Category[],
  assessments: Assessment[],
  preparations: Preparation[],
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
): CategoryRow[] => {
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return categoryEntryRows(categories, assessments, preparations).filter(({ category, preparationId }) => {
    if (selectedCategoryIds && !selectedCategoryIds.has(category.id)) {
      return false
    }
    if (!matchesCategoryQuery(category, index.tree, filters.query)) {
      return false
    }

    return matchesGuidanceFilters(
      { kind: 'category', category },
      guidanceLists,
      index,
      filters,
      preparationId,
    )
  })
}

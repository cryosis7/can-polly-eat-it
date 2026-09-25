import { resolveAssessment, type AssessmentSubjectRef } from './assessment'
import { catalogueRows, categoryEntryRows, type CatalogueRow, type CategoryRow } from './categoryTree'
import type { ContentIndex } from './contentIndex'
import { matchesCategoryQuery, matchesSearchQuery } from './search'
import type { GuidanceList, OutcomeBand } from './schemas'

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

/** The selected lists, or nothing when any selected list is unknown, so that no row can match. */
const selectedGuidanceLists = (index: ContentIndex, filters: FoodFilterState): GuidanceList[] | undefined => {
  const lists = filters.guidanceListIds.map((guidanceListId) =>
    index.guidanceLists.find((list) => list.id === guidanceListId))
  return lists.every((list) => list !== undefined) ? lists : undefined
}

const matchesGuidanceFilters = (
  subjectRef: AssessmentSubjectRef,
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
  preparationId?: string,
) => filters.outcomeBands.length === 0 || guidanceLists.every((guidanceList) => filters.outcomeBands.includes(
  resolveAssessment(subjectRef, guidanceList, index, preparationId).status.outcomeBand,
))

/**
 * Filtering is per row, so an outcome filter returns the cooked row of a food without its raw row,
 * and each returned row is counted once.
 */
export const filterFoods = (index: ContentIndex, filters: FoodFilterState): CatalogueRow[] => {
  const guidanceLists = selectedGuidanceLists(index, filters)
  if (guidanceLists === undefined) {
    return []
  }
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return catalogueRows(index).filter(({ food, preparationId }) => {
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
export const filterCategoryEntries = (index: ContentIndex, filters: FoodFilterState): CategoryRow[] => {
  const guidanceLists = selectedGuidanceLists(index, filters)
  if (guidanceLists === undefined) {
    return []
  }
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return categoryEntryRows(index).filter(({ category, preparationId }) => {
    if (selectedCategoryIds && !selectedCategoryIds.has(category.id)) {
      return false
    }
    if (!matchesCategoryQuery(category, index.tree, filters.query)) {
      return false
    }

    return matchesGuidanceFilters({ kind: 'category', category }, guidanceLists, index, filters, preparationId)
  })
}
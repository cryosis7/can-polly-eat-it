import { resolveAssessment, type AssessmentSubjectRef } from './assessment'
import type { ContentIndex } from './contentIndex'
import { matchesCategoryQuery, matchesSearchQuery } from './search'
import type { Category, Food, GuidanceList, OutcomeBand } from './schemas'

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
    return filters.outcomeBands.includes(resolveAssessment(subjectRef, guidanceList, index).status.outcomeBand)
  })
}

export const filterFoods = (
  foods: Food[],
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
) => {
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return foods.filter((food) => {
    if (!matchesSearchQuery(food, index.tree, filters.query)) {
      return false
    }
    if (selectedCategoryIds && !selectedCategoryIds.has(food.primaryCategoryId)) {
      return false
    }

    return matchesGuidanceFilters({ kind: 'food', food }, guidanceLists, index, filters)
  })
}

export const filterCategoryEntries = (
  categories: Category[],
  guidanceLists: GuidanceList[],
  index: ContentIndex,
  filters: FoodFilterState,
) => {
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(index, filters.categoryId)
    : undefined

  return categories.filter((category) => {
    if (!index.assessedCategoryIds.has(category.id)) {
      return false
    }
    if (selectedCategoryIds && !selectedCategoryIds.has(category.id)) {
      return false
    }
    if (!matchesCategoryQuery(category, index.tree, filters.query)) {
      return false
    }

    return matchesGuidanceFilters({ kind: 'category', category }, guidanceLists, index, filters)
  })
}

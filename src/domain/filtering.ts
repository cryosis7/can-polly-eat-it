import { resolveAssessment } from './assessment'
import { buildCategoryTree } from './categoryTree'
import { matchesSearchQuery } from './search'
import type { Category, Food, FoodAssessment, GuidanceList } from './schemas'

export type FoodFilterState = {
  query: string
  categoryId?: string
  statusIdsByGuidanceListId: Record<string, string[]>
}

export const categoryAndDescendantIds = (categories: Category[], categoryId: string) => {
  const tree = buildCategoryTree(categories)
  const ids = new Set<string>()
  const pending = [categoryId]

  while (pending.length > 0) {
    const currentId = pending.pop()!
    ids.add(currentId)
    pending.push(...(tree.childIdsByParentId.get(currentId) ?? []))
  }

  return ids
}

export const filterFoods = (
  foods: Food[],
  categories: Category[],
  guidanceLists: GuidanceList[],
  assessments: FoodAssessment[],
  filters: FoodFilterState,
) => {
  const selectedCategoryIds = filters.categoryId
    ? categoryAndDescendantIds(categories, filters.categoryId)
    : undefined
  const guidanceListsById = new Map(guidanceLists.map((list) => [list.id, list]))

  return foods.filter((food) => {
    if (!matchesSearchQuery(food, categories, filters.query)) {
      return false
    }
    if (selectedCategoryIds && !selectedCategoryIds.has(food.primaryCategoryId)) {
      return false
    }

    return Object.entries(filters.statusIdsByGuidanceListId).every(([guidanceListId, statusIds]) => {
      const guidanceList = guidanceListsById.get(guidanceListId)
      return guidanceList !== undefined
        && statusIds.includes(resolveAssessment(food, guidanceList, assessments, categories).status.id)
    })
  })
}

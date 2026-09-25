import type { ContentIndex } from './contentIndex'
import type { Category, Food } from './schemas'

export type CategoryTree = {
  categoryById: Map<string, Category>
  childIdsByParentId: Map<string | null, string[]>
  pathByCategoryId: Map<string, Category[]>
}

/** Editorial order: authored sort order, ties broken by name. */
export const sortByEditorialOrder = <T extends { sortOrder: number; name: string }>(items: T[]) =>
  [...items].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))

export const buildCategoryTree = (categories: Category[]): CategoryTree => {
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const childIdsByParentId = new Map<string | null, string[]>()

  for (const category of categories) {
    const childIds = childIdsByParentId.get(category.parentId) ?? []
    childIds.push(category.id)
    childIdsByParentId.set(category.parentId, childIds)
  }

  for (const [parentId, childIds] of childIdsByParentId) {
    childIdsByParentId.set(parentId, sortByEditorialOrder(
      childIds.map((childId) => categoryById.get(childId)!),
    ).map((category) => category.id))
  }

  const pathByCategoryId = new Map<string, Category[]>()
  for (const category of categories) {
    const reversedPath: Category[] = []
    let current: Category | undefined = category
    while (current) {
      reversedPath.push(current)
      current = current.parentId === null ? undefined : categoryById.get(current.parentId)
    }
    pathByCategoryId.set(category.id, reversedPath.reverse())
  }

  return { categoryById, childIdsByParentId, pathByCategoryId }
}

export const foodsByCategoryId = (foods: Food[]) => {
  const grouped = new Map<string, Food[]>()
  for (const food of foods) {
    const categoryFoods = grouped.get(food.primaryCategoryId) ?? []
    categoryFoods.push(food)
    grouped.set(food.primaryCategoryId, categoryFoods)
  }
  for (const [categoryId, categoryFoods] of grouped) {
    grouped.set(categoryId, sortByEditorialOrder(categoryFoods))
  }
  return grouped
}

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
/**
 * One browsable entry: a food in a preparation context. A food declaring preparation states yields
 * one row per state and no preparation-free row, because such a row would need a status standing
 * for every way the food is eaten and no such status is ever authored.
 */
export type CatalogueRow = {
  food: Food
  preparationId?: string
}

export const catalogueRows = (index: ContentIndex): CatalogueRow[] => index.foods.flatMap((food) => (
  food.preparationIds.length === 0
    ? [{ food }]
    : food.preparationIds.map((preparationId) => ({ food, preparationId }))
))

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
/**
 * One browsable entry for a category's own guidance, in a preparation context.
 *
 * A category is a first-class subject, so once its preparation-shaped children retire into
 * qualified assessments on it, its guidance has the same two axes a food's does. Without this a
 * category holding only qualified guidance would render nothing browsable and resolve as
 * `not-assessed`, which would author a neutral fallback onto a subject that has been assessed.
 */
export type CategoryRow = {
  category: Category
  preparationId?: string
}

/**
 * One row per axis a category actually holds guidance on: an unqualified row where it has
 * unqualified guidance, then one row per preparation it is assessed for, in vocabulary order.
 * Categories carrying no assessment of their own yield no rows, so a structural parent stays a
 * heading rather than becoming a browsable entry.
 */
export const categoryEntryRows = (index: ContentIndex): CategoryRow[] => index.categories.flatMap((category) => {
  if (!index.isCategoryAssessed(category.id)) {
    return []
  }
  const subject = { kind: 'category', categoryId: category.id } as const
  // The category's preparation states already include every state it holds a qualified
  // assessment for, in vocabulary order, so filtering them keeps that order.
  const holdsGuidance = (preparationId?: string) => index.guidanceLists.some(
    (guidanceList) => index.assessmentsFor(guidanceList.id, subject, preparationId).length > 0,
  )
  return [undefined, ...index.preparationStatesFor(category.id).map((preparation) => preparation.id)]
    .filter(holdsGuidance)
    .map((preparationId) => ({ category, preparationId }))
})

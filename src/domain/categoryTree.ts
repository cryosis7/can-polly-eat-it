import type { Category, Food } from './schemas'

export type CategoryTree = {
  categoryById: Map<string, Category>
  childIdsByParentId: Map<string | null, string[]>
  pathByCategoryId: Map<string, Category[]>
}

export type CategoryDisplayRow = {
  category: Category
  breadcrumb: string
  depth: number
  ancestorIds: string[]
  hasChildCategories: boolean
}

const sortByEditorialOrder = <T extends { sortOrder: number; name: string }>(items: T[]) =>
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

export const flattenCategoryRows = (tree: CategoryTree): CategoryDisplayRow[] => {
  const rows: CategoryDisplayRow[] = []
  const stack = [...(tree.childIdsByParentId.get(null) ?? [])].reverse().map((id) => ({ id, depth: 0 }))

  while (stack.length > 0) {
    const { id, depth } = stack.pop()!
    const category = tree.categoryById.get(id)!
    const path = tree.pathByCategoryId.get(id)!
    const children = tree.childIdsByParentId.get(id) ?? []
    rows.push({
      category,
      breadcrumb: path.map((item) => item.name).join(' > '),
      depth,
      ancestorIds: path.slice(0, -1).map((item) => item.id),
      hasChildCategories: children.length > 0,
    })

    for (let index = children.length - 1; index >= 0; index -= 1) {
      stack.push({ id: children[index], depth: depth + 1 })
    }
  }

  return rows
}

export const visibleCategoryRows = (rows: CategoryDisplayRow[], collapsedIds: Set<string>) =>
  rows.filter((row) => !row.ancestorIds.some((ancestorId) => collapsedIds.has(ancestorId)))

export const withAncestorIds = (rows: CategoryDisplayRow[], categoryIds: Set<string>) => {
  const retained = new Set<string>()
  for (const row of rows) {
    if (!categoryIds.has(row.category.id)) {
      continue
    }
    retained.add(row.category.id)
    for (const ancestorId of row.ancestorIds) {
      retained.add(ancestorId)
    }
  }
  return retained
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

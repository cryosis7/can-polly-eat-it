import type { Assessment, Category, Food, Preparation } from './schemas'

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

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
/**
 * One browsable entry: a food in a preparation context. A food declaring preparation states yields
 * one row per state and no preparation-free row, because such a row would need a status standing
 * for every way the food is eaten and no such status is ever authored.
 */
export type CatalogueRow = {
  food: Food
  preparationId?: string
}

export const catalogueRows = (foods: Food[]): CatalogueRow[] => foods.flatMap((food) => (
  food.preparationIds.length === 0
    ? [{ food }]
    : food.preparationIds.map((preparationId) => ({ food, preparationId }))
))

/**
 * The rows to render beneath each category, grouped by preparation where the category has that
 * dimension. `undefined` keys the rows of foods declaring no preparation state, which render
 * directly under the category exactly as they did before preparations existed.
 */
export type CategoryRowGroups = Map<string | undefined, CatalogueRow[]>

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
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
export const categoryEntryRows = (
  categories: Category[],
  assessments: Assessment[],
  preparations: Preparation[],
): CategoryRow[] => {
  const axesByCategoryId = new Map<string, Set<string | undefined>>()
  for (const assessment of assessments) {
    if (assessment.subject.kind !== 'category') {
      continue
    }
    const { categoryId } = assessment.subject
    const axes = axesByCategoryId.get(categoryId) ?? new Set<string | undefined>()
    axes.add(assessment.preparationId)
    axesByCategoryId.set(categoryId, axes)
  }

  const vocabularyOrder = [...preparations]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((preparation) => preparation.id)

  return categories.flatMap((category) => {
    const axes = axesByCategoryId.get(category.id)
    if (axes === undefined) {
      return []
    }
    const orderedAxes: (string | undefined)[] = [
      ...(axes.has(undefined) ? [undefined] : []),
      ...vocabularyOrder.filter((preparationId) => axes.has(preparationId)),
    ]
    return orderedAxes.map((preparationId) => ({ category, preparationId }))
  })
}

/** Category guidance entries grouped by category then preparation, in vocabulary order. */
export type CategoryEntryGroups = Map<string | undefined, CategoryRow[]>

export const entryRowsByCategoryId = (
  rows: CategoryRow[],
  preparationOrder: Map<string, string[]>,
): Map<string, CategoryEntryGroups> => {
  const grouped = new Map<string, CategoryEntryGroups>()

  for (const row of rows) {
    const groups = grouped.get(row.category.id) ?? new Map<string | undefined, CategoryRow[]>()
    groups.set(row.preparationId, [...(groups.get(row.preparationId) ?? []), row])
    grouped.set(row.category.id, groups)
  }

  for (const [categoryId, groups] of grouped) {
    const order = [undefined, ...(preparationOrder.get(categoryId) ?? [])]
    grouped.set(categoryId, new Map(
      order
        .filter((preparationId) => groups.has(preparationId))
        .map((preparationId) => [preparationId, groups.get(preparationId)!]),
    ))
  }

  return grouped
}

export const rowsByCategoryId = (
  rows: CatalogueRow[],
  preparationOrder: Map<string, string[]>,
): Map<string, CategoryRowGroups> => {
  const grouped = new Map<string, CategoryRowGroups>()

  for (const row of rows) {
    const categoryId = row.food.primaryCategoryId
    const groups = grouped.get(categoryId) ?? new Map<string | undefined, CatalogueRow[]>()
    const groupRows = groups.get(row.preparationId) ?? []
    groupRows.push(row)
    groups.set(row.preparationId, groupRows)
    grouped.set(categoryId, groups)
  }

  for (const [categoryId, groups] of grouped) {
    const order = [undefined, ...(preparationOrder.get(categoryId) ?? [])]
    grouped.set(categoryId, new Map(
      order
        .filter((preparationId) => groups.has(preparationId))
        .map((preparationId) => [
          preparationId,
          sortByEditorialOrder(groups.get(preparationId)!.map((row) => row.food))
            .map((food) => ({ food, preparationId })),
        ]),
    ))
  }

  return grouped
}

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
/**
 * The preparation states in play for each category: the union of the states its foods declare and
 * the states carrying an authored category assessment for it, ordered by the vocabulary's
 * `sortOrder`. Derived on every build rather than authored, so a category cannot drift out of step
 * with the foods in it and adding a food needs one edit rather than two. A category with no
 * preparation dimension is absent from the map and renders no preparation level.
 */
export const preparationIdsByCategoryId = (
  foods: Food[],
  assessments: Assessment[],
  preparations: Preparation[],
): Map<string, string[]> => {
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

  const vocabularyOrder = [...preparations]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((preparation) => preparation.id)

  return new Map(
    [...idsByCategory].map(([categoryId, ids]) => [
      categoryId,
      vocabularyOrder.filter((preparationId) => ids.has(preparationId)),
    ]),
  )
}

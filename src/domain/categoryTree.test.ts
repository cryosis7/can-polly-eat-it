import { describe, expect, it } from 'vitest'
import { buildContentIndex } from '../test/buildContentIndex'
import {
  buildCategoryTree,
  entriesSurfacedByDescendants,
  foodsByCategoryId,
  visibleCategoryRows,
  withAncestorIds,
} from './categoryTree'
import type { Category, Food } from './schemas'

const nestedCategories: Category[] = [
  { id: 'root', slug: 'root', name: 'Root', parentId: null, aliases: [], sortOrder: 1 },
  { id: 'branch', slug: 'branch', name: 'Branch', parentId: 'root', aliases: [], sortOrder: 1 },
  { id: 'leaf', slug: 'leaf', name: 'Leaf', parentId: 'branch', aliases: [], sortOrder: 1 },
  { id: 'other-root', slug: 'other-root', name: 'Other root', parentId: null, aliases: [], sortOrder: 2 },
]

describe('category tree', () => {
  describe('entries surfaced by descendants', () => {
    const tree = buildCategoryTree(nestedCategories)
    const foodIn = (categoryId: string, preparationId?: string) => ({
      food: { id: 'f', slug: 'f', name: 'F', aliases: [], primaryCategoryId: categoryId, preparationIds: [], tags: [], sortOrder: 1 } as Food,
      preparationId,
    })

    it('drops a parent band whose rule a descendant band already states beside its foods', () => {
      const entry = { category: nestedCategories[0], preparationId: 'smoked' }

      const surfaced = entriesSurfacedByDescendants([entry], [foodIn('leaf', 'smoked')], tree)

      expect(surfaced.has(entry)).toBe(true)
    })

    it('keeps a band that lists its own foods, so the rule stays beside them', () => {
      const entry = { category: nestedCategories[0], preparationId: 'smoked' }

      const surfaced = entriesSurfacedByDescendants(
        [entry],
        [foodIn('root', 'smoked'), foodIn('leaf', 'smoked')],
        tree,
      )

      expect(surfaced.has(entry)).toBe(false)
    })

    it('keeps a band no descendant lists foods for, and never drops an unqualified entry', () => {
      const banded = { category: nestedCategories[0], preparationId: 'smoked' }
      const unqualified = { category: nestedCategories[0] }

      const surfaced = entriesSurfacedByDescendants(
        [banded, unqualified],
        [foodIn('leaf', 'cooked'), foodIn('other-root')],
        tree,
      )

      expect(surfaced.size).toBe(0)
    })
  })

  it('hides every descendant of a collapsed ancestor at 1,000 levels without recursion', () => {
    const categories: Category[] = Array.from({ length: 1000 }, (_, index) => ({
      id: `level-${index}`,
      slug: `level-${index}`,
      name: `Level ${index}`,
      parentId: index === 0 ? null : `level-${index - 1}`,
      aliases: [],
      sortOrder: index,
    }))

    const rows = buildContentIndex({ categories }).categoryOutline

    expect(visibleCategoryRows(rows, new Set(['level-0']))).toHaveLength(1)
  })

  it('hides descendants of a collapsed ancestor but keeps unrelated roots', () => {
    const rows = buildContentIndex({ categories: nestedCategories }).categoryOutline

    expect(visibleCategoryRows(rows, new Set(['root'])).map((row) => row.category.id))
      .toEqual(['root', 'other-root'])
    expect(visibleCategoryRows(rows, new Set()).map((row) => row.category.id))
      .toEqual(['root', 'branch', 'leaf', 'other-root'])
  })

  it('retains a row whose collapsed ancestor is subtracted from the effective set', () => {
    const rows = buildContentIndex({ categories: nestedCategories }).categoryOutline
    const collapsed = new Set(['root', 'branch'])
    const effective = new Set([...collapsed].filter((id) => !withAncestorIds(rows, new Set(['leaf'])).has(id)))

    expect(visibleCategoryRows(rows, effective).map((row) => row.category.id))
      .toEqual(['root', 'branch', 'leaf', 'other-root'])
  })

  it('collects matching categories together with their ancestors', () => {
    const rows = buildContentIndex({ categories: nestedCategories }).categoryOutline

    expect([...withAncestorIds(rows, new Set(['leaf']))].sort()).toEqual(['branch', 'leaf', 'root'])
    expect(withAncestorIds(rows, new Set(['missing'])).size).toBe(0)
  })

  it('keeps direct foods and child categories independently addressable', () => {
    const categories: Category[] = [
      { id: 'root', slug: 'root', name: 'Root', parentId: null, aliases: [], sortOrder: 1 },
      { id: 'child', slug: 'child', name: 'Child', parentId: 'root', aliases: [], sortOrder: 1 },
    ]
    const foods: Food[] = [
      { id: 'root-food', slug: 'root-food', name: 'Root food', aliases: [], primaryCategoryId: 'root', preparationIds: [], tags: [], sortOrder: 1 },
      { id: 'child-food', slug: 'child-food', name: 'Child food', aliases: [], primaryCategoryId: 'child', preparationIds: [], tags: [], sortOrder: 1 },
    ]

    const tree = buildCategoryTree(categories)
    const groupedFoods = foodsByCategoryId(foods)

    expect(tree.childIdsByParentId.get('root')).toEqual(['child'])
    expect(groupedFoods.get('root')?.map((food) => food.id)).toEqual(['root-food'])
    expect(groupedFoods.get('child')?.map((food) => food.id)).toEqual(['child-food'])
  })

  it('sorts equal editorial positions alphabetically', () => {
    const categories: Category[] = [
      { id: 'beta', slug: 'beta', name: 'Beta', parentId: 'missing', aliases: [], sortOrder: 1 },
      { id: 'alpha', slug: 'alpha', name: 'Alpha', parentId: 'missing', aliases: [], sortOrder: 1 },
    ]
    const foods: Food[] = [
      { id: 'beta-food', slug: 'beta-food', name: 'Beta food', aliases: [], primaryCategoryId: 'beta', preparationIds: [], tags: [], sortOrder: 1 },
      { id: 'alpha-food', slug: 'alpha-food', name: 'Alpha food', aliases: [], primaryCategoryId: 'alpha', preparationIds: [], tags: [], sortOrder: 1 },
    ]

    const tree = buildCategoryTree(categories)

    expect(tree.childIdsByParentId.get('missing')).toEqual(['alpha', 'beta'])
    expect(foodsByCategoryId(foods).get('beta')?.map((food) => food.name)).toEqual(['Beta food'])
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildCategoryTree,
  flattenCategoryRows,
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
  it('derives a 1,000-level path without recursion', () => {
    const categories: Category[] = Array.from({ length: 1000 }, (_, index) => ({
      id: `level-${index}`,
      slug: `level-${index}`,
      name: `Level ${index}`,
      parentId: index === 0 ? null : `level-${index - 1}`,
      aliases: [],
      sortOrder: index,
    }))

    const tree = buildCategoryTree(categories)
    const rows = flattenCategoryRows(tree)

    expect(rows).toHaveLength(1000)
    expect(tree.pathByCategoryId.get('level-999')).toHaveLength(1000)
    expect(rows[999].breadcrumb).toContain('Level 999')
    expect(rows[999].ancestorIds).toHaveLength(999)
    expect(visibleCategoryRows(rows, new Set(['level-0']))).toHaveLength(1)
  })

  it('exposes root-first ancestors that exclude the row itself', () => {
    const rows = flattenCategoryRows(buildCategoryTree(nestedCategories))
    const leaf = rows.find((row) => row.category.id === 'leaf')!

    expect(leaf.ancestorIds).toEqual(['root', 'branch'])
    expect(rows.find((row) => row.category.id === 'root')!.ancestorIds).toEqual([])
  })

  it('marks whether a row has child categories', () => {
    const rows = flattenCategoryRows(buildCategoryTree(nestedCategories))

    expect(rows.find((row) => row.category.id === 'branch')!.hasChildCategories).toBe(true)
    expect(rows.find((row) => row.category.id === 'leaf')!.hasChildCategories).toBe(false)
  })

  it('hides descendants of a collapsed ancestor but keeps unrelated roots', () => {
    const rows = flattenCategoryRows(buildCategoryTree(nestedCategories))

    expect(visibleCategoryRows(rows, new Set(['root'])).map((row) => row.category.id))
      .toEqual(['root', 'other-root'])
    expect(visibleCategoryRows(rows, new Set()).map((row) => row.category.id))
      .toEqual(['root', 'branch', 'leaf', 'other-root'])
  })

  it('retains a row whose collapsed ancestor is subtracted from the effective set', () => {
    const rows = flattenCategoryRows(buildCategoryTree(nestedCategories))
    const collapsed = new Set(['root', 'branch'])
    const effective = new Set([...collapsed].filter((id) => !withAncestorIds(rows, new Set(['leaf'])).has(id)))

    expect(visibleCategoryRows(rows, effective).map((row) => row.category.id))
      .toEqual(['root', 'branch', 'leaf', 'other-root'])
  })

  it('collects matching categories together with their ancestors', () => {
    const rows = flattenCategoryRows(buildCategoryTree(nestedCategories))

    expect([...withAncestorIds(rows, new Set(['leaf']))].sort()).toEqual(['branch', 'leaf', 'root'])
    expect(withAncestorIds(rows, new Set(['missing'])).size).toBe(0)
  })

  it('keeps direct foods and child categories independently addressable', () => {
    const categories: Category[] = [
      { id: 'root', slug: 'root', name: 'Root', parentId: null, aliases: [], sortOrder: 1 },
      { id: 'child', slug: 'child', name: 'Child', parentId: 'root', aliases: [], sortOrder: 1 },
    ]
    const foods: Food[] = [
      { id: 'root-food', slug: 'root-food', name: 'Root food', aliases: [], primaryCategoryId: 'root', tags: [], sortOrder: 1 },
      { id: 'child-food', slug: 'child-food', name: 'Child food', aliases: [], primaryCategoryId: 'child', tags: [], sortOrder: 1 },
    ]

    const tree = buildCategoryTree(categories)
    const groupedFoods = foodsByCategoryId(foods)

    expect(tree.childIdsByParentId.get('root')).toEqual(['child'])
    expect(groupedFoods.get('root')?.map((food) => food.id)).toEqual(['root-food'])
    expect(groupedFoods.get('child')?.map((food) => food.id)).toEqual(['child-food'])
  })

  it('sorts equal editorial positions alphabetically and handles a tree without roots', () => {
    const categories: Category[] = [
      { id: 'beta', slug: 'beta', name: 'Beta', parentId: 'missing', aliases: [], sortOrder: 1 },
      { id: 'alpha', slug: 'alpha', name: 'Alpha', parentId: 'missing', aliases: [], sortOrder: 1 },
    ]
    const foods: Food[] = [
      { id: 'beta-food', slug: 'beta-food', name: 'Beta food', aliases: [], primaryCategoryId: 'beta', tags: [], sortOrder: 1 },
      { id: 'alpha-food', slug: 'alpha-food', name: 'Alpha food', aliases: [], primaryCategoryId: 'alpha', tags: [], sortOrder: 1 },
    ]

    const tree = buildCategoryTree(categories)

    expect(tree.childIdsByParentId.get('missing')).toEqual(['alpha', 'beta'])
    expect(flattenCategoryRows(tree)).toEqual([])
    expect(foodsByCategoryId(foods).get('beta')?.map((food) => food.name)).toEqual(['Beta food'])
  })
})

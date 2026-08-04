import { describe, expect, it } from 'vitest'
import { buildCategoryTree, flattenCategoryRows, foodsByCategoryId } from './categoryTree'
import type { Category, Food } from './schemas'

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

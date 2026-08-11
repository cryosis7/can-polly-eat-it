import { describe, expect, it } from 'vitest'
import {
  buildCategoryTree,
  entriesSurfacedByDescendants,
  flattenCategoryRows,
  foodsByCategoryId,
  preparationIdsByCategoryId,
  visibleCategoryRows,
  withAncestorIds,
} from './categoryTree'
import type { Assessment, Category, Food, Preparation } from './schemas'

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
      { id: 'root-food', slug: 'root-food', name: 'Root food', aliases: [], primaryCategoryId: 'root', preparationIds: [], tags: [], sortOrder: 1 },
      { id: 'child-food', slug: 'child-food', name: 'Child food', aliases: [], primaryCategoryId: 'child', preparationIds: [], tags: [], sortOrder: 1 },
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
      { id: 'beta-food', slug: 'beta-food', name: 'Beta food', aliases: [], primaryCategoryId: 'beta', preparationIds: [], tags: [], sortOrder: 1 },
      { id: 'alpha-food', slug: 'alpha-food', name: 'Alpha food', aliases: [], primaryCategoryId: 'alpha', preparationIds: [], tags: [], sortOrder: 1 },
    ]

    const tree = buildCategoryTree(categories)

    expect(tree.childIdsByParentId.get('missing')).toEqual(['alpha', 'beta'])
    expect(flattenCategoryRows(tree)).toEqual([])
    expect(foodsByCategoryId(foods).get('beta')?.map((food) => food.name)).toEqual(['Beta food'])
  })
})

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
describe('derived category preparation groupings', () => {
  const vocabulary: Preparation[] = [
    { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 },
    { id: 'smoked', slug: 'smoked', name: 'Smoked', sortOrder: 3 },
    { id: 'cooked', slug: 'cooked', name: 'Cooked', sortOrder: 4 },
  ]

  const food = (id: string, primaryCategoryId: string, preparationIds: string[]): Food => ({
    id,
    slug: id,
    name: id,
    aliases: [],
    primaryCategoryId,
    preparationIds,
    tags: [],
    sortOrder: 1,
  })

  const categoryAssessment = (id: string, categoryId: string, preparationId?: string): Assessment => ({
    id,
    subject: { kind: 'category', categoryId },
    guidanceListId: 'list',
    statusId: 'ok',
    preparationId,
    scopeStatement: `Applies to all ${categoryId}.`,
    guidanceScenarios: [],
    reasonLinks: [],
    citations: [],
  })

  it('unions the states its foods declare, in vocabulary order rather than authoring order', () => {
    const grouped = preparationIdsByCategoryId(
      [food('salmon', 'fish', ['cooked', 'raw']), food('snapper', 'fish', ['smoked'])],
      [],
      vocabulary,
    )

    expect(grouped.get('fish')).toEqual(['raw', 'smoked', 'cooked'])
  })

  it('includes a state carrying an authored category assessment even where no food declares it', () => {
    const grouped = preparationIdsByCategoryId(
      [food('salmon', 'fish', ['cooked'])],
      [categoryAssessment('fish-raw', 'fish', 'raw'), categoryAssessment('fish-all', 'fish')],
      vocabulary,
    )

    expect(grouped.get('fish')).toEqual(['raw', 'cooked'])
  })

  it('makes a grouping appear when a food declaring a new state is added, with no other edit', () => {
    const existing = [food('salmon', 'fish', ['cooked'])]

    expect(preparationIdsByCategoryId(existing, [], vocabulary).get('fish')).toEqual(['cooked'])
    expect(preparationIdsByCategoryId([...existing, food('tuna', 'fish', ['raw'])], [], vocabulary).get('fish'))
      .toEqual(['raw', 'cooked'])
  })

  it('gives a category whose foods declare nothing no preparation dimension at all', () => {
    const grouped = preparationIdsByCategoryId(
      [food('rice', 'cereals', [])],
      [categoryAssessment('cereals-all', 'cereals'), { ...categoryAssessment('rice-all', 'cereals'), id: 'rice-food', subject: { kind: 'food', foodId: 'rice' }, scopeStatement: undefined }],
      vocabulary,
    )

    expect(grouped.has('cereals')).toBe(false)
  })
})

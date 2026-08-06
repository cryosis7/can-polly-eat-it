import { describe, expect, it } from 'vitest'
import { buildCategoryTree } from './categoryTree'
import { categorySearchText, foodSearchText, matchesCategoryQuery, matchesSearchQuery, normaliseSearchText, searchTokens } from './search'
import type { Category, Food } from './schemas'

const root: Category = { id: 'root', slug: 'root', name: 'Root', parentId: null, aliases: ['top level'], sortOrder: 1 }
const child: Category = { id: 'child', slug: 'child', name: 'Child', parentId: 'root', aliases: [], sortOrder: 1 }
const tree = buildCategoryTree([root, child])

const childFood: Food = { id: 'item', slug: 'item', name: 'Item', aliases: ['alt-name'], primaryCategoryId: 'child', tags: [], sortOrder: 1 }

describe('search', () => {
  it('normalises case, diacritics, punctuation, and whitespace', () => {
    expect(normaliseSearchText('  Yógurt-Cup!! ')).toBe('yogurt cup')
    expect(searchTokens('Yógurt-Cup')).toEqual(['yogurt', 'cup'])
    expect(searchTokens('')).toEqual([])
  })

  it('matches a food by its own alias and by its ancestor category path', () => {
    expect(matchesSearchQuery(childFood, tree, 'alt-name')).toBe(true)
    expect(matchesSearchQuery(childFood, tree, 'top level')).toBe(true)
    expect(matchesSearchQuery(childFood, tree, '')).toBe(true)
    expect(matchesSearchQuery(childFood, tree, 'unrelated')).toBe(false)
  })

  it('falls back to an empty category path for a food whose category is outside the tree', () => {
    const orphanFood: Food = { ...childFood, primaryCategoryId: 'missing-category' }
    expect(foodSearchText(orphanFood, tree)).toBe('item alt name')
  })

  it('matches a category entry by its own name, alias, and ancestor path label', () => {
    expect(matchesCategoryQuery(child, tree, 'child')).toBe(true)
    expect(matchesCategoryQuery(child, tree, 'top level')).toBe(true)
    expect(matchesCategoryQuery(child, tree, '')).toBe(true)
    expect(matchesCategoryQuery(child, tree, 'unrelated')).toBe(false)
  })

  it('falls back to matching only itself when a category is outside the tree', () => {
    const orphanCategory: Category = { id: 'orphan', slug: 'orphan', name: 'Orphan', parentId: null, aliases: [], sortOrder: 1 }
    expect(categorySearchText(orphanCategory, tree)).toBe('orphan')
  })
})

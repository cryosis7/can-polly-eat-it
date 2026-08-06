import { describe, expect, it } from 'vitest'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import type { Assessment, Category, Food, GuidanceList } from './schemas'

const list: GuidanceList = {
  id: 'test-list',
  slug: 'test-list',
  title: 'Test list',
  description: 'A test guidance list.',
  citationPolicy: 'optional',
  evidentiaryBasis: 'Test basis.',
  unassessedStatusId: 'not-assessed',
  outOfCoverageStatusId: 'outside-coverage',
  statuses: [
    { id: 'ok', slug: 'ok', label: 'OK', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK' },
    { id: 'avoid', slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 2, filterLabel: 'Avoid' },
    { id: 'not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 3, filterLabel: 'Not assessed' },
    { id: 'outside-coverage', slug: 'outside-coverage', label: 'Outside coverage', tone: 'grey', outcomeBand: 'outside-coverage', sortOrder: 4, filterLabel: 'Outside coverage' },
  ],
  coverage: {
    mode: 'all-catalogue',
    categoryIds: [],
    foodIds: [],
    description: 'Everything is covered.',
    citations: [],
  },
}

const otherList: GuidanceList = { ...list, id: 'other-list', slug: 'other-list' }

const category = (id: string, parentId: string | null): Category => ({
  id,
  slug: id,
  name: id,
  parentId,
  aliases: [],
  sortOrder: 1,
})

const food = (id: string, primaryCategoryId: string): Food => ({
  id,
  slug: id,
  name: id,
  aliases: [],
  primaryCategoryId,
  tags: [],
  sortOrder: 1,
})

const categoryAssessment = (categoryId: string, statusId: string, guidanceListId = list.id): Assessment => ({
  id: `${categoryId}-${guidanceListId}`,
  subject: { kind: 'category', categoryId },
  guidanceListId,
  statusId,
  summary: `Applies to ${categoryId}.`,
  scopeStatement: `Applies to all ${categoryId}.`,
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
})

const foodAssessment = (foodId: string, statusId: string, guidanceListId = list.id): Assessment => ({
  id: `${foodId}-${guidanceListId}`,
  subject: { kind: 'food', foodId },
  guidanceListId,
  statusId,
  summary: `Applies to ${foodId} only.`,
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
})

describe('resolveAssessment', () => {
  it('uses the nearest assessed ancestor category, not a more distant one', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const leaf = category('leaf', 'middle')
    const categories = [root, middle, leaf]
    const cheese = food('cheese', 'leaf')

    const assessments = [categoryAssessment('root', 'avoid'), categoryAssessment('middle', 'ok')]
    const index = createContentIndex(categories, assessments)

    const resolved = resolveAssessment({ kind: 'food', food: cheese }, list, index)
    expect(resolved.status.id).toBe('ok')
    expect(resolved.origin).toEqual({ kind: 'inherited', category: middle })
  })

  it('lets a food-level assessment fully override an assessed ancestor category', () => {
    const root = category('root', null)
    const categories = [root]
    const cheddar = food('cheddar', 'root')

    const assessments = [categoryAssessment('root', 'avoid'), foodAssessment('cheddar', 'ok')]
    const index = createContentIndex(categories, assessments)

    const resolved = resolveAssessment({ kind: 'food', food: cheddar }, list, index)
    expect(resolved.status.id).toBe('ok')
    expect(resolved.origin).toEqual({ kind: 'own' })
    expect(resolved.assessment?.summary).toBe('Applies to cheddar only.')
  })

  it('never inherits guidance authored in a different guidance list', () => {
    const root = category('root', null)
    const categories = [root]
    const item = food('item', 'root')

    const assessments = [categoryAssessment('root', 'avoid', otherList.id)]
    const index = createContentIndex(categories, assessments)

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.origin).toEqual({ kind: 'coverage-fallback' })
    expect(resolved.status.id).toBe('not-assessed')
  })

  it('resolves a category via a grandparent category assessment, excluding itself', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const leaf = category('leaf', 'middle')
    const categories = [root, middle, leaf]

    const assessments = [categoryAssessment('root', 'avoid')]
    const index = createContentIndex(categories, assessments)

    const resolved = resolveAssessment({ kind: 'category', category: leaf }, list, index)
    expect(resolved.status.id).toBe('avoid')
    expect(resolved.origin).toEqual({ kind: 'inherited', category: root })
  })

  it('resolves a 1,000-level ancestor walk iteratively', () => {
    const categories: Category[] = Array.from({ length: 1000 }, (_, position) => category(
      `level-${position}`,
      position === 0 ? null : `level-${position - 1}`,
    ))
    const deepFood = food('deep-food', 'level-999')
    const assessments = [categoryAssessment('level-0', 'ok')]
    const index = createContentIndex(categories, assessments)

    const resolved = resolveAssessment({ kind: 'food', food: deepFood }, list, index)
    expect(resolved.status.id).toBe('ok')
    expect(resolved.origin).toEqual({ kind: 'inherited', category: categories[0] })
  })

  it('treats a food or category whose primary category is outside the index as having no ancestors', () => {
    const root = category('root', null)
    const index = createContentIndex([root], [categoryAssessment('root', 'ok')])
    const orphanFood = food('orphan-food', 'not-in-tree')
    const orphanCategory = category('orphan-category', null)

    expect(resolveAssessment({ kind: 'food', food: orphanFood }, list, index).origin).toEqual({ kind: 'coverage-fallback' })
    expect(resolveAssessment({ kind: 'category', category: orphanCategory }, list, index).origin).toEqual({ kind: 'coverage-fallback' })
  })

  it('falls back to the outside-coverage status when nothing applies and coverage excludes the subject', () => {
    const outOfCoverageList: GuidanceList = {
      ...list,
      coverage: { mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: [], description: 'Nothing is covered.', citations: [] },
    }
    const root = category('root', null)
    const item = food('item', 'root')
    const index = createContentIndex([root], [])

    const resolved = resolveAssessment({ kind: 'food', food: item }, outOfCoverageList, index)
    expect(resolved.status.id).toBe('outside-coverage')
    expect(resolved.origin).toEqual({ kind: 'coverage-fallback' })
  })

  it('falls back to the outside-coverage status for an uncovered category subject', () => {
    const outOfCoverageList: GuidanceList = {
      ...list,
      coverage: { mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: [], description: 'Nothing is covered.', citations: [] },
    }
    const root = category('root', null)
    const index = createContentIndex([root], [])

    const resolved = resolveAssessment({ kind: 'category', category: root }, outOfCoverageList, index)
    expect(resolved.status.id).toBe('outside-coverage')
    expect(resolved.origin).toEqual({ kind: 'coverage-fallback' })
  })
})

import { describe, expect, it } from 'vitest'
import { resolveAssessment } from './assessment'
import { buildContentIndex } from '../test/buildContentIndex'
import type { Assessment, Category, Food, GuidanceList, Preparation } from './schemas'

const list: GuidanceList = {
  id: 'test-list',
  slug: 'test-list',
  title: 'Test list',
  description: 'A test guidance list.',
  citationPolicy: 'optional',
  sourceIds: [],
  evidentiaryBasis: 'Test basis.',
  unassessedStatusId: 'not-assessed',
  statuses: [
    { id: 'ok', slug: 'ok', label: 'OK', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK', summary: 'The list says this is okay.' },
    { id: 'careful', slug: 'careful', label: 'Careful', tone: 'amber', outcomeBand: 'maybe', sortOrder: 4, filterLabel: 'Careful', summary: 'The list says to take care.' },
    { id: 'avoid', slug: 'avoid', label: 'Avoid', tone: 'red', outcomeBand: 'not-okay', sortOrder: 2, filterLabel: 'Avoid', summary: 'The list says to avoid this.' },
    { id: 'steer-clear', slug: 'steer-clear', label: 'Steer clear', tone: 'red', outcomeBand: 'not-okay', sortOrder: 5, filterLabel: 'Steer clear', summary: 'The list says to steer clear of this.' },
    { id: 'not-assessed', slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 3, filterLabel: 'Not assessed', summary: 'This has not been assessed.' },
  ],
  unassessedNotice: {
    description: 'This guide has no reviewed rule for this item.',
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

const food = (id: string, primaryCategoryId: string, preparationIds: string[] = []): Food => ({
  id,
  slug: id,
  name: id,
  aliases: [],
  primaryCategoryId,
  preparationIds,
  tags: [],
  sortOrder: 1,
})

const categoryAssessment = (categoryId: string, statusId: string, guidanceListId = list.id, relation?: 'replaces' | 'adds-to'): Assessment => ({
  id: `${categoryId}-${guidanceListId}`,
  subject: { kind: 'category', categoryId },
  guidanceListId,
  statusId,
  summary: `Applies to ${categoryId}.`,
  scopeStatement: `Applies to all ${categoryId}.`,
  ...(relation ? { relation } : {}),
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
})

const foodAssessment = (foodId: string, statusId: string, guidanceListId = list.id, relation?: 'replaces' | 'adds-to'): Assessment => ({
  id: `${foodId}-${guidanceListId}`,
  subject: { kind: 'food', foodId },
  guidanceListId,
  statusId,
  summary: `Applies to ${foodId} only.`,
  ...(relation ? { relation } : {}),
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
})

const raw: Preparation = { id: 'raw', slug: 'raw', name: 'Raw', sortOrder: 1 }

const indexOf = (categories: Category[], assessments: Assessment[], foods: Food[] = []) =>
  buildContentIndex({ categories, foods, preparations: [raw], guidanceLists: [list, otherList], assessments })

describe('resolveAssessment', () => {
  it('uses the nearest assessed ancestor category, not a more distant one', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const leaf = category('leaf', 'middle')
    const categories = [root, middle, leaf]
    const cheese = food('cheese', 'leaf')

    const assessments = [categoryAssessment('root', 'avoid'), categoryAssessment('middle', 'ok')]
    const index = indexOf(categories, assessments, [cheese])

    const resolved = resolveAssessment({ kind: 'food', food: cheese }, list, index)
    expect(resolved.status.id).toBe('ok')
    expect(resolved.origin).toEqual({ kind: 'inherited', category: middle })
  })

  it('lets a food-level assessment fully override an assessed ancestor category', () => {
    const root = category('root', null)
    const categories = [root]
    const cheddar = food('cheddar', 'root')

    const assessments = [categoryAssessment('root', 'avoid'), foodAssessment('cheddar', 'ok')]
    const index = indexOf(categories, assessments, [cheddar])

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
    const index = indexOf(categories, assessments, [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.origin).toEqual({ kind: 'not-assessed' })
    expect(resolved.status.id).toBe('not-assessed')
  })

  it('resolves a category via a grandparent category assessment, excluding itself', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const leaf = category('leaf', 'middle')
    const categories = [root, middle, leaf]

    const assessments = [categoryAssessment('root', 'avoid')]
    const index = indexOf(categories, assessments)

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
    const index = indexOf(categories, assessments, [deepFood])

    const resolved = resolveAssessment({ kind: 'food', food: deepFood }, list, index)
    expect(resolved.status.id).toBe('ok')
    expect(resolved.origin).toEqual({ kind: 'inherited', category: categories[0] })
  })

  it('treats a food or category whose primary category is outside the index as having no ancestors', () => {
    const root = category('root', null)
    const index = indexOf([root], [categoryAssessment('root', 'ok')])
    const orphanFood = food('orphan-food', 'not-in-tree')
    const orphanCategory = category('orphan-category', null)

    expect(resolveAssessment({ kind: 'food', food: orphanFood }, list, index).origin).toEqual({ kind: 'not-assessed' })
    expect(resolveAssessment({ kind: 'category', category: orphanCategory }, list, index).origin).toEqual({ kind: 'not-assessed' })
  })

  it('falls back to the single not-assessed status for a food with nothing to inherit', () => {
    const root = category('root', null)
    const item = food('item', 'root')
    const index = indexOf([root], [], [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.status.id).toBe('not-assessed')
    expect(resolved.origin).toEqual({ kind: 'not-assessed' })
    expect(resolved.layers).toEqual([])
  })

  it('falls back to the single not-assessed status for an unassessed category subject', () => {
    const root = category('root', null)
    const index = indexOf([root], [])

    const resolved = resolveAssessment({ kind: 'category', category: root }, list, index)
    expect(resolved.status.id).toBe('not-assessed')
    expect(resolved.origin).toEqual({ kind: 'not-assessed' })
  })

  it('resolves an unassessed food identically under two different parent categories', () => {
    const first = category('first', null)
    const second = category('second', null)
    const index = indexOf([first, second], [])

    const before = resolveAssessment({ kind: 'food', food: food('item', 'first') }, list, index)
    const after = resolveAssessment({ kind: 'food', food: food('item', 'second') }, list, index)

    expect(after.status.id).toBe(before.status.id)
    expect(after.origin).toEqual(before.origin)
  })
})

describe('accumulating guidance across subject levels', () => {
  it('returns exactly one layer, matching today, when nothing declares an addition', () => {
    const root = category('root', null)
    const cheddar = food('cheddar', 'root')
    const index = indexOf([root], [categoryAssessment('root', 'avoid'), foodAssessment('cheddar', 'ok')], [cheddar])

    const resolved = resolveAssessment({ kind: 'food', food: cheddar }, list, index)
    expect(resolved.layers).toHaveLength(1)
    expect(resolved.layers[0]).toEqual({ assessment: resolved.assessment, origin: { kind: 'own' }, sourceIds: [], citations: [] })
    expect(resolved.positions).toEqual([])
  })

  it('returns two layers, broadest first, for an additive food beneath an assessed category', () => {
    const root = category('root', null)
    const oysters = food('oysters', 'root')
    const index = indexOf([root], [categoryAssessment('root', 'ok'), foodAssessment('oysters', 'avoid', list.id, 'adds-to')], [oysters])

    const resolved = resolveAssessment({ kind: 'food', food: oysters }, list, index)
    expect(resolved.layers.map((layer) => layer.assessment.id)).toEqual(['root-test-list', 'oysters-test-list'])
    expect(resolved.layers[0].origin).toEqual({ kind: 'inherited', category: root })
    expect(resolved.layers[1].origin).toEqual({ kind: 'own' })
  })

  it('accumulates a third layer when an addition adds to another addition', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const item = food('item', 'middle')
    const index = indexOf([root, middle], [
      categoryAssessment('root', 'ok'),
      categoryAssessment('middle', 'ok', list.id, 'adds-to'),
      foodAssessment('item', 'avoid', list.id, 'adds-to'),
    ], [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.layers.map((layer) => layer.assessment.id)).toEqual([
      'root-test-list',
      'middle-test-list',
      'item-test-list',
    ])
  })

  it('stops the walk at and includes the first replacing ancestor', () => {
    const root = category('root', null)
    const middle = category('middle', 'root')
    const item = food('item', 'middle')
    const index = indexOf([root, middle], [
      categoryAssessment('root', 'ok'),
      categoryAssessment('middle', 'ok'),
      foodAssessment('item', 'avoid', list.id, 'adds-to'),
    ], [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.layers.map((layer) => layer.assessment.id)).toEqual(['middle-test-list', 'item-test-list'])
  })

  it('never accumulates an assessment authored in another guidance list', () => {
    const root = category('root', null)
    const item = food('item', 'root', ['raw'])
    // An addition must add to something in its own list, so the root carries a raw-only rule too. It
    // sits on another axis, so it never joins this preparation-free resolution.
    const index = indexOf([root], [
      categoryAssessment('root', 'ok', otherList.id),
      { ...categoryAssessment('root', 'ok'), id: 'root-raw-test-list', preparationId: 'raw' },
      foodAssessment('item', 'avoid', list.id, 'adds-to'),
    ], [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.layers.map((layer) => layer.assessment.id)).toEqual(['item-test-list'])
  })

  it('returns no layers when the resolution falls back to not-assessed', () => {
    const root = category('root', null)
    const item = food('item', 'root')
    const index = indexOf([root], [], [item])

    expect(resolveAssessment({ kind: 'food', food: item }, list, index).layers).toEqual([])
  })

  it('always takes the status from the nearest assessment, whatever its relation', () => {
    const root = category('root', null)
    const item = food('item', 'root')
    const index = indexOf([root], [categoryAssessment('root', 'ok'), foodAssessment('item', 'avoid', list.id, 'adds-to')], [item])

    const resolved = resolveAssessment({ kind: 'food', food: item }, list, index)
    expect(resolved.status.id).toBe('avoid')
    expect(resolved.origin).toEqual({ kind: 'own' })
  })

  it('accumulates for a category subject through its assessed ancestors', () => {
    const root = category('root', null)
    const leaf = category('leaf', 'root')
    const index = indexOf([root, leaf], [
      categoryAssessment('root', 'ok'),
      categoryAssessment('leaf', 'avoid', list.id, 'adds-to'),
    ])

    const resolved = resolveAssessment({ kind: 'category', category: leaf }, list, index)
    expect(resolved.layers.map((layer) => layer.assessment.id)).toEqual(['root-test-list', 'leaf-test-list'])
  })
})

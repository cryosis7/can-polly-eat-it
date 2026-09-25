import { describe, expect, it } from 'vitest'
import { buildContentIndex } from '../test/buildContentIndex'
import { createContentIndex } from './contentIndex'
import type { ContentData } from './contentValidation'
import type { Assessment, AssessmentSubject, Category, Food, GuidanceList, Preparation, Source } from './schemas'

const category = (id: string, parentId: string | null = null, sortOrder = 1): Category => ({
  id,
  slug: `${id}-slug`,
  name: id,
  parentId,
  aliases: [],
  sortOrder,
})

const food = (id: string, primaryCategoryId: string, preparationIds: string[] = []): Food => ({
  id,
  slug: `${id}-slug`,
  name: id,
  aliases: [],
  primaryCategoryId,
  preparationIds,
  tags: [],
  sortOrder: 1,
})

const preparation = (id: string, sortOrder: number): Preparation => ({ id, slug: `${id}-slug`, name: id, sortOrder })

const source = (id: string): Source => ({ id, slug: `${id}-slug`, name: id, organisation: id })

const guidanceList = (id: string): GuidanceList => ({
  id,
  slug: `${id}-slug`,
  title: id,
  description: `The ${id} list.`,
  citationPolicy: 'optional',
  sourceIds: [],
  evidentiaryBasis: 'Fixture content.',
  unassessedStatusId: `${id}-not-assessed`,
  statuses: [
    { id: `${id}-ok`, slug: 'ok', label: 'OK', tone: 'green', outcomeBand: 'okay', sortOrder: 1, filterLabel: 'OK', summary: 'OK to eat.' },
    { id: `${id}-not-assessed`, slug: 'not-assessed', label: 'Not assessed', tone: 'grey', outcomeBand: 'not-assessed', sortOrder: 2, filterLabel: 'Not assessed', summary: 'Not assessed.' },
  ],
  unassessedNotice: { description: 'Not assessed yet.', citations: [] },
})

const assessment = (
  id: string,
  guidanceListId: string,
  subject: AssessmentSubject,
  preparationId?: string,
): Assessment => ({
  id,
  subject,
  guidanceListId,
  statusId: `${guidanceListId}-ok`,
  preparationId,
  scopeStatement: subject.kind === 'category' ? 'Applies to the whole group.' : undefined,
  guidanceScenarios: [],
  reasonLinks: [],
  citations: [],
})

describe('content index', () => {
  it('builds only from validated content', () => {
    const build = (unvalidated: ContentData) =>
      // @ts-expect-error Only content returned by validation can build an index.
      createContentIndex(unvalidated)

    expect(build).toBeTypeOf('function')
  })

  it('builds a 1,000-level category path without recursion', () => {
    const categories = Array.from({ length: 1000 }, (_, level) =>
      category(`level-${level}`, level === 0 ? null : `level-${level - 1}`))

    const index = buildContentIndex({ categories })

    expect(index.tree.pathByCategoryId.get('level-999')).toHaveLength(1000)
    expect(index.categoryBySlug('level-999-slug')?.parentId).toBe('level-998')
  })

  it('exposes collections in authored order and preparations in vocabulary order', () => {
    const index = buildContentIndex({
      categories: [category('fish', null, 2), category('dairy', null, 1)],
      foods: [food('tuna', 'fish'), food('milk', 'dairy'), food('anchovy', 'fish')],
      preparations: [preparation('cooked', 3), preparation('raw', 1), preparation('smoked', 2)],
      sources: [source('nzfs'), source('mpi')],
      guidanceLists: [guidanceList('vegetarian'), guidanceList('pregnancy')],
    })

    expect(index.categories.map(({ id }) => id)).toEqual(['fish', 'dairy'])
    expect(index.foods.map(({ id }) => id)).toEqual(['tuna', 'milk', 'anchovy'])
    expect(index.sources.map(({ id }) => id)).toEqual(['nzfs', 'mpi'])
    expect(index.guidanceLists.map(({ id }) => id)).toEqual(['vegetarian', 'pregnancy'])
    expect(index.preparations.map(({ id }) => id)).toEqual(['raw', 'smoked', 'cooked'])
  })

  describe('lookups', () => {
    const index = buildContentIndex({
      categories: [category('fish')],
      foods: [food('tuna', 'fish', ['raw'])],
      preparations: [preparation('raw', 1)],
      sources: [source('nzfs')],
      guidanceLists: [guidanceList('pregnancy')],
    })

    it('finds foods, categories, sources, and preparations by ID', () => {
      expect(index.foodById('tuna').name).toBe('tuna')
      expect(index.categoryById('fish').name).toBe('fish')
      expect(index.sourceById('nzfs').name).toBe('nzfs')
      expect(index.preparationById('raw').name).toBe('raw')
    })

    it('throws on an unknown ID, because a validated reference always resolves', () => {
      expect(() => index.foodById('missing')).toThrow('Unknown food "missing".')
      expect(() => index.categoryById('missing')).toThrow('Unknown category "missing".')
      expect(() => index.sourceById('missing')).toThrow('Unknown source "missing".')
      expect(() => index.preparationById('missing')).toThrow('Unknown preparation "missing".')
    })

    it('finds foods, categories, guidance lists, and preparations by slug', () => {
      expect(index.foodBySlug('tuna-slug')?.id).toBe('tuna')
      expect(index.categoryBySlug('fish-slug')?.id).toBe('fish')
      expect(index.guidanceListBySlug('pregnancy-slug')?.id).toBe('pregnancy')
      expect(index.preparationBySlug('raw-slug')?.id).toBe('raw')
    })

    it('returns nothing for an unknown slug, because slugs come from the URL', () => {
      expect(index.foodBySlug('tuna')).toBeUndefined()
      expect(index.categoryBySlug('fish')).toBeUndefined()
      expect(index.guidanceListBySlug('pregnancy')).toBeUndefined()
      expect(index.preparationBySlug('raw')).toBeUndefined()
    })
  })

  describe('assessments for a subject', () => {
    const tuna: AssessmentSubject = { kind: 'food', foodId: 'tuna' }
    const fish: AssessmentSubject = { kind: 'category', categoryId: 'fish' }
    const index = buildContentIndex({
      categories: [category('fish')],
      foods: [food('tuna', 'fish', ['raw', 'cooked'])],
      preparations: [preparation('raw', 1), preparation('cooked', 2)],
      guidanceLists: [guidanceList('pregnancy'), guidanceList('vegetarian')],
      assessments: [
        assessment('tuna-cooked', 'pregnancy', tuna, 'cooked'),
        assessment('tuna-all', 'pregnancy', tuna),
        assessment('tuna-vegetarian', 'vegetarian', tuna),
        assessment('fish-raw', 'pregnancy', fish, 'raw'),
      ],
    })
    const ids = (found: readonly Assessment[]) => found.map(({ id }) => id)

    it('answers the unqualified guidance when no preparation is given', () => {
      expect(ids(index.assessmentsFor('pregnancy', tuna))).toEqual(['tuna-all'])
    })

    it('answers only the guidance qualified by a given preparation', () => {
      expect(ids(index.assessmentsFor('pregnancy', tuna, 'cooked'))).toEqual(['tuna-cooked'])
      expect(ids(index.assessmentsFor('pregnancy', tuna, 'raw'))).toEqual([])
    })

    it('keeps guidance lists and subject kinds apart', () => {
      expect(ids(index.assessmentsFor('vegetarian', tuna))).toEqual(['tuna-vegetarian'])
      expect(ids(index.assessmentsFor('vegetarian', fish, 'raw'))).toEqual([])
      expect(ids(index.assessmentsFor('pregnancy', fish, 'raw'))).toEqual(['fish-raw'])
    })
  })

  // ADR: Model catalogue subjects and preparation independently.
  // See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
  describe('category preparation states and assessment', () => {
    const index = buildContentIndex({
      categories: [category('seafood'), category('fish', 'seafood'), category('cereals')],
      foods: [
        food('salmon', 'fish', ['cooked', 'raw']),
        food('mussels', 'seafood', ['cooked']),
        food('rice', 'cereals'),
      ],
      preparations: [preparation('cooked', 3), preparation('raw', 1), preparation('smoked', 2)],
      guidanceLists: [guidanceList('pregnancy')],
      assessments: [
        assessment('seafood-smoked', 'pregnancy', { kind: 'category', categoryId: 'seafood' }, 'smoked'),
        assessment('seafood-all', 'pregnancy', { kind: 'category', categoryId: 'seafood' }),
        assessment('cereals-all', 'pregnancy', { kind: 'category', categoryId: 'cereals' }),
        assessment('salmon-all', 'pregnancy', { kind: 'food', foodId: 'salmon' }),
      ],
    })
    const ids = (preparations: readonly Preparation[]) => preparations.map(({ id }) => id)

    it('unions the states its own foods declare, in vocabulary order rather than authoring order', () => {
      expect(ids(index.preparationStatesFor('fish'))).toEqual(['raw', 'cooked'])
    })

    it('adds states carrying its own qualified assessments, but not its descendants\' foods', () => {
      expect(ids(index.preparationStatesFor('seafood'))).toEqual(['smoked', 'cooked'])
    })

    it('gives a category whose foods declare nothing no preparation states', () => {
      expect(index.preparationStatesFor('cereals')).toEqual([])
    })

    it('counts a category as assessed only when it carries an assessment of its own', () => {
      expect(index.isCategoryAssessed('seafood')).toBe(true)
      expect(index.isCategoryAssessed('cereals')).toBe(true)
      expect(index.isCategoryAssessed('fish')).toBe(false)
    })
  })
})

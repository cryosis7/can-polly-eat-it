import { describe, expect, it } from 'vitest'
import { assessments } from '../data/assessments'
import { categories } from '../data/categories'
import { foods } from '../data/foods'
import { guidanceLists } from '../data/guidanceLists'
import { createContentIndex } from './contentIndex'
import { filterCategoryEntries, filterFoods } from './filtering'

const index = createContentIndex(categories, assessments)

describe('filterFoods', () => {
  it('matches aliases and normalised category-path text', () => {
    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: 'yógurt',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((category) => category.slug)).toEqual(['pasteurised-yoghurt'])

    expect(filterFoods(foods, guidanceLists, index, {
      query: 'milk-products cheddar',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['cheddar'])
  })

  it('includes foods in descendant categories and resolved fallback statuses', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toContain('cheddar')

    const notAssessed = filterFoods(foods, guidanceLists, index, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-assessed'],
    }).map((food) => food.slug)

    // Every food with no pregnancy rule now shares the single fallback band, whether or not an
    // ancestor was once named in a coverage declaration.
    expect(notAssessed).toContain('yellowfin-tuna')
    expect(notAssessed).toContain('apple-pie')
  })

  it('preserves the source cheese hierarchy and its low-acid soft cheese examples', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'low-acid-soft-pasteurised-cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual([
      'brie',
      'camembert',
      'blue-cheese',
      'ricotta',
      'mozzarella',
      'feta',
      'halloumi',
      'paneer',
    ])

    expect(filterFoods(foods, guidanceLists, index, {
      query: 'dairy cheese low acid pasteurised brie',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['brie'])
  })

  it('resolves cheddar, parmesan, and gouda through the hard-cheese category rule', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['cheddar', 'parmesan', 'gouda'])

    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['vegetarian-suitability'],
      outcomeBands: ['maybe'],
    }).map((food) => food.slug)).toEqual(['cheddar', 'gouda'])
  })

  it('ORs selected outcome bands within a scope while combining category and outcome predicates', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['okay'],
    }).map((food) => food.slug)).toEqual(['breakfast-cereals', 'rice', 'pasta'])

    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['okay', 'maybe'],
    }).map((food) => food.slug)).toEqual(['breakfast-cereals', 'rice', 'pasta', 'fresh-filled-pasta'])
  })

  it('ANDs outcome constraints across selected scopes', () => {
    const primaryList = guidanceLists[0]
    const alternativeList = { ...primaryList, id: 'pregnancy-alternative' }
    const freshFilledPasta = assessments.find((assessment) =>
      assessment.subject.kind === 'food' && assessment.subject.foodId === 'fresh-filled-pasta',
    )!
    const alternativeIndex = createContentIndex(categories, [
      ...assessments,
      { ...freshFilledPasta, id: 'fresh-filled-pasta-pregnancy-alternative', guidanceListId: alternativeList.id },
    ])

    expect(filterFoods(foods, [primaryList, alternativeList], alternativeIndex, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: [primaryList.id, alternativeList.id],
      outcomeBands: ['maybe'],
    }).map((food) => food.slug)).toEqual(['fresh-filled-pasta'])
  })

  it('rejects an unknown selected guidance scope', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      guidanceListIds: ['unknown-guidance-list'],
      outcomeBands: [],
    })).toEqual([])
  })
})

describe('filterCategoryEntries', () => {
  it('includes only categories carrying their own authored assessment', () => {
    const entryIds = filterCategoryEntries(categories, guidanceLists, index, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: [],
    }).map((category) => category.id)

    expect(entryIds).toContain('hard-cheese')
    expect(entryIds).not.toContain('cheese')
    expect(entryIds).not.toContain('dairy')
  })

  it('matches a category entry by its own name and by an ancestor path label', () => {
    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: 'hard cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((category) => category.id)).toEqual(['hard-cheese'])

    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: 'milk-products',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((category) => category.id)).toContain('hard-cheese')
  })

  it('restricts category entries to the selected category filter', () => {
    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: '',
      categoryId: 'seafood',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((category) => category.id)).toEqual(['raw-fish', 'raw-shellfish', 'smoked-seafood', 'freshly-cooked-seafood'])

    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: '',
      categoryId: 'fish-mercury-guidance',
      guidanceListIds: [],
      outcomeBands: [],
    })).toEqual([])
  })

  it('filters category entries by outcome band within the selected scope', () => {
    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['vegetarian-suitability'],
      outcomeBands: ['maybe'],
    }).map((category) => category.id)).toEqual(['hard-cheese'])

    expect(filterCategoryEntries(categories, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['maybe'],
    })).toEqual([])
  })
})

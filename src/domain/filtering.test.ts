import { describe, expect, it } from 'vitest'
import { assessments } from '../data/assessments'
import { categories } from '../data/categories'
import { foods } from '../data/foods'
import { guidanceLists } from '../data/guidanceLists'
import { preparations } from '../data/preparations'
import { content, contentIndex as index } from '../data'
import { buildContentIndex } from '../test/buildContentIndex'
import { filterCategoryEntries, filterFoods } from './filtering'

describe('filterFoods', () => {
  it('matches aliases and normalised category-path text', () => {
    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: 'yógurt',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.category.slug)).toEqual(['yoghurt'])

    expect(filterFoods(foods, guidanceLists, index, {
      query: 'milk-products cheddar',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.food.slug)).toEqual(['cheddar'])
  })

  it('includes foods in descendant categories and resolved fallback statuses', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.food.slug)).toContain('cheddar')

    const notAssessed = filterFoods(foods, guidanceLists, index, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-assessed'],
    }).map((row) => row.food.slug)

    // Every food with no pregnancy rule now shares the single fallback band, whether or not an
    // ancestor was once named in a coverage declaration.
    expect(notAssessed).toContain('gummy-bears')
    expect(notAssessed).toContain('pies-and-other-pastries')
  })

  it('preserves the source cheese hierarchy and its low-acid soft cheese examples', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'low-acid-soft-pasteurised-cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.food.slug)).toEqual([
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
    }).map((row) => row.food.slug)).toEqual(['brie'])
  })

  it('resolves cheddar, parmesan, and gouda through the hard-cheese category rule', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.food.slug)).toEqual(['cheddar', 'parmesan', 'gouda'])

    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['vegetarian-suitability'],
      outcomeBands: ['maybe'],
    }).map((row) => row.food.slug)).toEqual(['cheddar', 'gouda'])
  })

  it('ORs selected outcome bands within a scope while combining category and outcome predicates', () => {
    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['okay'],
    }).map((row) => row.food.slug)).toEqual([
      'breakfast-cereals',
      'rice',
      'pasta',
      'instant-noodles-and-flavour-sachets',
      'risotto-and-prepared-rice-dishes',
    ])

    expect(filterFoods(foods, guidanceLists, index, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['okay', 'maybe'],
    }).map((row) => row.food.slug)).toEqual([
      'breakfast-cereals',
      'rice',
      'pasta',
      'fresh-filled-pasta',
      'instant-noodles-and-flavour-sachets',
      'risotto-and-prepared-rice-dishes',
    ])
  })

  it('ANDs outcome constraints across selected scopes', () => {
    const primaryList = guidanceLists[0]
    const alternativeList = { ...primaryList, id: 'pregnancy-alternative', slug: 'pregnancy-alternative' }
    const freshFilledPasta = assessments.find((assessment) =>
      assessment.subject.kind === 'food' && assessment.subject.foodId === 'fresh-filled-pasta',
    )!
    const alternativeIndex = buildContentIndex({
      ...content,
      guidanceLists: [...guidanceLists, alternativeList],
      assessments: [
        ...assessments,
        { ...freshFilledPasta, id: 'fresh-filled-pasta-pregnancy-alternative', guidanceListId: alternativeList.id },
      ],
    })

    expect(filterFoods(foods, [primaryList, alternativeList], alternativeIndex, {
      query: '',
      categoryId: 'cereals',
      guidanceListIds: [primaryList.id, alternativeList.id],
      outcomeBands: ['maybe'],
    }).map((row) => row.food.slug)).toEqual(['fresh-filled-pasta'])
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
    const entryIds = filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: [],
    }).map((row) => row.category.id)

    expect(entryIds).toContain('hard-cheese')
    expect(entryIds).not.toContain('cheese')
    // dairy now carries the unpasteurised rule itself, so it is an entry in its own right.
    expect(entryIds).toContain('dairy')
  })

  it('matches a category entry by its own name and by an ancestor path label', () => {
    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: 'hard cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.category.id)).toEqual(['hard-cheese'])

    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: 'milk-products',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => row.category.id)).toContain('hard-cheese')
  })

  it('restricts category entries to the selected category filter', () => {
    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: '',
      categoryId: 'seafood',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((row) => `${row.category.id}:${row.preparationId}`)).toEqual(['seafood:smoked', 'seafood:cooked', 'fish:raw', 'shellfish:raw'])

    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: '',
      categoryId: 'crustacea',
      guidanceListIds: [],
      outcomeBands: [],
    })).toEqual([])
  })

  it('filters category entries by outcome band within the selected scope', () => {
    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['vegetarian-suitability'],
      outcomeBands: ['maybe'],
    }).map((row) => row.category.id)).toEqual(['hard-cheese'])

    expect(filterCategoryEntries(categories, assessments, preparations, guidanceLists, index, {
      query: '',
      categoryId: 'hard-cheese',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['maybe'],
    })).toEqual([])
  })
})

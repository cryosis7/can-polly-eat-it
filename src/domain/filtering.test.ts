import { describe, expect, it } from 'vitest'
import { assessments } from '../data/assessments'
import { categories } from '../data/categories'
import { foods } from '../data/foods'
import { guidanceLists } from '../data/guidanceLists'
import { filterFoods } from './filtering'

describe('filterFoods', () => {
  it('matches aliases and normalised category-path text', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: 'yógurt',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['pasteurised-yoghurt'])

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: 'milk-products cheddar',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['cheddar'])
  })

  it('includes foods in descendant categories and resolved fallback statuses', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toContain('cheddar')

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-assessed'],
    }).map((food) => food.slug)).toEqual(['yellowfin-tuna'])
  })

  it('preserves the source cheese hierarchy and its low-acid soft cheese examples', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
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

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: 'dairy cheese low acid pasteurised brie',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['brie'])
  })

  it('ORs selected outcome bands within a scope while combining category and outcome predicates', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-okay', 'not-assessed'],
    }).map((food) => food.slug)).toEqual(['unpasteurised-milk-and-dairy-products', 'soft-serve-ice-cream'])
  })

  it('ANDs outcome constraints across selected scopes', () => {
    const primaryList = guidanceLists[0]
    const alternativeList = { ...primaryList, id: 'pregnancy-alternative' }
    const cookedEggs = assessments.find((assessment) => assessment.foodId === 'cooked-eggs')!

    expect(filterFoods(foods, categories, [primaryList, alternativeList], [
      ...assessments,
      { ...cookedEggs, id: 'cooked-eggs-pregnancy-alternative', guidanceListId: alternativeList.id },
    ], {
      query: '',
      categoryId: 'eggs',
      guidanceListIds: [primaryList.id, alternativeList.id],
      outcomeBands: ['maybe'],
    }).map((food) => food.slug)).toEqual(['cooked-eggs'])
  })

  it('rejects an unknown selected guidance scope', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      guidanceListIds: ['unknown-guidance-list'],
      outcomeBands: [],
    })).toEqual([])
  })
})

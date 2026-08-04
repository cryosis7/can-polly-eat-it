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
      statusIdsByGuidanceListId: {},
    }).map((food) => food.slug)).toEqual(['yoghurt'])

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: 'milk-products hard-cheese',
      statusIdsByGuidanceListId: {},
    }).map((food) => food.slug)).toEqual(['cheddar'])
  })

  it('includes foods in descendant categories and resolved fallback statuses', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      statusIdsByGuidanceListId: {},
    }).map((food) => food.slug)).toEqual(['cheddar', 'brie', 'yoghurt'])

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      statusIdsByGuidanceListId: {
        'pregnancy-food-safety': ['pregnancy-not-assessed'],
      },
    }).map((food) => food.slug)).toEqual(['yoghurt'])
  })

  it('ORs selected statuses within a list while combining category and status predicates', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      statusIdsByGuidanceListId: {
        'pregnancy-food-safety': ['pregnancy-avoid', 'pregnancy-not-assessed'],
      },
    }).map((food) => food.slug)).toEqual(['brie', 'yoghurt'])
  })
})

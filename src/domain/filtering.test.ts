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
    }).map((food) => food.slug)).toEqual(['yoghurt'])

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: 'milk-products hard-cheese',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['cheddar', 'parmesan'])
  })

  it('includes foods in descendant categories and resolved fallback statuses', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: [],
      outcomeBands: [],
    }).map((food) => food.slug)).toEqual(['cheddar', 'parmesan', 'brie', 'yoghurt'])

    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-assessed'],
    }).map((food) => food.slug)).toEqual([
      'parmesan',
      'yoghurt',
      'apple-pie',
      'french-fries',
      'gummy-bears',
      'jelly',
      'marshmallows',
      'panna-cotta',
      'starburst',
      'tortillas',
      'vegetable-soup',
      'white-sugar',
      'worcestershire-sauce',
    ])
  })

  it('ORs selected outcome bands within a scope while combining category and outcome predicates', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: ['pregnancy-food-safety'],
      outcomeBands: ['not-okay', 'not-assessed'],
    }).map((food) => food.slug)).toEqual(['parmesan', 'brie', 'yoghurt'])
  })

  it('ANDs outcome constraints across vegetarian and pregnancy scopes', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      categoryId: 'dairy',
      guidanceListIds: ['vegetarian-suitability', 'pregnancy-food-safety'],
      outcomeBands: ['maybe', 'not-assessed'],
    }).map((food) => food.slug)).toEqual(['yoghurt'])
  })

  it('rejects an unknown selected guidance scope', () => {
    expect(filterFoods(foods, categories, guidanceLists, assessments, {
      query: '',
      guidanceListIds: ['unknown-guidance-list'],
      outcomeBands: [],
    })).toEqual([])
  })
})

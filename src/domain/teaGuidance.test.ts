import { describe, expect, it } from 'vitest'
import { content, contentIndex as index } from '../data'
import { resolveAssessment } from './assessment'
import { matchesSearchQuery } from './search'

const pregnancy = content.guidanceLists.find((list) => list.id === 'pregnancy-food-safety')!

const foodNamed = (foodId: string) => content.foods.find((food) => food.id === foodId)!
const categoryNamed = (categoryId: string) =>
  content.categories.find((category) => category.id === categoryId)!

const resolveFood = (foodId: string) =>
  resolveAssessment({ kind: 'food', food: foodNamed(foodId) }, pregnancy, index)

const resolveCategory = (categoryId: string) =>
  resolveAssessment({ kind: 'category', category: categoryNamed(categoryId) }, pregnancy, index)

/** The status each source reached, keyed by source so the assertion does not depend on row order. */
const positionsOf = (foodId: string) => Object.fromEntries(
  resolveFood(foodId).positions.map((position) => [position.sourceId, position.status.label]),
)

describe('tea guidance from three partly-disagreeing sources', () => {
  it('governs a contested tea with the most cautious authored status and names every position', () => {
    const chamomile = resolveFood('chamomile-tea')

    expect(chamomile.status.label).toBe('Avoid')
    expect(positionsOf('chamomile-tea')).toEqual({
      'medeniyet-medical-journal': 'Avoid',
      babycenter: 'Avoid',
      'american-pregnancy-association': 'Not enough evidence',
    })
  })

  it('shows a source that declined to judge as declining, not as setting conditions', () => {
    const apa = resolveFood('chamomile-tea').positions
      .find((position) => position.sourceId === 'american-pregnancy-association')!

    expect(apa.status.id).toBe('pregnancy-insufficient-evidence')
    expect(apa.status.outcomeBand).toBe('maybe')
    expect(apa.layers[0].assessment.summary)
      .toContain('insufficient reliable information available')
  })

  it('governs a tea whose only assessment is an absence of evidence with that status alone', () => {
    for (const foodId of ['dandelion-tea', 'rose-hip-tea']) {
      const resolved = resolveFood(foodId)
      expect(resolved.status.label, foodId).toBe('Not enough evidence')
      // One source spoke, so nothing is contested and no dissent notice is rendered.
      expect(resolved.positions, foodId).toEqual([])
    }
  })

  it('lets the cautious position govern peppermint while both permissive sources stay visible', () => {
    expect(resolveFood('peppermint-tea').status.label).toBe('Only with conditions')
    expect(positionsOf('peppermint-tea')).toEqual({
      'medeniyet-medical-journal': 'Only with conditions',
      'american-pregnancy-association': 'OK to eat',
      babycenter: 'OK to eat',
    })
  })

  it('stacks three agreeing sources as separate layers rather than merging their wording', () => {
    const ginger = resolveFood('ginger-tea')

    expect(ginger.status.label).toBe('Only with conditions')
    // Agreement on status means no competing positions, and three distinct authored sentences.
    expect(ginger.positions).toEqual([])
    expect(ginger.layers).toHaveLength(3)
    expect(new Set(ginger.layers.map((layer) => layer.assessment.summary)).size).toBe(3)
    expect(ginger.layers.flatMap((layer) => layer.sourceIds).sort()).toEqual([
      'american-pregnancy-association',
      'babycenter',
      'medeniyet-medical-journal',
    ])
  })

  it('keeps each source’s own caffeine limit in that source’s own sentence', () => {
    const caffeinated = resolveCategory('caffeinated-tea')
    const summaries = caffeinated.layers.map((layer) => layer.assessment.summary!)

    expect(caffeinated.status.label).toBe('Only with conditions')
    // BabyCenter sets a figure and the American Pregnancy Association declines to, so the reader is
    // shown one number attributed to the source that set it rather than a reconciled limit.
    expect(summaries.find((summary) => summary.includes('200 mg'))).toBeTruthy()
    expect(summaries.find((summary) => summary.includes('no agreed safe amount'))).toBeTruthy()
    expect(summaries.filter((summary) => summary.includes('300 mg'))).toEqual([])
  })

  it('governs the herbal-tea group with its most cautious rule, and keeps the sources unmerged', () => {
    const herbal = resolveCategory('herbal-tea')

    // All three remaining sources reach the same status here, so nothing is contested and the group
    // shows one status over three separately authored rules.
    expect(herbal.status.label).toBe('Only with conditions')
    expect(herbal.positions).toEqual([])
    expect(herbal.layers.flatMap((layer) => layer.sourceIds).sort()).toEqual([
      'american-pregnancy-association',
      'babycenter',
      'medeniyet-medical-journal',
    ])
  })

  it('carries no herbal tea that no source named', () => {
    // The catalogue earns its entries from sources: a tea is listed because a reviewed source named
    // it, never because it is a tea people drink. Herbal teas are always named individually, because
    // each herb is its own question, so every one must hold its own assessment. This guard is why
    // `Thyme tea` was removed when the only source naming it was dropped.
    const herbalTeas = content.foods.filter((food) => food.primaryCategoryId === 'herbal-tea')

    expect(herbalTeas.length).toBeGreaterThan(0)
    for (const food of herbalTeas) {
      const own = content.assessments.filter((assessment) =>
        assessment.subject.kind === 'food' && assessment.subject.foodId === food.id)
      expect(own.length, `"${food.name}" has no assessment of its own`).toBeGreaterThan(0)
      expect(resolveFood(food.id).origin, food.id).toEqual({ kind: 'own' })
    }
  })

  it('covers every caffeinated tea by the group rule its sources authored', () => {
    // Caffeinated teas are the one place a group rule is the whole answer: both sources address
    // "black, green and white teas" as one class and set one caffeine budget over it. So these are
    // source-backed through the group rather than individually, and none may fall back to
    // not-assessed.
    const caffeinated = content.foods.filter((food) => food.primaryCategoryId === 'caffeinated-tea')

    expect(caffeinated.length).toBeGreaterThan(0)
    for (const food of caffeinated) {
      const resolved = resolveFood(food.id)
      expect(resolved.status.id, food.id).not.toBe(pregnancy.unassessedStatusId)
      expect(resolved.layers.length, food.id).toBeGreaterThan(0)
      expect(resolved.layers.every((layer) => layer.sourceIds.length > 0), food.id).toBe(true)
    }
    expect(resolveCategory('caffeinated-tea').origin).toEqual({ kind: 'own' })
    expect(resolveCategory('herbal-tea').origin).toEqual({ kind: 'own' })
  })

  it('adds the green-tea folate limit to BabyCenter’s caffeine rule instead of replacing it', () => {
    const green = resolveFood('green-tea')
    const summaries = green.layers.map((layer) => layer.assessment.summary!)

    expect(green.status.label).toBe('Only with conditions')
    expect(summaries.some((summary) => summary.includes('folic acid'))).toBe(true)
    expect(summaries.some((summary) => summary.includes('200 mg'))).toBe(true)
  })

  it('cites a durable source URL and an exact locator on every tea assessment', () => {
    const teaCategoryIds = new Set(['caffeinated-tea', 'herbal-tea'])
    const teaFoodIds = new Set(
      content.foods.filter((food) => teaCategoryIds.has(food.primaryCategoryId)).map((food) => food.id),
    )
    const teaAssessments = content.assessments.filter((assessment) => (
      assessment.subject.kind === 'food'
        ? teaFoodIds.has(assessment.subject.foodId)
        : teaCategoryIds.has(assessment.subject.categoryId)
    ))

    expect(teaAssessments.length).toBeGreaterThan(0)
    for (const assessment of teaAssessments) {
      expect(assessment.sourceId, assessment.id).toBeTruthy()
      expect(pregnancy.sourceIds, assessment.id).toContain(assessment.sourceId)
      expect(assessment.citations, assessment.id).toHaveLength(1)
      expect(assessment.citations[0].url.startsWith('https://'), assessment.id).toBe(true)
      expect(assessment.citations[0].locator.trim().length, assessment.id).toBeGreaterThan(0)
    }
  })

  it('never authors the not-assessed fallback onto a tea', () => {
    const authoredStatusIds = new Set(content.assessments.map((assessment) => assessment.statusId))
    expect(authoredStatusIds.has(pregnancy.unassessedStatusId)).toBe(false)
  })

  it('finds tea by the names people search for', () => {
    const matches = (query: string, foodId: string) =>
      matchesSearchQuery(foodNamed(foodId), index.tree, query)

    expect(matches('earl grey', 'black-tea')).toBe(true)
    expect(matches('camomile', 'chamomile-tea')).toBe(true)
    expect(matches('tisane', 'peppermint-tea')).toBe(true)
    expect(matches('matcha latte', 'matcha-tea')).toBe(true)
    expect(matches('red raspberry leaf', 'raspberry-leaf-tea')).toBe(true)
  })
})

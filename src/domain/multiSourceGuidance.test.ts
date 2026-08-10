import { describe, expect, it } from 'vitest'
import { assessmentSummary, resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import { validateContent } from './contentValidation'
import { filterFoods } from './filtering'
import {
  categoryAssessment,
  dualSourceContent,
  dualSourceList,
  foodAssessment,
  mussels,
  oysters,
} from '../test/multiSourceFixture'

const resolve = (assessments: ReturnType<typeof foodAssessment>[], food = oysters) => {
  const content = validateContent(dualSourceContent(assessments))
  const index = createContentIndex(content.categories, content.assessments)
  return resolveAssessment({ kind: 'food', food }, dualSourceList, index)
}

const nzfsSays = (statusId: string, summary?: string) =>
  foodAssessment('oysters-nzfs', 'oysters', statusId, { sourceId: 'nzfs', summary })

const nswSays = (statusId: string, summary?: string) =>
  foodAssessment('oysters-nsw', 'oysters', statusId, { sourceId: 'nsw-health', summary })

describe('guidance from more than one source', () => {
  it('shows one status and both sources when they agree and word it identically', () => {
    const resolved = resolve([
      nzfsSays('dual-conditions', 'Cook shellfish thoroughly.'),
      nswSays('dual-conditions', 'Cook shellfish thoroughly.'),
    ])

    expect(resolved.status.label).toBe('Only with conditions')
    expect(resolved.layers).toHaveLength(1)
    expect(resolved.layers[0].sourceIds).toEqual(['nzfs', 'nsw-health'])
    expect(resolved.positions).toEqual([])
  })

  it('unions the citations of an identically worded statement without merging any text', () => {
    const resolved = resolve([
      nzfsSays('dual-ok', 'Eat freely.'),
      foodAssessment('oysters-nsw', 'oysters', 'dual-ok', {
        sourceId: 'nsw-health',
        summary: 'Eat freely.',
        citations: [{ title: 'NSW', url: 'https://example-nsw.test/oysters', locator: 'Oysters' }],
      }),
    ])

    expect(resolved.layers).toHaveLength(1)
    expect(resolved.layers[0].citations.map((citation) => citation.title)).toEqual(['NSW'])
    expect(resolved.layers[0].assessment.summary).toBe('Eat freely.')
  })

  it('keeps two layers when agreeing sources word their advice differently', () => {
    const resolved = resolve([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-ok', 'Eat freely!'),
    ])

    expect(resolved.status.label).toBe('OK to eat')
    expect(resolved.layers.map((layer) => layer.sourceIds)).toEqual([['nzfs'], ['nsw-health']])
    expect(resolved.positions).toEqual([])
  })

  it('shows the most cautious authored status and one position per source when they disagree', () => {
    const resolved = resolve([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-avoid', 'Do not eat these.'),
    ])

    expect(resolved.status.label).toBe('Avoid')
    expect(resolved.positions.map((position) => [position.sourceId, position.status.label])).toEqual([
      ['nzfs', 'OK to eat'],
      ['nsw-health', 'Avoid'],
    ])
    expect(resolved.positions.map((position) => position.layers.map((layer) => layer.sourceIds))).toEqual([
      [['nzfs']],
      [['nsw-health']],
    ])
  })

  it('breaks a tie within an outcome band on the order the list declares its sources', () => {
    const resolved = resolve([
      nzfsSays('dual-avoid', 'Do not eat these.'),
      nswSays('dual-steer-clear', 'Steer clear of these.'),
    ])

    expect(resolved.status.label).toBe('Avoid')
    expect(resolved.positions).toHaveLength(2)
  })

  it('labels a cross-source inherited layer with the source that stated it', () => {
    const content = validateContent(dualSourceContent([
      categoryAssessment('shellfish-nzfs', 'shellfish', 'dual-conditions', {
        sourceId: 'nzfs',
        summary: 'Cook all shellfish thoroughly.',
      }),
      foodAssessment('oysters-nsw', 'oysters', 'dual-avoid', {
        sourceId: 'nsw-health',
        summary: 'Do not eat raw oysters at all.',
        relation: 'adds-to',
      }),
    ]))
    const index = createContentIndex(content.categories, content.assessments)

    const resolved = resolveAssessment({ kind: 'food', food: oysters }, dualSourceList, index)
    expect(resolved.status.label).toBe('Avoid')
    expect(resolved.layers.map((layer) => layer.sourceIds)).toEqual([['nzfs'], ['nsw-health']])
    expect(resolved.layers[0].origin).toEqual({ kind: 'inherited', category: content.categories[1] })
  })

  it('treats a source that has not assessed a food as silent, not as agreeing or dissenting', () => {
    const resolved = resolve([nzfsSays('dual-avoid', 'Do not eat these.')])

    expect(resolved.status.label).toBe('Avoid')
    expect(resolved.positions).toEqual([])
    expect(resolved.layers[0].sourceIds).toEqual(['nzfs'])
  })

  it('falls back to the list wording when a source authors no summary of its own', () => {
    const resolved = resolve([nzfsSays('dual-ok')])

    expect(assessmentSummary(resolved.assessment!, dualSourceList)).toBe('The guide lists this food as okay to eat.')
  })

  it('resolves an unassessed food to the list not-assessed state with no layers or positions', () => {
    const resolved = resolve([nzfsSays('dual-ok', 'Eat freely.')], mussels)

    expect(resolved.status.label).toBe('Not assessed')
    expect(resolved.layers).toEqual([])
    expect(resolved.positions).toEqual([])
  })

  it('gives a contested additive position its own inherited layers, labelled by the source that stated them', () => {
    const content = validateContent(dualSourceContent([
      categoryAssessment('shellfish-nzfs', 'shellfish', 'dual-conditions', {
        sourceId: 'nzfs',
        summary: 'Cook all shellfish thoroughly.',
      }),
      foodAssessment('oysters-nzfs', 'oysters', 'dual-conditions', {
        sourceId: 'nzfs',
        summary: 'Shuck them just before cooking.',
        relation: 'adds-to',
      }),
      foodAssessment('oysters-nsw', 'oysters', 'dual-avoid', {
        sourceId: 'nsw-health',
        summary: 'Do not eat these at all.',
      }),
    ]))
    const index = createContentIndex(content.categories, content.assessments)

    const resolved = resolveAssessment({ kind: 'food', food: oysters }, dualSourceList, index)
    expect(resolved.status.label).toBe('Avoid')
    expect(resolved.positions.map((position) => position.layers.map((layer) => layer.assessment.id))).toEqual([
      ['shellfish-nzfs', 'oysters-nzfs'],
      ['oysters-nsw'],
    ])
  })

  it('accepts two assessments for one subject from different sources, and rejects two from the same source', () => {
    expect(() => validateContent(dualSourceContent([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-avoid', 'Do not eat these.'),
    ]))).not.toThrow()

    expect(() => validateContent(dualSourceContent([
      nzfsSays('dual-ok', 'Eat freely.'),
      foodAssessment('oysters-nzfs-again', 'oysters', 'dual-avoid', { sourceId: 'nzfs', summary: 'Avoid.' }),
    ]))).toThrow('duplicate subject/preparation/list/source assessment pair')
  })

  it('filters a contested food under its most cautious band only, and counts it once', () => {
    const content = validateContent(dualSourceContent([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-avoid', 'Do not eat these.'),
    ]))
    const index = createContentIndex(content.categories, content.assessments)
    const filters = { query: '', guidanceListIds: [dualSourceList.id], outcomeBands: [] }

    expect(filterFoods(content.foods, content.guidanceLists, index, { ...filters, outcomeBands: ['not-okay'] })
      .map((row) => row.food.id)).toEqual(['oysters'])
    expect(filterFoods(content.foods, content.guidanceLists, index, { ...filters, outcomeBands: ['okay'] }))
      .toEqual([])
  })
})

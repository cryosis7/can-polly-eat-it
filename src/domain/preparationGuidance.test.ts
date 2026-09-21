import { describe, expect, it } from 'vitest'
import { resolveAssessment } from './assessment'
import { createContentIndex } from './contentIndex'
import { validateContent } from './contentValidation'
import {
  categoryAssessment,
  dualSourceContent,
  foodAssessment,
  makeFood,
  nzfs,
  nswHealth,
  dualSourceList as list,
} from '../test/multiSourceFixture'
import type { Assessment, Food } from './schemas'

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
//
// Salmon stands for the case the ADR was written for: one authority reasoning by preparation and
// another by species, against the same food.
const salmon: Food = makeFood('salmon', 'shellfish', ['raw', 'smoked', 'cooked'])
const plainFood: Food = makeFood('mussels')

const indexFor = (assessments: Assessment[], foods: Food[] = [salmon, plainFood]) => {
  const content = validateContent(dualSourceContent(assessments, foods))
  return createContentIndex(content.categories, content.assessments)
}

const resolveSalmon = (assessments: Assessment[], preparationId?: string) =>
  resolveAssessment({ kind: 'food', food: salmon }, list, indexFor(assessments), preparationId)

const summaries = (assessments: Assessment[], preparationId?: string) =>
  resolveSalmon(assessments, preparationId).layers.map((layer) => layer.assessment.summary)

const avoidRaw = foodAssessment('salmon-nhs-raw', 'salmon', 'dual-avoid', {
  preparationId: 'raw',
  sourceId: nswHealth.id,
  summary: 'Do not eat raw fish.',
})

const mercuryLimit = foodAssessment('salmon-nzfs', 'salmon', 'dual-conditions', {
  sourceId: nzfs.id,
  summary: 'Limit to 3 to 4 servings a week.',
})

describe('preparation-qualified guidance', () => {
  it('applies a qualified assessment only in its own preparation context', () => {
    expect(summaries([avoidRaw], 'raw')).toEqual(['Do not eat raw fish.'])
    expect(summaries([avoidRaw], 'cooked')).toEqual([])
    expect(resolveSalmon([avoidRaw], 'cooked').status.label).toBe('Not assessed')
  })

  it('leaves qualified guidance out of a preparation-free resolution entirely', () => {
    const resolved = resolveSalmon([avoidRaw])

    expect(resolved.layers).toEqual([])
    expect(resolved.status.label).toBe('Not assessed')
  })

  it('carries a species-level limit and preparation advice together, most cautious governing', () => {
    const raw = resolveSalmon([mercuryLimit, avoidRaw], 'raw')

    expect(raw.status.label).toBe('Avoid')
    expect(raw.layers.map((layer) => layer.assessment.summary)).toEqual([
      'Limit to 3 to 4 servings a week.',
      'Do not eat raw fish.',
    ])
    expect(raw.positions.map((position) => [position.sourceId, position.status.label])).toEqual([
      [nzfs.id, 'Only with conditions'],
      [nswHealth.id, 'Avoid'],
    ])
  })

  it('shows the species-level limit alone in a preparation the other source did not address', () => {
    const cooked = resolveSalmon([mercuryLimit, avoidRaw], 'cooked')

    expect(cooked.status.label).toBe('Only with conditions')
    expect(cooked.layers.map((layer) => layer.assessment.summary)).toEqual([
      'Limit to 3 to 4 servings a week.',
    ])
    expect(cooked.positions).toEqual([])
  })

  it('lets one source qualify its own unqualified guidance without either being lost', () => {
    const nzfsRaw = foodAssessment('salmon-nzfs-raw', 'salmon', 'dual-avoid', {
      preparationId: 'raw',
      sourceId: nzfs.id,
      summary: 'Do not eat this raw.',
    })
    const raw = resolveSalmon([mercuryLimit, nzfsRaw], 'raw')

    expect(raw.status.label).toBe('Avoid')
    expect(raw.assessment?.id).toBe('salmon-nzfs-raw')
    expect(raw.layers.map((layer) => layer.assessment.summary)).toEqual([
      'Limit to 3 to 4 servings a week.',
      'Do not eat this raw.',
    ])
    expect(raw.positions).toEqual([])
  })

  it('renders both of a source\'s statements within its position when sources disagree', () => {
    const nzfsRaw = foodAssessment('salmon-nzfs-raw', 'salmon', 'dual-conditions', {
      preparationId: 'raw',
      sourceId: nzfs.id,
      summary: 'Freeze before serving raw.',
    })
    const raw = resolveSalmon([mercuryLimit, nzfsRaw, avoidRaw], 'raw')

    expect(raw.status.label).toBe('Avoid')
    expect(raw.positions.map((position) => position.layers.map((layer) => layer.assessment.id))).toEqual([
      ['salmon-nzfs', 'salmon-nzfs-raw'],
      ['salmon-nhs-raw'],
    ])
  })

  it('layers a preparation-qualified category rule onto that preparation only', () => {
    const rawShellfish = categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
      preparationId: 'raw',
      sourceId: nzfs.id,
      summary: 'Avoid raw shellfish.',
    })

    expect(summaries([rawShellfish], 'raw')).toEqual(['Avoid raw shellfish.'])
    expect(summaries([rawShellfish], 'smoked')).toEqual([])
    expect(resolveAssessment({ kind: 'food', food: plainFood }, list, indexFor([rawShellfish]), 'raw')
      .layers.map((layer) => layer.assessment.summary)).toEqual(['Avoid raw shellfish.'])
  })

  it('accumulates an additive qualified assessment onto its qualified ancestor', () => {
    const rawShellfish = categoryAssessment('shellfish-raw', 'shellfish', 'dual-conditions', {
      preparationId: 'raw',
      sourceId: nzfs.id,
      summary: 'Avoid raw shellfish.',
    })
    const salmonRaw = foodAssessment('salmon-raw', 'salmon', 'dual-avoid', {
      preparationId: 'raw',
      relation: 'adds-to',
      sourceId: nzfs.id,
      summary: 'Salmon especially.',
    })

    expect(summaries([rawShellfish, salmonRaw], 'raw')).toEqual([
      'Avoid raw shellfish.',
      'Salmon especially.',
    ])
    expect(summaries([rawShellfish, salmonRaw], 'cooked')).toEqual([])
  })

  it('falls back to the list not-assessed state for a preparation nothing addresses', () => {
    const resolved = resolveSalmon([avoidRaw], 'smoked')

    expect(resolved.status.label).toBe('Not assessed')
    expect(resolved.layers).toEqual([])
    expect(resolved.positions).toEqual([])
    expect(resolved.origin).toEqual({ kind: 'not-assessed' })
  })

  it('resolves a food declaring no preparations exactly as it did before preparations existed', () => {
    const mussels = foodAssessment('mussels-nzfs', 'mussels', 'dual-ok', {
      sourceId: nzfs.id,
      summary: 'Fine to eat.',
    })
    const index = indexFor([mussels])
    const withoutContext = resolveAssessment({ kind: 'food', food: plainFood }, list, index)

    expect(withoutContext.status.label).toBe('OK to eat')
    expect(withoutContext.layers.map((layer) => layer.assessment.id)).toEqual(['mussels-nzfs'])
    expect(resolveAssessment({ kind: 'food', food: plainFood }, list, index, 'raw')).toEqual(withoutContext)
  })

  it('resolves a category subject in a preparation context', () => {
    const rawShellfish = categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
      preparationId: 'raw',
      sourceId: nzfs.id,
      summary: 'Avoid raw shellfish.',
    })
    const shellfish = { kind: 'category' as const, category: { id: 'shellfish', slug: 'shellfish', name: 'Shellfish', parentId: 'seafood', aliases: [], sortOrder: 1 } }
    const index = indexFor([rawShellfish])

    expect(resolveAssessment(shellfish, list, index, 'raw').status.label).toBe('Avoid')
    expect(resolveAssessment(shellfish, list, index).status.label).toBe('Not assessed')
  })
})

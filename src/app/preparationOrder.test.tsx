import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { content } from '../data'
import { App } from './App'

// Real content is authored in vocabulary order throughout, so only edited content can catch a regression.
vi.mock('../data/foods', async (importOriginal) => {
  const { foods } = await importOriginal<typeof import('../data/foods')>()
  const declared: Record<string, string[]> = {
    anchovy: ['cooked', 'raw'],
    barracouta: ['smoked', 'dried', 'cooked'],
  }
  return {
    foods: foods.map((food) => (food.id in declared ? { ...food, preparationIds: declared[food.id] } : food)),
  }
})

vi.mock('../data/preparations', async (importOriginal) => {
  const { preparations } = await importOriginal<typeof import('../data/preparations')>()
  return { preparations: [...preparations].reverse() }
})

const preparationHeadings = (container: HTMLElement) => within(container)
  .getAllByRole('heading', { name: /^(Raw|Dried|Smoked|Cooked)$/ })
  .map((heading) => heading.textContent)

afterEach(() => {
  window.history.pushState({}, '', '/')
})

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
describe('preparation order on food detail', () => {
  it('orders declared and group-rule preparation sections by the vocabulary, not by declaration', () => {
    expect(content.foods.find((food) => food.id === 'anchovy')!.preparationIds).toEqual(['cooked', 'raw'])
    expect(content.preparations[0].id).toBe('soft-serve')

    window.history.pushState({}, '', '/food/anchovy')
    render(<App />)

    expect(preparationHeadings(screen.getByRole('region', { name: 'Guidance' }))).toEqual(['Raw', 'Cooked'])
    expect(preparationHeadings(screen.getByRole('region', { name: /^General guidance for .+ applies:$/ })))
      .toEqual(['Dried', 'Smoked'])
  })
})

import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'

const pregnancy = 'Pregnancy food safety'
const vegetarian = 'Vegetarian suitability'

// Parsed scopes keep URL order; the reader still sees lists in the order they are authored.
const scopesOutOfOrder = 'v=1&scope=vegetarian-suitability,pregnancy-food-safety'

const listHeadings = () => within(screen.getByRole('main'))
  .getAllByRole('heading', { name: new RegExp(`^(${pregnancy}|${vegetarian})$`) })
  .map((heading) => heading.textContent)

const renderAtPath = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<App />)
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

// ADR: Model guidance as independent lists and sources.
// See: docs/decisions/2026-09-21 ADR - model guidance as independent lists and sources.md
describe('guidance list order when the URL names scopes out of authored order', () => {
  it('renders each preparation section of a food detail page in authored list order', () => {
    renderAtPath(`/food/farmed-salmon?${scopesOutOfOrder}`)

    expect(listHeadings()).toEqual([pregnancy, vegetarian, pregnancy, vegetarian, pregnancy, vegetarian])
  })

  it('renders a category detail page in authored list order', () => {
    renderAtPath(`/category/hard-cheese?${scopesOutOfOrder}`)

    expect(listHeadings()).toEqual([pregnancy, vegetarian])
  })

  it('renders a catalogue card in authored list order', () => {
    renderAtPath(`/?${scopesOutOfOrder}&q=cheddar`)

    expect(listHeadings()).toEqual([pregnancy, vegetarian])
  })
})

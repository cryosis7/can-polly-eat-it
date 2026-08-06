import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import { CategoryDetailPage } from './CategoryDetailPage'

const disclaimer = 'This guide is general information, not medical advice.'

const renderDetail = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/category/:categorySlug" element={<CategoryDetailPage content={content} disclaimer={disclaimer} />} />
    </Routes>
  </MemoryRouter>,
)

describe('CategoryDetailPage', () => {
  it('renders guidance for an assessed category across selected scopes', () => {
    renderDetail('/category/hard-cheese?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Hard cheese' })).toBeInTheDocument()
    expect(screen.getByText('Dairy > Cheese > Hard cheese')).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('The guide lists hard cheese as okay to eat when refrigerated.')).toBeInTheDocument()
    expect(screen.getByText('Check ingredients')).toBeInTheDocument()
    expect(screen.getByText('Traditional hard cheese can be set using animal-derived rennet, so check the label.')).toBeInTheDocument()
    expect(screen.getByLabelText('Medical information disclaimer')).toHaveTextContent(disclaimer)
  })

  it('links back to the food guide preserving the current query', () => {
    renderDetail('/category/hard-cheese?v=1&scope=pregnancy-food-safety&q=cheese&category=dairy')

    expect(screen.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&scope=pregnancy-food-safety&q=cheese&category=dairy',
    )
  })

  it('renders a safe not-found state for an unknown category slug', () => {
    renderDetail('/category/unknown-category?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Category not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to the food guide' })).toBeInTheDocument()
  })

  it('renders the same not-found state for a category that only inherits and carries no own assessment', () => {
    renderDetail('/category/cheese?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Category not found' })).toBeInTheDocument()
  })
})

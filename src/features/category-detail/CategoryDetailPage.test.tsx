import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { contentIndex } from '../../data'
import type { ContentData } from '../../domain/contentValidation'
import { buildContentIndex } from '../../test/buildContentIndex'
import { categoryAssessment, dualSourceContent } from '../../test/multiSourceFixture'
import { CategoryDetailPage } from './CategoryDetailPage'

const disclaimer = 'This guide is general information, not medical advice.'

const renderDetail = (path: string, pageContent?: ContentData) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/category/:categorySlug" element={<CategoryDetailPage disclaimer={disclaimer} index={pageContent === undefined ? contentIndex : buildContentIndex(pageContent)} />} />
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

  // A category holding only preparation-qualified guidance must never render the neutral fallback:
  // it has been assessed, and `not-assessed` never means safe.
  it('renders one section per preparation the category is assessed for, each with its own wording', () => {
    const qualified = dualSourceContent([
      categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
        preparationId: 'raw',
        sourceId: 'nzfs',
        summary: 'Do not eat raw shellfish.',
      }),
      categoryAssessment('shellfish-cooked', 'shellfish', 'dual-conditions', {
        preparationId: 'cooked',
        sourceId: 'nzfs',
        summary: 'Cook shellfish thoroughly and eat it while hot.',
      }),
    ], [])

    renderDetail('/category/shellfish?v=1&scope=dual', qualified)

    expect(screen.getByRole('heading', { name: 'Raw' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cooked' })).toBeInTheDocument()
    expect(screen.getAllByText('Do not eat raw shellfish.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Cook shellfish thoroughly and eat it while hot.').length).toBeGreaterThan(0)
    expect(screen.queryByText('Not assessed')).not.toBeInTheDocument()
  })

  it('renders unqualified guidance above the preparation sections when the category holds both', () => {
    const both = dualSourceContent([
      categoryAssessment('shellfish-wide', 'shellfish', 'dual-ok', {
        sourceId: 'nzfs',
        summary: 'Shellfish is okay to eat.',
      }),
      categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
        preparationId: 'raw',
        sourceId: 'nzfs',
        summary: 'Do not eat raw shellfish.',
      }),
    ], [])

    renderDetail('/category/shellfish?v=1&scope=dual', both)

    expect(screen.getAllByText('Shellfish is okay to eat.').length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Raw' })).toBeInTheDocument()
    expect(screen.getAllByText('Do not eat raw shellfish.').length).toBeGreaterThan(0)
  })

  it('names the preparation the reader arrived from', () => {
    const qualified = dualSourceContent([
      categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
        preparationId: 'raw',
        sourceId: 'nzfs',
        summary: 'Do not eat raw shellfish.',
      }),
    ], [])

    renderDetail('/category/shellfish?v=1&scope=dual&prep=raw', qualified)

    expect(screen.getByText('- the preparation you were looking at')).toBeInTheDocument()
  })
})

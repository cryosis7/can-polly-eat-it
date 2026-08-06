import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import type { ContentData } from '../../domain/contentValidation'
import { FoodDetailPage } from './FoodDetailPage'

const disclaimer = 'This guide is general information, not medical advice.'

const detailedContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.subject.kind === 'food' && assessment.subject.foodId === 'leftover-cooked-foods'
      ? {
          ...assessment,
          guidanceScenarios: [
            {
              id: 'reheated-leftovers',
              applicability: 'When reheating leftovers',
              instruction: 'Reheat until steaming hot before serving.',
              conditions: [
                {
                  id: 'heat-leftovers',
                  kind: 'preparation',
                  instruction: 'Heat all parts thoroughly.',
                  facts: [{ label: 'Temperature', valueText: '75 degC' }],
                },
                {
                  id: 'serve-leftovers',
                  kind: 'serving',
                  instruction: 'Serve immediately after reheating.',
                },
              ],
            },
            {
              id: 'discard-leftovers',
              applicability: 'When leftovers cannot be reheated',
              instruction: 'Discard them instead.',
              conditions: [],
            },
          ],
          reasonLinks: [{ kind: 'contains', targetFoodId: 'cheddar', statement: 'Contains' }],
        }
      : assessment
  )),
}

const renderDetail = (path: string, detailContent = content) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/food/:foodSlug" element={<FoodDetailPage content={detailContent} disclaimer={disclaimer} />} />
    </Routes>
  </MemoryRouter>,
)

const outsideCoverageContent: ContentData = {
  ...content,
  guidanceLists: content.guidanceLists.map((list) => ({
    ...list,
    coverage: { ...list.coverage, mode: 'category-subtrees-and-foods', categoryIds: [], foodIds: [] },
  })),
}

const uncitedVegetarianContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.subject.kind === 'food' && assessment.subject.foodId === 'parmesan' && assessment.guidanceListId === 'vegetarian-suitability'
      ? { ...assessment, citations: [] }
      : assessment
  )),
}

describe('FoodDetailPage', () => {
  it('renders an assessed food with its status, summary, and citation', () => {
    renderDetail('/food/cheddar?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Cheddar' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('The guide lists hard cheese as okay to eat when refrigerated.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy',
    )
  })

  it('discloses inherited hard-cheese guidance for Gouda, which has no assessment of its own', () => {
    renderDetail('/food/gouda?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Gouda' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('Check ingredients')).toBeInTheDocument()
    expect(screen.getAllByText(/Applies to all hard cheese\./)).toHaveLength(2)
    const categoryLinks = screen.getAllByRole('link', { name: 'See Hard cheese guidance' })
    expect(categoryLinks).toHaveLength(2)
    expect(categoryLinks[0]).toHaveAttribute(
      'href',
      '/category/hard-cheese?v=1&scope=pregnancy-food-safety%2Cvegetarian-suitability',
    )
  })

  it('renders distinct guidance scenarios, optional facts, and authored reason links', () => {
    renderDetail('/food/leftover-cooked-foods?v=1&scope=pregnancy-food-safety', detailedContent)

    expect(screen.getByRole('heading', { name: 'How to follow this guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When reheating leftovers' })).toBeInTheDocument()
    expect(screen.getByText('Heat all parts thoroughly.')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('75 degC')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When leftovers cannot be reheated' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&scope=pregnancy-food-safety',
    )
  })

  it('renders the in-coverage not-assessed state with coverage sources and retained catalogue context', () => {
    renderDetail('/food/yellowfin-tuna?v=1&scope=pregnancy-food-safety&q=yellowfin&category=fish-mercury-guidance')

    expect(screen.getByText('Not assessed')).toBeInTheDocument()
    expect(screen.getByText(/has not been individually assessed/i)).toBeInTheDocument()
    expect(screen.getByText('All food categories and named foods in the June 2026 MPI pullout guide are covered.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&scope=pregnancy-food-safety&q=yellowfin&category=fish-mercury-guidance',
    )
  })

  it('renders source-backed conditions and their citation', () => {
    renderDetail('/food/cooked-eggs?v=1&scope=pregnancy-food-safety')

    expect(screen.getByText('Pregnancy food safety')).toBeInTheDocument()
    expect(screen.getByText('Only with conditions')).toBeInTheDocument()
    expect(screen.getByText('Ensure yolks and scrambled eggs are firm.')).toBeInTheDocument()
  })

  it('renders only the selected non-default guidance scope', () => {
    renderDetail('/food/parmesan?v=1&scope=vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Vegetarian suitability' })).toBeInTheDocument()
    expect(screen.getByText('Contains animal-derived ingredients')).toBeInTheDocument()
    expect(screen.getByText('Traditional Parmesan uses animal-derived rennet.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pregnancy food safety' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sources' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Veggy Malta: 15 Products Not Vegetarian' })).toHaveAttribute(
      'href',
      'https://veggymalta.com/15-products-not-vegetarian/',
    )
  })

  it('renders the evidentiary basis and omits the Sources section for an uncited assessment', () => {
    renderDetail('/food/parmesan?v=1&scope=vegetarian-suitability', uncitedVegetarianContent)

    expect(screen.getByText('Contains animal-derived ingredients')).toBeInTheDocument()
    expect(screen.getByText(/Reflects general vegetarian knowledge/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sources' })).not.toBeInTheDocument()
  })

  it('renders the outside-coverage state with the medical-information disclaimer', () => {
    renderDetail('/food/yellowfin-tuna?v=1&scope=pregnancy-food-safety', outsideCoverageContent)

    expect(screen.getByText('Outside current coverage')).toBeInTheDocument()
    expect(screen.getByLabelText('Medical information disclaimer')).toHaveTextContent(disclaimer)
  })

  it('renders a safe food-not-found page', () => {
    renderDetail('/food/removed-food?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Food not found' })).toBeInTheDocument()
    expect(screen.getByText(/not in the current guide/i)).toBeInTheDocument()
  })
})

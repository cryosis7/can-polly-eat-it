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
    assessment.foodId === 'leftovers'
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

describe('FoodDetailPage', () => {
  it('renders an assessed food with its status, summary, review date, and citation', () => {
    renderDetail('/food/cheddar?v=1&list=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Cheddar' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('Hard cheese is included in the reviewed guidance.')).toBeInTheDocument()
    expect(screen.getByText('Reviewed: 2026-08-04')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'MPI: Food and pregnancy' })).toHaveAttribute(
      'href',
      'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy/',
    )
  })

  it('renders distinct guidance scenarios, optional facts, and authored reason links', () => {
    renderDetail('/food/leftovers?v=1&list=pregnancy-food-safety', detailedContent)

    expect(screen.getByRole('heading', { name: 'How to follow this guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When reheating leftovers' })).toBeInTheDocument()
    expect(screen.getByText('Heat all parts thoroughly.')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('75 degC')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When leftovers cannot be reheated' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&list=pregnancy-food-safety',
    )
  })

  it('renders the in-coverage not-assessed state with coverage sources and retained catalogue context', () => {
    renderDetail('/food/yoghurt?v=1&list=pregnancy-food-safety&q=yogurt&category=dairy')

    expect(screen.getByText('Not assessed')).toBeInTheDocument()
    expect(screen.getByText(/has not been individually assessed/i)).toBeInTheDocument()
    expect(screen.getByText('Dairy and prepared foods reviewed for this initial guide.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&list=pregnancy-food-safety&q=yogurt&category=dairy',
    )
  })

  it('renders the outside-coverage state with the medical-information disclaimer', () => {
    renderDetail('/food/kombucha?v=1&list=pregnancy-food-safety')

    expect(screen.getByText('Outside current coverage')).toBeInTheDocument()
    expect(screen.getByLabelText('Medical information disclaimer')).toHaveTextContent(disclaimer)
  })

  it('renders a safe food-not-found page', () => {
    renderDetail('/food/removed-food?v=1&list=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Food not found' })).toBeInTheDocument()
    expect(screen.getByText(/not in the current guide/i)).toBeInTheDocument()
  })
})

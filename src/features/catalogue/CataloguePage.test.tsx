import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import { CataloguePage } from './CataloguePage'

describe('CataloguePage', () => {
  it('renders category breadcrumbs, each status outcome, and primary-source links', () => {
    render(
      <MemoryRouter>
        <CataloguePage content={content} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Pregnancy food safety' })).toBeInTheDocument()
    expect(screen.getByText('Dairy > Cheese > Hard cheese')).toBeInTheDocument()
    expect(screen.getAllByText('OK to eat')).toHaveLength(2)
    expect(screen.getAllByText('Only with conditions')).toHaveLength(2)
    expect(screen.getAllByText('Avoid')).toHaveLength(2)
    expect(screen.getAllByText('Not assessed')).toHaveLength(2)
    expect(screen.getAllByText('Outside current coverage')).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /Primary source: MPI: Food and pregnancy/i })).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&list=pregnancy-food-safety',
    )
  })
})

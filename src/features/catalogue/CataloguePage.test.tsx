import { fireEvent, render, screen } from '@testing-library/react'
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
    expect(screen.getAllByText('Dairy > Cheese > Hard cheese')).toHaveLength(2)
    expect(screen.getAllByText('OK to eat')).toHaveLength(3)
    expect(screen.getAllByText('Only with conditions')).toHaveLength(3)
    expect(screen.getAllByText('Avoid')).toHaveLength(3)
    expect(screen.getAllByText('Not assessed')).toHaveLength(3)
    expect(screen.getAllByText('Outside current coverage')).toHaveLength(3)
    expect(screen.getAllByRole('link', { name: /Primary source: MPI: Food and pregnancy/i })).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&list=pregnancy-food-safety',
    )
  })

  it('reproduces a filtered URL and labels active status filters with their list slug', () => {
    render(
      <MemoryRouter initialEntries={['/?v=1&list=pregnancy-food-safety&category=dairy&status.pregnancy-food-safety=avoid,not-assessed']}>
        <CataloguePage content={content} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Brie' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yoghurt' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pregnancy-food-safety: Avoid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pregnancy-food-safety: Not assessed' })).toBeInTheDocument()
  })

  it('finds food aliases from the URL search query', () => {
    render(
      <MemoryRouter initialEntries={['/?v=1&list=pregnancy-food-safety&q=yogurt']}>
        <CataloguePage content={content} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Yoghurt' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    expect(screen.getByText('1 food in the guide')).toBeInTheDocument()
  })

  it('announces removed URL filters, shows no results, and clears active controls', () => {
    render(
      <MemoryRouter initialEntries={['/?v=2&list=retired-list&category=retired-category&q=no-match']}>
        <CataloguePage content={content} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Unavailable shared filters were removed.')
    expect(screen.getByText(/No foods match these filters/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(screen.getByText('5 foods in the guide')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })
})

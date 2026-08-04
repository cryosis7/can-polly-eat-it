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

  it('updates, removes, and clears search, category, and status filters through the controls', () => {
    const { container } = render(
      <MemoryRouter>
        <CataloguePage content={content} />
      </MemoryRouter>,
    )

    fireEvent.submit(container.querySelector('form')!)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search foods' }), { target: { value: 'cheddar' } })
    expect(screen.getByRole('button', { name: 'Search: cheddar' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Search: cheddar' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'dairy' } })
    expect(screen.getByRole('button', { name: 'Category: Dairy' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Category: Dairy' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: '' } })

    fireEvent.change(screen.getByRole('combobox', { name: 'Guidance list' }), {
      target: { value: 'pregnancy-food-safety' },
    })

    const avoidCheckbox = screen.getByRole('checkbox', { name: 'Avoid' })
    fireEvent.click(avoidCheckbox)
    expect(screen.getByRole('button', { name: 'pregnancy-food-safety: Avoid' })).toBeInTheDocument()
    fireEvent.click(avoidCheckbox)
    expect(screen.queryByRole('button', { name: 'pregnancy-food-safety: Avoid' })).not.toBeInTheDocument()

    fireEvent.click(avoidCheckbox)
    fireEvent.click(screen.getByRole('button', { name: 'pregnancy-food-safety: Avoid' }))
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  it('removes one status chip without removing another guidance list selection', () => {
    const secondList = {
      ...content.guidanceLists[0],
      id: 'second-guidance-list',
      slug: 'second-guidance-list',
      title: 'Second guidance list',
      unassessedStatusId: 'second-pregnancy-not-assessed',
      outOfCoverageStatusId: 'second-pregnancy-outside-coverage',
      statuses: content.guidanceLists[0].statuses.map((status) => ({
        ...status,
        id: `second-${status.id}`,
      })),
    }

    render(
      <MemoryRouter initialEntries={['/?v=1&status.pregnancy-food-safety=avoid&status.second-guidance-list=avoid']}>
        <CataloguePage content={{ ...content, guidanceLists: [...content.guidanceLists, secondList] }} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'pregnancy-food-safety: Avoid' }))

    expect(screen.queryByRole('button', { name: 'pregnancy-food-safety: Avoid' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'second-guidance-list: Avoid' })).toBeInTheDocument()
  })
})

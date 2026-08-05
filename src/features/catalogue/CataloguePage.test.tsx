import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import { CataloguePage } from './CataloguePage'

const renderCatalogue = (initialEntry = '/') => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <CataloguePage content={content} />
  </MemoryRouter>,
)

describe('CataloguePage', () => {
  it('defaults to pregnancy scope and renders its list-specific card guidance', () => {
    renderCatalogue()

    expect(screen.getByRole('heading', { name: "Polly's Food Guide" })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Dairy > Cheese > Hard cheese')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&scope=pregnancy-food-safety',
    )
    expect(screen.getByRole('link', { name: 'Cheddar' }).closest('.food-card')).toHaveTextContent('Pregnancy food safety')
    expect(screen.getByRole('link', { name: 'Cheddar' }).closest('.food-card')).not.toHaveTextContent('Vegetarian suitability')
  })

  it('keeps search available while mobile filter facets use a native disclosure', () => {
    const { container } = renderCatalogue()

    const disclosure = container.querySelector('details')
    expect(disclosure).not.toHaveAttribute('open')
    expect(screen.getByRole('searchbox', { name: 'Search foods' })).toBeInTheDocument()
    expect(screen.getByText('19 foods in the guide')).toBeInTheDocument()

    disclosure!.open = true
    fireEvent(disclosure!, new Event('toggle', { bubbles: true }))

    expect(disclosure).toHaveAttribute('open')
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Dietary scopes' })).toBeInTheDocument()
  })

  it('applies selected outcomes to every selected scope and labels active chips', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=okay,maybe')

    expect(screen.getByRole('button', { name: 'Dietary scope: Pregnancy food safety' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dietary scope: Vegetarian suitability' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outcome: Okay' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outcome: Maybe - see notes' })).toBeInTheDocument()
    expect(screen.getByText(/No foods match these filters/i)).toBeInTheDocument()
  })

  it('updates and clears search, category, scope, and generic outcome controls', () => {
    const { container } = renderCatalogue()

    fireEvent.submit(container.querySelector('form')!)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search foods' }), { target: { value: 'cheddar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search: cheddar' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'dairy' } })
    fireEvent.click(screen.getByRole('button', { name: 'Category: Dairy' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: '' } })

    fireEvent.click(screen.getByRole('checkbox', { name: 'Vegetarian suitability' }))
    expect(screen.getByRole('button', { name: 'Dietary scope: Vegetarian suitability' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' }).closest('.food-card')).toHaveTextContent('Vegetarian suitability')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pregnancy food safety' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pregnancy food safety' }))

    const okayCheckbox = screen.getByRole('checkbox', { name: 'Okay' })
    fireEvent.click(okayCheckbox)
    expect(screen.getByRole('button', { name: 'Outcome: Okay' })).toBeInTheDocument()
    fireEvent.click(okayCheckbox)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Maybe - see notes' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Maybe - see notes' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Not okay' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Not okay' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Okay' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  it('finds aliases and removes unavailable shared URL constraints', () => {
    renderCatalogue('/?v=2&scope=retired-list&outcome=unknown&category=retired-category&q=yogurt')

    expect(screen.getByRole('status')).toHaveTextContent('Unavailable shared filters were removed.')
    expect(screen.getByRole('link', { name: 'Yoghurt' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    expect(screen.getByText('1 food in the guide')).toBeInTheDocument()
  })

  it('shows neutral fallback outcomes from a copied URL without treating them as primary controls', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&outcome=not-assessed&category=dairy')

    expect(screen.getByRole('button', { name: 'Outcome: Not assessed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Parmesan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yoghurt' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Outcome: Not assessed' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Not assessed' })).not.toBeInTheDocument()
  })

  it('removes an added scope from an active chip', () => {
    renderCatalogue('/?scope=pregnancy-food-safety,vegetarian-suitability&outcome=maybe')

    fireEvent.click(screen.getByRole('button', { name: 'Dietary scope: Pregnancy food safety' }))

    expect(screen.queryByRole('button', { name: 'Dietary scope: Pregnancy food safety' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Maybe - see notes' })).toBeChecked()
  })
})

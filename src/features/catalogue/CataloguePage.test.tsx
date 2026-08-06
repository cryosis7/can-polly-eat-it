import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import type { ContentData } from '../../domain/contentValidation'
import { CataloguePage } from './CataloguePage'

const renderCatalogue = (initialEntry = '/', catalogueContent = content) => render(
  <MemoryRouter initialEntries={[initialEntry]}>
    <CataloguePage content={catalogueContent} />
  </MemoryRouter>,
)

const hardCheesePregnancyAssessment = content.assessments.find((assessment) =>
  assessment.subject.kind === 'category' && assessment.subject.categoryId === 'hard-cheese' && assessment.guidanceListId === 'pregnancy-food-safety',
)!

const contentWithAdditionalScope: ContentData = {
  ...content,
  guidanceLists: [
    ...content.guidanceLists,
    { ...content.guidanceLists[0], id: 'alternative-pregnancy-food-safety', slug: 'alternative-pregnancy-food-safety', title: 'Alternative pregnancy food safety' },
  ],
  assessments: [
    ...content.assessments,
    {
      ...hardCheesePregnancyAssessment,
      id: 'hard-cheese-alternative-pregnancy',
      guidanceListId: 'alternative-pregnancy-food-safety',
    },
  ],
}

const contentWithUncitedVegetarianAssessment: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.subject.kind === 'food' && assessment.subject.foodId === 'parmesan' && assessment.guidanceListId === 'vegetarian-suitability'
      ? { ...assessment, citations: [] }
      : assessment
  )),
}

describe('CataloguePage', () => {
  it('defaults to pregnancy scope and renders its list-specific card guidance', () => {
    renderCatalogue()

    expect(screen.getByRole('heading', { name: "Polly's Food Guide" })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Low-acid soft pasteurised cheese' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&scope=pregnancy-food-safety',
    )
    expect(screen.getByRole('link', { name: 'Cheddar' }).closest('.food-card')).toHaveTextContent('Pregnancy food safety')
  })

  it('keeps search available while mobile filter facets use a native disclosure', () => {
    const { container } = renderCatalogue()

    const disclosure = container.querySelector('details')
    expect(disclosure).not.toHaveAttribute('open')
    expect(screen.getByRole('searchbox', { name: 'Search foods' })).toBeInTheDocument()
    expect(screen.getByText('143 results in the guide')).toBeInTheDocument()

    disclosure!.open = true
    fireEvent(disclosure!, new Event('toggle', { bubbles: true }))

    expect(disclosure).toHaveAttribute('open')
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Dietary scopes' })).toBeInTheDocument()
  })

  it('applies selected outcomes and labels active chips', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&outcome=okay,maybe')

    expect(screen.getByRole('button', { name: 'Outcome: Okay' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Outcome: Maybe - see notes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toBeInTheDocument()
  })

  it('updates and clears search, category, scope, and generic outcome controls', () => {
    const { container } = renderCatalogue()

    fireEvent.submit(container.querySelector('form')!)
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search foods' }), { target: { value: 'cheddar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search: cheddar' }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: 'dairy' } })
    fireEvent.click(screen.getByRole('button', { name: 'Category: Dairy' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Category' }), { target: { value: '' } })

    const okayCheckbox = screen.getByRole('checkbox', { name: 'Okay' })
    fireEvent.click(okayCheckbox)
    expect(screen.getByRole('button', { name: 'Outcome: Okay' })).toBeInTheDocument()
    fireEvent.click(okayCheckbox)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Maybe - see notes' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Maybe - see notes' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Not okay' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Not okay' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Okay' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Maybe - see notes' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  it('finds aliases and removes unavailable shared URL constraints', () => {
    renderCatalogue('/?v=2&scope=retired-list&outcome=unknown&category=retired-category&q=yogurt')

    expect(screen.getByRole('status')).toHaveTextContent('Unavailable shared filters were removed.')
    expect(screen.getByRole('link', { name: 'Pasteurised yoghurt' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    expect(screen.getByText('1 result in the guide')).toBeInTheDocument()
  })

  it('uses source row names as separate food titles rather than combined example cards', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&category=cereals')

    expect(screen.getByRole('link', { name: 'Breakfast cereals' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pasta' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Breakfast cereals, rice and pasta' })).not.toBeInTheDocument()
  })

  it('shows neutral fallback outcomes from a copied URL without treating them as primary controls', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&outcome=not-assessed&category=fish-mercury-guidance')

    expect(screen.getByRole('button', { name: 'Outcome: Not assessed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Yellowfin tuna' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Outcome: Not assessed' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Not assessed' })).not.toBeInTheDocument()
  })

  it('removes an added scope and an outcome from active chips', () => {
    renderCatalogue(
      '/?scope=pregnancy-food-safety,alternative-pregnancy-food-safety&outcome=okay',
      contentWithAdditionalScope,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Dietary scope: Alternative pregnancy food safety' }))
    expect(screen.queryByRole('button', { name: 'Dietary scope: Alternative pregnancy food safety' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alternative pregnancy food safety' }))
    expect(screen.getByRole('button', { name: 'Dietary scope: Alternative pregnancy food safety' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Alternative pregnancy food safety' }))
    expect(screen.queryByRole('button', { name: 'Dietary scope: Alternative pregnancy food safety' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Outcome: Okay' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Okay' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Okay' })).not.toBeChecked()
  })

  it('shows an empty state when no food matches a valid filter', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&q=not-a-guide-food')

    expect(screen.getByText(/No foods match these filters/i)).toBeInTheDocument()
  })

  it('renders a primary source link for a cited scope', () => {
    renderCatalogue('/?v=1&scope=vegetarian-suitability&q=marshmallows')

    const marshmallowsCard = screen.getByRole('link', { name: 'Marshmallows' }).closest('.food-card') as HTMLElement
    expect(within(marshmallowsCard).getByRole('link', { name: /Primary source: Veggy Malta/ })).toHaveAttribute(
      'href',
      'https://veggymalta.com/15-products-not-vegetarian/',
    )
  })

  it('omits the source affordance for an uncited assessment and shows the evidentiary basis once per view', () => {
    renderCatalogue('/?v=1&scope=vegetarian-suitability&q=parmesan', contentWithUncitedVegetarianAssessment)

    const parmesanCard = screen.getByRole('link', { name: 'Parmesan' }).closest('.food-card') as HTMLElement
    expect(within(parmesanCard).queryByRole('link', { name: /Primary source/ })).not.toBeInTheDocument()
    expect(screen.getAllByText(/Reflects general vegetarian knowledge/)).toHaveLength(1)
  })

  it('shows a category entry heading with its own resolved guidance and detail link', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=hard-cheese')

    const hardCheeseHeading = screen.getByRole('heading', { name: 'Hard cheese' })
    const hardCheeseLink = within(hardCheeseHeading).getByRole('link', { name: 'Hard cheese' })
    expect(hardCheeseLink).toHaveAttribute(
      'href',
      '/category/hard-cheese?v=1&scope=pregnancy-food-safety%2Cvegetarian-suitability&category=hard-cheese',
    )
    const categoryGroup = hardCheeseHeading.closest('.category-group') as HTMLElement
    expect(within(categoryGroup).getByText('Pregnancy food safety: OK to eat')).toBeInTheDocument()
    expect(within(categoryGroup).getByText('Vegetarian suitability: Check ingredients')).toBeInTheDocument()
  })

  it('shows Gouda inheriting hard-cheese guidance with disclosed provenance, and Parmesan keeping its own override', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=hard-cheese')

    const goudaCard = screen.getByRole('link', { name: 'Gouda' }).closest('.food-card') as HTMLElement
    expect(within(goudaCard).getByText('OK to eat')).toBeInTheDocument()
    expect(within(goudaCard).getByText('Check ingredients')).toBeInTheDocument()
    expect(within(goudaCard).getAllByText(/Applies to all hard cheese\./)).toHaveLength(2)
    expect(within(goudaCard).getAllByRole('link', { name: 'See Hard cheese guidance' })).toHaveLength(2)

    const parmesanCard = screen.getByRole('link', { name: 'Parmesan' }).closest('.food-card') as HTMLElement
    expect(within(parmesanCard).getByText('Contains animal-derived ingredients')).toBeInTheDocument()
    expect(within(parmesanCard).getAllByText(/Applies to all hard cheese\./)).toHaveLength(1)
  })

  it('counts matched category entries alongside foods in the announced result count', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&q=hard%20cheese')

    expect(screen.getByText('4 results in the guide')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hard cheese' })).toBeInTheDocument()
  })
})

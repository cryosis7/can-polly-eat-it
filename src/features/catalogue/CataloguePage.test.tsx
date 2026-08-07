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

const expandGroup = (name: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}, level \\d+$`) }))

describe('CataloguePage', () => {
  it('defaults to pregnancy scope and renders its list-specific card guidance', () => {
    renderCatalogue()
    expandGroup('Dairy')

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
    expect(screen.getByText('159 results in the guide')).toBeInTheDocument()

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
    expect(screen.getByRole('link', { name: 'Pasteurised yoghurt guidance' })).toBeInTheDocument()
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

    const hardCheeseToggle = screen.getByRole('button', { name: /^Hard cheese, level \d+$/ })
    const categoryGroup = hardCheeseToggle.closest('.category-group') as HTMLElement
    const hardCheeseLink = within(categoryGroup).getByRole('link', { name: 'Hard cheese guidance' })
    expect(hardCheeseLink).toHaveAttribute(
      'href',
      '/category/hard-cheese?v=1&scope=pregnancy-food-safety%2Cvegetarian-suitability&category=hard-cheese',
    )
    const entry = categoryGroup.querySelector('.category-entry') as HTMLElement
    expect(within(entry).getByRole('heading', { name: 'Pregnancy food safety' })).toBeInTheDocument()
    expect(within(entry).getByText('OK to eat')).toBeInTheDocument()
    expect(within(entry).getByRole('heading', { name: 'Vegetarian suitability' })).toBeInTheDocument()
    expect(within(entry).getByText('Check ingredients')).toBeInTheDocument()
    expect(within(entry).getAllByRole('link', { name: /^Primary source:/ }).length).toBeGreaterThan(0)
  })

  it('splits sauces into commercial and home-made groups without either showing the other rule', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=sauces-dressings-and-spreads')

    const commercial = screen.getByRole('heading', { name: 'Commercial sauces, dressings and spreads' })
      .closest('.category-group') as HTMLElement
    expect(within(commercial).getByText(/follow their manufacturer storage and heating instructions/)).toBeInTheDocument()
    expect(within(commercial).queryByText(/contains raw egg/)).not.toBeInTheDocument()

    const homeMade = screen.getByRole('button', { name: /^Home-made sauces, level \d+$/ })
      .closest('.category-group') as HTMLElement
    expect(within(homeMade).getByText(/check whether this one contains raw egg/)).toBeInTheDocument()
    expect(within(homeMade).queryByText(/manufacturer storage/)).not.toBeInTheDocument()
    expect(within(homeMade).getByRole('link', { name: 'Mayonnaise' })).toBeInTheDocument()
  })

  it('shows an unassessed cold dessert inheriting the amber group rule with its origin named', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=cold-desserts')

    const pannaCottaCard = screen.getByRole('link', { name: 'Panna cotta' }).closest('.food-card') as HTMLElement
    expect(within(pannaCottaCard).getByText('Only with conditions')).toBeInTheDocument()
    expect(within(pannaCottaCard).getByText(/Applies to all cold desserts/)).toBeInTheDocument()
    expect(within(pannaCottaCard).getByRole('link', { name: 'See Cold desserts guidance' })).toBeInTheDocument()
    expect(within(pannaCottaCard).queryByText('Outside current coverage')).not.toBeInTheDocument()
  })

  it('moves ice cream out of Dairy and fruit juice out of Miscellaneous', () => {
    renderCatalogue()
    expandGroup('Dairy')
    expect(screen.queryByRole('button', { name: /^Ice cream, level \d+$/ })).not.toBeInTheDocument()

    expandGroup('Miscellaneous')
    expect(screen.queryByRole('button', { name: /^Fruit juice, kombucha and cider \(non-alcoholic\), level \d+$/ })).not.toBeInTheDocument()

    expandGroup('Drinks')
    expect(screen.getByRole('button', { name: /^Fruit juice, kombucha and cider \(non-alcoholic\), level 2$/ })).toBeInTheDocument()
  })

  it('renders root categories in alphabetical order', () => {
    renderCatalogue()

    const rootNames = screen.getAllByRole('button', { name: /, level 1$/ })
      .map((toggle) => toggle.getAttribute('aria-label')!.replace(/, level 1$/, ''))
    expect(rootNames).toEqual([...rootNames].sort((left, right) => left.localeCompare(right)))
  })

  it('renders every ancestor heading so a nested entry is never shown under an unrelated group', () => {
    renderCatalogue()
    expandGroup('Breads and cereals')

    const parentHeading = screen.getByRole('button', { name: /^Cakes, slices and muffins, level 2$/ })
    const nested = screen.getByRole('heading', { name: 'Plain cakes, slices and muffins' })
    expect(parentHeading).toBeInTheDocument()
    expect(parentHeading.compareDocumentPosition(nested) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders a category that has no direct foods but has content beneath it', () => {
    renderCatalogue()
    expandGroup('Dairy')

    expect(screen.getByRole('button', { name: /^Cheese, level 2$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Custard, level 2$/ })).toBeInTheDocument()
  })

  it('collapses top-level groups by default and reveals descendants when one is expanded', () => {
    renderCatalogue()

    const dairyToggle = screen.getByRole('button', { name: /^Dairy, level 1$/ })
    expect(dairyToggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: /^Cheese, level 2$/ })).not.toBeInTheDocument()

    fireEvent.click(dairyToggle)

    expect(dairyToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /^Cheese, level 2$/ })).toBeInTheDocument()
  })

  it('reveals a match inside a collapsed group and restores manual expansion when the search clears', () => {
    renderCatalogue()
    expandGroup('Eggs')
    const searchField = screen.getByLabelText('Search foods')

    fireEvent.change(searchField, { target: { value: 'gouda' } })
    expect(screen.getByRole('link', { name: 'Gouda' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Cheese, level 2$/ })).toBeInTheDocument()

    fireEvent.change(searchField, { target: { value: '' } })
    expect(screen.queryByRole('link', { name: 'Gouda' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cooked eggs' })).toBeInTheDocument()
  })

  it('collapses an expanded nested group without affecting its siblings', () => {
    renderCatalogue()
    expandGroup('Dairy')
    expect(screen.getByRole('link', { name: 'Cheddar' })).toBeInTheDocument()

    expandGroup('Cheese')

    expect(screen.getByRole('button', { name: /^Cheese, level 2$/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Butter' })).toBeInTheDocument()
  })

  it('keeps the announced result count unchanged when a group is collapsed', () => {
    renderCatalogue()
    const countBefore = screen.getByText(/results in the guide/).textContent

    expandGroup('Dairy')

    expect(screen.getByText(/results in the guide/)).toHaveTextContent(countBefore!)
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

  it('shows a food beneath a newly assessed category inheriting its rule with the origin disclosed', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=pasteurised-cottage-and-cream-cheese')

    const cottageCheeseCard = screen.getByRole('link', { name: 'Pasteurised cottage cheese' }).closest('.food-card') as HTMLElement
    expect(within(cottageCheeseCard).getByText('Only with conditions')).toBeInTheDocument()
    expect(within(cottageCheeseCard).getByText(/Applies to pasteurised cottage cheese, cream cheese and similar pasteurised cheese\./)).toBeInTheDocument()
    expect(within(cottageCheeseCard).getByRole('link', { name: 'See Pasteurised cottage cheese, cream cheese, etc guidance' })).toBeInTheDocument()
  })

  it('renders a merged category entry with its own status, summary, and source', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=pasteurised-cottage-and-cream-cheese')

    const toggle = screen.getByRole('button', { name: /^Pasteurised cottage cheese, cream cheese, etc, level \d+$/ })
    const entry = toggle.closest('.category-group')!.querySelector('.category-entry') as HTMLElement
    expect(within(entry).getByText('Only with conditions')).toBeInTheDocument()
    expect(within(entry).getByText(/Use pasteurised cheese from sealed packs within two days of opening/)).toBeInTheDocument()
    expect(within(entry).getByRole('link', { name: /^Primary source:/ })).toBeInTheDocument()
  })
})

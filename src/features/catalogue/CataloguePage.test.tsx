import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { content } from '../../data'
import type { ContentData } from '../../domain/contentValidation'
import { categoryAssessment, dualSourceContent } from '../../test/multiSourceFixture'
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

const expandGroup = (name: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}, level \\d+`) }))

describe('CataloguePage', () => {
  // A rule may be authored above the foods it governs: one "smoked seafood" rule covers fish,
  // shellfish and crustacea while the species stay filed under what they are. The band calls it out
  // and names the scope it was authored at, so it reads as the group's rule, not as a category.
  it('calls out the governing rule on the band and names the scope it was authored at', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&q=barracouta')

    const smoked = screen.getByRole('region', { name: 'Smoked Fish' })
    const callout = within(smoked).getByRole('complementary', { name: 'Smoked guidance for Fish' })
    expect(callout).toHaveClass('preparation-callout', 'tone-amber')
    expect(callout).toHaveTextContent('Only with conditions')
    expect(callout).toHaveTextContent('Eat chilled smoked or pre-cooked seafood only after heating until piping hot.')
    expect(callout).toHaveTextContent('Applies to all chilled smoked or pre-cooked fish, shellfish and crustacea.')
    expect(within(callout).getByRole('link', { name: 'See Seafood guidance' })).toBeInTheDocument()
  })

  it('names each dietary scope on a band callout when more than one is selected', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&q=yogurt')

    const pasteurised = screen.getByRole('region', { name: 'Pasteurised Yoghurt' })
    const callouts = within(pasteurised).getAllByRole('complementary', { name: 'Pasteurised guidance for Yoghurt' })

    expect(callouts).toHaveLength(2)
    expect(callouts[0]).toHaveTextContent('Pregnancy food safety')
    expect(callouts[1]).toHaveTextContent('Vegetarian suitability')
  })

  it('states the restriction in words on every card, not just as a status chip', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&q=farmed%20salmon')

    // The species mercury limit and the group's preparation rule are separate authored layers, and
    // a card that showed only one of them would understate the guidance.
    const smoked = screen.getByRole('region', { name: 'Smoked Fish' })
    const card = within(smoked).getByRole('link', { name: 'Farmed salmon' }).closest('.food-card')!
    expect(card).toHaveTextContent('Only with conditions')
    expect(card).toHaveTextContent('Limit this species to three or four servings each week.')
    expect(card).toHaveTextContent('Specific to this food')
    expect(card).toHaveTextContent('Eat chilled smoked or pre-cooked seafood only after heating until piping hot.')
    expect(card).toHaveTextContent('Applies to all chilled smoked or pre-cooked fish, shellfish and crustacea.')

    for (const anyCard of document.querySelectorAll('.food-card')) {
      const status = anyCard.querySelector('.status')!.textContent!
      const guidance = anyCard.querySelector('.food-guidance')!.textContent!
      expect(guidance.replace(status, '').trim().length, `a card showing "${status}" states no restriction`)
        .toBeGreaterThan(0)
    }
  })

  it('drops a parent band whose rule its descendants already state beside their foods', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=seafood')

    const seafood = screen.getByRole('button', { name: 'Seafood, level 1' }).closest('.category-group')!
    expect(within(seafood as HTMLElement).queryByRole('link', { name: 'Seafood guidance' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('region', { name: /^Smoked / }).length).toBeGreaterThan(0)
  })

  it('defaults to pregnancy and vegetarian scopes and renders their list-specific card guidance', () => {
    renderCatalogue()
    expandGroup('Dairy')

    expect(screen.getByRole('heading', { name: "Polly's Food Guide" })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pregnancy food safety' })).not.toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeDisabled()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Low-acid soft pasteurised cheese' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&scope=pregnancy-food-safety%2Cvegetarian-suitability',
    )
    const cheddarCard = screen.getByRole('link', { name: 'Cheddar' }).closest('.food-card')
    expect(cheddarCard).toHaveTextContent('Pregnancy food safety')
    expect(cheddarCard).toHaveTextContent('Vegetarian suitability')
  })

  it('keeps search available while mobile filter facets use a native disclosure', () => {
    const { container } = renderCatalogue()

    const disclosure = container.querySelector('details')
    expect(disclosure).not.toHaveAttribute('open')
    expect(screen.getByRole('searchbox', { name: 'Search foods' })).toBeInTheDocument()
    expect(screen.getByText('242 results in the guide')).toBeInTheDocument()

    disclosure!.open = true
    fireEvent(disclosure!, new Event('toggle', { bubbles: true }))

    expect(disclosure).toHaveAttribute('open')
    expect(screen.getByRole('combobox', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Dietary scopes' })).toBeInTheDocument()
  })

  it('keeps every typed character while settling a multi-word search into catalogue state', async () => {
    vi.useFakeTimers()

    try {
      renderCatalogue()
      const search = screen.getByRole('searchbox', { name: 'Search foods' })

      fireEvent.change(search, { target: { value: 'farmed' } })
      fireEvent.change(search, { target: { value: 'farmed ' } })
      expect(search).toHaveValue('farmed ')
      expect(screen.queryByRole('button', { name: 'Search: farmed' })).not.toBeInTheDocument()

      fireEvent.change(search, { target: { value: 'farmed salmon' } })
      expect(search).toHaveValue('farmed salmon')

      await act(async () => vi.runAllTimersAsync())

      expect(search).toHaveValue('farmed salmon')
      expect(screen.getByRole('button', { name: 'Search: farmed salmon' })).toBeInTheDocument()
      expect(screen.getByText('3 results in the guide')).toBeInTheDocument()

      fireEvent.change(search, { target: { value: '' } })
      expect(search).toHaveValue('')

      await act(async () => vi.runAllTimersAsync())

      expect(screen.queryByRole('button', { name: /^Search:/ })).not.toBeInTheDocument()
      expect(screen.getByText('242 results in the guide')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
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
    fireEvent.submit(container.querySelector('form')!)
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
    expect(screen.getAllByRole('link', { name: 'Yoghurt guidance' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Cheddar' })).not.toBeInTheDocument()
    // Soy yoghurt's "soy yogurt" alias also matches this search term, alongside the Yoghurt category.
    expect(screen.getByRole('link', { name: 'Soy yoghurt' })).toBeInTheDocument()
    expect(screen.getByText('2 results in the guide')).toBeInTheDocument()
  })

  it('uses source row names as separate food titles rather than combined example cards', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&category=cereals')

    expect(screen.getByRole('link', { name: 'Breakfast cereals' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Pasta' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Breakfast cereals, rice and pasta' })).not.toBeInTheDocument()
  })

  it('shows neutral fallback outcomes from a copied URL without treating them as primary controls', () => {
    renderCatalogue('/?scope=pregnancy-food-safety&outcome=not-assessed&category=confectionery')

    expect(screen.getByRole('button', { name: 'Outcome: Not assessed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gummy bears' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Not assessed' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Outcome: Not assessed' }))
    expect(screen.queryByRole('button', { name: 'Outcome: Not assessed' })).not.toBeInTheDocument()
  })

  it('offers no outside-coverage control and drops the retired outcome from a shared URL', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&outcome=outside-coverage')

    expect(screen.queryByRole('checkbox', { name: 'Outside current coverage' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Outcome: Outside current coverage' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/removed/i)
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

  it('names no primary source on a catalogue card, because a citation array carries no authored ranking', () => {
    renderCatalogue('/?v=1&scope=vegetarian-suitability&q=marshmallows')

    const marshmallowsCard = screen.getByRole('link', { name: 'Marshmallows' }).closest('.food-card') as HTMLElement
    expect(within(marshmallowsCard).queryByRole('link', { name: /Primary source/ })).not.toBeInTheDocument()
  })

  it('omits the source affordance for an uncited assessment and shows the evidentiary basis once per view', () => {
    renderCatalogue('/?v=1&scope=vegetarian-suitability&q=parmesan', contentWithUncitedVegetarianAssessment)

    const parmesanCard = screen.getByRole('link', { name: 'Parmesan' }).closest('.food-card') as HTMLElement
    expect(within(parmesanCard).queryByRole('link', { name: /Primary source/ })).not.toBeInTheDocument()
    expect(screen.getAllByText(/Reflects general vegetarian knowledge/)).toHaveLength(1)
  })

  it('shows a category entry heading with its own resolved guidance and detail link', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=hard-cheese')

    const hardCheeseToggle = screen.getByRole('button', { name: /^Hard cheese, level \d+/ })
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
  })

  // The migration retires 32 categories that hold guidance and no foods. Their guidance must stay
  // browsable inside a preparation grouping, or retiring them silently deletes it from the catalogue.
  it('renders a preparation grouping for a category holding qualified guidance and no foods', () => {
    const qualifiedOnly = dualSourceContent([
      categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', {
        preparationId: 'raw',
        summary: 'Do not eat raw shellfish.',
      }),
      categoryAssessment('shellfish-cooked', 'shellfish', 'dual-conditions', {
        preparationId: 'cooked',
        summary: 'Cook shellfish thoroughly and eat it while hot.',
      }),
    ], [])

    renderCatalogue('/?v=1&scope=dual', qualifiedOnly)
    expandGroup('Seafood')

    const shellfish = screen.getByRole('button', { name: /^Shellfish, level \d+/ })
      .closest('.category-group') as HTMLElement
    // A scope selection is a lens rather than a filter, so it no longer expands bands for us.
    fireEvent.click(within(shellfish).getByRole('button', { name: /^Raw Shellfish,/ }))
    const raw = within(shellfish).getByRole('heading', { name: 'Raw Shellfish' })
      .closest('.preparation-group') as HTMLElement

    expect(within(raw).getByText('Avoid')).toBeInTheDocument()
    expect(within(raw).getAllByText('Do not eat raw shellfish.').length).toBeGreaterThan(0)
    expect(within(raw).queryByText(/Cook shellfish thoroughly/)).not.toBeInTheDocument()
    expect(within(raw).getByRole('link', { name: 'Shellfish guidance' })).toHaveAttribute(
      'href',
      '/category/shellfish?v=1&scope=dual&prep=raw',
    )
  })

  it('counts each preparation entry of a food-less category once', () => {
    const qualifiedOnly = dualSourceContent([
      categoryAssessment('shellfish-raw', 'shellfish', 'dual-avoid', { preparationId: 'raw' }),
      categoryAssessment('shellfish-cooked', 'shellfish', 'dual-conditions', { preparationId: 'cooked' }),
    ], [])

    renderCatalogue('/?v=1&scope=dual', qualifiedOnly)

    expect(screen.getByText('2 results in the guide')).toBeInTheDocument()
  })

  it('splits sauces into store-bought and home-made groups without either showing the other rule', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=sauces-dressings-and-spreads')

    const storeBought = screen.getByRole('heading', { name: 'Store-bought Sauces, dressings and spreads' })
      .closest('.preparation-group') as HTMLElement
    expect(within(storeBought).getAllByText(/follow their manufacturer storage and heating instructions/).length)
      .toBeGreaterThan(0)
    expect(within(storeBought).queryByText(/contains raw egg/)).not.toBeInTheDocument()
    expect(within(storeBought).getByRole('link', { name: 'Worcestershire sauce' })).toBeInTheDocument()

    const homeMade = screen.getByRole('heading', { name: 'Home-made Sauces, dressings and spreads' })
      .closest('.preparation-group') as HTMLElement
    expect(within(homeMade).getAllByText(/check whether this one contains raw egg/).length).toBeGreaterThan(0)
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
    expect(screen.queryByRole('button', { name: /^Ice cream, level \d+/ })).not.toBeInTheDocument()

    expandGroup('Miscellaneous')
    expect(screen.queryByRole('button', { name: /^Fruit juice, kombucha and cider \(non-alcoholic\), level \d+/ })).not.toBeInTheDocument()

    expandGroup('Drinks')
    expect(screen.getByRole('button', { name: /^Fruit juice, kombucha and cider \(non-alcoholic\), level 2/ })).toBeInTheDocument()
  })

  it('shows an accumulated food card stating the inherited group guidance', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=shellfish')

    // The serving-limit footnote is food-wide, so it is restated on every preparation row.
    expect(screen.getAllByRole('link', { name: 'Bluff and Pacific oysters' }).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Cook seafood thoroughly and eat it while hot/).length).toBeGreaterThan(0)

    const cheddarCard = renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=hard-cheese')
      .container.querySelector('.food-card') as HTMLElement
    expect(cheddarCard.querySelector('.accumulated-note')).toBeNull()
  })

  it('renders root categories in alphabetical order', () => {
    renderCatalogue()

    const rootNames = screen.getAllByRole('button', { name: /, level 1$/ })
      .map((toggle) => toggle.getAttribute('aria-label')!.replace(/, level 1$/, ''))
    expect(rootNames).toEqual([...rootNames].sort((left, right) => left.localeCompare(right)))
  })

  it('offers the new food groups as category filters under their full authored path', () => {
    renderCatalogue()

    const options = Array.from(screen.getByLabelText(/category/i).querySelectorAll('option'))
      .map((option) => option.textContent)
    expect(options).toEqual(expect.arrayContaining([
      'Confectionery',
      'Ingredients and additives',
      'Soups',
      'Desserts > Baked desserts',
      'Drinks > Alcoholic drinks',
    ]))
    expect(options.some((option) => option?.includes('animal-derived'))).toBe(false)
  })

  it('shows the retired animal-derived heading nowhere, and its foods under real food groups', () => {
    renderCatalogue()

    const rootNames = screen.getAllByRole('button', { name: /, level 1$/ })
      .map((toggle) => toggle.getAttribute('aria-label')!.replace(/, level 1$/, ''))
    expect(rootNames).not.toContain('Foods that may contain animal-derived ingredients')
    expect(rootNames).toEqual(expect.arrayContaining(['Confectionery', 'Ingredients and additives', 'Soups']))

    expandGroup('Confectionery')
    for (const name of ['Gummy bears', 'Jelly', 'Marshmallows', 'Starburst']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }

    expandGroup('Ingredients and additives')
    expect(screen.getByRole('link', { name: 'Gelatin' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'White sugar' })).toBeInTheDocument()
  })

  it('shows orange juice once, on the juice group rather than either pasteurisation child', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&category=drinks')

    const orangeJuiceLinks = screen.getAllByRole('link', { name: 'Orange juice' })
    expect(orangeJuiceLinks).toHaveLength(1)

    const juiceGroup = screen.getByRole('button', { name: /^Fruit juice, kombucha and cider \(non-alcoholic\), level \d+/ })
      .closest('.category-group') as HTMLElement
    expect(within(juiceGroup).getByRole('link', { name: 'Orange juice' })).toBeInTheDocument()
  })

  it('renders every ancestor heading so a nested entry is never shown under an unrelated group', () => {
    renderCatalogue()
    expandGroup('Breads and cereals')

    const parentHeading = screen.getByRole('button', { name: /^Cakes, slices and muffins, level 2/ })
    const nested = screen.getByRole('heading', { name: 'Plain cakes, slices and muffins' })
    expect(parentHeading).toBeInTheDocument()
    expect(parentHeading.compareDocumentPosition(nested) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders a category that has no direct foods but has content beneath it', () => {
    renderCatalogue()
    expandGroup('Dairy')

    expect(screen.getByRole('button', { name: /^Cheese, level 2/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Custard, level 2/ })).toBeInTheDocument()
  })

  it('collapses top-level groups by default and reveals descendants when one is expanded', () => {
    renderCatalogue()

    const dairyToggle = screen.getByRole('button', { name: /^Dairy, level 1$/ })
    expect(dairyToggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: /^Cheese, level 2/ })).not.toBeInTheDocument()

    fireEvent.click(dairyToggle)

    expect(dairyToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: /^Cheese, level 2/ })).toBeInTheDocument()
  })

  it('reveals a match inside a collapsed group and restores manual expansion when the search clears', () => {
    renderCatalogue()
    expandGroup('Eggs')
    const searchField = screen.getByLabelText('Search foods')

    fireEvent.change(searchField, { target: { value: 'gouda' } })
    fireEvent.submit(searchField.closest('form')!)
    expect(screen.getByRole('link', { name: 'Gouda' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Cheese, level 2/ })).toBeInTheDocument()

    fireEvent.change(searchField, { target: { value: '' } })
    fireEvent.submit(searchField.closest('form')!)
    expect(screen.queryByRole('link', { name: 'Gouda' })).not.toBeInTheDocument()
    // Eggs stays manually expanded, showing the preparation groupings its rules now live on.
    expect(screen.getByRole('heading', { name: 'Raw Eggs' })).toBeInTheDocument()
  })

  it('collapses an expanded nested group without affecting its siblings', () => {
    renderCatalogue()
    expandGroup('Dairy')
    expect(screen.getByRole('link', { name: 'Cheddar' })).toBeInTheDocument()

    expandGroup('Cheese')

    expect(screen.getByRole('button', { name: /^Cheese, level 2/ })).toHaveAttribute('aria-expanded', 'false')
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

    const toggle = screen.getByRole('button', { name: /^Pasteurised cottage cheese, cream cheese, etc, level \d+/ })
    const entry = toggle.closest('.category-group')!.querySelector('.category-entry') as HTMLElement
    expect(within(entry).getByText('Only with conditions')).toBeInTheDocument()
    expect(within(entry).getByText(/Use pasteurised cheese from sealed packs within two days of opening/)).toBeInTheDocument()
  })
})

// ADR: Model catalogue subjects and preparation independently.
// See: docs/decisions/2026-09-21 ADR - model catalogue subjects and preparation independently.md
describe('browsing a category with a preparation dimension', () => {
  const citation = content.assessments.find((assessment) => assessment.citations.length > 0)!.citations[0]
  const salmon = content.foods.find((food) => food.id === 'farmed-salmon')!

  const preparedContent: ContentData = {
    ...content,
    foods: content.foods.map((food) => (
      food.id === salmon.id ? { ...food, preparationIds: ['raw', 'cooked'] } : food
    )),
    assessments: [
      ...content.assessments,
      {
        id: 'salmon-raw-pregnancy',
        subject: { kind: 'food', foodId: salmon.id },
        guidanceListId: 'pregnancy-food-safety',
        // The pregnancy list declares more than one source, so a fixture assessment must name one
        // too; an unattributed one would be rejected by validation and cannot arise in real content.
        sourceId: 'new-zealand-food-safety',
        statusId: 'pregnancy-avoid',
        preparationId: 'raw',
        summary: 'Do not eat raw salmon.',
        guidanceScenarios: [],
        reasonLinks: [],
        citations: [citation],
      },
      {
        id: 'salmon-cooked-pregnancy',
        subject: { kind: 'food', foodId: salmon.id },
        guidanceListId: 'pregnancy-food-safety',
        sourceId: 'new-zealand-food-safety',
        statusId: 'pregnancy-ok',
        preparationId: 'cooked',
        summary: 'Cooked salmon is fine.',
        guidanceScenarios: [],
        reasonLinks: [],
        citations: [citation],
      },
    ],
  }

  const scope = 'v=1&scope=pregnancy-food-safety'

  const cardFor = (preparationName: string) => {
    const group = screen.getByRole('heading', { name: `${preparationName} Fish` }).closest('.preparation-group') as HTMLElement
    return within(group).getByRole('link', { name: salmon.name }).closest('.food-card') as HTMLElement
  }

  it('defaults preparation bands to collapsed and expands one without affecting its sibling or the result count', () => {
    renderCatalogue(`/?${scope}`, preparedContent)
    const countBefore = screen.getByText(/results in the guide/).textContent
    expandGroup('Seafood')
    const fish = screen.getByRole('button', { name: /^Fish, level \d+/ }).closest('.category-group') as HTMLElement
    const rawToggle = within(fish).getByRole('button', { name: /^Raw Fish,.*\d+ entries$/ })
    const cookedToggle = within(fish).getByRole('button', { name: /^Cooked Fish,.*\d+ entries$/ })

    expect(rawToggle).toHaveAttribute('aria-expanded', 'false')
    expect(cookedToggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(fish).queryByRole('link', { name: salmon.name })).not.toBeInTheDocument()

    fireEvent.click(rawToggle)

    expect(rawToggle).toHaveAttribute('aria-expanded', 'true')
    expect(cookedToggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(fish).getByRole('link', { name: salmon.name })).toHaveAttribute(
      'href',
      expect.stringContaining('prep=raw'),
    )

    fireEvent.click(rawToggle)

    expect(rawToggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(fish).queryByRole('link', { name: salmon.name })).not.toBeInTheDocument()
    expect(screen.getByText(/results in the guide/)).toHaveTextContent(countBefore!)
  })

  it('groups the food under each preparation, each row showing one status', () => {
    renderCatalogue(`/?${scope}&q=${salmon.slug}`, preparedContent)

    // Raw takes the avoid rule; cooked keeps the group's food-wide rule, which is more cautious
    // than the cooked-only rule and applies however the fish is prepared.
    expect(within(cardFor('Raw')).getByText('Avoid')).toBeInTheDocument()
    expect(within(cardFor('Cooked')).getByText('Only with conditions')).toBeInTheDocument()
    expect(screen.getByText('2 results in the guide')).toBeInTheDocument()
  })

  it('keeps matching preparation rows discoverable in filtered result views', () => {
    renderCatalogue(`/?${scope}&q=${salmon.slug}`, preparedContent)

    expect(screen.getByRole('button', { name: 'Raw Fish, 1 entry' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Cooked Fish, 1 entry' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(cardFor('Raw')).getByText('Avoid')).toBeInTheDocument()
    expect(within(cardFor('Cooked')).getByText('Only with conditions')).toBeInTheDocument()
  })

  it('links each row to the food in the preparation the reader was looking at', () => {
    renderCatalogue(`/?${scope}&q=${salmon.slug}`, preparedContent)

    expect(within(cardFor('Raw')).getByRole('link', { name: salmon.name }))
      .toHaveAttribute('href', expect.stringContaining('prep=raw'))
    expect(within(cardFor('Cooked')).getByRole('link', { name: salmon.name }))
      .toHaveAttribute('href', expect.stringContaining('prep=cooked'))
  })

  it('returns one preparation row of a food under an outcome filter and not the other', () => {
    renderCatalogue(`/?${scope}&q=${salmon.slug}&outcome=not-okay`, preparedContent)

    expect(screen.getByRole('heading', { name: 'Raw Fish' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Cooked Fish' })).not.toBeInTheDocument()
    expect(screen.getByText('1 result in the guide')).toBeInTheDocument()
  })

  it('renders a category with no preparation dimension exactly as before', () => {
    renderCatalogue(`/?${scope}&q=cheddar`, preparedContent)

    expect(document.querySelectorAll('.preparation-group')).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      expect.not.stringContaining('prep='),
    )
  })
})

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
describe('CataloguePage collapsed-row chips', () => {
  const rowToggle = (name: string) =>
    screen.getByRole('button', { name: new RegExp(`^${name}, level \\d+`) })

  const chipIn = (row: HTMLElement) => row.querySelector('.aggregate-chip')

  // Roots start collapsed and their descendants start expanded, so a nested row has to be closed
  // before it can be summarised.
  const collapseRow = (name: string) => fireEvent.click(rowToggle(name))

  it('summarises a uniformly okay category with its own solid chip', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety')
    expandGroup('Dairy')
    collapseRow('Hard cheese')

    const chip = chipIn(rowToggle('Hard cheese'))

    expect(chip).toHaveTextContent('OK')
    expect(chip).toHaveClass('tone-green')
  })

  it('summarises a category holding one dissenting food as mixed, not as its majority', () => {
    // Cereals: the category rule, Breakfast cereals, Rice and Pasta all say okay to eat, while
    // Fresh filled pasta replaces that rule with its own conditional one.
    renderCatalogue()
    expandGroup('Breads and cereals')
    collapseRow('Cereals')

    const chip = chipIn(rowToggle('Cereals'))

    expect(chip).toHaveTextContent('Maybe')
    expect(chip).toHaveClass('tone-amber')
  })

  it('reveals the dissenting entry the mixed chip stood for when the row is expanded', () => {
    renderCatalogue()
    expandGroup('Breads and cereals')

    expect(screen.getByRole('link', { name: 'Fresh filled pasta' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Rice' })).toBeInTheDocument()
  })

  it('never chips a root category, however much it hides', () => {
    renderCatalogue()

    expect(chipIn(rowToggle('Dairy'))).toBeNull()
    expect(chipIn(rowToggle('Seafood'))).toBeNull()
  })

  it('drops the chip once the row is expanded, so it never sits beside the statuses it summarised', () => {
    renderCatalogue()
    expandGroup('Dairy')
    collapseRow('Hard cheese')
    expect(chipIn(rowToggle('Hard cheese'))).not.toBeNull()

    fireEvent.click(rowToggle('Hard cheese'))

    expect(chipIn(rowToggle('Hard cheese'))).toBeNull()
  })

  it('shows no chip while a search is active, so it never summarises a filtered subset', () => {
    // Searching `rice` narrows Cereals to one okay food. A chip folded over what survived would
    // report the whole group as okay, implying Fresh filled pasta is okay too.
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&q=rice')

    for (const toggle of screen.getAllByRole('button', { name: /, level \d+/ })) {
      expect(chipIn(toggle)).toBeNull()
    }
  })

  it('shows no chip while an outcome filter is active', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety&outcome=okay')

    for (const toggle of screen.getAllByRole('button', { name: /, level \d+/ })) {
      expect(chipIn(toggle)).toBeNull()
    }
  })

  it('summarises a collapsed preparation band', () => {
    renderCatalogue()
    expandGroup('Meat and poultry')

    const heading = screen.getByRole('heading', { name: /^Raw Meat and poultry/ })

    expect(heading.querySelector('.aggregate-chip')).toHaveTextContent('Avoid')
  })

  it('gives a collapsed row an entry count and speaks its summary to assistive technology', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety')
    expandGroup('Dairy')
    collapseRow('Hard cheese')

    const label = rowToggle('Hard cheese').getAttribute('aria-label')!

    expect(label).toContain('Hard cheese')
    expect(label).toContain('all okay')
    expect(label).toMatch(/\d+ entr/)
  })

  it('hides the chip from assistive technology, so the row is not announced twice', () => {
    renderCatalogue()
    expandGroup('Dairy')
    collapseRow('Hard cheese')

    expect(chipIn(rowToggle('Hard cheese'))).toHaveAttribute('aria-hidden', 'true')
  })

  it('leaves the result count untouched when a row is collapsed or expanded', () => {
    renderCatalogue()
    const before = screen.getByText(/results in the guide/).textContent
    expandGroup('Dairy')
    collapseRow('Hard cheese')
    fireEvent.click(rowToggle('Hard cheese'))

    expect(screen.getByText(/results in the guide/)).toHaveTextContent(before!)
  })

  it('hides the category own guidance while collapsed, as a preparation band hides its callout', () => {
    renderCatalogue('/?v=1&scope=pregnancy-food-safety')
    expandGroup('Dairy')
    const groupFor = (name: string) => rowToggle(name).closest('.category-group') as HTMLElement

    expect(groupFor('Hard cheese').querySelector('.category-entry')).not.toBeNull()

    collapseRow('Hard cheese')

    // The chip already answers for the group, so restating the whole rule beneath it said the same
    // thing twice and left the row disagreeing with every collapsed preparation band on the page.
    expect(groupFor('Hard cheese').querySelector('.category-entry')).toBeNull()
    expect(rowToggle('Hard cheese').querySelector('.aggregate-chip')).toHaveTextContent('OK')

    fireEvent.click(rowToggle('Hard cheese'))

    expect(groupFor('Hard cheese').querySelector('.category-entry')).not.toBeNull()
  })

  it('keeps a category collapsible when its own guidance is all it holds', () => {
    // Canned foods carries a rule and holds no foods or subcategories, so before its guidance moved
    // inside the collapse it had nothing to hide and therefore no toggle.
    renderCatalogue()
    expandGroup('Miscellaneous')
    const canned = rowToggle('Canned foods')
    const group = canned.closest('.category-group') as HTMLElement

    expect(canned).toHaveAttribute('aria-expanded', 'true')
    expect(group.querySelector('.category-entry')).not.toBeNull()

    fireEvent.click(canned)

    expect(rowToggle('Canned foods')).toHaveAttribute('aria-expanded', 'false')
    expect(group.querySelector('.category-entry')).toBeNull()
  })
})

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
describe('CataloguePage collapsed-row chips across dietary scopes', () => {
  const bothScopes = '/?v=1&scope=pregnancy-food-safety,vegetarian-suitability'

  const rowToggle = (name: string) =>
    screen.getByRole('button', { name: new RegExp(`^${name}, level \\d+`) })

  it('shows exactly one chip per row however many scopes are active', () => {
    renderCatalogue(bothScopes)
    fireEvent.click(rowToggle('Dairy'))
    fireEvent.click(rowToggle('Hard cheese'))

    expect(rowToggle('Hard cheese').querySelectorAll('.aggregate-chip')).toHaveLength(1)
  })

  it('lets a second scope change the summary, because the answer now covers both', () => {
    // Hard cheese is uniformly okay under pregnancy alone. Adding vegetarian suitability splits it:
    // Parmesan contains animal-derived rennet while its siblings only need their labels checked.
    renderCatalogue(bothScopes)
    fireEvent.click(rowToggle('Dairy'))
    fireEvent.click(rowToggle('Hard cheese'))

    expect(rowToggle('Hard cheese').querySelector('.aggregate-chip')).toHaveTextContent('Maybe')
  })
})

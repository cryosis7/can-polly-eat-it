import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { contentIndex } from '../data'
import { FoodDetailPage } from '../features/food-detail/FoodDetailPage'

const scope = 'v=1&scope=pregnancy-food-safety'

const renderTea = (slug: string) => render(
  <MemoryRouter initialEntries={[`/food/${slug}?${scope}`]}>
    <Routes>
      <Route
        path="/food/:foodSlug"
        element={<FoodDetailPage index={contentIndex} disclaimer="Not medical advice." />}
      />
    </Routes>
  </MemoryRouter>,
)

const pregnancyCard = () =>
  screen.getByRole('heading', { name: 'Pregnancy food safety' }).closest('.guidance-summary') as HTMLElement

describe('rendering the tea sources where they disagree', () => {
  it('leads chamomile with the cautious status and names the source that declined to judge', () => {
    renderTea('chamomile-tea')
    const card = within(pregnancyCard())

    expect(card.getByText('Avoid')).toBeInTheDocument()
    expect(card.getByRole('heading', { name: 'What each source says' })).toBeInTheDocument()
    expect(card.getByRole('heading', { name: 'American Pregnancy Association: Not enough evidence' }))
      .toBeInTheDocument()
    expect(card.getByRole('heading', { name: 'BabyCenter: Avoid' })).toBeInTheDocument()
    expect(card.getByRole('heading', { name: 'Medeniyet Medical Journal: Avoid' })).toBeInTheDocument()
  })

  it('states the chamomile disagreement in words and links out to the dissenting source', () => {
    renderTea('chamomile-tea')

    const dissent = within(pregnancyCard())
      .getByText(/American Pregnancy Association reached a different conclusion: Not enough evidence\./)
    expect(within(dissent).getByRole('link', { name: 'Read American Pregnancy Association' }))
      .toHaveAttribute('href', 'https://americanpregnancy.org/pregnancy/herbal-tea/')
  })

  it('lists every source behind a contested tea, each with its own exact locator', () => {
    renderTea('chamomile-tea')

    const sources = within(pregnancyCard()).getByRole('heading', { name: 'Sources' })
      .parentElement as HTMLElement
    const links = within(sources).getAllByRole('link').map((link) => link.getAttribute('href'))

    expect(new Set(links)).toEqual(new Set([
      'https://www.babycenter.com/pregnancy/diet-and-fitness/herbal-teas-during-pregnancy_3537',
      'https://americanpregnancy.org/pregnancy/herbal-tea/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC7384490/',
    ]))
    expect(sources.textContent).toContain('The Herbs Used - Chamomile (German)')
  })

  it('stacks the agreeing ginger sources without any dissent notice', () => {
    renderTea('ginger-tea')
    const card = within(pregnancyCard())

    expect(card.getByText('Only with conditions')).toBeInTheDocument()
    expect(card.getByRole('heading', { name: 'All of the following apply' })).toBeInTheDocument()
    expect(card.queryByText(/reached a different conclusion/)).not.toBeInTheDocument()
    expect(card.getByText('Stated by Medeniyet Medical Journal')).toBeInTheDocument()
    expect(card.getByText('Stated by BabyCenter')).toBeInTheDocument()
  })

  it('lets a named tea’s own source replace the group rule rather than stacking on it', () => {
    renderTea('lemongrass-tea')
    const card = within(pregnancyCard())

    expect(card.getByText('Avoid')).toBeInTheDocument()
    expect(card.getByText('Stated by BabyCenter')).toBeInTheDocument()
    // BabyCenter named this tea, so its own sentence stands in place of the group rule; the reader
    // is not shown the group's general advice as though it were about lemongrass specifically.
    expect(card.queryByText(/Some herbal teas are safe for pregnancy and some aren/)).not.toBeInTheDocument()
  })

  it('names the reason food a pregnancy blend contains rather than inferring its status', () => {
    renderTea('pregnancy-tea-blends')
    const card = within(pregnancyCard())

    expect(card.getByText('Only with conditions')).toBeInTheDocument()
    expect(card.getByRole('link', { name: 'Nettle tea' })).toBeInTheDocument()
    expect(card.getByText(/American Pregnancy Association reached a different conclusion: OK to eat\./))
      .toBeInTheDocument()
  })
})

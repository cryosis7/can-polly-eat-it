import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { contentIndex } from '../data'
import { CataloguePage } from '../features/catalogue/CataloguePage'
import { FoodDetailPage } from '../features/food-detail/FoodDetailPage'
import {
  categoryAssessment,
  dualSourceContent,
  foodAssessment,
} from '../test/multiSourceFixture'
import { buildContentIndex } from '../test/buildContentIndex'
import type { Assessment } from '../domain/schemas'

const nzfsSays = (statusId: string, summary: string, overrides = {}) =>
  foodAssessment('oysters-nzfs', 'oysters', statusId, { sourceId: 'nzfs', summary, ...overrides })

const nswSays = (statusId: string, summary: string, overrides = {}) =>
  foodAssessment('oysters-nsw', 'oysters', statusId, { sourceId: 'nsw-health', summary, ...overrides })

const renderDetail = (assessments: Assessment[]) => render(
  <MemoryRouter initialEntries={['/food/oysters?v=1&scope=dual']}>
    <Routes>
      <Route
        path="/food/:foodSlug"
        element={<FoodDetailPage index={buildContentIndex(dualSourceContent(assessments))} disclaimer="Not medical advice." />}
      />
    </Routes>
  </MemoryRouter>,
)

const renderCatalogue = (assessments: Assessment[]) => render(
  <MemoryRouter initialEntries={['/?v=1&scope=dual&q=oysters']}>
    <CataloguePage index={buildContentIndex(dualSourceContent(assessments))} />
  </MemoryRouter>,
)

describe('rendering guidance from more than one source', () => {
  it('stacks agreeing sources cumulatively and names each one', () => {
    renderDetail([
      categoryAssessment('shellfish-nzfs', 'shellfish', 'dual-conditions', {
        sourceId: 'nzfs',
        summary: 'Cook all shellfish thoroughly.',
      }),
      nswSays('dual-conditions', 'Do not eat these raw.', { relation: 'adds-to' }),
    ])

    expect(screen.getByRole('heading', { name: 'All of the following apply' })).toBeInTheDocument()
    expect(screen.getByText('Stated by New Zealand Food Safety')).toBeInTheDocument()
    expect(screen.getByText('Stated by New South Wales Health')).toBeInTheDocument()
    expect(screen.getByText('Cook all shellfish thoroughly.')).toBeInTheDocument()
    expect(screen.getAllByText('Do not eat these raw.').length).toBeGreaterThan(0)
    expect(screen.queryByText(/reached a different conclusion/)).not.toBeInTheDocument()
  })

  it('presents disagreeing sources as competing positions with a worded dissent notice', () => {
    renderDetail([
      nzfsSays('dual-ok', 'Eat freely.', {
        citations: [{ title: 'NZFS', url: 'https://example-nzfs.test/oysters', locator: 'Oysters' }],
      }),
      nswSays('dual-avoid', 'Do not eat these at all.'),
    ])

    expect(screen.getByText('Avoid')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What each source says' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'New Zealand Food Safety: OK to eat' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'New South Wales Health: Avoid' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'All of the following apply' })).not.toBeInTheDocument()

    const dissent = screen.getByText(/New Zealand Food Safety reached a different conclusion: OK to eat\./)
    expect(within(dissent).getByRole('link', { name: 'Read New Zealand Food Safety' }))
      .toHaveAttribute('href', 'https://example-nzfs.test/oysters')
  })

  it('names a dissenting source without a link when it has neither a citation nor a home page', () => {
    renderDetail([
      nzfsSays('dual-avoid', 'Do not eat these at all.'),
      nswSays('dual-ok', 'Eat freely.'),
    ])

    const dissent = screen.getByText(/New South Wales Health reached a different conclusion: OK to eat\./)
    expect(within(dissent).queryByRole('link')).not.toBeInTheDocument()
  })

  it('names the one source that assessed a food, because a silent source is not an agreeing one', () => {
    renderDetail([nzfsSays('dual-ok', 'Eat freely.')])

    expect(screen.getByText(/Stated by/)).toHaveTextContent('Stated by New Zealand Food Safety')
    expect(screen.queryByRole('heading', { name: 'What each source says' })).not.toBeInTheDocument()
    expect(screen.queryByText(/reached a different conclusion/)).not.toBeInTheDocument()
  })

  it('renders no attribution chrome in a list that declares no source, while an attributed list names its own', () => {
    render(
      <MemoryRouter initialEntries={['/food/cheddar?v=1&scope=pregnancy-food-safety,vegetarian-suitability']}>
        <Routes>
          <Route
            path="/food/:foodSlug"
            element={<FoodDetailPage index={contentIndex} disclaimer="Not medical advice." />}
          />
        </Routes>
      </MemoryRouter>,
    )

    const cardFor = (title: string) =>
      screen.getByRole('heading', { name: title }).closest('.guidance-summary') as HTMLElement

    // Vegetarian suitability stands on its evidentiary basis rather than a named authority, so it
    // renders no attribution at all.
    const vegetarian = cardFor('Vegetarian suitability')
    expect(within(vegetarian).queryByText(/Stated by/)).not.toBeInTheDocument()
    expect(within(vegetarian).queryByText(/reached a different conclusion/)).not.toBeInTheDocument()

    // Pregnancy food safety now draws on more than one authority, so it names the one that spoke.
    const pregnancy = cardFor('Pregnancy food safety')
    expect(within(pregnancy).getByText(/Stated by/)).toHaveTextContent('Stated by New Zealand Food Safety')
    expect(within(pregnancy).queryByText(/reached a different conclusion/)).not.toBeInTheDocument()
  })

  it('states the disagreement on the catalogue card, where most readers see the status', () => {
    renderCatalogue([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-avoid', 'Do not eat these at all.'),
    ])

    const card = screen.getByRole('link', { name: 'oysters' }).closest('.food-card') as HTMLElement
    expect(within(card).getByText('Avoid')).toBeInTheDocument()
    expect(within(card).getByText(/New Zealand Food Safety reached a different conclusion: OK to eat\./))
      .toBeInTheDocument()
  })

  it('states no disagreement on the catalogue card when the sources agree', () => {
    renderCatalogue([
      nzfsSays('dual-ok', 'Eat freely.'),
      nswSays('dual-ok', 'Eat freely.'),
    ])

    const card = screen.getByRole('link', { name: 'oysters' }).closest('.food-card') as HTMLElement
    expect(within(card).queryByText(/reached a different conclusion/)).not.toBeInTheDocument()
  })

  it('displays the list wording for a status the source did not word itself', () => {
    renderDetail([foodAssessment('oysters-nzfs', 'oysters', 'dual-ok', { sourceId: 'nzfs' })])

    expect(screen.getByText('The guide lists this food as okay to eat.')).toBeInTheDocument()
  })
})

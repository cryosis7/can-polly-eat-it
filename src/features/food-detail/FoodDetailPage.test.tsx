import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { content } from '../../data'
import type { ContentData } from '../../domain/contentValidation'
import { FoodDetailPage } from './FoodDetailPage'

const disclaimer = 'This guide is general information, not medical advice.'

const detailedContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.subject.kind === 'food' && assessment.subject.foodId === 'fresh-filled-pasta'
      ? {
          ...assessment,
          guidanceScenarios: [
            {
              id: 'cooked-filling',
              applicability: 'When the filling is cooked through',
              instruction: 'Serve it steaming hot.',
              conditions: [
                {
                  id: 'heat-filling',
                  kind: 'preparation',
                  instruction: 'Heat all parts thoroughly.',
                  facts: [{ label: 'Temperature', valueText: '75 degC' }],
                },
                {
                  id: 'serve-filling',
                  kind: 'serving',
                  instruction: 'Serve immediately after cooking.',
                },
              ],
            },
            {
              id: 'unknown-filling',
              applicability: 'When the filling cannot be identified',
              instruction: 'Do not eat it.',
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

const uncitedVegetarianContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.subject.kind === 'food' && assessment.subject.foodId === 'parmesan' && assessment.guidanceListId === 'vegetarian-suitability'
      ? { ...assessment, citations: [] }
      : assessment
  )),
}

const oysterAssessmentId = 'bluff-and-pacific-oysters-pregnancy'
const groupAssessmentId = 'seafood-cooked-pregnancy'

const multiScenarioLayerContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.id === oysterAssessmentId
      ? {
          ...assessment,
          guidanceScenarios: [
            ...assessment.guidanceScenarios,
            { id: 'served-raw', applicability: 'When it is served raw', instruction: 'Do not eat it.', conditions: [] },
          ],
        }
      : assessment
  )),
}

const sharedLocatorContent: ContentData = {
  ...content,
  assessments: content.assessments.map((assessment) => (
    assessment.id === groupAssessmentId
      ? { ...assessment, citations: content.assessments.find((candidate) => candidate.id === oysterAssessmentId)!.citations }
      : assessment
  )),
}

describe('FoodDetailPage', () => {
  it('renders an assessed food with its status, summary, and citation', () => {
    renderDetail('/food/cheddar?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Cheddar' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('The guide lists hard cheese as okay to eat when refrigerated.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy',
    )
  })

  it('discloses inherited hard-cheese guidance for Gouda, which has no assessment of its own', () => {
    renderDetail('/food/gouda?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Gouda' })).toBeInTheDocument()
    expect(screen.getByText('OK to eat')).toBeInTheDocument()
    expect(screen.getByText('Check ingredients')).toBeInTheDocument()
    expect(screen.getAllByText(/Applies to all hard cheese\./)).toHaveLength(2)
    const categoryLinks = screen.getAllByRole('link', { name: 'See Hard cheese guidance' })
    expect(categoryLinks).toHaveLength(2)
    expect(categoryLinks[0]).toHaveAttribute(
      'href',
      '/category/hard-cheese?v=1&scope=pregnancy-food-safety%2Cvegetarian-suitability',
    )
  })

  it('discloses the group rule a migrated food now inherits from its real food group', () => {
    renderDetail('/food/worcestershire-sauce?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Worcestershire sauce' })).toBeInTheDocument()
    expect(screen.getByText(/Refrigerate opened products and follow their manufacturer storage/)).toBeInTheDocument()
    expect(screen.getByText(/Applies to commercially manufactured sauces, dressings and spreads\./)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'See Sauces, dressings and spreads guidance' })[0]).toBeInTheDocument()
  })

  it('renders distinct guidance scenarios, optional facts, and authored reason links', () => {
    renderDetail('/food/fresh-filled-pasta?v=1&scope=pregnancy-food-safety', detailedContent)

    expect(screen.getByRole('heading', { name: 'How to follow this guidance' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When the filling is cooked through' })).toBeInTheDocument()
    expect(screen.getByText('Heat all parts thoroughly.')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('75 degC')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'When the filling cannot be identified' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cheddar' })).toHaveAttribute(
      'href',
      '/food/cheddar?v=1&scope=pregnancy-food-safety',
    )
  })

  it('renders the not-assessed state with its notice, source, and retained catalogue context', () => {
    renderDetail('/food/gummy-bears?v=1&scope=pregnancy-food-safety&q=gummy&category=confectionery')

    expect(screen.getByText('Not assessed')).toBeInTheDocument()
    expect(screen.getByText('This item has not been added to this guide yet, so it has not been assessed.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&scope=pregnancy-food-safety&q=gummy&category=confectionery',
    )
  })

  it('renders source-backed conditions and their citation for a food inheriting a newly assessed category', () => {
    renderDetail('/food/cottage-cheese?v=1&scope=pregnancy-food-safety')

    expect(screen.getByText('Pregnancy food safety')).toBeInTheDocument()
    expect(screen.getByText('Only with conditions')).toBeInTheDocument()
    expect(screen.getByText('Keep in its sealed pack and eat cold within two days of opening.')).toBeInTheDocument()
    expect(screen.getByText(/Applies to pasteurised cottage cheese, cream cheese and similar pasteurised cheese\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See Pasteurised cottage cheese, cream cheese, etc guidance' })).toHaveAttribute(
      'href',
      '/category/pasteurised-cottage-and-cream-cheese?v=1&scope=pregnancy-food-safety',
    )
    expect(screen.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toBeInTheDocument()
  })

  it('renders only the selected non-default guidance scope', () => {
    renderDetail('/food/parmesan?v=1&scope=vegetarian-suitability')

    expect(screen.getByRole('heading', { name: 'Vegetarian suitability' })).toBeInTheDocument()
    expect(screen.getByText('Contains animal-derived ingredients')).toBeInTheDocument()
    expect(screen.getByText('Traditional Parmesan uses animal-derived rennet.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pregnancy food safety' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sources' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Veggy Malta: 15 Products Not Vegetarian' })).toHaveAttribute(
      'href',
      'https://veggymalta.com/15-products-not-vegetarian/',
    )
  })

  it('renders the evidentiary basis and omits the Sources section for an uncited assessment', () => {
    renderDetail('/food/parmesan?v=1&scope=vegetarian-suitability', uncitedVegetarianContent)

    expect(screen.getByText('Contains animal-derived ingredients')).toBeInTheDocument()
    expect(screen.getByText(/Reflects general vegetarian knowledge/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sources' })).not.toBeInTheDocument()
  })

  it('renders the single not-assessed state with the medical-information disclaimer', () => {
    renderDetail('/food/apple-pie?v=1&scope=pregnancy-food-safety')

    expect(screen.getByText('Not assessed')).toBeInTheDocument()
    expect(screen.queryByText('Outside current coverage')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Medical information disclaimer')).toHaveTextContent(disclaimer)
  })

  it('renders an accumulated food as separate layers, each with its own statement and locator', () => {
    renderDetail('/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety')

    expect(screen.getAllByRole('heading', { name: 'All of the following apply' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('heading', {
      name: 'Applies to all freshly cooked fish, mussels, oysters, crayfish and scallops.',
    })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Specific to this food' })[0]).toBeInTheDocument()
    expect(screen.getAllByText('Cook above 75°C throughout.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Have no more than one serving per month.').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'See Seafood guidance' }).length).toBeGreaterThan(0)

    const sources = screen.getAllByRole('heading', { name: 'Sources' })[0].closest('section') as HTMLElement
    expect(sources.querySelectorAll('li')).toHaveLength(2)
  })

  it('introduces a multi-scenario layer with Follow whichever applies', () => {
    renderDetail('/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety', multiScenarioLayerContent)

    expect(screen.getAllByRole('heading', { name: 'Follow whichever applies' })[0]).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'When it is served raw' })[0]).toBeInTheDocument()
  })

  it('de-duplicates identical citations across accumulated layers', () => {
    renderDetail('/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety', sharedLocatorContent)

    // Scoped to the cooked section, where the group rule and the food's footnote share a locator.
    const cooked = screen.getByRole('heading', { name: 'Cooked' }).closest('.preparation-section') as HTMLElement
    const sources = within(cooked).getByRole('heading', { name: 'Sources' }).closest('section') as HTMLElement
    const locators = [...sources.querySelectorAll('li')].map((item) => item.textContent)
    expect(new Set(locators).size).toBe(1)
  })

  it('renders a safe food-not-found page', () => {
    renderDetail('/food/removed-food?v=1&scope=pregnancy-food-safety')

    expect(screen.getByRole('heading', { name: 'Food not found' })).toBeInTheDocument()
    expect(screen.getByText(/not in the current guide/i)).toBeInTheDocument()
  })
})

// ADR: Model preparation as a catalogue dimension.
// See: docs/decisions/2026-08-10 ADR - model preparation as a catalogue dimension.md
describe('a food eaten in several preparations', () => {
  const citation = content.assessments.find((assessment) => assessment.citations.length > 0)!.citations[0]
  const salmon = content.foods.find((food) => food.id === 'farmed-salmon')!
  const sibling = content.foods.find((food) =>
    food.primaryCategoryId === salmon.primaryCategoryId && food.id !== salmon.id)!

  const preparedContent: ContentData = {
    ...content,
    foods: content.foods.map((food) => {
      if (food.id === salmon.id) {
        return { ...food, preparationIds: ['raw', 'cooked'] }
      }
      return food.id === sibling.id ? { ...food, preparationIds: ['smoked'] } : food
    }),
    assessments: [
      ...content.assessments,
      {
        id: 'salmon-raw-pregnancy',
        subject: { kind: 'food', foodId: salmon.id },
        guidanceListId: 'pregnancy-food-safety',
        // The pregnancy list declares more than one source, so a fixture assessment names one too.
        // Naming New Zealand Food Safety also keeps `salmon-mercury-pregnancy` below on the same
        // axis and source as the authored farmed-salmon rule, which is the collision this fixture
        // exists to exercise.
        sourceId: 'new-zealand-food-safety',
        statusId: 'pregnancy-avoid',
        preparationId: 'raw',
        summary: 'Do not eat raw salmon.',
        guidanceScenarios: [],
        reasonLinks: [],
        citations: [citation],
      },
      {
        id: 'salmon-mercury-pregnancy',
        subject: { kind: 'food', foodId: salmon.id },
        guidanceListId: 'pregnancy-food-safety',
        sourceId: 'new-zealand-food-safety',
        statusId: 'pregnancy-conditions',
        summary: 'Limit to 3 to 4 servings a week.',
        guidanceScenarios: [],
        reasonLinks: [],
        citations: [citation],
      },
      {
        id: 'smoked-group-pregnancy',
        subject: { kind: 'category', categoryId: salmon.primaryCategoryId },
        guidanceListId: 'pregnancy-food-safety',
        sourceId: 'new-zealand-food-safety',
        statusId: 'pregnancy-avoid',
        preparationId: 'smoked',
        scopeStatement: 'Applies to all smoked seafood in this group.',
        summary: 'Heat smoked seafood until steaming hot.',
        guidanceScenarios: [],
        reasonLinks: [],
        citations: [citation],
      },
    ],
  }

  const scope = 'v=1&scope=pregnancy-food-safety'

  it('shows each declared preparation with its own status and the species limit in both', () => {
    renderDetail(`/food/${salmon.slug}?${scope}`, preparedContent)

    const raw = screen.getByRole('heading', { name: 'Raw' }).closest('section') as HTMLElement
    const cooked = screen.getByRole('heading', { name: 'Cooked' }).closest('section') as HTMLElement

    expect(within(raw).getAllByText('Do not eat raw salmon.').length).toBeGreaterThan(0)
    expect(within(raw).getByText('Limit to 3 to 4 servings a week.')).toBeInTheDocument()
    expect(within(cooked).getByText('Limit to 3 to 4 servings a week.')).toBeInTheDocument()
    expect(within(cooked).queryByText('Do not eat raw salmon.')).not.toBeInTheDocument()
  })

  it('shows an undeclared preparation as the group rule, named as the group rather than the food', () => {
    renderDetail(`/food/${salmon.slug}?${scope}`, preparedContent)

    const groupGuidance = screen
      .getByRole('heading', { name: /^General guidance for .+ applies:$/ })
      .closest('section') as HTMLElement

    expect(within(groupGuidance).getByRole('heading', { name: 'Smoked' })).toBeInTheDocument()
    expect(within(groupGuidance).getAllByText('Heat smoked seafood until steaming hot.').length).toBeGreaterThan(0)
    // The group's rule for this preparation is not suppressed by the food's own food-wide rule,
    // and the food's rule for a preparation it is eaten in never leaks into this section.
    expect(within(groupGuidance).getAllByText('Limit to 3 to 4 servings a week.').length).toBeGreaterThan(0)
    expect(within(groupGuidance).queryByText('Do not eat raw salmon.')).not.toBeInTheDocument()
  })

  it('names the preparation the reader arrived from, and ignores an unknown one', () => {
    const { unmount } = renderDetail(`/food/${salmon.slug}?${scope}&prep=raw`, preparedContent)

    expect(screen.getByText(/the preparation you were looking at/)).toBeInTheDocument()
    unmount()

    renderDetail(`/food/${salmon.slug}?${scope}&prep=poached`, preparedContent)

    expect(screen.getByRole('heading', { name: 'Raw' })).toBeInTheDocument()
    expect(screen.queryByText(/the preparation you were looking at/)).not.toBeInTheDocument()
  })

  it('leaves a food declaring no preparation states rendering exactly as before', () => {
    renderDetail('/food/cheddar?v=1&scope=pregnancy-food-safety', preparedContent)

    expect(screen.queryByRole('heading', { name: /^General guidance for/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pregnancy food safety' })).toBeInTheDocument()
  })
})

import { expect, test, type Page } from '@playwright/test'
import { desktopViewport, expectNoAccessibilityViolations, mobileViewport } from './support/axe'

const viewports = [
  { name: 'mobile', size: mobileViewport },
  { name: 'desktop', size: desktopViewport },
]

const scannedStates = [
  {
    name: 'the default catalogue',
    url: '/',
    settled: (page: Page) => page.getByRole('heading', { name: "Polly's Food Guide" }),
  },
  {
    name: 'a searched and category-filtered catalogue',
    url: '/?v=1&scope=pregnancy-food-safety&q=yogurt&category=dairy',
    settled: (page: Page) => page.getByRole('link', { name: 'Yoghurt guidance', exact: true }),
  },
  {
    name: 'the no-results state',
    url: '/?v=1&scope=pregnancy-food-safety&q=not-a-guide-food',
    settled: (page: Page) => page.getByText('0 results in the guide'),
  },
  {
    name: 'the removed-filter announcement',
    url: '/?v=2&scope=unknown&outcome=unknown&q=yogurt',
    settled: (page: Page) => page.getByText('Unavailable shared filters were removed.'),
  },
  {
    name: 'a food detail page inheriting a lifted category rule',
    url: '/food/cottage-cheese?v=1&scope=pregnancy-food-safety',
    settled: (page: Page) => page.getByRole('heading', { name: 'Pasteurised cottage cheese' }),
  },
  {
    name: 'a migrated category detail page with conditions and a citation',
    url: '/category/eggs?v=1&scope=pregnancy-food-safety&prep=cooked',
    settled: (page: Page) => page.getByRole('heading', { name: 'Eggs' }),
  },
  {
    name: 'a food detail page with reason links',
    url: '/food/marshmallows?v=1&scope=vegetarian-suitability',
    settled: (page: Page) => page.getByRole('heading', { name: 'Why this guidance applies' }),
  },
  {
    name: 'an assessed category detail page',
    url: '/category/hard-cheese?v=1&scope=pregnancy-food-safety,vegetarian-suitability',
    settled: (page: Page) => page.getByRole('heading', { name: 'Hard cheese' }),
  },
  {
    name: 'a food detail page with accumulated guidance layers',
    url: '/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety',
    settled: (page: Page) => page.getByRole('heading', { name: 'All of the following apply' }).first(),
  },
  {
    name: 'a preparation-scoped food detail page',
    url: '/food/farmed-salmon?v=1&scope=pregnancy-food-safety&prep=raw',
    settled: (page: Page) => page.getByRole('heading', { name: /^Raw/ }),
  },
  {
    name: 'a catalogue showing preparation groupings',
    url: '/?v=1&scope=pregnancy-food-safety&q=farmed%20salmon',
    settled: (page: Page) => page.locator('.preparation-group').first(),
  },
  {
    name: 'a category detail page with per-preparation sections',
    url: '/category/ice-cream?v=1&scope=pregnancy-food-safety&prep=soft-serve',
    settled: (page: Page) => page.getByRole('heading', { name: 'Ice cream' }),
  },
  {
    name: 'a contested food detail page showing competing source positions',
    url: '/food/chamomile-tea?v=1&scope=pregnancy-food-safety',
    settled: (page: Page) => page.getByRole('heading', { name: 'What each source says' }),
  },
  {
    name: 'the food-not-found route',
    url: '/food/removed-food?v=1&scope=pregnancy-food-safety',
    settled: (page: Page) => page.getByRole('heading', { name: 'Food not found' }),
  },
]

test.describe('Accessibility', () => {
  for (const viewport of viewports) {
    test.describe(`at the ${viewport.name} viewport`, () => {
      test.use({ viewport: viewport.size })

      for (const state of scannedStates) {
        test(`has no WCAG 2.2 AA violations on ${state.name}`, async ({ page }) => {
          await page.goto(state.url)
          await expect(state.settled(page).first()).toBeVisible()

          await expectNoAccessibilityViolations(page)
        })
      }
    })
  }

  test('has no WCAG 2.2 AA violations with the mobile filters disclosure open', async ({ page }) => {
    await page.setViewportSize(mobileViewport)
    await page.goto('/')

    const disclosure = page.locator('details')
    await expect(disclosure).not.toHaveAttribute('open', '')

    await page.getByText('Filters', { exact: true }).click()
    await expect(disclosure).toHaveAttribute('open', '')
    await expect(page.getByRole('combobox', { name: 'Category' })).toBeVisible()

    await expectNoAccessibilityViolations(page)
  })
})

import { expect, test, type Page } from '@playwright/test'

const scope = 'v=1&scope=pregnancy-food-safety'

const apaSourceUrl = 'https://americanpregnancy.org/pregnancy/herbal-tea/'
const babyCenterSourceUrl = 'https://www.babycenter.com/pregnancy/diet-and-fitness/herbal-teas-during-pregnancy_3537'

const pregnancyCard = (page: Page) =>
  page.locator('.guidance-summary', { has: page.getByRole('heading', { name: 'Pregnancy food safety' }) })

const foodCard = (page: Page, name: string) =>
  page.locator('.food-card', { has: page.getByRole('link', { name, exact: true }) })

test.describe('Tea guidance from disagreeing sources', () => {
  test('leads a contested tea with the cautious status and names every source position', async ({ page }) => {
    await page.goto(`/food/chamomile-tea?${scope}`)
    const card = pregnancyCard(page)

    await expect(card.getByText('Avoid').first()).toBeVisible()
    await expect(card.getByRole('heading', { name: 'What each source says' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'BabyCenter: Avoid' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'Medeniyet Medical Journal: Avoid' })).toBeVisible()
    await expect(card.getByRole('heading', { name: 'American Pregnancy Association: Not enough evidence' }))
      .toBeVisible()
  })

  test('states the disagreement in words and links to the dissenting source', async ({ page }) => {
    await page.goto(`/food/chamomile-tea?${scope}`)

    const dissent = pregnancyCard(page)
      .getByText('American Pregnancy Association reached a different conclusion: Not enough evidence.')
    await expect(dissent).toBeVisible()
    await expect(dissent.getByRole('link', { name: 'Read American Pregnancy Association' }))
      .toHaveAttribute('href', apaSourceUrl)
  })

  test('cites every source behind a contested tea with its own locator', async ({ page }) => {
    await page.goto(`/food/chamomile-tea?${scope}`)
    const sources = pregnancyCard(page).locator('.source-links')

    await expect(sources.getByRole('link', { name: /BabyCenter/ })).toHaveAttribute('href', babyCenterSourceUrl)
    await expect(sources.getByRole('link')).toHaveCount(3)
    await expect(sources).toContainText('The Herbs Used - Chamomile (German)')
  })

  test('stacks agreeing sources on ginger without claiming a disagreement', async ({ page }) => {
    await page.goto(`/food/ginger-tea?${scope}`)
    const card = pregnancyCard(page)

    await expect(card.getByText('Only with conditions').first()).toBeVisible()
    await expect(card.getByRole('heading', { name: 'All of the following apply' })).toBeVisible()
    await expect(card.getByText(/reached a different conclusion/)).toHaveCount(0)
    await expect(card.getByText('Stated by BabyCenter')).toBeVisible()
  })

  test('attributes the caffeine limit to the source that set it', async ({ page }) => {
    await page.goto(`/category/caffeinated-tea?${scope}`)
    const card = pregnancyCard(page)

    await expect(card).toContainText('200 mg')
    await expect(card).toContainText('no agreed safe amount')
    await expect(card.getByText('Stated by BabyCenter')).toBeVisible()
  })

  test('shows the disagreement on the catalogue card, where most readers see the status', async ({ page }) => {
    await page.goto(`/?${scope}&q=chamomile`)
    const card = foodCard(page, 'Chamomile tea')

    await expect(card.getByText('Avoid')).toBeVisible()
    await expect(card.getByText(/American Pregnancy Association reached a different conclusion/))
      .toBeVisible()
  })

  test('browses tea under Drinks, split by what the leaf is', async ({ page }) => {
    await page.goto(`/?${scope}&q=peppermint`)

    await expect(page.locator('.breadcrumb', { hasText: 'Drinks > Tea > Herbal tea' }).first()).toBeVisible()
    await expect(foodCard(page, 'Peppermint tea').getByText('Only with conditions')).toBeVisible()
  })
})

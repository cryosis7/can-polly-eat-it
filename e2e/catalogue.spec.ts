import { expect, test, type Page } from '@playwright/test'

const mpiSourceUrl = 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy'
const veggyMaltaSourceUrl = 'https://veggymalta.com/15-products-not-vegetarian/'

const foodCard = (page: Page, name: string) =>
  page.locator('.food-card', { has: page.getByRole('link', { name, exact: true }) })

test.describe('Food catalogue', () => {
  test('shows pregnancy guidance by default with neutral fallback states', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Polly's Food Guide" })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeDisabled()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Low-acid soft pasteurised cheese' })).toBeVisible()
    await expect(page.getByText('OK to eat').first()).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage').first()).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Not assessed' })).toHaveCount(0)

    const cheddarCard = foodCard(page, 'Cheddar')
    await expect(cheddarCard.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(cheddarCard.getByRole('link', { name: 'Primary source: New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
  })

  test('finds a food through an alias search', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('yogurt')

    await expect(page.getByRole('link', { name: 'Yoghurt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    await expect(page.getByText('1 food in the guide')).toBeVisible()
    await expect(page).toHaveURL(/q=yogurt/)
  })

  test('includes descendant foods when filtering by a parent category', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&category=dairy')

    await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue('dairy')
    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Hard cheese' })).toBeVisible()
    await expect(foodCard(page, 'Cheddar')).toBeVisible()
    await expect(foodCard(page, 'Pasteurised yoghurt')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cooked eggs', exact: true })).toHaveCount(0)
  })

  test('reproduces selected outcomes from a direct URL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/?v=1&scope=pregnancy-food-safety&outcome=okay,maybe')

    await expect(page.locator('details')).toHaveAttribute('open', '')
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Okay', exact: true })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Maybe - see notes' })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Outcome: Maybe - see notes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).toBeVisible()
  })

  test('combines selected dietary scopes and outcome bands cumulatively', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=maybe&category=dairy')

    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Maybe - see notes' })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Dietary scope: Vegetarian suitability' })).toBeVisible()
    await expect(page.getByText('1 food in the guide')).toBeVisible()

    const yoghurtCard = foodCard(page, 'Pasteurised yoghurt')
    await expect(yoghurtCard).toBeVisible()
    await expect(yoghurtCard.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(yoghurtCard.getByText('Only with conditions')).toBeVisible()
    await expect(yoghurtCard.getByRole('heading', { name: 'Vegetarian suitability' })).toBeVisible()
    await expect(yoghurtCard.getByText('Check ingredients')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Parmesan', exact: true })).toHaveCount(0)
  })

  test('shows a cited pregnancy source and the vegetarian evidentiary basis on a filtered URL', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=dairy')

    const cheddarCard = foodCard(page, 'Cheddar')
    await expect(cheddarCard.getByRole('link', { name: 'Primary source: New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
    await expect(page.getByText(/Reflects general vegetarian knowledge/)).toBeVisible()
  })

  test('updates outcome controls, then clears filters', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('checkbox', { name: 'Not okay' }).click()

    await expect(page.getByRole('button', { name: 'Outcome: Not okay' })).toBeVisible()

    await page.getByRole('button', { name: 'Clear filters' }).click()

    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  test('shows a useful no-results state for valid filters', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=not-a-guide-food')

    await expect(page.getByText('0 foods in the guide')).toBeVisible()
    await expect(page.getByText('No foods match these filters. Try clearing a filter or searching for another name.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Search: not-a-guide-food' })).toBeVisible()
  })

  test('keeps mobile search and feedback visible while filters are disclosed', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/')

    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await expect(page.getByRole('searchbox', { name: 'Search foods' })).toBeVisible()
    await expect(page.getByText('140 foods in the guide')).toBeVisible()
    await expect(page.locator('details')).not.toHaveAttribute('open', '')

    await page.getByText('Filters', { exact: true }).click()
    await page.getByRole('combobox', { name: 'Category' }).selectOption('dairy')

    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page).toHaveURL(/category=dairy/)
  })

  test('shows source-backed conditions on a direct food-detail route', async ({ page }) => {
    await page.goto('/food/cooked-eggs?v=1&scope=pregnancy-food-safety&q=eggs&category=eggs')

    await expect(page.getByRole('heading', { name: 'Cooked eggs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(page.getByText('Only with conditions')).toBeVisible()
    await expect(page.getByText('Ensure yolks and scrambled eggs are firm.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
    await expect(page.getByText('Eggs: Cooked eggs')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&scope=pregnancy-food-safety&q=eggs&category=eggs',
    )
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')
  })

  test('shows independently resolved selected scopes on a direct food-detail route', async ({ page }) => {
    await page.goto('/food/pasteurised-yoghurt?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=maybe&q=yogurt&category=dairy')

    await expect(page.getByRole('heading', { name: 'Pasteurised yoghurt' })).toBeVisible()

    const pregnancyGuidance = page.locator('.guidance-summary', {
      has: page.getByRole('heading', { name: 'Pregnancy food safety' }),
    })
    await expect(pregnancyGuidance.getByText('Only with conditions')).toBeVisible()
    await expect(pregnancyGuidance.getByText('Use pasteurised dairy under the manufacturer’s storage guidance.')).toBeVisible()
    await expect(pregnancyGuidance.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )

    const vegetarianGuidance = page.locator('.guidance-summary', {
      has: page.getByRole('heading', { name: 'Vegetarian suitability' }),
    })
    await expect(vegetarianGuidance.getByText('Check ingredients')).toBeVisible()
    await expect(vegetarianGuidance.getByText('Some yoghurts use gelatin as a gelling agent, so check the label.')).toBeVisible()
    await expect(vegetarianGuidance.getByRole('link', { name: 'Veggy Malta: 15 Products Not Vegetarian' })).toHaveAttribute(
      'href',
      veggyMaltaSourceUrl,
    )

    await expect(page.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      /scope=pregnancy-food-safety%2Cvegetarian-suitability.*q=yogurt.*category=dairy.*outcome=maybe/,
    )
  })

  test('keeps reason links on food detail pages and navigates to canonical reason foods', async ({ page }) => {
    await page.goto('/?v=1&scope=vegetarian-suitability&q=marshmallows')

    const marshmallowsCard = foodCard(page, 'Marshmallows')
    await expect(marshmallowsCard).toBeVisible()
    await expect(marshmallowsCard.getByText('Contains animal-derived ingredients')).toBeVisible()
    await expect(marshmallowsCard.getByRole('link', { name: 'Gelatin' })).toHaveCount(0)

    await marshmallowsCard.getByRole('link', { name: 'Marshmallows' }).click()

    await expect(page.getByRole('heading', { name: 'Marshmallows' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Why this guidance applies' })).toBeVisible()
    await expect(page.getByText('Contains gelatin.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Gelatin' })).toHaveAttribute(
      'href',
      '/food/gelatin?v=1&scope=vegetarian-suitability&q=marshmallows',
    )

    await page.getByRole('link', { name: 'Gelatin' }).click()

    await expect(page.getByRole('heading', { name: 'Gelatin' })).toBeVisible()
    await expect(page.getByText('Contains animal-derived ingredients')).toBeVisible()
    await expect(page.getByText('Gelatin is an animal-derived gelling ingredient.')).toBeVisible()
  })

  test('removes unavailable URL constraints without dropping valid search text', async ({ page }) => {
    await page.goto('/?v=2&scope=unknown&outcome=unknown&q=yogurt')

    await expect(page.getByRole('status')).toContainText('Unavailable shared filters were removed.')
    await expect(page.getByRole('link', { name: 'Pasteurised yoghurt' })).toBeVisible()
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('shows a safe food-not-found route', async ({ page }) => {
    await page.goto('/food/removed-food?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Food not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the food guide' })).toBeVisible()
  })
})

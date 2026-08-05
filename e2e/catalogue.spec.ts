import { expect, test } from '@playwright/test'

test.describe('Food catalogue', () => {
  test('shows pregnancy guidance by default with neutral fallback states', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: "Polly's Food Guide" })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Hard cheese' })).toBeVisible()
    await expect(page.getByText('OK to eat').first()).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage').first()).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Not assessed' })).toHaveCount(0)
  })

  test('finds a food through an alias search', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('yogurt')

    await expect(page.getByRole('link', { name: 'Yoghurt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    await expect(page.getByText('1 food in the guide')).toBeVisible()
    await expect(page).toHaveURL(/q=yogurt/)
  })

  test('reproduces combined scopes and outcomes from a direct URL', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=okay,maybe')

    await expect(page.locator('details')).toHaveAttribute('open', '')
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Okay', exact: true })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Maybe - see notes' })).toBeChecked()
    await expect(page.getByRole('button', { name: 'Dietary scope: Pregnancy food safety' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Outcome: Maybe - see notes' })).toBeVisible()
    await expect(page.getByText(/No foods match these filters/i)).toBeVisible()
  })

  test('updates scope and outcome controls, then clears filters', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('checkbox', { name: 'Vegetarian suitability' }).click()
    await page.getByRole('checkbox', { name: 'Not okay' }).click()

    await expect(page.getByRole('button', { name: 'Dietary scope: Vegetarian suitability' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Outcome: Not okay' })).toBeVisible()
    await expect(page).toHaveURL(/scope=pregnancy-food-safety%2Cvegetarian-suitability/)

    await page.getByRole('button', { name: 'Clear filters' }).click()

    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  test('keeps mobile search and feedback visible while filters are disclosed', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/')

    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await expect(page.getByRole('searchbox', { name: 'Search foods' })).toBeVisible()
    await expect(page.getByText('19 foods in the guide')).toBeVisible()
    await expect(page.locator('details')).not.toHaveAttribute('open', '')

    await page.getByText('Filters', { exact: true }).click()
    await page.getByRole('combobox', { name: 'Category' }).selectOption('dairy')

    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page).toHaveURL(/category=dairy/)
  })

  test('shows all independently resolved guidance on a direct food-detail route', async ({ page }) => {
    await page.goto('/food/yoghurt?v=1&scope=vegetarian-suitability')

    await expect(page.getByRole('heading', { name: 'Yoghurt' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Vegetarian suitability' })).toBeVisible()
    await expect(page.getByText('Check ingredients')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Veggy Malta: 15 Products Not Vegetarian' })).toHaveAttribute(
      'href',
      'https://veggymalta.com/15-products-not-vegetarian/',
    )
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')
  })

  test('removes unavailable URL constraints without dropping valid search text', async ({ page }) => {
    await page.goto('/?v=2&scope=unknown&outcome=unknown&q=yogurt')

    await expect(page.getByRole('status')).toContainText('Unavailable shared filters were removed.')
    await expect(page.getByRole('link', { name: 'Yoghurt' })).toBeVisible()
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('shows a safe food-not-found route', async ({ page }) => {
    await page.goto('/food/removed-food?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Food not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the food guide' })).toBeVisible()
  })
})

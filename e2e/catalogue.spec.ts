import { expect, test } from '@playwright/test'

test.describe('Food catalogue', () => {
  test('shows the default guide, food outcomes, and source links', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Hard cheese' })).toBeVisible()
    await expect(page.getByText('OK to eat').first()).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
    await expect(page.getByText('Avoid').first()).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Primary source: MPI: Food and pregnancy/i })).toHaveCount(5)
  })

  test('finds a food through an alias search', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('yogurt')

    await expect(page.getByRole('link', { name: 'Yoghurt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    await expect(page.getByText('1 food in the guide')).toBeVisible()
    await expect(page).toHaveURL(/q=yogurt/)
  })

  test('filters by category and status, then clears filters', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('combobox', { name: 'Category' }).selectOption('dairy')
    await page.getByRole('checkbox', { name: 'Avoid' }).check()

    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'pregnancy-food-safety: Avoid' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Brie' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    await expect(page.getByText('1 food in the guide')).toBeVisible()

    await page.getByRole('button', { name: 'Clear filters' }).click()

    await expect(page.getByText('5 foods in the guide')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeDisabled()
  })

  test('reproduces a filtered catalogue from a direct URL', async ({ page }) => {
    await page.goto('/?v=1&list=pregnancy-food-safety&category=dairy&status.pregnancy-food-safety=avoid,not-assessed')

    await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue('dairy')
    await expect(page.getByRole('checkbox', { name: 'Avoid' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Not assessed' })).toBeChecked()
    await expect(page.getByRole('link', { name: 'Brie' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Yoghurt' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
  })

  test('shows a direct food-detail route with its selected list, citation, and disclaimer', async ({ page }) => {
    await page.goto('/food/cheddar?v=1&list=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Cheddar' })).toBeVisible()
    await expect(page.getByText('Pregnancy food safety')).toBeVisible()
    await expect(page.getByText('OK to eat')).toBeVisible()
    await expect(page.getByRole('link', { name: 'MPI: Food and pregnancy' })).toHaveAttribute(
      'href',
      'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy/',
    )
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')
  })

  test('shows a safe food-not-found route', async ({ page }) => {
    await page.goto('/food/removed-food?v=1&list=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Food not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the food guide' })).toBeVisible()
  })
})

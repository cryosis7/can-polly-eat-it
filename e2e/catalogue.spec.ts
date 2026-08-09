import { expect, test, type Page } from '@playwright/test'

const mpiSourceUrl = 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy'
const veggyMaltaSourceUrl = 'https://veggymalta.com/15-products-not-vegetarian/'

const foodCard = (page: Page, name: string) =>
  page.locator('.food-card', { has: page.getByRole('link', { name, exact: true }) })

test.describe('Food catalogue', () => {
  test('shows pregnancy guidance by default with neutral fallback states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Dairy, level 1' }).click()
    await page.getByRole('button', { name: 'Seafood, level 1' }).click()
    await page.getByRole('button', { name: 'Confectionery, level 1' }).click()

    await expect(page.getByRole('heading', { name: "Polly's Food Guide" })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeDisabled()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeChecked()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Low-acid soft pasteurised cheese' })).toBeVisible()
    await expect(page.getByText('OK to eat').first()).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Not assessed' })).toHaveCount(0)

    const cheddarCard = foodCard(page, 'Cheddar')
    await expect(cheddarCard.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(cheddarCard.getByRole('link', { name: /Primary source/ })).toHaveCount(0)
  })

  test('lands with top-level groups collapsed and a much shorter page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Dairy, level 1' })).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('button', { name: 'Cheese, level 2' })).toHaveCount(0)
    await expect(page.getByText('159 results in the guide')).toBeVisible()

    const collapsedHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(collapsedHeight).toBeLessThan(6000)
  })

  test('expands a group by keyboard and shows its nested headings with visible focus', async ({ page }) => {
    await page.goto('/')

    const breadsToggle = page.getByRole('button', { name: 'Breads and cereals, level 1' })
    await breadsToggle.focus()
    await expect(breadsToggle).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(breadsToggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Cakes, slices and muffins, level 2' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Plain cakes, slices and muffins' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dairy, level 1' })).toHaveAttribute('aria-expanded', 'false')
  })

  test('reveals a searched entry that sits inside a collapsed group', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=gouda')

    await expect(foodCard(page, 'Gouda')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cheese, level 2' })).toBeVisible()
    await expect(page.getByText('1 result in the guide')).toBeVisible()
  })

  test('finds a merged entry through an alias search', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('yogurt')

    await expect(page.getByRole('link', { name: 'Pasteurised yoghurt guidance', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    await expect(page.getByText('1 result in the guide')).toBeVisible()
    await expect(page).toHaveURL(/q=yogurt/)
  })

  test('reaches a migrated alias of a retired food on its merged category entry', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=poached%20eggs')

    await expect(page.getByText('1 result in the guide')).toBeVisible()
    const cookedEggsGroup = page.locator('.category-group', { hasText: 'Cooked eggs' })
    await expect(cookedEggsGroup.getByRole('link', { name: 'Cooked eggs guidance', exact: true })).toBeVisible()
    await expect(cookedEggsGroup.getByText('Only with conditions').first()).toBeVisible()
  })

  test('reaches a raw-egg food surfaced in its own category from a cold start', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('dressings containing mayonnaise')

    await expect(page.getByText('1 result in the guide')).toBeVisible()
    const mayonnaiseCard = foodCard(page, 'Mayonnaise')
    await expect(mayonnaiseCard).toBeVisible()
    await expect(mayonnaiseCard.getByText('Avoid')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Raw eggs guidance', exact: true })).toHaveCount(0)
  })

  test('loads the new cold desserts category directly and shows its amber rule and children', async ({ page }) => {
    await page.goto('/category/cold-desserts?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Cold desserts' })).toBeVisible()
    await expect(page.getByText('Desserts > Cold desserts')).toBeVisible()
    await expect(page.getByText('Only with conditions')).toBeVisible()
    await expect(page.getByText('Do not eat it if it contains raw egg.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')

    await page.goto('/?v=1&scope=pregnancy-food-safety&category=cold-desserts')
    await expect(page.getByRole('button', { name: 'Ice cream, level 3' })).toBeVisible()
    await expect(foodCard(page, 'Tiramisu').getByText('Avoid')).toBeVisible()
  })

  test('includes descendant foods when filtering by a parent category', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&category=dairy')

    await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue('dairy')
    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Hard cheese' })).toBeVisible()
    await expect(foodCard(page, 'Cheddar')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pasteurised yoghurt guidance', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cooked eggs guidance', exact: true })).toHaveCount(0)
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
    await expect(page.getByText('1 result in the guide')).toBeVisible()

    const yoghurtEntry = page.locator('.category-group', {
      has: page.getByRole('link', { name: 'Pasteurised yoghurt guidance', exact: true }),
    }).locator('.category-entry')
    await expect(yoghurtEntry).toBeVisible()
    await expect(yoghurtEntry.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(yoghurtEntry.getByText('Only with conditions')).toBeVisible()
    await expect(yoghurtEntry.getByRole('heading', { name: 'Vegetarian suitability' })).toBeVisible()
    await expect(yoghurtEntry.getByText('Check ingredients')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Parmesan', exact: true })).toHaveCount(0)
  })

  test('shows the cited pregnancy source on the food page and the vegetarian evidentiary basis on a filtered URL', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=dairy')

    await expect(foodCard(page, 'Cheddar').getByRole('link', { name: /Primary source/ })).toHaveCount(0)
    await expect(page.getByText(/Reflects general vegetarian knowledge/)).toBeVisible()

    await page.goto('/food/cheddar?v=1&scope=pregnancy-food-safety')
    await expect(page.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' }).first()).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
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

    await expect(page.getByText('0 results in the guide')).toBeVisible()
    await expect(page.getByText('No foods match these filters. Try clearing a filter or searching for another name.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Search: not-a-guide-food' })).toBeVisible()
  })

  test('keeps mobile search and feedback visible while filters are disclosed', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/')

    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
    await expect(page.getByRole('searchbox', { name: 'Search foods' })).toBeVisible()
    await expect(page.getByText('159 results in the guide')).toBeVisible()
    await expect(page.locator('details')).not.toHaveAttribute('open', '')

    await page.getByText('Filters', { exact: true }).click()
    await page.getByRole('combobox', { name: 'Category' }).selectOption('dairy')

    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page).toHaveURL(/category=dairy/)
  })

  test('shows source-backed conditions on a retired record’s new category-detail route', async ({ page }) => {
    await page.goto('/category/cooked-eggs?v=1&scope=pregnancy-food-safety&q=eggs&category=eggs')

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

  test('shows independently resolved selected scopes on a direct category-detail route', async ({ page }) => {
    await page.goto('/category/pasteurised-yoghurt?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=maybe&q=yogurt&category=dairy')

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

  test('browses to a migrated food through the food group it now belongs to', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Foods that may contain animal-derived ingredients, level 1' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Confectionery, level 1' }).click()
    await page.getByRole('link', { name: 'Marshmallows', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Marshmallows' })).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
  })

  test('keeps an unassessed new food group as a plain browse heading rather than a route', async ({ page }) => {
    await page.goto('/category/confectionery')

    await expect(page.getByRole('heading', { name: 'Category not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the food guide' })).toBeVisible()
  })

  test('returns the unchanged vegetarian entry set for a migrated food on a filtered URL', async ({ page }) => {
    await page.goto('/?v=1&scope=vegetarian-suitability&q=gelatin')

    const gelatinCard = foodCard(page, 'Gelatin')
    await expect(gelatinCard).toBeVisible()
    await expect(gelatinCard.getByText('Contains animal-derived ingredients')).toBeVisible()
    await expect(gelatinCard.getByText('Gelatin is an animal-derived gelling ingredient.')).toBeVisible()
  })

  test('removes unavailable URL constraints without dropping valid search text', async ({ page }) => {
    await page.goto('/?v=2&scope=unknown&outcome=unknown&q=yogurt')

    await expect(page.getByRole('status')).toContainText('Unavailable shared filters were removed.')
    await expect(page.getByRole('link', { name: 'Pasteurised yoghurt guidance', exact: true })).toBeVisible()
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('drops the retired outside-coverage outcome from a shared URL and announces the removal', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&outcome=outside-coverage')

    await expect(page.getByRole('status')).toContainText('Unavailable shared filters were removed.')
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('shows a food with no reviewed rule as a single not-assessed state with the guide notice', async ({ page }) => {
    await page.goto('/food/apple-pie?v=1&scope=pregnancy-food-safety')

    await expect(page.getByText('Not assessed')).toBeVisible()
    await expect(page.getByText('This item has not been added to this guide yet, so it has not been assessed.').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page.getByLabel('Medical information disclaimer')).toBeVisible()
  })

  test('shows both accumulated instructions with their own locators on a food detail route', async ({ page }) => {
    await page.goto('/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Bluff and Pacific oysters' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'All of the following apply' })).toBeVisible()
    await expect(page.getByText('Cook above 75°C throughout.')).toBeVisible()
    await expect(page.getByText('Have no more than one serving per month.')).toBeVisible()
    await expect(page.getByText('Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc')).toBeVisible()
    await expect(page.getByText('Seafood footnote: Bluff and Pacific oysters and queen scallops')).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
  })

  test('shows a safe food-not-found route', async ({ page }) => {
    await page.goto('/food/removed-food?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Food not found' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to the food guide' })).toBeVisible()
  })

  test('loads an assessed category directly and shows its scoped guidance', async ({ page }) => {
    await page.goto('/category/hard-cheese?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    await expect(page.getByRole('heading', { name: 'Hard cheese' })).toBeVisible()
    await expect(page.getByText('Dairy > Cheese > Hard cheese')).toBeVisible()
    await expect(page.getByText('OK to eat')).toBeVisible()
    await expect(page.getByText('Check ingredients')).toBeVisible()
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')
  })

  test('shows an inheritance-only food and its origin category as guide entries on a filtered URL', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability&category=hard-cheese')

    const hardCheeseGroup = page.locator('.category-group', {
      has: page.getByRole('button', { name: 'Hard cheese, level 3' }),
    })
    await expect(hardCheeseGroup.getByRole('link', { name: 'Hard cheese guidance', exact: true })).toBeVisible()
    await expect(hardCheeseGroup.locator('.category-entry').getByText('OK to eat')).toBeVisible()

    const goudaCard = foodCard(page, 'Gouda')
    await expect(goudaCard).toBeVisible()
    await expect(goudaCard.getByText('Applies to all hard cheese.').first()).toBeVisible()
    await expect(goudaCard.getByRole('link', { name: 'See Hard cheese guidance' }).first()).toHaveAttribute(
      'href',
      /\/category\/hard-cheese/,
    )

    await goudaCard.getByRole('link', { name: 'See Hard cheese guidance' }).first().click()
    await expect(page.getByRole('heading', { name: 'Hard cheese' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to the food guide' })).toBeVisible()
  })
})

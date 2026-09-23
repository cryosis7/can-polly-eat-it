import { expect, test, type Page } from '@playwright/test'

const mpiSourceUrl = 'https://www.mpi.govt.nz/food-safety-home/food-pregnancy/list-safe-food-pregnancy'

const foodCard = (page: Page, name: string) =>
  page.locator('.food-card', { has: page.getByRole('link', { name, exact: true }) })

test.describe('Food catalogue', () => {
  test('shows pregnancy and vegetarian guidance by default with neutral fallback states', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Dairy, level 1' }).click()
    await page.getByRole('button', { name: 'Seafood, level 1' }).click()
    await page.getByRole('button', { name: 'Confectionery, level 1' }).click()

    await expect(page.getByRole('heading', { name: "Polly's Food Guide" })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Pregnancy food safety' })).not.toBeDisabled()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).toBeChecked()
    await expect(page.getByRole('checkbox', { name: 'Vegetarian suitability' })).not.toBeDisabled()
    await expect(page.locator('.breadcrumb', { hasText: 'Dairy > Cheese > Low-acid soft pasteurised cheese' })).toBeVisible()
    await expect(page.getByText('OK to eat').first()).toBeVisible()
    await expect(page.getByText('Only with conditions').first()).toBeVisible()
    await expect(page.getByText('Not assessed').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page.getByRole('checkbox', { name: 'Not assessed' })).toHaveCount(0)

    const cheddarCard = foodCard(page, 'Cheddar')
    await expect(cheddarCard.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(cheddarCard.getByRole('heading', { name: 'Vegetarian suitability' })).toBeVisible()
    await expect(cheddarCard.getByRole('link', { name: /Primary source/ })).toHaveCount(0)
  })

  test('lands with top-level groups collapsed and a much shorter page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Dairy, level 1' })).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('button', { name: 'Cheese, level 2' })).toHaveCount(0)
    await expect(page.getByText('261 results in the guide')).toBeVisible()

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

    const pasteurisedGroup = page.locator('.preparation-group', { hasText: 'Pasteurised' })
    await expect(pasteurisedGroup.getByRole('link', { name: 'Yoghurt guidance', exact: true }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cheddar' })).not.toBeVisible()
    // Soy yoghurt's "soy yogurt" alias also matches this search term, alongside the Yoghurt category.
    await expect(page.getByRole('link', { name: 'Soy yoghurt' })).toBeVisible()
    await expect(page.getByText('2 results in the guide')).toBeVisible()
    await expect(page).toHaveURL(/q=yogurt/)
  })

  test('accepts a multi-word query through sequential typing', async ({ page }) => {
    await page.goto('/')

    const search = page.getByRole('searchbox', { name: 'Search foods' })
    await search.pressSequentially('farmed salmon', { delay: 25 })

    await expect(search).toHaveValue('farmed salmon')
    await expect(page).toHaveURL(/q=farmed(?:%20|\+)salmon/)
    await expect(page.getByText('3 results in the guide')).toBeVisible()
    await expect(foodCard(page, 'Farmed salmon').first()).toBeVisible()
  })

  test('reaches a migrated alias of a retired food on its merged category entry', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=poached%20eggs')

    await expect(page.getByText('2 results in the guide')).toBeVisible()
    const cookedEggsGroup = page.locator('.category-group', { hasText: 'Eggs' })
      .locator('.preparation-group', { hasText: 'Cooked' })
    await expect(cookedEggsGroup.getByRole('link', { name: 'Eggs guidance', exact: true })).toBeVisible()
    await expect(cookedEggsGroup.getByText('Only with conditions').first()).toBeVisible()
  })

  test('reaches a raw-egg food surfaced in its own category from a cold start', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('searchbox', { name: 'Search foods' }).fill('dressings containing mayonnaise')

    const homeMadeMayonnaise = page.locator('.preparation-group', { hasText: 'Home-made' })
      .locator('.food-card', { has: page.getByRole('link', { name: 'Mayonnaise', exact: true }) })
    await expect(homeMadeMayonnaise).toBeVisible()
    await expect(homeMadeMayonnaise.getByText('Avoid')).toBeVisible()
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
    await expect(page.getByRole('link', { name: 'Yoghurt guidance', exact: true }).first()).toBeVisible()
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
    await expect(page.getByRole('button', { name: 'Outcome: Maybe - see notes' })).toBeVisible()
    await expect(page.getByText('2 results in the guide')).toBeVisible()

    // Each selected scope gets its own callout on the band, so the two lists are never blended.
    const yoghurtBand = page.locator('.preparation-group', { hasText: 'Pasteurised' })
    const pregnancy = yoghurtBand.getByRole('complementary', { name: 'Pasteurised guidance for Yoghurt' }).first()
    const vegetarian = yoghurtBand.getByRole('complementary', { name: 'Pasteurised guidance for Yoghurt' }).nth(1)
    await expect(pregnancy).toContainText('Pregnancy food safety')
    await expect(pregnancy).toContainText('Only with conditions')
    await expect(vegetarian).toContainText('Vegetarian suitability')
    await expect(vegetarian).toContainText('Check ingredients')
    await expect(yoghurtBand.getByRole('link', { name: 'Yoghurt guidance', exact: true }).first()).toBeVisible()
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
    await expect(page.getByText('261 results in the guide')).toBeVisible()
    await expect(page.locator('details')).not.toHaveAttribute('open', '')

    await page.getByText('Filters', { exact: true }).click()
    await page.getByRole('combobox', { name: 'Category' }).selectOption('dairy')

    await expect(page.getByRole('button', { name: 'Category: Dairy' })).toBeVisible()
    await expect(page).toHaveURL(/category=dairy/)
  })

  test('shows source-backed conditions on a retired record’s new category-detail route', async ({ page }) => {
    await page.goto('/category/eggs?v=1&scope=pregnancy-food-safety&prep=cooked&q=eggs&category=eggs')

    await expect(page.getByRole('heading', { name: 'Eggs' })).toBeVisible()
    const cooked = page.locator('.preparation-section', { hasText: 'Cooked' })
    await expect(cooked.getByRole('heading', { name: 'Pregnancy food safety' })).toBeVisible()
    await expect(cooked.getByText('Only with conditions')).toBeVisible()
    await expect(cooked.getByText('Ensure yolks and scrambled eggs are firm.')).toBeVisible()
    await expect(cooked.getByRole('link', { name: 'New Zealand Food Safety: Pullout guide to food safety in pregnancy' })).toHaveAttribute(
      'href',
      mpiSourceUrl,
    )
    await expect(cooked.getByText('Eggs: Cooked eggs')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Back to the food guide' })).toHaveAttribute(
      'href',
      '/?v=1&scope=pregnancy-food-safety&q=eggs&category=eggs',
    )
    await expect(page.getByLabel('Medical information disclaimer')).toContainText('general information, not medical advice')
  })

  test('shows independently resolved selected scopes on a direct category-detail route', async ({ page }) => {
    await page.goto('/category/yoghurt?v=1&scope=pregnancy-food-safety,vegetarian-suitability&outcome=maybe&prep=pasteurised&q=yogurt&category=dairy')

    await expect(page.getByRole('heading', { name: 'Yoghurt' })).toBeVisible()

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
    await expect(vegetarianGuidance.getByText('Reflects general vegetarian knowledge reviewed by maintainers.')).toBeVisible()
    await expect(vegetarianGuidance.getByRole('heading', { name: 'Sources' })).toHaveCount(0)

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

  test('finds maintainer-reviewed vegetarian additions and explains the hidden ingredient', async ({ page }) => {
    await page.goto('/?v=1&scope=vegetarian-suitability&q=fresh+filled+pasta')

    const pastaCard = foodCard(page, 'Fresh filled pasta')
    await expect(pastaCard).toBeVisible()
    await expect(pastaCard.getByText('Check ingredients')).toBeVisible()
    await expect(pastaCard).toContainText(
      'Fresh filled pasta can contain cheese made with animal-derived rennet, so check the ingredients.',
    )

    await pastaCard.getByRole('link', { name: 'Fresh filled pasta' }).click()

    await expect(page.getByRole('heading', { name: 'Why this guidance applies' })).toBeVisible()
    await expect(page.getByText('Can contain cheese made with animal-derived rennet.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Animal-derived rennet' })).toHaveAttribute(
      'href',
      '/food/animal-derived-rennet?v=1&scope=vegetarian-suitability&q=fresh+filled+pasta',
    )
  })

  test('shows the generic soups stock warning on the soups guide entry', async ({ page }) => {
    await page.goto('/category/soups?v=1&scope=vegetarian-suitability')

    await expect(page.getByText(
      'Soups can be made with meat or fish stock, so check the stock used.',
    )).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Soups' })).toBeVisible()
    await expect(page).toHaveURL('/category/soups?v=1&scope=vegetarian-suitability')
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
    await expect(page.getByRole('link', { name: 'Yoghurt guidance', exact: true }).first()).toBeVisible()
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('drops the retired outside-coverage outcome from a shared URL and announces the removal', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&outcome=outside-coverage')

    await expect(page.getByRole('status')).toContainText('Unavailable shared filters were removed.')
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page).toHaveURL(/scope=pregnancy-food-safety/)
  })

  test('shows a food with no reviewed rule as a single not-assessed state with the guide notice', async ({ page }) => {
    await page.goto('/food/pies-and-other-pastries?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Pies and Other Pastries' })).toBeVisible()
    await expect(page.getByText('Not assessed')).toBeVisible()
    await expect(page.getByText('This item has not been added to this guide yet, so it has not been assessed.').first()).toBeVisible()
    await expect(page.getByText('Outside current coverage')).toHaveCount(0)
    await expect(page.getByLabel('Medical information disclaimer')).toBeVisible()
  })

  test('shows both accumulated instructions with their own locators on a food detail route', async ({ page }) => {
    await page.goto('/food/bluff-and-pacific-oysters?v=1&scope=pregnancy-food-safety')

    await expect(page.getByRole('heading', { name: 'Bluff and Pacific oysters' })).toBeVisible()
    const cooked = page.getByLabel('Cooked', { exact: true })
    await expect(cooked.getByRole('heading', { name: 'All of the following apply' })).toBeVisible()
    await expect(cooked.getByText('Cook above 75°C throughout.')).toBeVisible()
    await expect(cooked.getByText('Have no more than one serving per month.')).toBeVisible()
    await expect(cooked.getByText('Seafood: Freshly cooked fish, mussels, oysters, crayfish, scallops, etc')).toBeVisible()
    await expect(cooked.getByText('Seafood footnote: Bluff and Pacific oysters and queen scallops')).toBeVisible()
    await expect(cooked.getByText('Only with conditions').first()).toBeVisible()
  })

  test('browses into a preparation grouping and opens a food from it', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=farmed%20salmon')

    const smokedGroup = page.locator('.preparation-group', { hasText: 'Smoked' })
    await smokedGroup.getByRole('link', { name: 'Farmed salmon', exact: true }).click()

    await expect(page).toHaveURL(/prep=smoked/)
    await expect(page.getByRole('heading', { name: 'Farmed salmon' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Smoked/ })).toContainText('the preparation you were looking at')
  })

  test('collapses preparation bands by default and expands one while browsing', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety')

    await page.getByRole('button', { name: 'Seafood, level 1' }).click()
    const fishGroup = page.locator('section[aria-labelledby="category-fish"]')
    const smokedToggle = fishGroup.getByRole('button', { name: /^Smoked Fish,.*\d+ entries$/ })

    await expect(smokedToggle).toHaveAttribute('aria-expanded', 'false')
    await expect(fishGroup.getByRole('link', { name: 'Farmed salmon', exact: true })).toHaveCount(0)

    await smokedToggle.click()

    await expect(smokedToggle).toHaveAttribute('aria-expanded', 'true')
    await expect(fishGroup.getByRole('link', { name: 'Farmed salmon', exact: true })).toBeVisible()
  })

  test('loads a preparation-scoped food URL directly and keeps every declared state readable', async ({ page }) => {
    await page.goto('/food/farmed-salmon?v=1&scope=pregnancy-food-safety&prep=raw')

    await expect(page.getByRole('heading', { name: /^Raw/ })).toContainText('the preparation you were looking at')
    await expect(page.getByRole('heading', { name: 'Smoked', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cooked', exact: true })).toBeVisible()
    await expect(page.getByRole('region', { name: /^Raw/ }).getByText('Avoid')).toBeVisible()
    await expect(page.getByLabel('Cooked', { exact: true }).getByText('Only with conditions').first()).toBeVisible()
  })

  test('shows only the matching preparation rows for a preparation-varying food on a filtered URL', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=farmed%20salmon&outcome=not-okay')

    await expect(page.locator('.preparation-group', { hasText: 'Raw' })
      .getByRole('link', { name: 'Farmed salmon', exact: true })).toBeVisible()
    await expect(page.locator('.preparation-group', { hasText: 'Cooked' })
      .getByRole('link', { name: 'Farmed salmon', exact: true })).toHaveCount(0)
  })

  // The heading level of a food name changes with how deeply its row is nested, so it must be styled
  // by its role rather than its tag. Nothing else in the suite would notice it shrinking.
  test('keeps one readable type ladder whether or not a row sits in a preparation band', async ({ page }) => {
    const sizeOf = (locator: ReturnType<Page['locator']>) =>
      locator.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))

    await page.goto('/?v=1&scope=pregnancy-food-safety&q=skipjack')
    const banded = await sizeOf(page.locator('.preparation-group .food-card-header > :is(h4, h5)'))
    const categoryHeading = await sizeOf(page.locator('.category-group > h3'))
    const band = await sizeOf(page.locator('.preparation-header > h4'))

    await page.goto('/?v=1&scope=pregnancy-food-safety&q=cheddar')
    const unbanded = await sizeOf(page.locator('.food-card-header > :is(h4, h5)'))

    expect(banded).toBe(unbanded)
    expect(banded).toBeGreaterThan(16)
    expect(categoryHeading).toBeGreaterThan(banded)
    expect(band).toBeLessThan(banded)
  })

  test('shrinks each nested guidance heading rather than growing it', async ({ page }) => {
    await page.goto('/food/farmed-salmon?v=1&scope=pregnancy-food-safety&prep=smoked')

    const sizes = await page.locator('.preparation-section .guidance-summary').first().evaluate((section) =>
      [...section.querySelectorAll('h3, h4, h5, h6')].map((heading) => ({
        depth: (() => {
          let depth = 0
          for (let node = heading.parentElement; node && node !== section; node = node.parentElement) depth += 1
          return depth
        })(),
        size: Number.parseFloat(getComputedStyle(heading).fontSize),
      })),
    )

    for (const outer of sizes) {
      for (const inner of sizes) {
        if (inner.depth > outer.depth) {
          expect(inner.size, `a heading nested deeper must not be larger`).toBeLessThanOrEqual(outer.size)
        }
      }
    }
  })

  test('shows a species mercury limit alongside its group rule on a catalogue card', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=striped%20marlin')

    const cooked = page.locator('.preparation-group', { hasText: 'Cooked' })
    const callout = cooked.getByRole('complementary', { name: 'Cooked guidance for Fish' })
    await expect(callout).toContainText('Cook seafood thoroughly and eat it while hot.')
    await expect(callout).toContainText('Applies to all freshly cooked fish, mussels, oysters, crayfish and scallops.')

    const card = cooked.locator('.food-card', { has: page.getByRole('link', { name: 'Striped marlin', exact: true }) })
    await expect(card).toContainText('Limit this species to one serving every one or two weeks.')
    await expect(card).toContainText('Specific to this food')
    await expect(card).toContainText('Cook seafood thoroughly and eat it while hot.')
  })

  test('shows a safe food-not-found route', async ({ page }) => {    await page.goto('/food/removed-food?v=1&scope=pregnancy-food-safety')

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

// ADR: Resolve guidance conservatively without inference.
// See: docs/decisions/2026-09-21 ADR - resolve guidance conservatively without inference.md
test.describe('Collapsed-row summary chips', () => {
  test('summarises a collapsed group and drops the chip once it is opened', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety')

    await page.getByRole('button', { name: /^Dairy, level 1/ }).click()
    const hardCheese = page.getByRole('button', { name: /^Hard cheese, level \d+/ })
    await hardCheese.click()

    await expect(hardCheese.locator('.aggregate-chip')).toHaveText(/OK/)
    await expect(hardCheese).toHaveAttribute('aria-label', /all okay/)

    await hardCheese.click()

    await expect(hardCheese.locator('.aggregate-chip')).toHaveCount(0)
  })

  test('summarises a group holding one dissenting food as mixed', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety')

    await page.getByRole('button', { name: /^Breads and cereals, level 1/ }).click()
    const cereals = page.getByRole('button', { name: /^Cereals, level \d+/ })
    await cereals.click()

    await expect(cereals.locator('.aggregate-chip')).toHaveText(/Maybe/)

    await cereals.click()

    await expect(page.getByRole('link', { name: 'Fresh filled pasta' })).toBeVisible()
  })

  test('shows no chip while a search is active, so none summarises a filtered subset', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety&q=rice')

    // "rice" is a substring of "licorice", so the tea now matches this search too; the assertion
    // names the exact link it means rather than relying on the query returning a single food.
    await expect(page.getByRole('link', { name: 'Rice', exact: true })).toBeVisible()
    await expect(page.locator('.aggregate-chip')).toHaveCount(0)
  })

  test('keeps collapse state and chips when a second dietary scope is selected', async ({ page }) => {
    await page.goto('/?v=1&scope=pregnancy-food-safety,vegetarian-suitability')

    await page.getByRole('button', { name: /^Dairy, level 1/ }).click()
    const hardCheese = page.getByRole('button', { name: /^Hard cheese, level \d+/ })
    await hardCheese.click()

    // Uniformly okay under pregnancy alone, but Parmesan carries a vegetarian animal-derived
    // override its siblings do not, so the two scopes together read as mixed.
    await expect(hardCheese.locator('.aggregate-chip')).toHaveText(/Maybe/)
  })
})

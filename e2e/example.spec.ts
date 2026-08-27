import { expect, test } from '@playwright/test'

test('app loads and renders the counter', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /count is/i })).toBeVisible()
})

import { expect, test } from '@playwright/test';

test('user can open my garden and go to gardens', async ({ page }) => {
  await page.goto('/my-garden');

  await expect(page.getByRole('heading', { name: 'My Garden', level: 1 })).toBeVisible();

  await page.getByRole('link', { name: 'Gardens' }).click();

  await expect(page).toHaveURL(/\/gardens$/);
  await expect(page.getByRole('heading', { name: 'Gardens', level: 1 })).toBeVisible();
});

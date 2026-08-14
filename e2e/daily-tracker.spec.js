const { test, expect } = require('@playwright/test');

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('creates then updates today’s daily entry and shows both states in the last-N list', async ({ page }) => {
  const today = todayIsoDate();
  const createdNotes = `E2E morning ${Date.now()}`;
  const updatedNotes = `E2E evening ${Date.now()}`;

  await page.goto('/');

  await page.locator('#nav-daily-tracker').click();
  await expect(page.locator('#daily-tracker-view')).toBeVisible();
  await expect(page.locator('#bootstrap-view')).toBeHidden();
  await expect(page.locator('#nutrition-routine-view')).toBeHidden();

  await page.locator('#daily-tracker-date').fill(today);
  await page.locator('#daily-tracker-user-id').fill('1');
  await page.locator('#daily-entry-notes').fill(createdNotes);
  await page.locator('#daily-entry-mood').selectOption('good');
  await page.locator('#daily-entry-energy').selectOption('4');
  await page.locator('#daily-entry-completed').check();
  await page.locator('#daily-entry-form').locator('button[type="submit"]').click();

  await expect(page.locator('#daily-entry-list')).toContainText(createdNotes);
  await expect(page.locator('#daily-entry-list')).toContainText(today);
  await expect(page.locator('#daily-entry-edit-id')).toHaveValue(/\d+/);
  await expect(page.locator('#daily-entry-notes')).toHaveValue(createdNotes);

  await page.locator('#daily-entry-notes').fill(updatedNotes);
  await page.locator('#daily-entry-mood').selectOption('great');
  await page.locator('#daily-entry-energy').selectOption('5');
  await page.locator('#daily-entry-form').locator('button[type="submit"]').click();

  await expect(page.locator('#daily-entry-list')).toContainText(updatedNotes);
  await expect(page.locator('#daily-entry-list')).toContainText('mood great');
  await expect(page.locator('#daily-entry-list')).not.toContainText(createdNotes);
});

const { test, expect } = require('@playwright/test');

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('creates one Nutrition and one Routine entry for today and shows them in the daily view', async ({ page }) => {
  const today = todayIsoDate();
  const mealDescription = `E2E oatmeal ${Date.now()}`;
  const steps = 9123;

  await page.goto('/');

  await page.locator('#nav-nutrition-routine').click();
  await expect(page.locator('#nutrition-routine-view')).toBeVisible();

  await page.locator('#nutrition-routine-date').fill(today);
  await page.locator('#nutrition-routine-user-id').fill('1');

  await page.locator('#mealType').selectOption('Breakfast');
  await page.locator('#description').fill(mealDescription);
  await page.locator('#calories').fill('350');
  await page.locator('#nutrition-form').locator('button[type="submit"]').click();

  await expect(page.locator('#nutrition-daily-list')).toContainText(mealDescription);

  await page.locator('#sleepHours').fill('7.5');
  await page.locator('#waterIntake').fill('2000');
  await page.locator('#steps').fill(String(steps));
  await page.locator('#routine-form').locator('button[type="submit"]').click();

  await expect(page.locator('#routine-daily-list')).toContainText(String(steps));
  await expect(page.locator('#nutrition-daily-list')).toContainText(mealDescription);
});

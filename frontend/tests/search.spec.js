import { test, expect } from '@playwright/test';

test.describe('Google Books Search', () => {
  const getUniqueUser = () => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      name: 'Search Tester',
      email: `search_${id}@example.com`,
      password: 'Password123!',
    };
  };

  test('Search Harry Potter and verify results display', async ({ page }) => {
    const user = getUniqueUser();
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/search');
    await page.fill('.search-input', 'Harry Potter');
    await page.click('.search-submit-btn');

    await expect(page.locator('.results-count-bar')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.book-card')).toHaveCount(20);
  });

  test('Search empty query is blocked', async ({ page }) => {
    const user = getUniqueUser();
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/search');
    await expect(page.locator('.search-submit-btn')).toBeDisabled();
  });
});

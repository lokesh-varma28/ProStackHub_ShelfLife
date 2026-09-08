import { test, expect } from '@playwright/test';

test.describe('Add to Shelf & Duplicate Handling', () => {
  const getUniqueUser = () => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      name: 'Shelf Tester',
      email: `shelf_${id}@example.com`,
      password: 'Password123!',
    };
  };

  test('Add book to shelf and verify duplicate handling', async ({ page }) => {
    const user = getUniqueUser();
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/search');
    await page.fill('.search-input', 'Design Patterns');
    await page.click('.search-submit-btn');

    await expect(page.locator('.results-count-bar')).toBeVisible({ timeout: 15000 });

    // Click Add to Shelf on first book
    const firstAddBtn = page.locator('.book-card').first().locator('button');
    await firstAddBtn.click();

    // Verify UI changes to Added to Shelf
    await expect(page.locator('.btn-added').first()).toBeVisible();

    // Navigate to Dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.shelf-count-tag')).toContainText('1 book');
  });
});

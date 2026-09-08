import { test, expect } from '@playwright/test';

test.describe('Security & User Isolation', () => {
  const getUniqueUser = (prefix) => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      name: `${prefix} User`,
      email: `${prefix.toLowerCase()}_${id}@example.com`,
      password: 'Password123!',
    };
  };

  test('User B cannot see or access User A books', async ({ page }) => {
    const userA = getUniqueUser('UserA');
    const userB = getUniqueUser('UserB');

    // 1. Register User A and add book
    await page.goto('/register');
    await page.fill('#name', userA.name);
    await page.fill('#email', userA.email);
    await page.fill('#password', userA.password);
    await page.fill('#confirmPassword', userA.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/search');
    await page.fill('.search-input', 'Refactoring');
    await page.click('.search-submit-btn');
    await expect(page.locator('.results-count-bar')).toBeVisible({ timeout: 15000 });
    await page.locator('.book-card').first().locator('button').click();
    await expect(page.locator('.btn-added').first()).toBeVisible();

    await page.goto('/dashboard');
    const userABookHref = await page.locator('.book-card-link').first().getAttribute('href');

    // Logout User A
    await page.click('.logout-banner-btn');
    await expect(page).toHaveURL(/\/login/);

    // 2. Register User B
    await page.goto('/register');
    await page.fill('#name', userB.name);
    await page.fill('#email', userB.email);
    await page.fill('#password', userB.password);
    await page.fill('#confirmPassword', userB.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // User B dashboard should be empty
    await expect(page.locator('.shelf-count-tag')).toContainText('0 books');

    // User B attempts direct URL access to User A book
    await page.goto(userABookHref);
    await expect(page.locator('.empty-results')).toContainText('Book Not Found');
  });
});

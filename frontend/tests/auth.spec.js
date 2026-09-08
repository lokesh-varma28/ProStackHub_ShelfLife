import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const getUniqueUser = () => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      name: 'Auth User',
      email: `auth_${id}@example.com`,
      password: 'Password123!',
    };
  };

  test('Protected route redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/search');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/books/sampleid');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Register new user and navigate to dashboard', async ({ page }) => {
    const user = getUniqueUser();
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.welcome-title')).toContainText(user.name);
  });

  test('Login existing user and logout', async ({ page }) => {
    const user = getUniqueUser();
    // 1. Register first
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Logout
    await page.click('.logout-banner-btn');
    await expect(page).toHaveURL(/\/login/);

    // 3. Login again
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

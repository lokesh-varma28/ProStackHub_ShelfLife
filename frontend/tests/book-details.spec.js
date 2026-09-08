import { test, expect } from '@playwright/test';

test.describe('Book Details & Reading Management', () => {
  const getUniqueUser = () => {
    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    return {
      name: 'Details Tester',
      email: `details_${id}@example.com`,
      password: 'Password123!',
    };
  };

  test('Update reading status, progress, rating, review, and delete book', async ({ page }) => {
    const user = getUniqueUser();
    await page.goto('/register');
    await page.fill('#name', user.name);
    await page.fill('#email', user.email);
    await page.fill('#password', user.password);
    await page.fill('#confirmPassword', user.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Search and Add Book
    await page.goto('/search');
    await page.fill('.search-input', 'Clean Code');
    await page.click('.search-submit-btn');
    await expect(page.locator('.results-count-bar')).toBeVisible({ timeout: 15000 });

    await page.locator('.book-card').first().locator('button').click();
    await expect(page.locator('.btn-added').first()).toBeVisible();

    // Go to Dashboard and open book
    await page.goto('/dashboard');
    await page.locator('.book-card-link').first().click();
    await expect(page).toHaveURL(/\/books\//);

    // Verify Book Details loaded
    await expect(page.locator('.details-title')).toBeVisible();

    // Change status to Reading
    await page.click('button:has-text("Reading")');
    await expect(page.locator('.alert-success')).toContainText('Status updated');

    // Update progress
    await page.fill('#currentPageInput', '50');
    await page.click('.update-page-btn');
    await expect(page.locator('.alert-success')).toContainText('Reading progress updated');

    // Rating
    await page.locator('.star-btn').nth(4).click(); // 5 stars
    await expect(page.locator('.alert-success')).toContainText('Rated 5 stars');

    // Review
    await page.fill('.review-textarea', 'Excellent book on software quality.');
    await page.click('button:has-text("Save Review")');
    await expect(page.locator('.alert-success')).toContainText('Review saved');

    // Delete
    await page.click('button:has-text("Delete from Shelf")');
    await expect(page.locator('.modal-content')).toBeVisible();
    await page.click('button:has-text("Yes, Delete")');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('.shelf-count-tag')).toContainText('0 books');
  });
});

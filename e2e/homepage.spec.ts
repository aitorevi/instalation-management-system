import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display setup complete message', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /IMS Setup Complete/i })).toBeVisible();

    await expect(page.getByText(/Phase 01 - Project initialization successful/i)).toBeVisible();
  });

  test('should have a link to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /Go to Login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/auth/login');
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/IMS - Setup Complete/i);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /IMS Setup Complete/i })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('User Info Display', () => {
  test.skip('admin dashboard displays user full name and role', async ({ page }) => {
    await page.goto('/admin');

    const userName = page.locator('text=/Admin User/i').first();
    const userRole = page.locator('text=/admin/i').first();

    await expect(userName).toBeVisible();
    await expect(userRole).toBeVisible();
  });

  test.skip('installer dashboard displays user full name and role', async ({ page }) => {
    await page.goto('/installer');

    const userName = page.locator('text=/Installer User/i').first();
    const userRole = page.locator('text=/installer/i').first();

    await expect(userName).toBeVisible();
    await expect(userRole).toBeVisible();
  });

  test.skip('admin dashboard displays user initials avatar', async ({ page }) => {
    await page.goto('/admin');

    const avatar = page.locator('[class*="rounded-full"]').first();
    await expect(avatar).toBeVisible();
  });

  test.skip('installer dashboard displays user initials avatar', async ({ page }) => {
    await page.goto('/installer');

    const avatar = page.locator('[class*="rounded-full"]').first();
    await expect(avatar).toBeVisible();
  });

  test.skip('admin dashboard has working logout link', async ({ page }) => {
    await page.goto('/admin');

    const logoutLink = page.locator('a[href="/auth/logout"]');
    await expect(logoutLink).toBeVisible();

    await logoutLink.click();
    await page.waitForURL(/\/login/);
  });

  test.skip('installer dashboard has working logout link', async ({ page }) => {
    await page.goto('/installer');

    const logoutLink = page.locator('a[href="/auth/logout"]');
    await expect(logoutLink).toBeVisible();

    await logoutLink.click();
    await page.waitForURL(/\/login/);
  });

  test.skip('user info is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin');

    const avatar = page.locator('[class*="rounded-full"]').first();
    await expect(avatar).toBeVisible();

    const logoutLink = page.locator('a[href="/auth/logout"]');
    await expect(logoutLink).toBeVisible();
  });

  test.skip('user info is responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/admin');

    const userName = page.locator('text=/Admin User/i').first();
    const userRole = page.locator('text=/admin/i').first();
    const avatar = page.locator('[class*="rounded-full"]').first();

    await expect(userName).toBeVisible();
    await expect(userRole).toBeVisible();
    await expect(avatar).toBeVisible();
  });
});

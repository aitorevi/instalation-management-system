import { test, expect } from '@playwright/test';

test.describe('Login Page Error Messages', () => {
  test('session expired message displays correctly', async ({ page }) => {
    await page.goto('/login?reason=session-expired');

    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Tu sesión ha expirado');
  });

  test('unauthorized reason message displays correctly', async ({ page }) => {
    await page.goto('/login?reason=unauthorized');

    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Debes iniciar sesión');
  });

  test('unauthorized error displays correctly', async ({ page }) => {
    await page.goto('/login?error=unauthorized');

    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('No tienes autorización');
  });

  test('invalid session error displays correctly', async ({ page }) => {
    await page.goto('/login?error=invalid_session');

    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Tu sesión es inválida');
  });

  test('access denied error displays correctly', async ({ page }) => {
    await page.goto('/login?error=access_denied');

    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Acceso denegado');
  });

  test('error banner has red styling for errors', async ({ page }) => {
    await page.goto('/login?error=unauthorized');

    const banner = page.locator('[role="alert"]');
    await expect(banner).toHaveClass(/bg-red-50/);
  });

  test('warning banner has yellow styling for warnings', async ({ page }) => {
    await page.goto('/login?reason=session-expired');

    const banner = page.locator('[role="status"]');
    await expect(banner).toHaveClass(/bg-yellow-50/);
  });

  test('info banner has blue styling for info messages', async ({ page }) => {
    await page.goto('/login?reason=unauthorized');

    const banner = page.locator('[role="status"]');
    await expect(banner).toHaveClass(/bg-blue-50/);
  });

  test('error messages are accessible with proper ARIA roles', async ({ page }) => {
    await page.goto('/login?error=unauthorized');

    const errorBanner = page.locator('[role="alert"]');
    await expect(errorBanner).toBeVisible();

    await page.goto('/login?reason=session-expired');

    const statusBanner = page.locator('[role="status"]');
    await expect(statusBanner).toBeVisible();
  });

  test('login page without errors does not display banner', async ({ page }) => {
    await page.goto('/login');

    const banner = page.locator('[role="alert"], [role="status"]');
    await expect(banner).not.toBeVisible();
  });

  test('error banners are responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login?error=unauthorized');

    const banner = page.locator('[role="alert"]');
    await expect(banner).toBeVisible();
  });

  test('error banners are responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login?reason=session-expired');

    const banner = page.locator('[role="status"]');
    await expect(banner).toBeVisible();
  });
});

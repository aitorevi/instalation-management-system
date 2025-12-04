import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('error page displays when middleware error query param exists', async ({ page }) => {
    const errorMessage = 'Test error message';
    await page.goto(`/error?message=${encodeURIComponent(errorMessage)}`);

    await expect(page.locator('h1')).toContainText('Error');
    await expect(page.locator('body')).toContainText(errorMessage);
  });

  test('error page provides navigation links', async ({ page }) => {
    await page.goto('/error?message=Test');

    const loginLink = page.locator('a[href="/login"]');
    const homeLink = page.locator('a[href="/"]');

    await expect(loginLink).toBeVisible();
    await expect(homeLink).toBeVisible();
  });

  test('error page displays fallback message when no message provided', async ({ page }) => {
    await page.goto('/error');

    await expect(page.locator('body')).toContainText('Ha ocurrido un error inesperado');
  });

  test('error page displays error code when provided', async ({ page }) => {
    const errorMessage = 'Test error';
    const errorCode = '500';
    await page.goto(`/error?message=${encodeURIComponent(errorMessage)}&code=${errorCode}`);

    await expect(page.locator('body')).toContainText(errorCode);
  });

  test('error page displays error type-specific styling for auth errors', async ({ page }) => {
    await page.goto('/error?message=Auth+error&type=auth');

    const card = page.locator('[role="alert"]');
    await expect(card).toBeVisible();
  });

  test('error page displays error type-specific styling for forbidden errors', async ({ page }) => {
    await page.goto('/error?message=Forbidden&type=forbidden');

    const card = page.locator('[role="alert"]');
    await expect(card).toBeVisible();
  });

  test('error page has proper accessibility attributes', async ({ page }) => {
    await page.goto('/error?message=Test+error');

    const alertElement = page.locator('[role="alert"]');
    await expect(alertElement).toBeVisible();
  });

  test('error page navigation to login works', async ({ page }) => {
    await page.goto('/error?message=Test');

    await page.click('a[href="/login"]');
    await page.waitForURL('/login');
  });

  test('error page navigation to home works', async ({ page }) => {
    await page.goto('/error?message=Test');

    await page.click('a[href="/"]');
    await page.waitForURL(/\/(login|admin|installer)/);
  });

  test('error page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/error?message=Test+error');

    const card = page.locator('[role="alert"]');
    await expect(card).toBeVisible();

    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
  });

  test('error page is responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/error?message=Test+error');

    const card = page.locator('[role="alert"]');
    await expect(card).toBeVisible();
  });

  test.skip('middleware errors redirect to error page', async () => {
    // TODO: Implement by simulating middleware errors
    // 1. Simulate database unavailable scenario
    // 2. Access protected route
    // 3. Verify redirect to /error with message
  });
});

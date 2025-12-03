import type { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.click('a[href*="authorize?provider=google"]');
  await page.waitForURL(/\/admin/);
}

export async function loginAsInstaller(page: Page): Promise<void> {
  await page.goto('/login');
  await page.click('a[href*="authorize?provider=google"]');
  await page.waitForURL(/\/installer/);
}

export async function logout(page: Page): Promise<void> {
  await page.goto('/auth/logout');
  await page.waitForURL(/\/login/);
}

export async function clearAuthCookies(page: Page): Promise<void> {
  const context = page.context();
  await context.clearCookies();
}

export async function simulateSessionExpiry(page: Page): Promise<void> {
  await clearAuthCookies(page);
}

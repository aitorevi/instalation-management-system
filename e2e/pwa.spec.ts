import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should register service worker on page load', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  test('should load web app manifest', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const manifestLink = await page.locator('link[rel="manifest"]');
    expect(await manifestLink.getAttribute('href')).toBe('/manifest.json');

    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifestData = await response?.json();
    expect(manifestData.name).toBe('IMS - Installation Management System');
    expect(manifestData.short_name).toBe('IMS');
    expect(manifestData.theme_color).toBe('#2563eb');
  });

  test('should show offline page when network unavailable', async ({ page, context }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await context.setOffline(true);

    const response = await page.goto('/offline.html', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(page.locator('h1')).toHaveText('Sin conexión');
    await expect(page.locator('button')).toHaveText('Reintentar');

    await context.setOffline(false);
  });

  test('should load all PWA icons', async ({ page }) => {
    const icons = ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

    for (const icon of icons) {
      const response = await page.goto(icon);
      expect(response?.status()).toBe(200);

      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('image/png');
    }
  });

  test('should cache static assets on install', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      return navigator.serviceWorker.ready;
    });

    const cacheNames = await page.evaluate(async () => {
      return await caches.keys();
    });

    expect(cacheNames).toContain('ims-cache-v1');

    const cachedUrls = await page.evaluate(async () => {
      const cache = await caches.open('ims-cache-v1');
      const requests = await cache.keys();
      return requests.map((req) => new URL(req.url).pathname);
    });

    expect(cachedUrls).toContain('/manifest.json');
    expect(cachedUrls).toContain('/favicon.svg');
    expect(cachedUrls).toContain('/icons/icon-192.png');
    expect(cachedUrls).toContain('/icons/icon-512.png');
    expect(cachedUrls).toContain('/offline.html');
  });
});

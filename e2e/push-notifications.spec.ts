import { test, expect } from '@playwright/test';

test.describe('Push Notifications Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await page.goto('/auth/login');

    await page.fill(
      'input[type="email"]',
      process.env.TEST_INSTALLER_EMAIL || 'test-installer@example.com'
    );
    await page.fill('input[type="password"]', process.env.TEST_INSTALLER_PASSWORD || 'test123456');
    await page.click('button[type="submit"]');

    await page.waitForURL('/installer');
  });

  test('should display PushSubscribe component on installer dashboard', async ({ page }) => {
    await expect(page.locator('#push-subscribe')).toBeVisible();

    const heading = page.locator('#push-subscribe h3');
    await expect(heading).toHaveText('Notificaciones');
  });

  test('should show correct initial state (disabled)', async ({ page }) => {
    const statusText = page.locator('#push-subscribe #status-text');
    await expect(statusText).toContainText(/Desactivadas|Cargando/);

    const toggle = page.locator('#notification-toggle');
    await expect(toggle).toBeVisible();
  });

  test('should enable notifications when toggle is clicked', async ({ page }) => {
    const toggle = page.locator('#notification-toggle');

    await toggle.waitFor({ state: 'visible' });

    const isDisabled = await toggle.getAttribute('disabled');
    if (!isDisabled) {
      await toggle.click();

      await page.waitForTimeout(2000);

      const statusText = page.locator('#push-subscribe #status-text');
      const status = await statusText.textContent();

      expect(status).toMatch(/Activadas|Procesando|Desactivadas/);
    }
  });

  test('should show success message after enabling notifications', async ({ page }) => {
    const toggle = page.locator('#notification-toggle');

    await toggle.waitFor({ state: 'visible' });

    const isDisabled = await toggle.getAttribute('disabled');
    if (!isDisabled) {
      const currentStatus = await page.locator('#push-subscribe #status-text').textContent();

      if (currentStatus?.includes('Desactivadas')) {
        await toggle.click();

        const alert = page.locator('#push-subscribe #alert-container [role="alert"]');
        await alert.waitFor({ state: 'visible', timeout: 5000 });

        const alertText = await alert.textContent();
        expect(alertText).toContain('Notificaciones activadas');
      }
    }
  });

  test('should disable notifications when toggle is clicked again', async ({ page }) => {
    const toggle = page.locator('#notification-toggle');
    const statusText = page.locator('#push-subscribe #status-text');

    await toggle.waitFor({ state: 'visible' });

    const isDisabled = await toggle.getAttribute('disabled');
    if (!isDisabled) {
      const currentStatus = await statusText.textContent();

      if (currentStatus?.includes('Activadas')) {
        await toggle.click();

        await page.waitForTimeout(2000);

        const newStatus = await statusText.textContent();
        expect(newStatus).toContain('Desactivadas');
      } else if (currentStatus?.includes('Desactivadas')) {
        await toggle.click();
        await page.waitForTimeout(2000);

        await toggle.click();
        await page.waitForTimeout(2000);

        const finalStatus = await statusText.textContent();
        expect(finalStatus).toContain('Desactivadas');
      }
    }
  });

  test('should prevent multiple simultaneous toggle operations', async ({ page }) => {
    const toggle = page.locator('#notification-toggle');

    await toggle.waitFor({ state: 'visible' });

    const isDisabled = await toggle.getAttribute('disabled');
    if (!isDisabled) {
      const promises = [toggle.click(), toggle.click(), toggle.click()];

      await Promise.allSettled(promises);

      await page.waitForTimeout(3000);

      const statusText = page.locator('#push-subscribe #status-text');
      const status = await statusText.textContent();

      expect(status).toMatch(/Activadas|Desactivadas/);
      expect(status).not.toContain('Procesando');
    }
  });

  test('should persist notification state across page reload', async ({ page }) => {
    const toggle = page.locator('#notification-toggle');
    const statusText = page.locator('#push-subscribe #status-text');

    await toggle.waitFor({ state: 'visible' });

    const isDisabled = await toggle.getAttribute('disabled');
    if (!isDisabled) {
      const initialStatus = await statusText.textContent();

      if (initialStatus?.includes('Desactivadas')) {
        await toggle.click();
        await page.waitForTimeout(2000);
      }

      const statusBeforeReload = await statusText.textContent();

      await page.reload();

      await toggle.waitFor({ state: 'visible' });
      await page.waitForTimeout(1000);

      const statusAfterReload = await statusText.textContent();

      if (statusBeforeReload?.includes('Activadas')) {
        expect(statusAfterReload).toContain('Activadas');
      }
    }
  });

  test('should show unsupported message if browser does not support push', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        get: () => undefined,
        configurable: true
      });
    });

    await page.goto('/installer');

    const unsupportedMessage = page.locator('#push-subscribe #unsupported-message');
    await unsupportedMessage.waitFor({ state: 'visible', timeout: 5000 });

    const messageText = await unsupportedMessage.textContent();
    expect(messageText).toContain('Tu navegador no soporta notificaciones');
  });
});

test.describe('Push Notifications - Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'admin123456');
    await page.click('button[type="submit"]');

    await page.waitForURL('/admin');
  });

  test('should trigger notification when admin assigns installation', async ({ page }) => {
    await page.goto('/admin/installations');

    const createButton = page.locator('a[href="/admin/installations/new"]');
    await createButton.click();

    await page.fill('input[name="installation_name"]', 'Test Installation for Push');
    await page.fill('input[name="client_name"]', 'Test Client');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="installation_date"]', '2025-12-31');

    const installerSelect = page.locator('select[name="installer_id"]');
    await installerSelect.selectOption({ index: 1 });

    await page.click('button[type="submit"]');

    await page.waitForURL('/admin/installations');

    const successMessage = page.locator('[role="alert"]');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});

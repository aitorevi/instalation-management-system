import { test, expect } from '@playwright/test';

test.describe('Admin Installers - Profile Page', () => {
  test.skip('displays installer profile header with avatar and badges', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.locator('[class*="rounded-full"]').first()).toBeVisible();

    const installerBadge = page.getByText(/installer/i).first();
    await expect(installerBadge).toBeVisible();
  });

  test.skip('displays admin profile header with purple badge', async ({ page }) => {
    await page.goto('/admin/installers');
    const adminCard = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]')
      .first();
    await adminCard.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const adminBadge = page.getByText(/admin/i).first();
    await expect(adminBadge).toBeVisible();
  });

  test.skip('displays "Tú" badge when viewing own profile', async ({ page }) => {
    await page.goto('/admin/installers');
    const adminCard = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a')
      .filter({ hasText: /tú/i })
      .first();

    if (await adminCard.isVisible()) {
      await adminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      await expect(page.getByText(/tú/i).last()).toBeVisible();
    }
  });

  test.skip('displays breadcrumb navigation', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /equipo/i })).toBeVisible();
  });

  test.skip('displays profile form with populated data', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/teléfono/i)).toBeVisible();
    await expect(page.getByLabel(/detalles de la empresa/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /guardar cambios/i })).toBeVisible();
  });

  test.skip('displays phone validation hint', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByText(/formato: \+34 600 000 000/i)).toBeVisible();
  });

  test.skip('validates phone format on form submission', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const phoneInput = page.getByLabel(/teléfono/i);
    await phoneInput.fill('123456789');

    const submitButton = page.getByRole('button', { name: /guardar cambios/i });
    await submitButton.click();

    const validationMessage = await phoneInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test.skip('updates profile successfully with valid phone', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const nameInput = page.getByLabel(/nombre completo/i);
    await nameInput.fill('Test Installer Updated');

    const phoneInput = page.getByLabel(/teléfono/i);
    await phoneInput.fill('+34 600 123 456');

    const submitButton = page.getByRole('button', { name: /guardar cambios/i });
    await submitButton.click();

    await expect(page.getByText(/perfil actualizado correctamente/i)).toBeVisible();
  });

  test.skip('displays installer stats sidebar', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByText(/estadísticas/i)).toBeVisible();
    await expect(page.getByText(/total asignadas/i)).toBeVisible();
    await expect(page.getByText(/pendientes/i)).toBeVisible();
    await expect(page.getByText(/en progreso/i)).toBeVisible();
    await expect(page.getByText(/completadas/i)).toBeVisible();
  });

  test.skip('hides stats card for admin profiles', async ({ page }) => {
    await page.goto('/admin/installers');
    const adminCard = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]')
      .first();
    await adminCard.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const statsCard = page.getByText(/estadísticas/i);
    await expect(statsCard).not.toBeVisible();
  });

  test.skip('displays recent installations for installers', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const recentInstallations = page.getByText(/instalaciones recientes/i);
    if (await recentInstallations.isVisible()) {
      await expect(page.getByRole('link', { name: /ver todas/i })).toBeVisible();
    }
  });

  test.skip('displays empty state for installers with no installations', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const emptyMessage = page.getByText(/no hay instalaciones asignadas/i);
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }
  });

  test.skip('navigates to installation detail when clicking installation link', async ({
    page
  }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const installationLink = page.locator('a[href*="/admin/installations/"]').first();
    if (await installationLink.isVisible()) {
      await installationLink.click();
      await page.waitForURL(/\/admin\/installations\/[^/]+$/);
    }
  });

  test.skip('displays info sidebar with email and creation date', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByText(/información/i).first()).toBeVisible();
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/miembro desde/i)).toBeVisible();
  });
});

test.describe('Admin Installers - Responsive Design (Profile)', () => {
  test.skip('displays mobile layout (375px) with stacked sections', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByText(/información/i).first()).toBeVisible();
  });

  test.skip('displays desktop layout (1440px) with 2-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByText(/información/i).first()).toBeVisible();
  });
});

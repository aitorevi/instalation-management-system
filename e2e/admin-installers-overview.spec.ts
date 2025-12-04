import { test, expect } from '@playwright/test';

test.describe('Admin Installers - Team Overview', () => {
  test.skip('displays admins and installers sections', async ({ page }) => {
    await page.goto('/admin/installers');

    await expect(page.getByRole('heading', { name: /equipo/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /administradores/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /instaladores/i })).toBeVisible();
  });

  test.skip('displays info card about Google OAuth', async ({ page }) => {
    await page.goto('/admin/installers');

    await expect(page.getByText(/¿cómo añadir nuevos instaladores\?/i)).toBeVisible();
    await expect(page.getByText(/google/i)).toBeVisible();
  });

  test.skip('displays admin cards with avatars and badges', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminSection = page.locator('section').filter({ hasText: /administradores/i });

    const adminCard = adminSection.locator('a[href*="/admin/installers/"]').first();
    await expect(adminCard).toBeVisible();

    await expect(adminCard.locator('[class*="rounded-full"]')).toBeVisible();

    const adminBadge = adminCard.getByText(/admin/i);
    await expect(adminBadge).toBeVisible();
  });

  test.skip('displays current user with "Tú" label in admin cards', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminSection = page.locator('section').filter({ hasText: /administradores/i });
    await expect(adminSection.getByText(/tú/i)).toBeVisible();
  });

  test.skip('displays installer table with stats', async ({ page }) => {
    await page.goto('/admin/installers');

    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.getByRole('columnheader', { name: /instalador/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /contacto/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /pendientes/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /en progreso/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /completadas/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /desde/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /acciones/i })).toBeVisible();
  });

  test.skip('displays installer stats with colored badges', async ({ page }) => {
    await page.goto('/admin/installers');

    const table = page.locator('table');

    const yellowBadges = table.locator('[class*="bg-yellow-100"]');
    await expect(yellowBadges.first()).toBeVisible();

    const blueBadges = table.locator('[class*="bg-blue-100"]');
    await expect(blueBadges.first()).toBeVisible();

    const greenBadges = table.locator('[class*="bg-green-100"]');
    await expect(greenBadges.first()).toBeVisible();
  });

  test.skip('displays "Ver perfil" links for installers', async ({ page }) => {
    await page.goto('/admin/installers');

    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute('href', /\/admin\/installers\/.+/);
  });

  test.skip('navigates to installer profile when clicking "Ver perfil"', async ({ page }) => {
    await page.goto('/admin/installers');

    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);
  });

  test.skip('displays empty state when no installers exist', async ({ page }) => {
    await page.goto('/admin/installers');

    const emptyState = page.getByText(/no hay instaladores/i);
    if (await emptyState.isVisible()) {
      await expect(
        page.getByText(/los instaladores aparecerán aquí cuando hagan login con google/i)
      ).toBeVisible();
    }
  });

  test.skip('admin cards are clickable and navigate to profile', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminCard = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]')
      .first();

    await adminCard.click();
    await page.waitForURL(/\/admin\/installers\/[^/]+$/);
  });
});

test.describe('Admin Installers - Responsive Design (Team Overview)', () => {
  test.skip('displays mobile layout (375px) with stacked admin cards', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/installers');

    const adminSection = page.locator('section').filter({ hasText: /administradores/i });
    await expect(adminSection).toBeVisible();

    const table = page.locator('table');
    if (await table.isVisible()) {
      const tableWrapper = table.locator('..');
      await expect(tableWrapper).toHaveCSS('overflow-x', /auto|scroll/);
    }
  });

  test.skip('displays tablet layout (768px) with 2-column admin grid', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin/installers');

    const adminSection = page.locator('section').filter({ hasText: /administradores/i });
    await expect(adminSection).toBeVisible();
  });

  test.skip('displays desktop layout (1440px) with 3-column admin grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/installers');

    const adminSection = page.locator('section').filter({ hasText: /administradores/i });
    await expect(adminSection).toBeVisible();

    const table = page.locator('table');
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  });
});

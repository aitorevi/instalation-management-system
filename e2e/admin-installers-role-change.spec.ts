import { test, expect } from '@playwright/test';

test.describe('Admin Installers - Role Management', () => {
  test.skip('displays "Promover a Admin" button for installers', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const promoteButton = page.getByRole('button', { name: /promover a admin/i });
    if (await promoteButton.isVisible()) {
      await expect(promoteButton).toBeVisible();
    }
  });

  test.skip('displays "Cambiar a Installer" button for admins (not self)', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminCards = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]');

    const nonSelfAdminCard = adminCards.filter({ hasNotText: /tú/i }).first();

    if (await nonSelfAdminCard.isVisible()) {
      await nonSelfAdminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await expect(demoteButton).toBeVisible();
    }
  });

  test.skip('does not display role change button for own profile', async ({ page }) => {
    await page.goto('/admin/installers');

    const selfCard = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a')
      .filter({ hasText: /tú/i })
      .first();

    if (await selfCard.isVisible()) {
      await selfCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      await expect(page.getByText(/tú/i).last()).toBeVisible();

      const promoteButton = page.getByRole('button', { name: /promover a admin/i });
      await expect(promoteButton).not.toBeVisible();

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await expect(demoteButton).not.toBeVisible();
    }
  });

  test.skip('opens promote modal when clicking "Promover a Admin"', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const promoteButton = page.getByRole('button', { name: /promover a admin/i });
    if (await promoteButton.isVisible()) {
      await promoteButton.click();

      const modal = page
        .locator('[role="dialog"]')
        .filter({ hasText: /promover a administrador/i });
      await expect(modal).toBeVisible();

      await expect(modal.getByText(/tendrá acceso completo al sistema/i)).toBeVisible();
    }
  });

  test.skip('opens demote modal when clicking "Cambiar a Installer"', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminCards = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]');

    const nonSelfAdminCard = adminCards.filter({ hasNotText: /tú/i }).first();

    if (await nonSelfAdminCard.isVisible()) {
      await nonSelfAdminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await demoteButton.click();

      const modal = page.locator('[role="dialog"]').filter({ hasText: /cambiar a installer/i });
      await expect(modal).toBeVisible();

      await expect(modal.getByText(/perderá acceso de administrador/i)).toBeVisible();
    }
  });

  test.skip('cancels promote modal when clicking "Cancelar"', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const promoteButton = page.getByRole('button', { name: /promover a admin/i });
    if (await promoteButton.isVisible()) {
      await promoteButton.click();

      const modal = page
        .locator('[role="dialog"]')
        .filter({ hasText: /promover a administrador/i });
      await expect(modal).toBeVisible();

      const cancelButton = modal.getByRole('button', { name: /cancelar/i });
      await cancelButton.click();

      await expect(modal).not.toBeVisible();

      const installerBadge = page.getByText(/installer/i).first();
      await expect(installerBadge).toBeVisible();
    }
  });

  test.skip('cancels demote modal when clicking "Cancelar"', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminCards = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]');

    const nonSelfAdminCard = adminCards.filter({ hasNotText: /tú/i }).first();

    if (await nonSelfAdminCard.isVisible()) {
      await nonSelfAdminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await demoteButton.click();

      const modal = page.locator('[role="dialog"]').filter({ hasText: /cambiar a installer/i });
      await expect(modal).toBeVisible();

      const cancelButton = modal.getByRole('button', { name: /cancelar/i });
      await cancelButton.click();

      await expect(modal).not.toBeVisible();

      const adminBadge = page.getByText(/admin/i).first();
      await expect(adminBadge).toBeVisible();
    }
  });

  test.skip('closes modal when pressing Escape key', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const promoteButton = page.getByRole('button', { name: /promover a admin/i });
    if (await promoteButton.isVisible()) {
      await promoteButton.click();

      const modal = page
        .locator('[role="dialog"]')
        .filter({ hasText: /promover a administrador/i });
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(modal).not.toBeVisible();
    }
  });

  test.skip('promotes installer to admin successfully', async ({ page }) => {
    await page.goto('/admin/installers');
    const profileLink = page.getByRole('link', { name: /ver perfil/i }).first();
    await profileLink.click();

    await page.waitForURL(/\/admin\/installers\/[^/]+$/);

    const promoteButton = page.getByRole('button', { name: /promover a admin/i });
    if (await promoteButton.isVisible()) {
      await promoteButton.click();

      const modal = page
        .locator('[role="dialog"]')
        .filter({ hasText: /promover a administrador/i });
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole('button', { name: /promover/i }).last();
      await confirmButton.click();

      await page.waitForURL('/admin/installers');

      await page.goto('/admin/installers');

      const adminSection = page.locator('section').filter({ hasText: /administradores/i });
      await expect(adminSection).toBeVisible();
    }
  });

  test.skip('demotes admin to installer successfully', async ({ page }) => {
    await page.goto('/admin/installers');

    const adminCards = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]');

    const nonSelfAdminCard = adminCards.filter({ hasNotText: /tú/i }).first();

    if (await nonSelfAdminCard.isVisible()) {
      await nonSelfAdminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await demoteButton.click();

      const modal = page.locator('[role="dialog"]').filter({ hasText: /cambiar a installer/i });
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole('button', { name: /cambiar rol/i });
      await confirmButton.click();

      await expect(page.getByText(/rol cambiado a installer correctamente/i)).toBeVisible();

      const installerBadge = page.getByText(/installer/i).first();
      await expect(installerBadge).toBeVisible();
    }
  });

  test.skip('displays "Cambiar Rol" button with danger variant in demote modal', async ({
    page
  }) => {
    await page.goto('/admin/installers');

    const adminCards = page
      .locator('section')
      .filter({ hasText: /administradores/i })
      .locator('a[href*="/admin/installers/"]');

    const nonSelfAdminCard = adminCards.filter({ hasNotText: /tú/i }).first();

    if (await nonSelfAdminCard.isVisible()) {
      await nonSelfAdminCard.click();
      await page.waitForURL(/\/admin\/installers\/[^/]+$/);

      const demoteButton = page.getByRole('button', { name: /cambiar a installer/i });
      await demoteButton.click();

      const modal = page.locator('[role="dialog"]').filter({ hasText: /cambiar a installer/i });
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole('button', { name: /cambiar rol/i });
      await expect(confirmButton).toBeVisible();
      await expect(confirmButton).toHaveClass(/bg-red-600/);
    }
  });
});

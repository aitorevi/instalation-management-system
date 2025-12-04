import { test, expect } from '@playwright/test';

test.describe('Session Timeout', () => {
  test.describe('Absolute Timeout', () => {
    test('should redirect to login with session-timeout reason when absolute timeout expires', async ({
      page,
      context
    }) => {
      await page.goto('/login');

      const nowMs = Date.now();
      const expiredSessionCreated = nowMs - 31 * 60 * 1000;
      const recentActivity = nowMs - 5 * 60 * 1000;

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-session-created',
          value: expiredSessionCreated.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-last-activity',
          value: recentActivity.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/admin');

      await expect(page).toHaveURL(/\/login\?reason=session-timeout/);

      const notification = page.locator('[role="status"], [role="alert"]');
      await expect(notification).toBeVisible();
      await expect(notification).toContainText(/tiempo de inactividad absoluto/i);
    });
  });

  test.describe('Inactivity Timeout', () => {
    test('should redirect to login with inactivity-timeout reason when inactivity timeout expires', async ({
      page,
      context
    }) => {
      await page.goto('/login');

      const nowMs = Date.now();
      const recentSessionCreated = nowMs - 10 * 60 * 1000;
      const expiredActivity = nowMs - 16 * 60 * 1000;

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-session-created',
          value: recentSessionCreated.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-last-activity',
          value: expiredActivity.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/admin');

      await expect(page).toHaveURL(/\/login\?reason=inactivity-timeout/);

      const notification = page.locator('[role="status"], [role="alert"]');
      await expect(notification).toBeVisible();
      await expect(notification).toContainText(/inactividad/i);
    });
  });

  test.describe('Valid Session', () => {
    test('should NOT redirect when session is within timeout limits', async ({ page, context }) => {
      await page.goto('/login');

      const nowMs = Date.now();
      const recentSessionCreated = nowMs - 10 * 60 * 1000;
      const recentActivity = nowMs - 5 * 60 * 1000;

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-session-created',
          value: recentSessionCreated.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-last-activity',
          value: recentActivity.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/');

      await expect(page).not.toHaveURL(/\/login\?reason=(session-timeout|inactivity-timeout)/);
    });
  });

  test.describe('Session Timeout Cookie Management', () => {
    test('should clear all session cookies on absolute timeout', async ({ page, context }) => {
      await page.goto('/login');

      const nowMs = Date.now();
      const expiredSessionCreated = nowMs - 31 * 60 * 1000;
      const recentActivity = nowMs - 5 * 60 * 1000;

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-refresh-token',
          value: 'mock-refresh-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-session-created',
          value: expiredSessionCreated.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-last-activity',
          value: recentActivity.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/admin');

      await expect(page).toHaveURL(/\/login\?reason=session-timeout/);

      const cookies = await context.cookies();
      const sessionCookies = cookies.filter(
        (c) =>
          c.name === 'sb-access-token' ||
          c.name === 'sb-refresh-token' ||
          c.name === 'sb-session-created' ||
          c.name === 'sb-last-activity'
      );

      expect(sessionCookies.length).toBe(0);
    });

    test('should clear all session cookies on inactivity timeout', async ({ page, context }) => {
      await page.goto('/login');

      const nowMs = Date.now();
      const recentSessionCreated = nowMs - 10 * 60 * 1000;
      const expiredActivity = nowMs - 16 * 60 * 1000;

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-refresh-token',
          value: 'mock-refresh-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-session-created',
          value: recentSessionCreated.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        },
        {
          name: 'sb-last-activity',
          value: expiredActivity.toString(),
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/admin');

      await expect(page).toHaveURL(/\/login\?reason=inactivity-timeout/);

      const cookies = await context.cookies();
      const sessionCookies = cookies.filter(
        (c) =>
          c.name === 'sb-access-token' ||
          c.name === 'sb-refresh-token' ||
          c.name === 'sb-session-created' ||
          c.name === 'sb-last-activity'
      );

      expect(sessionCookies.length).toBe(0);
    });
  });

  test.describe('New Session Initialization', () => {
    test('should create session timestamp cookies for new session', async ({ page, context }) => {
      await page.goto('/login');

      await context.addCookies([
        {
          name: 'sb-access-token',
          value: 'mock-access-token',
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax'
        }
      ]);

      await page.goto('/');

      const cookies = await context.cookies();
      const sessionCreated = cookies.find((c) => c.name === 'sb-session-created');
      const lastActivity = cookies.find((c) => c.name === 'sb-last-activity');

      if (sessionCreated) {
        expect(sessionCreated.value).toBeTruthy();
        expect(parseInt(sessionCreated.value, 10)).toBeGreaterThan(0);
      }

      if (lastActivity) {
        expect(lastActivity.value).toBeTruthy();
        expect(parseInt(lastActivity.value, 10)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Login Page Messages', () => {
    test('should display absolute timeout message', async ({ page }) => {
      await page.goto('/login?reason=session-timeout');

      const notification = page.locator('[role="status"], [role="alert"]');
      await expect(notification).toBeVisible();
      await expect(notification).toContainText(/tiempo de inactividad absoluto/i);
    });

    test('should display inactivity timeout message', async ({ page }) => {
      await page.goto('/login?reason=inactivity-timeout');

      const notification = page.locator('[role="status"], [role="alert"]');
      await expect(notification).toBeVisible();
      await expect(notification).toContainText(/inactividad/i);
    });

    test('should display session expired message (token expiry)', async ({ page }) => {
      await page.goto('/login?reason=session-expired');

      const notification = page.locator('[role="status"], [role="alert"]');
      await expect(notification).toBeVisible();
      await expect(notification).toContainText(/sesión ha expirado/i);
      await expect(notification).not.toContainText(/inactividad/i);
    });
  });
});

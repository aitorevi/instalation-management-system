import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser, clearSessionCookies } from '@/features/auth/logic/auth';
import {
  checkSessionTimeout,
  getLastActivity,
  getSessionCreatedAt,
  setSessionCreatedAt,
  updateLastActivity
} from '@/features/auth/logic/session-timeout';

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/logout'];
const ADMIN_PREFIX = '/admin';
const INSTALLER_PREFIX = '/installer';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, locals } = context;
  const pathname = url.pathname;

  try {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isStaticAsset =
      pathname.startsWith('/_') || pathname.includes('.') || pathname.startsWith('/api');

    if (isPublicRoute || isStaticAsset) {
      return next();
    }

    const { user, error } = await getCurrentUser(cookies);

    if (!user) {
      const reason = error === 'Session expired' ? 'session-expired' : 'unauthorized';
      return redirect(`/login?reason=${reason}`);
    }

    const sessionCreatedAt = getSessionCreatedAt(cookies);
    const lastActivityAt = getLastActivity(cookies);

    if (!sessionCreatedAt || !lastActivityAt) {
      setSessionCreatedAt(cookies);
      updateLastActivity(cookies);
    } else {
      const sessionTimeout = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      if (sessionTimeout.isExpired) {
        clearSessionCookies(cookies);
        return redirect('/login?reason=session-timeout');
      }

      if (sessionTimeout.isInactive) {
        clearSessionCookies(cookies);
        return redirect('/login?reason=inactivity-timeout');
      }

      updateLastActivity(cookies);
    }

    const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);
    const isInstallerRoute = pathname.startsWith(INSTALLER_PREFIX);

    if (isAdminRoute && user.role !== 'admin') {
      return redirect('/installer');
    }

    if (isInstallerRoute && user.role !== 'installer') {
      return redirect('/admin');
    }

    if (pathname === '/') {
      const redirectUrl = user.role === 'admin' ? '/admin' : '/installer';
      return redirect(redirectUrl);
    }

    locals.user = user;

    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return redirect(`/error?message=${encodeURIComponent(message)}`);
  }
});

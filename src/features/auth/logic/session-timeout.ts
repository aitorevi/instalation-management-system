import type { AstroCookies } from 'astro';

export interface SessionTimeout {
  lastActivityAt: number;
  createdAt: number;
  isExpired: boolean;
  isInactive: boolean;
}

export interface SessionTimeoutConfig {
  absoluteTimeoutMs: number;
  inactivityTimeoutMs: number;
}

const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;
const DEFAULT_INACTIVITY_TIMEOUT_MINUTES = 15;
const COOKIE_SESSION_CREATED = 'sb-session-created';
const COOKIE_LAST_ACTIVITY = 'sb-last-activity';

export function getSessionTimeout(): SessionTimeoutConfig {
  const sessionTimeoutMinutes =
    import.meta.env.SESSION_TIMEOUT_MINUTES ?? DEFAULT_SESSION_TIMEOUT_MINUTES;
  const inactivityTimeoutMinutes =
    import.meta.env.SESSION_INACTIVITY_TIMEOUT_MINUTES ?? DEFAULT_INACTIVITY_TIMEOUT_MINUTES;

  return {
    absoluteTimeoutMs: sessionTimeoutMinutes * 60 * 1000,
    inactivityTimeoutMs: inactivityTimeoutMinutes * 60 * 1000
  };
}

export function checkSessionTimeout(
  sessionCreatedAt: number | null,
  lastActivityAt: number | null
): SessionTimeout {
  const now = Date.now();
  const config = getSessionTimeout();

  const createdAt = sessionCreatedAt ?? now;
  const lastActivity = lastActivityAt ?? now;

  const timeSinceCreation = now - createdAt;
  const timeSinceActivity = now - lastActivity;

  const isExpired = timeSinceCreation > config.absoluteTimeoutMs;
  const isInactive = timeSinceActivity > config.inactivityTimeoutMs;

  return {
    lastActivityAt: lastActivity,
    createdAt,
    isExpired,
    isInactive
  };
}

export function updateLastActivity(cookies: AstroCookies): void {
  const now = Date.now();

  cookies.set(COOKIE_LAST_ACTIVITY, now.toString(), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
}

export function getLastActivity(cookies: AstroCookies): number | null {
  const value = cookies.get(COOKIE_LAST_ACTIVITY)?.value;
  if (!value) {
    return null;
  }

  const timestamp = parseInt(value, 10);
  return isNaN(timestamp) ? null : timestamp;
}

export function getSessionCreatedAt(cookies: AstroCookies): number | null {
  const value = cookies.get(COOKIE_SESSION_CREATED)?.value;
  if (!value) {
    return null;
  }

  const timestamp = parseInt(value, 10);
  return isNaN(timestamp) ? null : timestamp;
}

export function setSessionCreatedAt(cookies: AstroCookies): void {
  const now = Date.now();

  cookies.set(COOKIE_SESSION_CREATED, now.toString(), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
}

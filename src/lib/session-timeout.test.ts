import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getSessionTimeout,
  checkSessionTimeout,
  updateLastActivity,
  getLastActivity,
  getSessionCreatedAt,
  setSessionCreatedAt
} from './session-timeout';
import type { AstroCookies } from 'astro';

describe('session-timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getSessionTimeout', () => {
    it('should return default timeout values when env vars are not set', () => {
      const config = getSessionTimeout();

      expect(config.absoluteTimeoutMs).toBe(30 * 60 * 1000);
      expect(config.inactivityTimeoutMs).toBe(15 * 60 * 1000);
    });

    it('should return configured values when env vars are set', () => {
      vi.stubEnv('SESSION_TIMEOUT_MINUTES', 45);
      vi.stubEnv('SESSION_INACTIVITY_TIMEOUT_MINUTES', 20);

      const config = getSessionTimeout();

      expect(config.absoluteTimeoutMs).toBe(45 * 60 * 1000);
      expect(config.inactivityTimeoutMs).toBe(20 * 60 * 1000);

      vi.unstubAllEnvs();
    });

    it('should use default when env var is undefined', () => {
      vi.stubEnv('SESSION_TIMEOUT_MINUTES', undefined);
      vi.stubEnv('SESSION_INACTIVITY_TIMEOUT_MINUTES', undefined);

      const config = getSessionTimeout();

      expect(config.absoluteTimeoutMs).toBe(30 * 60 * 1000);
      expect(config.inactivityTimeoutMs).toBe(15 * 60 * 1000);

      vi.unstubAllEnvs();
    });
  });

  describe('checkSessionTimeout', () => {
    it('should detect absolute timeout when session created > SESSION_TIMEOUT_MINUTES ago', () => {
      const now = Date.now();
      const sessionCreatedAt = now - 31 * 60 * 1000;
      const lastActivityAt = now - 5 * 60 * 1000;

      const result = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      expect(result.isExpired).toBe(true);
      expect(result.isInactive).toBe(false);
      expect(result.createdAt).toBe(sessionCreatedAt);
      expect(result.lastActivityAt).toBe(lastActivityAt);
    });

    it('should detect inactivity timeout when last activity > SESSION_INACTIVITY_TIMEOUT_MINUTES ago', () => {
      const now = Date.now();
      const sessionCreatedAt = now - 10 * 60 * 1000;
      const lastActivityAt = now - 16 * 60 * 1000;

      const result = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      expect(result.isExpired).toBe(false);
      expect(result.isInactive).toBe(true);
      expect(result.createdAt).toBe(sessionCreatedAt);
      expect(result.lastActivityAt).toBe(lastActivityAt);
    });

    it('should return valid session when within timeout limits', () => {
      const now = Date.now();
      const sessionCreatedAt = now - 10 * 60 * 1000;
      const lastActivityAt = now - 5 * 60 * 1000;

      const result = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      expect(result.isExpired).toBe(false);
      expect(result.isInactive).toBe(false);
      expect(result.createdAt).toBe(sessionCreatedAt);
      expect(result.lastActivityAt).toBe(lastActivityAt);
    });

    it('should use current time when sessionCreatedAt is null', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = checkSessionTimeout(null, now - 5 * 60 * 1000);

      expect(result.isExpired).toBe(false);
      expect(result.createdAt).toBe(now);
    });

    it('should use current time when lastActivityAt is null', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = checkSessionTimeout(now - 10 * 60 * 1000, null);

      expect(result.isInactive).toBe(false);
      expect(result.lastActivityAt).toBe(now);
    });

    it('should handle both timestamps being null', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const result = checkSessionTimeout(null, null);

      expect(result.isExpired).toBe(false);
      expect(result.isInactive).toBe(false);
      expect(result.createdAt).toBe(now);
      expect(result.lastActivityAt).toBe(now);
    });

    it('should detect both absolute and inactivity timeout simultaneously', () => {
      const now = Date.now();
      const sessionCreatedAt = now - 31 * 60 * 1000;
      const lastActivityAt = now - 16 * 60 * 1000;

      const result = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      expect(result.isExpired).toBe(true);
      expect(result.isInactive).toBe(true);
    });

    it('should work with custom timeout values from env', () => {
      vi.stubEnv('SESSION_TIMEOUT_MINUTES', 5);
      vi.stubEnv('SESSION_INACTIVITY_TIMEOUT_MINUTES', 2);

      const now = Date.now();
      const sessionCreatedAt = now - 6 * 60 * 1000;
      const lastActivityAt = now - 3 * 60 * 1000;

      const result = checkSessionTimeout(sessionCreatedAt, lastActivityAt);

      expect(result.isExpired).toBe(true);
      expect(result.isInactive).toBe(true);

      vi.unstubAllEnvs();
    });
  });

  describe('cookie helpers', () => {
    let mockCookies: AstroCookies;

    beforeEach(() => {
      const cookieStore = new Map<string, { value: string }>();

      mockCookies = {
        get: vi.fn((name: string) => cookieStore.get(name)),
        set: vi.fn((name: string, value: string) => {
          cookieStore.set(name, { value });
        }),
        delete: vi.fn((name: string) => {
          cookieStore.delete(name);
        })
      } as unknown as AstroCookies;
    });

    describe('updateLastActivity', () => {
      it('should set last activity cookie with current timestamp', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        updateLastActivity(mockCookies);

        expect(mockCookies.set).toHaveBeenCalledWith('sb-last-activity', now.toString(), {
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        });
      });

      it('should use secure flag in production', () => {
        vi.stubEnv('PROD', true);
        const now = Date.now();
        vi.setSystemTime(now);

        updateLastActivity(mockCookies);

        expect(mockCookies.set).toHaveBeenCalledWith('sb-last-activity', now.toString(), {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        });

        vi.unstubAllEnvs();
      });
    });

    describe('getLastActivity', () => {
      it('should retrieve timestamp from cookie', () => {
        const timestamp = Date.now();
        mockCookies.set('sb-last-activity', timestamp.toString(), {});

        const result = getLastActivity(mockCookies);

        expect(result).toBe(timestamp);
      });

      it('should return null when cookie does not exist', () => {
        const result = getLastActivity(mockCookies);

        expect(result).toBeNull();
      });

      it('should return null for invalid timestamp', () => {
        mockCookies.set('sb-last-activity', 'invalid-timestamp', {});

        const result = getLastActivity(mockCookies);

        expect(result).toBeNull();
      });

      it('should return null for empty string', () => {
        mockCookies.set('sb-last-activity', '', {});

        const result = getLastActivity(mockCookies);

        expect(result).toBeNull();
      });
    });

    describe('setSessionCreatedAt', () => {
      it('should set session created cookie with current timestamp', () => {
        const now = Date.now();
        vi.setSystemTime(now);

        setSessionCreatedAt(mockCookies);

        expect(mockCookies.set).toHaveBeenCalledWith('sb-session-created', now.toString(), {
          path: '/',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        });
      });

      it('should use secure flag in production', () => {
        vi.stubEnv('PROD', true);
        const now = Date.now();
        vi.setSystemTime(now);

        setSessionCreatedAt(mockCookies);

        expect(mockCookies.set).toHaveBeenCalledWith('sb-session-created', now.toString(), {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        });

        vi.unstubAllEnvs();
      });
    });

    describe('getSessionCreatedAt', () => {
      it('should retrieve timestamp from cookie', () => {
        const timestamp = Date.now();
        mockCookies.set('sb-session-created', timestamp.toString(), {});

        const result = getSessionCreatedAt(mockCookies);

        expect(result).toBe(timestamp);
      });

      it('should return null when cookie does not exist', () => {
        const result = getSessionCreatedAt(mockCookies);

        expect(result).toBeNull();
      });

      it('should return null for invalid timestamp', () => {
        mockCookies.set('sb-session-created', 'invalid-timestamp', {});

        const result = getSessionCreatedAt(mockCookies);

        expect(result).toBeNull();
      });

      it('should return null for empty string', () => {
        mockCookies.set('sb-session-created', '', {});

        const result = getSessionCreatedAt(mockCookies);

        expect(result).toBeNull();
      });
    });
  });
});

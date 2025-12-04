import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, hasRole, isAdmin, isInstaller, signOut } from './auth';
import type { AstroCookies } from 'astro';

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      refreshSession: vi.fn()
    }
  },
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }))
}));

import { supabase, createServerClient } from './supabase';

const createMockCookies = (
  accessToken: string | null = null,
  refreshToken: string | null = null
): AstroCookies => {
  const cookieStore = new Map([
    ['sb-access-token', accessToken ? { value: accessToken } : undefined],
    ['sb-refresh-token', refreshToken ? { value: refreshToken } : undefined]
  ]);

  return {
    get: vi.fn((name: string) => cookieStore.get(name)),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn((name: string) => cookieStore.has(name))
  } as unknown as AstroCookies;
};

const mockUser = {
  id: 'user-123',
  email: 'user@test.com',
  full_name: 'Test User',
  role: 'admin' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('Authentication Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return "No session" error when no access token', async () => {
      const cookies = createMockCookies(null, null);

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: null, error: 'No session' });
    });

    it('should return user when access token is valid', async () => {
      const cookies = createMockCookies('valid-token', 'refresh-token');
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as ReturnType<typeof createServerClient>
      );

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: mockUser, error: null });
      expect(createServerClient).toHaveBeenCalledWith('valid-token');
    });

    it('should return "Invalid session" error when auth fails and no refresh token', async () => {
      const cookies = createMockCookies('invalid-token', null);
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          })
        }
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as ReturnType<typeof createServerClient>
      );

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: null, error: 'Invalid session' });
    });

    it('should attempt refresh when auth fails but refresh token exists', async () => {
      const cookies = createMockCookies('expired-token', 'valid-refresh-token');
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Token expired' }
          })
        }
      };

      const refreshedUser = { id: 'user-123' };
      const refreshedSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      };

      vi.mocked(createServerClient).mockReturnValueOnce(
        mockAuthClient as ReturnType<typeof createServerClient>
      );
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: {
          session: refreshedSession,
          user: refreshedUser
        },
        error: null
      });

      const mockRefreshedClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValueOnce(
        mockRefreshedClient as ReturnType<typeof createServerClient>
      );

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: mockUser, error: null });
      expect(supabase.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'valid-refresh-token'
      });
      expect(cookies.set).toHaveBeenCalledWith(
        'sb-access-token',
        'new-access-token',
        expect.any(Object)
      );
      expect(cookies.set).toHaveBeenCalledWith(
        'sb-refresh-token',
        'new-refresh-token',
        expect.any(Object)
      );
    });

    it('should return "Session expired" error when refresh fails', async () => {
      const cookies = createMockCookies('expired-token', 'invalid-refresh-token');
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Token expired' }
          })
        }
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockAuthClient as ReturnType<typeof createServerClient>
      );
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Refresh failed', name: 'AuthError', status: 401 }
      });

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: null, error: 'Session expired' });
    });

    it('should return "User not found in database" error when user query fails', async () => {
      const cookies = createMockCookies('valid-token', 'refresh-token');
      const mockClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
          })
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as ReturnType<typeof createServerClient>
      );

      const result = await getCurrentUser(cookies);

      expect(result).toEqual({ user: null, error: 'User not found in database' });
    });

    it('should set httpOnly and sameSite cookies', async () => {
      const cookies = createMockCookies('expired-token', 'valid-refresh-token');
      const mockAuthClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Token expired' }
          })
        }
      };

      const refreshedSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      };

      vi.mocked(createServerClient).mockReturnValueOnce(
        mockAuthClient as ReturnType<typeof createServerClient>
      );
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: {
          session: refreshedSession,
          user: { id: 'user-123' }
        },
        error: null
      });

      const mockRefreshedClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValueOnce(
        mockRefreshedClient as ReturnType<typeof createServerClient>
      );

      await getCurrentUser(cookies);

      expect(cookies.set).toHaveBeenCalledWith(
        'sb-access-token',
        'new-access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/'
        })
      );
    });
  });

  describe('hasRole', () => {
    it('should return true when user has specified role', () => {
      const user = { ...mockUser, role: 'admin' as const };

      expect(hasRole(user, 'admin')).toBe(true);
    });

    it('should return false when user has different role', () => {
      const user = { ...mockUser, role: 'installer' as const };

      expect(hasRole(user, 'admin')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const user = { ...mockUser, role: 'admin' as const };

      expect(isAdmin(user)).toBe(true);
    });

    it('should return false for installer user', () => {
      const user = { ...mockUser, role: 'installer' as const };

      expect(isAdmin(user)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isInstaller', () => {
    it('should return true for installer user', () => {
      const user = { ...mockUser, role: 'installer' as const };

      expect(isInstaller(user)).toBe(true);
    });

    it('should return false for admin user', () => {
      const user = { ...mockUser, role: 'admin' as const };

      expect(isInstaller(user)).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(isInstaller(null)).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should delete both access and refresh tokens', () => {
      const cookies = createMockCookies('access-token', 'refresh-token');

      signOut(cookies);

      expect(cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
      expect(cookies.delete).toHaveBeenCalledWith('sb-refresh-token', { path: '/' });
    });

    it('should delete tokens even if they do not exist', () => {
      const cookies = createMockCookies(null, null);

      signOut(cookies);

      expect(cookies.delete).toHaveBeenCalledWith('sb-access-token', { path: '/' });
      expect(cookies.delete).toHaveBeenCalledWith('sb-refresh-token', { path: '/' });
    });
  });
});

import { describe, it, expect } from 'vitest';
import { getUser, requireAdmin, requireInstaller } from './page-utils';
import type { AstroGlobal } from 'astro';

import type { User } from './supabase';

const createMockAstro = (user: User): Readonly<AstroGlobal> => {
  return {
    locals: { user }
  } as Readonly<AstroGlobal>;
};

describe('Page Utilities', () => {
  const mockAdminUser = {
    id: 'admin-123',
    email: 'admin@test.com',
    full_name: 'Admin User',
    role: 'admin' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockInstallerUser = {
    id: 'installer-123',
    email: 'installer@test.com',
    full_name: 'Installer User',
    role: 'installer' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  describe('getUser', () => {
    it('should retrieve user from Astro.locals', () => {
      const astro = createMockAstro(mockAdminUser);
      const user = getUser(astro);

      expect(user).toEqual(mockAdminUser);
    });

    it('should retrieve installer user from Astro.locals', () => {
      const astro = createMockAstro(mockInstallerUser);
      const user = getUser(astro);

      expect(user).toEqual(mockInstallerUser);
    });
  });

  describe('requireAdmin', () => {
    it('should return user when role is admin', () => {
      const astro = createMockAstro(mockAdminUser);
      const user = requireAdmin(astro);

      expect(user).toEqual(mockAdminUser);
    });

    it('should throw error when role is installer', () => {
      const astro = createMockAstro(mockInstallerUser);

      expect(() => requireAdmin(astro)).toThrow('Admin access required');
    });

    it('should throw error with correct message', () => {
      const astro = createMockAstro(mockInstallerUser);

      try {
        requireAdmin(astro);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Admin access required');
      }
    });
  });

  describe('requireInstaller', () => {
    it('should return user when role is installer', () => {
      const astro = createMockAstro(mockInstallerUser);
      const user = requireInstaller(astro);

      expect(user).toEqual(mockInstallerUser);
    });

    it('should throw error when role is admin', () => {
      const astro = createMockAstro(mockAdminUser);

      expect(() => requireInstaller(astro)).toThrow('Installer access required');
    });

    it('should throw error with correct message', () => {
      const astro = createMockAstro(mockAdminUser);

      try {
        requireInstaller(astro);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Installer access required');
      }
    });
  });

  describe('Edge cases', () => {
    it('getUser should return user object with all properties', () => {
      const astro = createMockAstro(mockAdminUser);
      const user = getUser(astro);

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('full_name');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('created_at');
      expect(user).toHaveProperty('updated_at');
    });

    it('requireAdmin should not modify user object', () => {
      const astro = createMockAstro(mockAdminUser);
      const user = requireAdmin(astro);

      expect(user).toBe(mockAdminUser);
      expect(user).toEqual(mockAdminUser);
    });

    it('requireInstaller should not modify user object', () => {
      const astro = createMockAstro(mockInstallerUser);
      const user = requireInstaller(astro);

      expect(user).toBe(mockInstallerUser);
      expect(user).toEqual(mockInstallerUser);
    });
  });
});

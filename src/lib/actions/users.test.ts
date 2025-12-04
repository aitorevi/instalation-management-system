import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUser, changeUserRole, isValidSpanishPhone } from './users';

vi.mock('../supabase', () => ({
  createServerClient: vi.fn()
}));

import { createServerClient } from '../supabase';

const mockUser = {
  id: 'user-123',
  email: 'user@test.com',
  full_name: 'Test User',
  phone_number: '+34 600 123 456',
  company_details: 'Test Company',
  role: 'installer' as const,
  created_at: '2024-01-01T00:00:00Z'
};

describe('User Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('isValidSpanishPhone', () => {
    it('should accept valid Spanish phone with +34 and spaces', () => {
      expect(isValidSpanishPhone('+34 600 123 456')).toBe(true);
      expect(isValidSpanishPhone('+34 700 123 456')).toBe(true);
      expect(isValidSpanishPhone('+34 900 123 456')).toBe(true);
    });

    it('should accept valid Spanish phone with +34 and no spaces', () => {
      expect(isValidSpanishPhone('+34600123456')).toBe(true);
      expect(isValidSpanishPhone('+34700123456')).toBe(true);
      expect(isValidSpanishPhone('+34900123456')).toBe(true);
    });

    it('should accept valid Spanish phone with 34 prefix', () => {
      expect(isValidSpanishPhone('34600123456')).toBe(true);
      expect(isValidSpanishPhone('34 700 123 456')).toBe(true);
    });

    it('should accept valid Spanish phone without country code', () => {
      expect(isValidSpanishPhone('600123456')).toBe(true);
      expect(isValidSpanishPhone('700123456')).toBe(true);
      expect(isValidSpanishPhone('900123456')).toBe(true);
    });

    it('should accept null phone number', () => {
      expect(isValidSpanishPhone(null)).toBe(true);
    });

    it('should reject too short phone numbers', () => {
      expect(isValidSpanishPhone('123')).toBe(false);
      expect(isValidSpanishPhone('12345')).toBe(false);
    });

    it('should reject wrong country code', () => {
      expect(isValidSpanishPhone('+1 555 123 4567')).toBe(false);
      expect(isValidSpanishPhone('+44 7700 900000')).toBe(false);
    });

    it('should reject non-numeric characters', () => {
      expect(isValidSpanishPhone('abc123')).toBe(false);
      expect(isValidSpanishPhone('+34 abc def ghi')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidSpanishPhone('')).toBe(false);
    });

    it('should reject invalid Spanish mobile prefixes', () => {
      expect(isValidSpanishPhone('500123456')).toBe(false);
      expect(isValidSpanishPhone('+34 800 123 456')).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should successfully update user profile', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
              }))
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const updateData = {
        full_name: 'Updated Name',
        phone_number: '+34 600 999 888'
      };

      const result = await updateUser('access-token', 'user-123', updateData);

      expect(result).toEqual({
        success: true,
        data: mockUser
      });
      expect(createServerClient).toHaveBeenCalledWith('access-token');
      expect(mockClient.from).toHaveBeenCalledWith('users');
    });

    it('should return error on database failure', async () => {
      const mockError = { message: 'Database error' };
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: mockError })
              }))
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await updateUser('access-token', 'user-123', { full_name: 'New Name' });

      expect(result).toEqual({
        success: false,
        error: 'Database error'
      });
      expect(console.error).toHaveBeenCalledWith('Error updating user:', mockError);
    });

    it('should validate phone number before update', async () => {
      const result = await updateUser('access-token', 'user-123', {
        phone_number: '123'
      });

      expect(result).toEqual({
        success: false,
        error: 'Formato de teléfono inválido. Use formato: +34 XXX XXX XXX'
      });
      expect(createServerClient).not.toHaveBeenCalled();
    });

    it('should allow valid phone number update', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
              }))
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await updateUser('access-token', 'user-123', {
        phone_number: '+34 600 123 456'
      });

      expect(result.success).toBe(true);
      expect(createServerClient).toHaveBeenCalled();
    });

    it('should allow null phone number', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { ...mockUser, phone_number: null },
                  error: null
                })
              }))
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await updateUser('access-token', 'user-123', {
        phone_number: null
      });

      expect(result.success).toBe(true);
      expect(createServerClient).toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
              }))
            }))
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const updateData = {
        full_name: 'New Name',
        phone_number: '+34 700 888 999',
        company_details: 'New Company'
      };

      const result = await updateUser('access-token', 'user-123', updateData);

      expect(result.success).toBe(true);
      expect(createServerClient).toHaveBeenCalledWith('access-token');
    });
  });

  describe('changeUserRole', () => {
    it('should successfully change role to admin', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await changeUserRole('access-token', 'user-123', 'admin');

      expect(result).toEqual({ success: true });
      expect(createServerClient).toHaveBeenCalledWith('access-token');
      expect(mockClient.from).toHaveBeenCalledWith('users');
    });

    it('should successfully change role to installer', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null })
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await changeUserRole('access-token', 'user-123', 'installer');

      expect(result).toEqual({ success: true });
      expect(createServerClient).toHaveBeenCalledWith('access-token');
    });

    it('should return error on database failure', async () => {
      const mockError = { message: 'Permission denied' };
      const mockClient = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: mockError })
          }))
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await changeUserRole('access-token', 'user-123', 'admin');

      expect(result).toEqual({
        success: false,
        error: 'Permission denied'
      });
      expect(console.error).toHaveBeenCalledWith('Error changing role:', mockError);
    });

    it('should call update with correct role value', async () => {
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }));

      const mockClient = {
        from: vi.fn(() => ({
          update: mockUpdate
        }))
      };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await changeUserRole('access-token', 'user-123', 'admin');

      expect(mockUpdate).toHaveBeenCalledWith({ role: 'admin' });
    });
  });
});

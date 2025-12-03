import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllUsers,
  getSingleInstallerStats,
  getInstallerInstallations,
  getUserById
} from './users';

vi.mock('../supabase', () => ({
  supabase: {},
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

const mockInstallation = {
  id: 'install-123',
  client_name: 'Test Client',
  client_email: 'client@test.com',
  client_phone: '+34 600 111 222',
  address: 'Test Address',
  installation_type: 'Type A',
  status: 'pending' as const,
  assigned_to: 'user-123',
  created_by: 'admin-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  scheduled_date: '2024-02-01',
  completed_at: null,
  archived_at: null,
  notes: null
};

describe('User Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getAllUsers', () => {
    it('should return all users ordered by creation date', async () => {
      const mockUsers = [
        { ...mockUser, id: 'user-1', created_at: '2024-01-03T00:00:00Z' },
        { ...mockUser, id: 'user-2', created_at: '2024-01-02T00:00:00Z' },
        { ...mockUser, id: 'user-3', created_at: '2024-01-01T00:00:00Z' }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockUsers, error: null });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getAllUsers('access-token');

      expect(result).toEqual(mockUsers);
      expect(createServerClient).toHaveBeenCalledWith('access-token');
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array on error', async () => {
      const mockError = { message: 'Database error' };
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getAllUsers('access-token');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching users:', mockError);
    });

    it('should return empty array when data is null', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockSelect = vi.fn(() => ({ order: mockOrder }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getAllUsers('access-token');

      expect(result).toEqual([]);
    });
  });

  describe('getSingleInstallerStats', () => {
    it('should calculate stats correctly with mixed statuses', async () => {
      const mockInstallations = [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'in_progress' },
        { status: 'in_progress' },
        { status: 'in_progress' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' }
      ];

      const mockIs = vi.fn().mockResolvedValue({ data: mockInstallations, error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getSingleInstallerStats('access-token', 'user-123');

      expect(result).toEqual({
        total: 10,
        pending: 2,
        inProgress: 3,
        completed: 5
      });
      expect(mockFrom).toHaveBeenCalledWith('installations');
      expect(mockSelect).toHaveBeenCalledWith('status');
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should exclude archived installations', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getSingleInstallerStats('access-token', 'user-123');

      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should return zero stats on error', async () => {
      const mockError = { message: 'Database error' };
      const mockIs = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getSingleInstallerStats('access-token', 'user-123');

      expect(result).toEqual({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching installer stats:', mockError);
    });

    it('should handle empty installations array', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getSingleInstallerStats('access-token', 'user-123');

      expect(result).toEqual({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
      });
    });

    it('should handle null data', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getSingleInstallerStats('access-token', 'user-123');

      expect(result).toEqual({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0
      });
    });
  });

  describe('getInstallerInstallations', () => {
    it('should return installations for specific installer', async () => {
      const mockInstallations = [mockInstallation];

      const mockQuery = Promise.resolve({ data: mockInstallations, error: null });
      const mockOrder = vi.fn(() => mockQuery);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getInstallerInstallations('access-token', 'user-123');

      expect(result).toEqual(mockInstallations);
      expect(mockFrom).toHaveBeenCalledWith('installations');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should order by scheduled_date descending', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockExecute);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getInstallerInstallations('access-token', 'user-123');

      expect(mockOrder).toHaveBeenCalledWith('scheduled_date', {
        ascending: false,
        nullsFirst: false
      });
    });

    it('should apply limit when provided', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getInstallerInstallations('access-token', 'user-123', 5);

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should not apply limit when omitted', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockExecute);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getInstallerInstallations('access-token', 'user-123');

      expect(mockOrder).toHaveBeenCalled();
      expect(mockOrder).not.toHaveBeenCalledWith(
        expect.objectContaining({ limit: expect.any(Function) })
      );
    });

    it('should exclude archived installations', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockExecute);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getInstallerInstallations('access-token', 'user-123');

      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should return empty array on error', async () => {
      const mockError = { message: 'Database error' };
      const mockQuery = Promise.resolve({ data: null, error: mockError });
      const mockOrder = vi.fn(() => mockQuery);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getInstallerInstallations('access-token', 'user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching installer installations:',
        mockError
      );
    });

    it('should return empty array when data is null', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockOrder = vi.fn(() => mockExecute);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getInstallerInstallations('access-token', 'user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID with access token', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUser, error: null });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getUserById('access-token', 'user-123');

      expect(result).toEqual(mockUser);
      expect(createServerClient).toHaveBeenCalledWith('access-token');
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('should return null when user not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getUserById('access-token', 'nonexistent-user');

      expect(result).toBeNull();
    });

    it('should throw error on other database errors', async () => {
      const mockError = { code: 'SOME_OTHER_ERROR', message: 'Database error' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockEq = vi.fn(() => ({ single: mockSingle }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await expect(getUserById('access-token', 'user-123')).rejects.toThrow(
        'Failed to fetch user: Database error'
      );
    });
  });
});

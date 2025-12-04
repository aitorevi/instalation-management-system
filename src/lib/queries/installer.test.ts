import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getMyStats,
  getTodayInstallations,
  getUpcomingInstallations,
  getMyInstallations,
  getMyInstallationById
} from './installer';

vi.mock('../supabase', () => ({
  supabase: {},
  createServerClient: vi.fn()
}));

import { createServerClient } from '../supabase';

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

describe('Installer Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getMyStats', () => {
    it('should calculate stats correctly', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const mockInstallations = [
        { status: 'pending', scheduled_date: null },
        { status: 'pending', scheduled_date: '2024-02-01' },
        { status: 'in_progress', scheduled_date: '2024-02-02' },
        { status: 'in_progress', scheduled_date: todayStr },
        { status: 'in_progress', scheduled_date: '2024-02-03' },
        { status: 'completed', scheduled_date: '2024-01-15' },
        { status: 'completed', scheduled_date: '2024-01-16' },
        { status: 'completed', scheduled_date: '2024-01-17' },
        { status: 'completed', scheduled_date: '2024-01-18' },
        { status: 'completed', scheduled_date: todayStr }
      ];

      const mockIs = vi.fn().mockResolvedValue({ data: mockInstallations, error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyStats('access-token', 'user-123');

      expect(result).toEqual({
        pending: 2,
        inProgress: 3,
        completed: 5,
        todayCount: 2
      });
      expect(createServerClient).toHaveBeenCalledWith('access-token');
      expect(mockFrom).toHaveBeenCalledWith('installations');
      expect(mockSelect).toHaveBeenCalledWith('status, scheduled_date');
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should handle empty installations', async () => {
      const mockIs = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyStats('access-token', 'user-123');

      expect(result).toEqual({
        pending: 0,
        inProgress: 0,
        completed: 0,
        todayCount: 0
      });
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

      await getMyStats('access-token', 'user-123');

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

      const result = await getMyStats('access-token', 'user-123');

      expect(result).toEqual({
        pending: 0,
        inProgress: 0,
        completed: 0,
        todayCount: 0
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching installer stats:', mockError);
    });

    it('should handle null scheduled_date', async () => {
      const mockInstallations = [
        { status: 'pending', scheduled_date: null },
        { status: 'in_progress', scheduled_date: null }
      ];

      const mockIs = vi.fn().mockResolvedValue({ data: mockInstallations, error: null });
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyStats('access-token', 'user-123');

      expect(result.todayCount).toBe(0);
    });
  });

  describe('getTodayInstallations', () => {
    it("should return today's installations", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const mockInstallations = [
        { ...mockInstallation, id: 'install-1', scheduled_date: `${todayStr}T08:00:00Z` },
        { ...mockInstallation, id: 'install-2', scheduled_date: `${todayStr}T14:00:00Z` }
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockInstallations, error: null });
      const mockLt = vi.fn(() => ({ order: mockOrder }));
      const mockGte = vi.fn(() => ({ lt: mockLt }));
      const mockIs = vi.fn(() => ({ gte: mockGte }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getTodayInstallations('access-token', 'user-123');

      expect(result).toEqual(mockInstallations);
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
      expect(mockOrder).toHaveBeenCalledWith('scheduled_date', { ascending: true });
    });

    it('should filter by assigned_to', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockLt = vi.fn(() => ({ order: mockOrder }));
      const mockGte = vi.fn(() => ({ lt: mockLt }));
      const mockIs = vi.fn(() => ({ gte: mockGte }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getTodayInstallations('access-token', 'user-123');

      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
    });

    it('should exclude archived', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockLt = vi.fn(() => ({ order: mockOrder }));
      const mockGte = vi.fn(() => ({ lt: mockLt }));
      const mockIs = vi.fn(() => ({ gte: mockGte }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getTodayInstallations('access-token', 'user-123');

      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should return empty array on error', async () => {
      const mockError = { message: 'Database error' };
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockLt = vi.fn(() => ({ order: mockOrder }));
      const mockGte = vi.fn(() => ({ lt: mockLt }));
      const mockIs = vi.fn(() => ({ gte: mockGte }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getTodayInstallations('access-token', 'user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching today installations:', mockError);
    });
  });

  describe('getUpcomingInstallations', () => {
    it('should return future installations', async () => {
      const mockInstallations = [
        { ...mockInstallation, id: 'install-1', status: 'pending' as const },
        { ...mockInstallation, id: 'install-2', status: 'in_progress' as const }
      ];

      const mockLimit = vi.fn().mockResolvedValue({ data: mockInstallations, error: null });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockGte = vi.fn(() => ({ order: mockOrder }));
      const mockIn = vi.fn(() => ({ gte: mockGte }));
      const mockIs = vi.fn(() => ({ in: mockIn }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getUpcomingInstallations('access-token', 'user-123');

      expect(result).toEqual(mockInstallations);
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
      expect(mockIn).toHaveBeenCalledWith('status', ['pending', 'in_progress']);
      expect(mockOrder).toHaveBeenCalledWith('scheduled_date', { ascending: true });
    });

    it('should respect limit', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockGte = vi.fn(() => ({ order: mockOrder }));
      const mockIn = vi.fn(() => ({ gte: mockGte }));
      const mockIs = vi.fn(() => ({ in: mockIn }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getUpcomingInstallations('access-token', 'user-123', 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should use default limit', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockGte = vi.fn(() => ({ order: mockOrder }));
      const mockIn = vi.fn(() => ({ gte: mockGte }));
      const mockIs = vi.fn(() => ({ in: mockIn }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getUpcomingInstallations('access-token', 'user-123');

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should exclude archived', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockGte = vi.fn(() => ({ order: mockOrder }));
      const mockIn = vi.fn(() => ({ gte: mockGte }));
      const mockIs = vi.fn(() => ({ in: mockIn }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getUpcomingInstallations('access-token', 'user-123');

      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should return empty array on error', async () => {
      const mockError = { message: 'Database error' };
      const mockLimit = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockOrder = vi.fn(() => ({ limit: mockLimit }));
      const mockGte = vi.fn(() => ({ order: mockOrder }));
      const mockIn = vi.fn(() => ({ gte: mockGte }));
      const mockIs = vi.fn(() => ({ in: mockIn }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getUpcomingInstallations('access-token', 'user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching upcoming installations:',
        mockError
      );
    });
  });

  describe('getMyInstallations', () => {
    it('should return all installations', async () => {
      const mockInstallations = [
        { ...mockInstallation, id: 'install-1' },
        { ...mockInstallation, id: 'install-2' }
      ];

      const mockQuery = {
        data: mockInstallations,
        error: null
      };
      const mockOrder = vi.fn().mockResolvedValue(mockQuery);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyInstallations('access-token', 'user-123');

      expect(result).toEqual(mockInstallations);
      expect(mockEq).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
      expect(mockOrder).toHaveBeenCalledWith('scheduled_date', {
        ascending: false,
        nullsFirst: false
      });
    });

    it('should filter by status', async () => {
      const mockEqStatus = vi.fn();
      const mockResult = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockResult);
      const mockIs = vi.fn(() => ({ eq: mockEqStatus, order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      mockEqStatus.mockReturnValue({ order: mockOrder });

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallations('access-token', 'user-123', { status: 'pending' });

      expect(mockEqStatus).toHaveBeenCalledWith('status', 'pending');
    });

    it('should filter by dateFrom', async () => {
      const mockGte = vi.fn();
      const mockResult = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockResult);
      const mockIs = vi.fn(() => ({ gte: mockGte, order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      mockGte.mockReturnValue({ order: mockOrder });

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallations('access-token', 'user-123', { dateFrom: '2024-01-01' });

      expect(mockGte).toHaveBeenCalledWith('scheduled_date', '2024-01-01');
    });

    it('should filter by dateTo', async () => {
      const mockLte = vi.fn();
      const mockResult = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockResult);
      const mockIs = vi.fn(() => ({ lte: mockLte, order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      mockLte.mockReturnValue({ order: mockOrder });

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallations('access-token', 'user-123', { dateTo: '2024-12-31' });

      expect(mockLte).toHaveBeenCalledWith('scheduled_date', '2024-12-31');
    });

    it('should combine filters', async () => {
      const mockEqStatus = vi.fn();
      const mockGte = vi.fn();
      const mockLte = vi.fn();
      const mockResult = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockResult);
      const mockIs = vi.fn(() => ({
        eq: mockEqStatus,
        gte: mockGte,
        lte: mockLte,
        order: mockOrder
      }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      mockEqStatus.mockReturnValue({ gte: mockGte });
      mockGte.mockReturnValue({ lte: mockLte });
      mockLte.mockReturnValue({ order: mockOrder });

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallations('access-token', 'user-123', {
        status: 'pending',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      expect(mockEqStatus).toHaveBeenCalledWith('status', 'pending');
      expect(mockGte).toHaveBeenCalledWith('scheduled_date', '2024-01-01');
      expect(mockLte).toHaveBeenCalledWith('scheduled_date', '2024-12-31');
    });

    it('should order by scheduled_date descending', async () => {
      const mockResult = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn(() => mockResult);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallations('access-token', 'user-123');

      expect(mockOrder).toHaveBeenCalledWith('scheduled_date', {
        ascending: false,
        nullsFirst: false
      });
    });

    it('should return empty array on error', async () => {
      const mockError = { message: 'Database error' };
      const mockQuery = { data: null, error: mockError };
      const mockOrder = vi.fn().mockResolvedValue(mockQuery);
      const mockIs = vi.fn(() => ({ order: mockOrder }));
      const mockEq = vi.fn(() => ({ is: mockIs }));
      const mockSelect = vi.fn(() => ({ eq: mockEq }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyInstallations('access-token', 'user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error fetching my installations:', mockError);
    });
  });

  describe('getMyInstallationById', () => {
    it('should return installation if assigned', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockInstallation, error: null });
      const mockIs = vi.fn(() => ({ single: mockSingle }));
      const mockEqInstaller = vi.fn(() => ({ is: mockIs }));
      const mockEqId = vi.fn(() => ({ eq: mockEqInstaller }));
      const mockSelect = vi.fn(() => ({ eq: mockEqId }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyInstallationById('access-token', 'user-123', 'install-123');

      expect(result).toEqual(mockInstallation);
      expect(mockEqId).toHaveBeenCalledWith('id', 'install-123');
      expect(mockEqInstaller).toHaveBeenCalledWith('assigned_to', 'user-123');
      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });

    it('should return null if not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockIs = vi.fn(() => ({ single: mockSingle }));
      const mockEqInstaller = vi.fn(() => ({ is: mockIs }));
      const mockEqId = vi.fn(() => ({ eq: mockEqInstaller }));
      const mockSelect = vi.fn(() => ({ eq: mockEqId }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyInstallationById('access-token', 'user-123', 'install-123');

      expect(result).toBeNull();
    });

    it('should return null on other errors', async () => {
      const mockError = { code: 'OTHER_ERROR', message: 'Database error' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockIs = vi.fn(() => ({ single: mockSingle }));
      const mockEqInstaller = vi.fn(() => ({ is: mockIs }));
      const mockEqId = vi.fn(() => ({ eq: mockEqInstaller }));
      const mockSelect = vi.fn(() => ({ eq: mockEqId }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      const result = await getMyInstallationById('access-token', 'user-123', 'install-123');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error fetching installation by ID:', mockError);
    });

    it('should exclude archived', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockInstallation, error: null });
      const mockIs = vi.fn(() => ({ single: mockSingle }));
      const mockEqInstaller = vi.fn(() => ({ is: mockIs }));
      const mockEqId = vi.fn(() => ({ eq: mockEqInstaller }));
      const mockSelect = vi.fn(() => ({ eq: mockEqId }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));

      const mockClient = { from: mockFrom };

      vi.mocked(createServerClient).mockReturnValue(
        mockClient as unknown as ReturnType<typeof createServerClient>
      );

      await getMyInstallationById('access-token', 'user-123', 'install-123');

      expect(mockIs).toHaveBeenCalledWith('archived_at', null);
    });
  });
});

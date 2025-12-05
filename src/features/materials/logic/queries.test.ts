import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMaterialsByInstallation } from './queries';

vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn()
}));

describe('getMaterialsByInstallation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return materials ordered by created_at', async () => {
    const mockMaterials = [
      {
        id: 'mat-1',
        description: 'Material 1',
        installation_id: 'install-123',
        created_at: '2024-01-01'
      },
      {
        id: 'mat-2',
        description: 'Material 2',
        installation_id: 'install-123',
        created_at: '2024-01-02'
      }
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockMaterials, error: null });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('@/lib/supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await getMaterialsByInstallation('access-token', 'install-123');

    expect(result).toEqual(mockMaterials);
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('installation_id', 'install-123');
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('should return empty array on error', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('@/lib/supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await getMaterialsByInstallation('access-token', 'install-123');

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it('should return empty array if no materials found', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('@/lib/supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await getMaterialsByInstallation('access-token', 'install-123');

    expect(result).toEqual([]);
  });
});

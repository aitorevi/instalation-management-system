import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateInstallationStatus,
  updateInstallationNotes,
  addMaterial,
  deleteMaterial
} from './installer';

vi.mock('../supabase', () => ({
  createServerClient: vi.fn()
}));

describe('updateInstallationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should reject cancelled status', async () => {
    const result = await updateInstallationStatus(
      'access-token',
      'install-123',
      'user-123',
      'cancelled'
    );

    expect(result).toEqual({
      success: false,
      error: 'No tienes permiso para cancelar instalaciones'
    });
  });

  it('should update status successfully', async () => {
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'user-123' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockSelectEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
    const mockFrom = vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate
    }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationStatus(
      'access-token',
      'install-123',
      'user-123',
      'in_progress'
    );

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'in_progress' });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'install-123');
  });

  it('should return error if installation not found', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' }
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationStatus(
      'access-token',
      'install-123',
      'user-123',
      'completed'
    );

    expect(result).toEqual({ success: false, error: 'Instalación no encontrada' });
  });

  it('should return error if user is not assigned', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'other-user' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationStatus(
      'access-token',
      'install-123',
      'user-123',
      'completed'
    );

    expect(result).toEqual({ success: false, error: 'No tienes acceso a esta instalación' });
  });

  it('should return error if update fails', async () => {
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } });
    const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'user-123' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockSelectEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
    const mockFrom = vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate
    }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationStatus(
      'access-token',
      'install-123',
      'user-123',
      'completed'
    );

    expect(result).toEqual({ success: false, error: 'Update failed' });
  });
});

describe('updateInstallationNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should update notes successfully', async () => {
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }));
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'user-123' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockSelectEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
    const mockFrom = vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate
    }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationNotes(
      'access-token',
      'install-123',
      'user-123',
      'Test notes'
    );

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({ notes: 'Test notes' });
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'install-123');
  });

  it('should return error if user is not assigned', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'other-user' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await updateInstallationNotes(
      'access-token',
      'install-123',
      'user-123',
      'Notes'
    );

    expect(result).toEqual({ success: false, error: 'No tienes acceso a esta instalación' });
  });
});

describe('addMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should add material successfully', async () => {
    const mockMaterial = {
      id: 'mat-123',
      description: 'Test material',
      installation_id: 'install-123',
      created_at: '2024-01-01'
    };
    const mockSingle = vi.fn().mockResolvedValue({ data: mockMaterial, error: null });
    const mockSelect = vi.fn(() => ({ single: mockSingle }));
    const mockInsert = vi.fn(() => ({ select: mockSelect }));
    const mockSingle2 = vi.fn().mockResolvedValue({
      data: { assigned_to: 'user-123' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle2 }));
    const mockEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect2 = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn((table: string) => {
      if (table === 'materials') {
        return { insert: mockInsert };
      }
      if (table === 'installations') {
        return { select: mockSelect2 };
      }
      return {};
    });

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await addMaterial('access-token', 'install-123', 'user-123', 'Test material');

    expect(result).toEqual({ success: true, data: mockMaterial });
    expect(mockInsert).toHaveBeenCalledWith({
      installation_id: 'install-123',
      description: 'Test material'
    });
  });

  it('should return error if user is not assigned', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { assigned_to: 'other-user' },
      error: null
    });
    const mockIs = vi.fn(() => ({ single: mockSingle }));
    const mockEq = vi.fn(() => ({ is: mockIs }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await addMaterial('access-token', 'install-123', 'user-123', 'Material');

    expect(result).toEqual({ success: false, error: 'No tienes acceso a esta instalación' });
  });
});

describe('deleteMaterial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should delete material successfully', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'mat-123',
        installation: { assigned_to: 'user-123' }
      },
      error: null
    });
    const mockEq2 = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq2 }));
    const mockFrom = vi.fn((table: string) => {
      if (table === 'materials') {
        return {
          select: mockSelect,
          delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }))
        };
      }
      return {};
    });

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await deleteMaterial('access-token', 'mat-123', 'user-123');

    expect(result).toEqual({ success: true });
  });

  it('should return error if user is not assigned to installation', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'mat-123',
        installation: { assigned_to: 'other-user' }
      },
      error: null
    });
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    const { createServerClient } = await import('../supabase');
    (createServerClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom
    });

    const result = await deleteMaterial('access-token', 'mat-123', 'user-123');

    expect(result).toEqual({ success: false, error: 'No tienes acceso a este material' });
  });
});

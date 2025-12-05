import { createServerClient } from '@/lib/supabase';
import type { Tables } from '@types/database';
import type { Database } from '@types/database';

export type Installation = Tables<'installations'>;

export interface InstallerStats {
  pending: number;
  inProgress: number;
  completed: number;
  todayCount: number;
}

/**
 * Get statistics for the logged-in installer.
 * Calculates counts for pending, in_progress, completed installations,
 * and installations scheduled for today.
 *
 * @param accessToken - User access token for RLS
 * @param userId - Installer user ID
 * @returns Statistics object with counts
 */
export async function getMyStats(accessToken: string, userId: string): Promise<InstallerStats> {
  try {
    const client = createServerClient(accessToken);

    const { data, error } = await client
      .from('installations')
      .select('status, scheduled_date')
      .eq('assigned_to', userId)
      .is('archived_at', null);

    if (error) {
      console.error('Error fetching installer stats:', error);
      return { pending: 0, inProgress: 0, completed: 0, todayCount: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const stats: InstallerStats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      todayCount: 0
    };

    data?.forEach((installation) => {
      switch (installation.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
      }

      if (installation.scheduled_date) {
        const scheduledDate = installation.scheduled_date.split('T')[0];
        if (scheduledDate === todayStr) {
          stats.todayCount++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Unexpected error in getMyStats:', error);
    return { pending: 0, inProgress: 0, completed: 0, todayCount: 0 };
  }
}

/**
 * Get installations scheduled for today for the logged-in installer.
 * Returns installations ordered by scheduled_date ascending (earliest first).
 *
 * @param accessToken - User access token for RLS
 * @param userId - Installer user ID
 * @returns Array of today's installations
 */
export async function getTodayInstallations(
  accessToken: string,
  userId: string
): Promise<Installation[]> {
  try {
    const client = createServerClient(accessToken);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = tomorrow.toISOString().split('T')[0];

    const { data, error } = await client
      .from('installations')
      .select('*')
      .eq('assigned_to', userId)
      .is('archived_at', null)
      .gte('scheduled_date', todayStart)
      .lt('scheduled_date', tomorrowStart)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching today installations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getTodayInstallations:', error);
    return [];
  }
}

/**
 * Get upcoming installations for the logged-in installer.
 * Returns future installations with status pending or in_progress,
 * ordered by scheduled_date ascending (earliest first), then by created_at descending.
 * Includes installations without scheduled_date.
 *
 * @param accessToken - User access token for RLS
 * @param userId - Installer user ID
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of upcoming installations
 */
export async function getUpcomingInstallations(
  accessToken: string,
  userId: string,
  limit: number = 5
): Promise<Installation[]> {
  try {
    const client = createServerClient(accessToken);

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await client
      .from('installations')
      .select('*')
      .eq('assigned_to', userId)
      .is('archived_at', null)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming installations:', error);
      return [];
    }

    const filtered = (data || []).filter((installation) => {
      if (!installation.scheduled_date) return true;
      const scheduledDate = installation.scheduled_date.split('T')[0];
      return scheduledDate >= tomorrowStr;
    });

    const sorted = filtered.sort((a, b) => {
      if (a.scheduled_date && !b.scheduled_date) return -1;
      if (!a.scheduled_date && b.scheduled_date) return 1;
      if (a.scheduled_date && b.scheduled_date) {
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Unexpected error in getUpcomingInstallations:', error);
    return [];
  }
}

/**
 * Get all installations for the logged-in installer with optional filters.
 * Returns installations ordered by scheduled_date descending (most recent first).
 *
 * @param accessToken - User access token for RLS
 * @param userId - Installer user ID
 * @param filters - Optional filters (status, dateFrom, dateTo)
 * @returns Array of installations
 */
export async function getMyInstallations(
  accessToken: string,
  userId: string,
  filters?: {
    status?: Database['public']['Enums']['installation_status'];
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Installation[]> {
  try {
    const client = createServerClient(accessToken);

    let query = client
      .from('installations')
      .select('*')
      .eq('assigned_to', userId)
      .is('archived_at', null);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('scheduled_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('scheduled_date', filters.dateTo);
    }

    query = query.order('scheduled_date', { ascending: false, nullsFirst: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching my installations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getMyInstallations:', error);
    return [];
  }
}

/**
 * Get a single installation by ID for the logged-in installer.
 * Returns installation only if assigned to the installer.
 *
 * @param accessToken - User access token for RLS
 * @param userId - Installer user ID
 * @param installationId - Installation ID
 * @returns Installation or null if not found or not assigned to installer
 */
export async function getMyInstallationById(
  accessToken: string,
  userId: string,
  installationId: string
): Promise<Installation | null> {
  try {
    const client = createServerClient(accessToken);

    const { data, error } = await client
      .from('installations')
      .select('*')
      .eq('id', installationId)
      .eq('assigned_to', userId)
      .is('archived_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching installation by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getMyInstallationById:', error);
    return null;
  }
}

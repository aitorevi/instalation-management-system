import { supabase, createServerClient } from '@/lib/supabase';
import type { Tables } from '@types/database';
import type { InstallationFilters } from '@types/index';

export type Installation = Tables<'installations'>;

export interface InstallationStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface InstallationWithInstaller extends Installation {
  installer: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

export async function getInstallationStats(accessToken: string): Promise<InstallationStats> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select('status', { count: 'exact' })
    .is('archived_at', null);

  if (error) {
    throw new Error(`Failed to fetch installation stats: ${error.message}`);
  }

  const stats: InstallationStats = {
    total: data?.length || 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
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
      case 'cancelled':
        stats.cancelled++;
        break;
    }
  });

  return stats;
}

export async function getUpcomingInstallations(
  accessToken: string,
  limit: number = 5
): Promise<InstallationWithInstaller[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select(
      `
      *,
      installer:assigned_to (
        id,
        full_name,
        email
      )
    `
    )
    .is('archived_at', null)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch upcoming installations: ${error.message}`);
  }

  const sorted = (data || []).sort((a, b) => {
    if (a.scheduled_date && !b.scheduled_date) return -1;
    if (!a.scheduled_date && b.scheduled_date) return 1;
    if (a.scheduled_date && b.scheduled_date) {
      return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sorted as InstallationWithInstaller[];
}

export async function getInstallations(
  accessToken: string,
  filters?: InstallationFilters & { includeArchived?: boolean }
): Promise<InstallationWithInstaller[]> {
  const client = accessToken ? createServerClient(accessToken) : supabase;

  let query = client.from('installations').select(
    `
      *,
      installer:assigned_to (
        id,
        full_name,
        email
      )
    `
  );

  if (!filters?.includeArchived) {
    query = query.is('archived_at', null);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.installerId) {
    query = query.eq('assigned_to', filters.installerId);
  }

  if (filters?.dateFrom) {
    query = query.gte('scheduled_date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('scheduled_date', filters.dateTo);
  }

  if (filters?.search) {
    query = query.or(
      `client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
    );
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch installations: ${error.message}`);
  }

  return (data || []) as InstallationWithInstaller[];
}

export async function getInstallationById(
  accessToken: string,
  id: string
): Promise<InstallationWithInstaller | null> {
  const client = accessToken ? createServerClient(accessToken) : supabase;

  const { data, error } = await client
    .from('installations')
    .select(
      `
      *,
      installer:assigned_to (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch installation: ${error.message}`);
  }

  return data as InstallationWithInstaller;
}

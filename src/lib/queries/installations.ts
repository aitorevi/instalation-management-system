import { supabase } from '../supabase';
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

export async function getInstallationStats(): Promise<InstallationStats> {
  const { data, error } = await supabase
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
  limit: number = 5
): Promise<InstallationWithInstaller[]> {
  const { data, error } = await supabase
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
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch upcoming installations: ${error.message}`);
  }

  return (data || []) as InstallationWithInstaller[];
}

export async function getInstallations(
  filters?: InstallationFilters
): Promise<InstallationWithInstaller[]> {
  let query = supabase
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
    .is('archived_at', null);

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

export async function getInstallationById(id: string): Promise<InstallationWithInstaller | null> {
  const { data, error } = await supabase
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

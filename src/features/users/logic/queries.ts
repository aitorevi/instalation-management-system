import { supabase, createServerClient } from '@/lib/supabase';
import type { Tables } from '@types/database';
import type { Installation } from '@/lib/supabase';

export type User = Tables<'users'>;

export interface InstallerStats {
  id: string;
  full_name: string;
  email: string;
  activeInstallations: number;
  completedInstallations: number;
}

export async function getInstallers(accessToken?: string): Promise<User[]> {
  const client = accessToken ? createServerClient(accessToken) : supabase;

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('role', 'installer')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch installers: ${error.message}`);
  }

  return data || [];
}

export async function getInstallerStats(): Promise<InstallerStats[]> {
  const { data: installers, error: installersError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('role', 'installer')
    .order('full_name', { ascending: true });

  if (installersError) {
    throw new Error(`Failed to fetch installers: ${installersError.message}`);
  }

  const stats: InstallerStats[] = [];

  for (const installer of installers || []) {
    const [activeResult, completedResult] = await Promise.all([
      supabase
        .from('installations')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', installer.id)
        .in('status', ['pending', 'in_progress'])
        .is('archived_at', null),
      supabase
        .from('installations')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', installer.id)
        .eq('status', 'completed')
        .is('archived_at', null)
    ]);

    stats.push({
      id: installer.id,
      full_name: installer.full_name,
      email: installer.email,
      activeInstallations: activeResult.count || 0,
      completedInstallations: completedResult.count || 0
    });
  }

  return stats;
}

/**
 * Gets user by ID with RLS context
 * @param accessToken - User's access token for RLS context
 * @param id - User ID to fetch
 * @returns User or null if not found
 */
export async function getUserById(accessToken: string, id: string): Promise<User | null> {
  const client = createServerClient(accessToken);
  const { data, error } = await client.from('users').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data;
}

export async function getUsersCount(): Promise<{ admins: number; installers: number }> {
  const [adminsResult, installersResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'installer')
  ]);

  if (adminsResult.error) {
    throw new Error(`Failed to fetch admins count: ${adminsResult.error.message}`);
  }

  if (installersResult.error) {
    throw new Error(`Failed to fetch installers count: ${installersResult.error.message}`);
  }

  return {
    admins: adminsResult.count || 0,
    installers: installersResult.count || 0
  };
}

/**
 * Gets all users (admins and installers) ordered by creation date
 * Requires admin access token - RLS will filter based on user role
 * @param accessToken - Admin's access token
 * @returns Array of all users (or only own user if not admin, per RLS)
 */
export async function getAllUsers(accessToken: string): Promise<User[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export interface InstallerStatsResult {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

/**
 * Gets installation statistics for a specific installer
 * Calculates counts by status, excluding archived installations
 * @param accessToken - User's access token
 * @param installerId - Installer user ID
 * @returns Stats object with counts by status
 */
export async function getSingleInstallerStats(
  accessToken: string,
  installerId: string
): Promise<InstallerStatsResult> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select('status')
    .eq('assigned_to', installerId)
    .is('archived_at', null);

  if (error) {
    console.error('Error fetching installer stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  }

  const installations = data || [];

  return {
    total: installations.length,
    pending: installations.filter((i) => i.status === 'pending').length,
    inProgress: installations.filter((i) => i.status === 'in_progress').length,
    completed: installations.filter((i) => i.status === 'completed').length
  };
}

/**
 * Gets installations assigned to a specific installer
 * Excludes archived installations, ordered by scheduled date
 * @param accessToken - User's access token
 * @param installerId - Installer user ID
 * @param limit - Optional limit on number of results
 * @returns Array of installations assigned to the installer
 */
export async function getInstallerInstallations(
  accessToken: string,
  installerId: string,
  limit?: number
): Promise<Installation[]> {
  const client = createServerClient(accessToken);

  let query = client
    .from('installations')
    .select('*')
    .eq('assigned_to', installerId)
    .is('archived_at', null)
    .order('scheduled_date', { ascending: false, nullsFirst: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching installer installations:', error);
    return [];
  }

  return data || [];
}

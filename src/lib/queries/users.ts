import { supabase } from '../supabase';
import type { Tables } from '@types/database';

export type User = Tables<'users'>;

export interface InstallerStats {
  id: string;
  full_name: string;
  email: string;
  activeInstallations: number;
  completedInstallations: number;
}

export async function getInstallers(): Promise<User[]> {
  const { data, error } = await supabase
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

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

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

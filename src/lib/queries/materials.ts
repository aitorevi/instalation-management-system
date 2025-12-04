import { createServerClient } from '../supabase';
import type { Tables } from '@types/database';

export type Material = Tables<'materials'>;

/**
 * Get all materials for an installation
 * Returns materials ordered by created_at ascending
 */
export async function getMaterialsByInstallation(
  accessToken: string,
  installationId: string
): Promise<Material[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('materials')
    .select('*')
    .eq('installation_id', installationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }

  return data;
}

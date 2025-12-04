import { createServerClient } from '../supabase';
import type { Installation } from '../supabase';

export async function getMyInstallationById(
  accessToken: string,
  userId: string,
  installationId: string
): Promise<Installation | null> {
  const supabase = createServerClient(accessToken);

  const { data, error } = await supabase
    .from('installations')
    .select('*')
    .eq('id', installationId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    console.error('Error fetching installation:', error);
    return null;
  }

  if (data.assigned_to !== userId) {
    console.error('Installation not assigned to user');
    return null;
  }

  return data;
}

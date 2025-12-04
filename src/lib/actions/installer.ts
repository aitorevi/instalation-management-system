import { createServerClient } from '../supabase';
import type { Database } from '@types/database';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

type InstallationStatus = Database['public']['Enums']['installation_status'];

/**
 * Update installation status
 * Installers can only change to: pending, in_progress, completed
 * Cannot change to 'cancelled' (admin only)
 */
export async function updateInstallationStatus(
  accessToken: string,
  installationId: string,
  userId: string,
  status: InstallationStatus
): Promise<ActionResult> {
  if (status === 'cancelled') {
    return { success: false, error: 'No tienes permiso para cancelar instalaciones' };
  }

  const client = createServerClient(accessToken);

  const { data: installation, error: fetchError } = await client
    .from('installations')
    .select('assigned_to')
    .eq('id', installationId)
    .is('archived_at', null)
    .single();

  if (fetchError || !installation) {
    console.error('Error fetching installation:', fetchError);
    return { success: false, error: 'Instalación no encontrada' };
  }

  if (installation.assigned_to !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { error: updateError } = await client
    .from('installations')
    .update({ status })
    .eq('id', installationId);

  if (updateError) {
    console.error('Error updating status:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Update installation notes
 */
export async function updateInstallationNotes(
  accessToken: string,
  installationId: string,
  userId: string,
  notes: string | null
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { data: installation, error: fetchError } = await client
    .from('installations')
    .select('assigned_to')
    .eq('id', installationId)
    .is('archived_at', null)
    .single();

  if (fetchError || !installation) {
    console.error('Error fetching installation:', fetchError);
    return { success: false, error: 'Instalación no encontrada' };
  }

  if (installation.assigned_to !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { error: updateError } = await client
    .from('installations')
    .update({ notes })
    .eq('id', installationId);

  if (updateError) {
    console.error('Error updating notes:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Add material to installation
 */
export async function addMaterial(
  accessToken: string,
  installationId: string,
  userId: string,
  description: string
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { data: installation, error: fetchError } = await client
    .from('installations')
    .select('assigned_to')
    .eq('id', installationId)
    .is('archived_at', null)
    .single();

  if (fetchError || !installation) {
    console.error('Error fetching installation:', fetchError);
    return { success: false, error: 'Instalación no encontrada' };
  }

  if (installation.assigned_to !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { data: material, error: insertError } = await client
    .from('materials')
    .insert({ installation_id: installationId, description })
    .select()
    .single();

  if (insertError) {
    console.error('Error adding material:', insertError);
    return { success: false, error: insertError.message };
  }

  return { success: true, data: material };
}

/**
 * Delete material
 */
export async function deleteMaterial(
  accessToken: string,
  materialId: string,
  userId: string
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { data: material, error: fetchError } = await client
    .from('materials')
    .select(
      `
      id,
      installation:installations!inner (
        assigned_to
      )
    `
    )
    .eq('id', materialId)
    .single();

  if (fetchError || !material) {
    console.error('Error fetching material:', fetchError);
    return { success: false, error: 'Material no encontrado' };
  }

  const installation = material.installation as { assigned_to: string | null };
  if (installation.assigned_to !== userId) {
    return { success: false, error: 'No tienes acceso a este material' };
  }

  const { error: deleteError } = await client.from('materials').delete().eq('id', materialId);

  if (deleteError) {
    console.error('Error deleting material:', deleteError);
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

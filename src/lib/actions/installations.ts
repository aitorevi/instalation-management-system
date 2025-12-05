import { createServerClient } from '../supabase';
import type { Installation, InstallationInsert, InstallationUpdate } from '../supabase';
import { sendPushNotification } from '../push-server';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: Installation;
}

export async function createInstallation(
  accessToken: string,
  data: InstallationInsert
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { data: installation, error } = await client
    .from('installations')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating installation:', error);
    return { success: false, error: error.message };
  }

  if (installation.installer_id) {
    sendPushNotification(installation.installer_id, {
      title: 'Nueva instalación asignada',
      body: `Se te ha asignado: ${installation.installation_name}`,
      url: `/installer/installations/${installation.id}`,
      data: {
        installationId: installation.id,
        installationName: installation.installation_name
      }
    }).catch((notificationError) => {
      console.error('Failed to send push notification:', notificationError);
    });
  }

  return { success: true, data: installation };
}

export async function updateInstallation(
  accessToken: string,
  id: string,
  data: InstallationUpdate
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { data: oldInstallation } = await client
    .from('installations')
    .select('installer_id')
    .eq('id', id)
    .single();

  const { data: installation, error } = await client
    .from('installations')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating installation:', error);
    return { success: false, error: error.message };
  }

  const oldInstallerId = oldInstallation?.installer_id;
  const newInstallerId = installation.installer_id;

  if (newInstallerId && oldInstallerId !== newInstallerId) {
    sendPushNotification(newInstallerId, {
      title: 'Nueva instalación asignada',
      body: `Se te ha asignado: ${installation.installation_name}`,
      url: `/installer/installations/${installation.id}`,
      data: {
        installationId: installation.id,
        installationName: installation.installation_name
      }
    }).catch((notificationError) => {
      console.error('Failed to send push notification:', notificationError);
    });
  }

  return { success: true, data: installation };
}

export async function archiveInstallation(accessToken: string, id: string): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { error } = await client
    .from('installations')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error archiving installation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function restoreInstallation(accessToken: string, id: string): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { error } = await client.from('installations').update({ archived_at: null }).eq('id', id);

  if (error) {
    console.error('Error restoring installation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

import { createServerClient } from '@/lib/supabase';
import type { User, UserUpdate } from '@/lib/supabase';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: User;
}

/**
 * Validates Spanish phone number format
 * Accepts formats: +34 XXX XXX XXX, +34XXXXXXXXX, 34XXXXXXXXX, XXXXXXXXX
 * Spanish mobile numbers start with 6, 7, or 9
 * @param phone - Phone number to validate
 * @returns true if valid Spanish phone format or null
 */
export function isValidSpanishPhone(phone: string | null): boolean {
  if (phone === null) {
    return true;
  }

  const trimmed = phone.replace(/\s+/g, '');

  const patterns = [
    /^\+34[67][0-9]{8}$/,
    /^34[67][0-9]{8}$/,
    /^[67][0-9]{8}$/,
    /^\+349[0-9]{8}$/,
    /^349[0-9]{8}$/,
    /^9[0-9]{8}$/
  ];

  return patterns.some((pattern) => pattern.test(trimmed));
}

/**
 * Updates user profile information
 * Validates phone number before updating (Spanish format required)
 * Requires admin access token (enforced by RLS)
 * @param accessToken - User's access token (must be admin)
 * @param id - User ID to update
 * @param data - Partial user data to update
 * @returns ActionResult with updated user data or error
 */
export async function updateUser(
  accessToken: string,
  id: string,
  data: UserUpdate
): Promise<ActionResult> {
  if (data.phone_number !== undefined && !isValidSpanishPhone(data.phone_number)) {
    return {
      success: false,
      error: 'Formato de teléfono inválido. Use formato: +34 XXX XXX XXX'
    };
  }

  const client = createServerClient(accessToken);

  const { data: user, error } = await client
    .from('users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: user };
}

/**
 * Changes user role between admin and installer
 * Requires admin access token (enforced by RLS)
 * Admins cannot change their own role (enforced by frontend/RLS)
 * @param accessToken - Admin's access token
 * @param id - User ID to update
 * @param role - New role ('admin' or 'installer')
 * @returns ActionResult indicating success or failure
 */
export async function changeUserRole(
  accessToken: string,
  id: string,
  role: 'admin' | 'installer'
): Promise<Omit<ActionResult, 'data'>> {
  const client = createServerClient(accessToken);

  const { error } = await client.from('users').update({ role }).eq('id', id);

  if (error) {
    console.error('Error changing role:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

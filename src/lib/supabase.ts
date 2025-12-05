import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function createServerClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

export function getSupabaseClient(cookies: {
  // eslint-disable-next-line no-unused-vars
  get: (name: string) => { value: string } | undefined;
}): SupabaseClient<Database> {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (accessToken) {
    return createServerClient(accessToken);
  }

  return supabase;
}

export type { Database };
export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];
export type Installation = Tables['installations']['Row'];
export type Material = Tables['materials']['Row'];
export type PushSubscription = Tables['push_subscriptions']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type InstallationStatus = Database['public']['Enums']['installation_status'];

export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];
export type InstallationInsert = Tables['installations']['Insert'];
export type InstallationUpdate = Tables['installations']['Update'];
export type MaterialInsert = Tables['materials']['Insert'];
export type MaterialUpdate = Tables['materials']['Update'];
export type PushSubscriptionInsert = Tables['push_subscriptions']['Insert'];
export type PushSubscriptionUpdate = Tables['push_subscriptions']['Update'];

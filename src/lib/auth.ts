import { supabase, createServerClient, type User, type UserRole } from './supabase';
import type { AstroCookies } from 'astro';

export interface AuthResult {
  user: User | null;
  error: string | null;
}

export async function getCurrentUser(cookies: AstroCookies): Promise<AuthResult> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    return { user: null, error: 'No session' };
  }

  const client = createServerClient(accessToken);

  const {
    data: { user: authUser },
    error: authError
  } = await client.auth.getUser();

  if (authError || !authUser) {
    if (refreshToken) {
      const { data: refreshData } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (refreshData.session) {
        cookies.set('sb-access-token', refreshData.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        });
        cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30
        });

        const newClient = createServerClient(refreshData.session.access_token);
        const { data: userData } = await newClient
          .from('users')
          .select('*')
          .eq('id', refreshData.user!.id)
          .single();

        return { user: userData, error: null };
      }
    }

    return { user: null, error: 'Invalid session' };
  }

  const { data: userData, error: userError } = await client
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (userError) {
    return { user: null, error: 'User not found in database' };
  }

  return { user: userData, error: null };
}

export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

export function isInstaller(user: User | null): boolean {
  return hasRole(user, 'installer');
}

export function signOut(cookies: AstroCookies): void {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}

export function getGoogleSignInUrl(): string {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const redirectUrl = `${import.meta.env.PUBLIC_APP_URL}/auth/callback`;

  return `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
}

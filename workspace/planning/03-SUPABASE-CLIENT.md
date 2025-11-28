# Fase 03: Supabase Client

## Objetivo

Crear el cliente Supabase configurado y helpers de utilidad para usar en todo el proyecto.

## Pre-requisitos

- Fase 01 y 02 completadas
- `.env` con credenciales reales
- `src/types/database.ts` generado

---

## Paso 1: Crear tipos de entorno

**Archivo:** `src/env.d.ts`

```typescript
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_APP_URL: string;
  readonly PUBLIC_VAPID_PUBLIC_KEY?: string;
  readonly VAPID_PRIVATE_KEY?: string;
  readonly VAPID_SUBJECT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Verificación:** Archivo existe en `src/`

---

## Paso 2: Crear cliente Supabase server-side

**Archivo:** `src/lib/supabase.ts`

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente público (para operaciones que respetan RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Crear cliente con token de sesión del usuario
export function createServerClient(accessToken: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

// Helper para obtener cliente autenticado desde cookies
export function getSupabaseClient(cookies: {
  get: (name: string) => { value: string } | undefined;
}): SupabaseClient<Database> {
  const accessToken = cookies.get('sb-access-token')?.value;

  if (accessToken) {
    return createServerClient(accessToken);
  }

  return supabase;
}

// Tipos exportados para uso en toda la app
export type { Database };
export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];
export type Installation = Tables['installations']['Row'];
export type Material = Tables['materials']['Row'];
export type UserRole = Database['public']['Enums']['user_role'];
export type InstallationStatus = Database['public']['Enums']['installation_status'];

// Tipos para insertar/actualizar
export type UserInsert = Tables['users']['Insert'];
export type UserUpdate = Tables['users']['Update'];
export type InstallationInsert = Tables['installations']['Insert'];
export type InstallationUpdate = Tables['installations']['Update'];
export type MaterialInsert = Tables['materials']['Insert'];
export type MaterialUpdate = Tables['materials']['Update'];
```

**Verificación:** Archivo existe sin errores de TypeScript

---

## Paso 3: Crear helpers de autenticación

**Archivo:** `src/lib/auth.ts`

```typescript
import { supabase, createServerClient, type User, type UserRole } from './supabase';
import type { AstroCookies } from 'astro';

// Resultado de autenticación
export interface AuthResult {
  user: User | null;
  error: string | null;
}

// Obtener usuario actual desde cookies
export async function getCurrentUser(cookies: AstroCookies): Promise<AuthResult> {
  const accessToken = cookies.get('sb-access-token')?.value;
  const refreshToken = cookies.get('sb-refresh-token')?.value;

  if (!accessToken) {
    return { user: null, error: 'No session' };
  }

  const client = createServerClient(accessToken);

  // Verificar sesión válida
  const {
    data: { user: authUser },
    error: authError
  } = await client.auth.getUser();

  if (authError || !authUser) {
    // Intentar refresh si hay refresh token
    if (refreshToken) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (refreshData.session) {
        // Actualizar cookies con nuevos tokens
        cookies.set('sb-access-token', refreshData.session.access_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 días
        });
        cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
          path: '/',
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 días
        });

        // Obtener usuario con nuevo token
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

  // Obtener datos del usuario de nuestra tabla users
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

// Verificar si el usuario tiene un rol específico
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

// Verificar si es admin
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

// Verificar si es installer
export function isInstaller(user: User | null): boolean {
  return hasRole(user, 'installer');
}

// Cerrar sesión
export function signOut(cookies: AstroCookies): void {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
}

// URL para login con Google
export function getGoogleSignInUrl(redirectTo: string): string {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const redirectUrl = `${import.meta.env.PUBLIC_APP_URL}/auth/callback`;

  return `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
}
```

**Verificación:** Archivo existe sin errores de TypeScript

---

## Paso 4: Crear tipos auxiliares

**Archivo:** `src/types/index.ts`

```typescript
// Re-exportar tipos de database
export * from './database';

// Tipos de navegación
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// Tipos de formularios
export interface FormError {
  field: string;
  message: string;
}

export interface FormResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormError[];
}

// Tipos de paginación
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipos de filtros
export interface InstallationFilters {
  status?: string;
  installerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Estado de las instalaciones con labels
export const INSTALLATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'yellow' },
  in_progress: { label: 'En Progreso', color: 'blue' },
  completed: { label: 'Completada', color: 'green' },
  cancelled: { label: 'Cancelada', color: 'red' }
};
```

**Verificación:** Archivo existe y exporta correctamente

---

## Paso 5: Verificar que compila

```bash
npm run dev
```

**Verificación:**

1. No hay errores de TypeScript
2. Consola limpia (pueden haber warnings de Astro, pero no errores)
3. Ctrl+C para detener

---

## Checklist Final Fase 03

- [ ] `src/env.d.ts` con tipos de ImportMetaEnv
- [ ] `src/lib/supabase.ts` con cliente y tipos exportados
- [ ] `src/lib/auth.ts` con helpers de autenticación
- [ ] `src/types/index.ts` con tipos auxiliares
- [ ] `npm run dev` compila sin errores de TypeScript

---

## Siguiente Fase

→ `04-AUTH-GOOGLE.md` - Configurar Google OAuth en Supabase

# Fase 09: Admin Dashboard

## Objetivo

Crear el dashboard de admin con estadísticas reales y lista de próximas instalaciones.

## Pre-requisitos

- Fases 01-08 completadas

---

## Paso 1: Crear helper para queries de instalaciones

**Archivo:** `src/lib/queries/installations.ts`

```typescript
import { createServerClient, type Installation, type InstallationStatus } from '../supabase';

export interface InstallationStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface InstallationWithInstaller extends Installation {
  installer?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

// Obtener estadísticas de instalaciones
export async function getInstallationStats(accessToken: string): Promise<InstallationStats> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select('status')
    .is('archived_at', null);

  if (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
  }

  const stats = {
    total: data.length,
    pending: data.filter((i) => i.status === 'pending').length,
    inProgress: data.filter((i) => i.status === 'in_progress').length,
    completed: data.filter((i) => i.status === 'completed').length,
    cancelled: data.filter((i) => i.status === 'cancelled').length
  };

  return stats;
}

// Obtener próximas instalaciones (pending o in_progress, ordenadas por fecha)
export async function getUpcomingInstallations(
  accessToken: string,
  limit: number = 5
): Promise<InstallationWithInstaller[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select(
      `
      *,
      installer:users!installations_installer_id_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .is('archived_at', null)
    .in('status', ['pending', 'in_progress'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming installations:', error);
    return [];
  }

  return data as InstallationWithInstaller[];
}

// Obtener todas las instalaciones con filtros
export async function getInstallations(
  accessToken: string,
  filters?: {
    status?: InstallationStatus;
    installerId?: string;
    includeArchived?: boolean;
    search?: string;
  }
): Promise<InstallationWithInstaller[]> {
  const client = createServerClient(accessToken);

  let query = client
    .from('installations')
    .select(
      `
      *,
      installer:users!installations_installer_id_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .order('scheduled_at', { ascending: false });

  // Filtro de archivados
  if (!filters?.includeArchived) {
    query = query.is('archived_at', null);
  }

  // Filtro de status
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Filtro de instalador
  if (filters?.installerId) {
    query = query.eq('installer_id', filters.installerId);
  }

  // Búsqueda por nombre/dirección
  if (filters?.search) {
    query = query.or(
      `client_name.ilike.%${filters.search}%,client_address.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching installations:', error);
    return [];
  }

  return data as InstallationWithInstaller[];
}

// Obtener una instalación por ID
export async function getInstallationById(
  accessToken: string,
  id: string
): Promise<InstallationWithInstaller | null> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select(
      `
      *,
      installer:users!installations_installer_id_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching installation:', error);
    return null;
  }

  return data as InstallationWithInstaller;
}
```

**Verificación:** Archivo existe sin errores TypeScript

---

## Paso 2: Crear helper para queries de usuarios

**Archivo:** `src/lib/queries/users.ts`

```typescript
import { createServerClient, type User } from '../supabase';

// Obtener todos los instaladores
export async function getInstallers(accessToken: string): Promise<User[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('role', 'installer')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching installers:', error);
    return [];
  }

  return data;
}

// Obtener count de instaladores
export async function getInstallersCount(accessToken: string): Promise<number> {
  const client = createServerClient(accessToken);

  const { count, error } = await client
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'installer');

  if (error) {
    console.error('Error fetching installers count:', error);
    return 0;
  }

  return count || 0;
}

// Obtener usuario por ID
export async function getUserById(accessToken: string, id: string): Promise<User | null> {
  const client = createServerClient(accessToken);

  const { data, error } = await client.from('users').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}
```

**Verificación:** Archivo existe

---

## Paso 3: Crear componente InstallationCard

**Archivo:** `src/components/installations/InstallationCard.astro`

```astro
---
import StatusBadge from './StatusBadge.astro';
import type { InstallationWithInstaller } from '../../lib/queries/installations';

interface Props {
  installation: InstallationWithInstaller;
  showInstaller?: boolean;
  href?: string;
}

const { installation, showInstaller = true, href } = Astro.props;

// Formatear fecha
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatear cantidad
function formatCurrency(amount: number | null): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

const Tag = href ? 'a' : 'div';
---

<Tag
  href={href}
  class:list={['card block', href && 'hover:shadow-md transition-shadow cursor-pointer']}
>
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1 min-w-0">
      <!-- Cliente -->
      <h3 class="font-medium text-gray-900 truncate">{installation.client_name}</h3>

      <!-- Dirección -->
      <p class="text-sm text-gray-500 mt-1 truncate">{installation.client_address}</p>

      <!-- Fecha programada -->
      <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
        <span>{formatDate(installation.scheduled_at)}</span>
      </div>

      <!-- Instalador -->
      {
        showInstaller && installation.installer && (
          <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{installation.installer.full_name}</span>
          </div>
        )
      }

      {
        showInstaller && !installation.installer && (
          <div class="flex items-center gap-2 mt-1 text-sm text-yellow-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Sin asignar</span>
          </div>
        )
      }
    </div>

    <!-- Status + Payment -->
    <div class="flex flex-col items-end gap-2">
      <StatusBadge status={installation.status} />

      {
        installation.collect_payment && (
          <span class="text-sm font-medium text-green-600">
            {formatCurrency(installation.amount_to_collect)}
          </span>
        )
      }
    </div>
  </div>
</Tag>
```

**Verificación:** Archivo existe

---

## Paso 4: Actualizar dashboard admin con datos reales

**Archivo:** `src/pages/admin/index.astro` (Reemplazar completamente)

```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';
import Button from '../../components/ui/Button.astro';
import InstallationCard from '../../components/installations/InstallationCard.astro';
import EmptyState from '../../components/ui/EmptyState.astro';
import { getInstallationStats, getUpcomingInstallations } from '../../lib/queries/installations';
import { getInstallersCount } from '../../lib/queries/users';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener datos
const stats = await getInstallationStats(accessToken);
const upcomingInstallations = await getUpcomingInstallations(accessToken, 5);
const installersCount = await getInstallersCount(accessToken);
---

<DashboardLayout title="Dashboard" user={user}>
  <!-- Page Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600 mt-1">Bienvenido de nuevo, {user.full_name}</p>
    </div>
    <Button href="/admin/installations/new">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
        ></path>
      </svg>
      Nueva Instalación
    </Button>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Total Instalaciones</p>
          <p class="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
      </div>
    </div>

    <!-- Pendientes -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <svg
            class="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Pendientes</p>
          <p class="text-2xl font-semibold text-gray-900">{stats.pending}</p>
        </div>
      </div>
    </div>

    <!-- Completadas -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Completadas</p>
          <p class="text-2xl font-semibold text-gray-900">{stats.completed}</p>
        </div>
      </div>
    </div>

    <!-- Instaladores -->
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg
            class="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Instaladores</p>
          <p class="text-2xl font-semibold text-gray-900">{installersCount}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Próximas Instalaciones -->
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">Próximas Instalaciones</h2>
      <Button variant="ghost" size="sm" href="/admin/installations">
        Ver todas
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </Button>
    </div>

    {
      upcomingInstallations.length > 0 ? (
        <div class="space-y-4">
          {upcomingInstallations.map((installation) => (
            <InstallationCard
              installation={installation}
              href={`/admin/installations/${installation.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay instalaciones próximas"
          description="Las instalaciones programadas aparecerán aquí."
        >
          <Button href="/admin/installations/new">Nueva Instalación</Button>
        </EmptyState>
      )
    }
  </div>
</DashboardLayout>
```

**Verificación:** Dashboard muestra estadísticas reales

---

## Paso 5: Crear página placeholder para lista de instalaciones

**Archivo:** `src/pages/admin/installations/index.astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';

const user = Astro.locals.user;
---

<DashboardLayout title="Instalaciones" user={user}>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Instalaciones</h1>
    <Button href="/admin/installations/new">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
        ></path>
      </svg>
      Nueva Instalación
    </Button>
  </div>

  <div class="card">
    <p class="text-gray-500">Contenido completo en Fase 10</p>
  </div>
</DashboardLayout>
```

**Verificación:** Página accesible desde navegación

---

## Paso 6: Crear página placeholder para instaladores

**Archivo:** `src/pages/admin/installers/index.astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';

const user = Astro.locals.user;
---

<DashboardLayout title="Instaladores" user={user}>
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Instaladores</h1>
    <Button href="/admin/installers/new">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
        ></path>
      </svg>
      Nuevo Instalador
    </Button>
  </div>

  <div class="card">
    <p class="text-gray-500">Contenido completo en Fase 11</p>
  </div>
</DashboardLayout>
```

**Verificación:** Página accesible desde navegación

---

## Paso 7: Verificar funcionamiento

1. `npm run dev`
2. Login como admin
3. Dashboard debe mostrar:
   - Estadísticas (probablemente 0 si no hay datos)
   - Sección "Próximas Instalaciones" (vacía o con datos)
4. Navegación a "Instalaciones" y "Instaladores" funciona

**Verificación:** Todo funciona correctamente

---

## Checklist Final Fase 09

- [ ] `src/lib/queries/installations.ts` con funciones de query
- [ ] `src/lib/queries/users.ts` con funciones de query
- [ ] `src/components/installations/InstallationCard.astro` creado
- [ ] `src/pages/admin/index.astro` actualizado con datos reales
- [ ] `src/pages/admin/installations/index.astro` placeholder
- [ ] `src/pages/admin/installers/index.astro` placeholder
- [ ] Dashboard muestra estadísticas correctamente
- [ ] Navegación funciona

---

## Siguiente Fase

→ `10-ADMIN-INSTALLATIONS.md` - CRUD completo de instalaciones

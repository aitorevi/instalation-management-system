# Fase 12: Installer Dashboard

## Objetivo

Crear el dashboard del installer con sus instalaciones asignadas y estadísticas.

## Pre-requisitos

- Fases 01-11 completadas

---

## Paso 1: Crear queries específicas para installer

**Archivo:** `src/lib/queries/installer.ts`

```typescript
import { createServerClient, type Installation, type InstallationStatus } from '../supabase';

export interface InstallerStats {
  pending: number;
  inProgress: number;
  completed: number;
  todayCount: number;
}

// Obtener estadísticas del installer actual
export async function getMyStats(accessToken: string, userId: string): Promise<InstallerStats> {
  const client = createServerClient(accessToken);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await client
    .from('installations')
    .select('status, scheduled_at')
    .eq('installer_id', userId)
    .is('archived_at', null);

  if (error || !data) {
    console.error('Error fetching stats:', error);
    return { pending: 0, inProgress: 0, completed: 0, todayCount: 0 };
  }

  const todayInstallations = data.filter((i) => {
    const scheduledDate = new Date(i.scheduled_at);
    return scheduledDate >= today && scheduledDate < tomorrow;
  });

  return {
    pending: data.filter((i) => i.status === 'pending').length,
    inProgress: data.filter((i) => i.status === 'in_progress').length,
    completed: data.filter((i) => i.status === 'completed').length,
    todayCount: todayInstallations.length
  };
}

// Obtener instalaciones de hoy
export async function getTodayInstallations(
  accessToken: string,
  userId: string
): Promise<Installation[]> {
  const client = createServerClient(accessToken);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await client
    .from('installations')
    .select('*')
    .eq('installer_id', userId)
    .is('archived_at', null)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error fetching today installations:', error);
    return [];
  }

  return data;
}

// Obtener próximas instalaciones (futuras)
export async function getUpcomingInstallations(
  accessToken: string,
  userId: string,
  limit: number = 5
): Promise<Installation[]> {
  const client = createServerClient(accessToken);

  const now = new Date().toISOString();

  const { data, error } = await client
    .from('installations')
    .select('*')
    .eq('installer_id', userId)
    .is('archived_at', null)
    .in('status', ['pending', 'in_progress'])
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming installations:', error);
    return [];
  }

  return data;
}

// Obtener mis instalaciones con filtros
export async function getMyInstallations(
  accessToken: string,
  userId: string,
  filters?: {
    status?: InstallationStatus;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Installation[]> {
  const client = createServerClient(accessToken);

  let query = client
    .from('installations')
    .select('*')
    .eq('installer_id', userId)
    .is('archived_at', null)
    .order('scheduled_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte('scheduled_at', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('scheduled_at', filters.dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching my installations:', error);
    return [];
  }

  return data;
}

// Obtener una instalación por ID (solo si está asignada al installer)
export async function getMyInstallationById(
  accessToken: string,
  userId: string,
  installationId: string
): Promise<Installation | null> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select('*')
    .eq('id', installationId)
    .eq('installer_id', userId)
    .is('archived_at', null)
    .single();

  if (error) {
    console.error('Error fetching installation:', error);
    return null;
  }

  return data;
}
```

**Verificación:** Archivo existe sin errores

---

## Paso 2: Crear componente InstallationCardCompact

**Archivo:** `src/components/installations/InstallationCardCompact.astro`

```astro
---
import StatusBadge from './StatusBadge.astro';
import type { Installation } from '../../lib/supabase';

interface Props {
  installation: Installation;
  href?: string;
  showDate?: boolean;
}

const { installation, href, showDate = true } = Astro.props;

// Formatear hora
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Formatear fecha corta
function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

// Formatear cantidad
function formatCurrency(amount: number | null): string {
  if (!amount) return '';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

const Tag = href ? 'a' : 'div';
---

<Tag
  href={href}
  class:list={[
    'flex items-center gap-4 p-4 rounded-lg border border-gray-200 bg-white',
    href && 'hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer'
  ]}
>
  <!-- Hora -->
  <div class="flex-shrink-0 text-center w-16">
    <div class="text-lg font-semibold text-gray-900">{formatTime(installation.scheduled_at)}</div>
    {
      showDate && (
        <div class="text-xs text-gray-500">{formatDateShort(installation.scheduled_at)}</div>
      )
    }
  </div>

  <!-- Separador -->
  <div class="w-px h-12 bg-gray-200"></div>

  <!-- Info -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <h3 class="font-medium text-gray-900 truncate">{installation.client_name}</h3>
      <StatusBadge status={installation.status} size="sm" />
    </div>
    <p class="text-sm text-gray-500 truncate mt-0.5">{installation.client_address}</p>

    <!-- Indicadores -->
    <div class="flex items-center gap-3 mt-2">
      {
        installation.client_phone && (
          <span class="inline-flex items-center gap-1 text-xs text-gray-500">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {installation.client_phone}
          </span>
        )
      }

      {
        installation.collect_payment && installation.amount_to_collect && (
          <span class="inline-flex items-center gap-1 text-xs font-medium text-green-600">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Cobrar {formatCurrency(installation.amount_to_collect)}
          </span>
        )
      }
    </div>
  </div>

  <!-- Arrow (si es link) -->
  {
    href && (
      <svg
        class="w-5 h-5 text-gray-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    )
  }
</Tag>
```

**Verificación:** Archivo existe

---

## Paso 3: Actualizar dashboard del installer

**Archivo:** `src/pages/installer/index.astro` (Reemplazar)

```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';
import InstallationCardCompact from '../../components/installations/InstallationCardCompact.astro';
import EmptyState from '../../components/ui/EmptyState.astro';
import Button from '../../components/ui/Button.astro';
import {
  getMyStats,
  getTodayInstallations,
  getUpcomingInstallations
} from '../../lib/queries/installer';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener datos
const stats = await getMyStats(accessToken, user.id);
const todayInstallations = await getTodayInstallations(accessToken, user.id);
const upcomingInstallations = await getUpcomingInstallations(accessToken, user.id, 5);

// Fecha de hoy formateada
const todayFormatted = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});
---

<DashboardLayout title="Dashboard" user={user}>
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Hola, {user.full_name.split(' ')[0]}</h1>
    <p class="text-gray-600 mt-1 capitalize">{todayFormatted}</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div class="card text-center">
      <div class="text-3xl font-bold text-primary-600">{stats.todayCount}</div>
      <div class="text-sm text-gray-500 mt-1">Hoy</div>
    </div>

    <div class="card text-center">
      <div class="text-3xl font-bold text-yellow-600">{stats.pending}</div>
      <div class="text-sm text-gray-500 mt-1">Pendientes</div>
    </div>

    <div class="card text-center">
      <div class="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
      <div class="text-sm text-gray-500 mt-1">En Progreso</div>
    </div>

    <div class="card text-center">
      <div class="text-3xl font-bold text-green-600">{stats.completed}</div>
      <div class="text-sm text-gray-500 mt-1">Completadas</div>
    </div>
  </div>

  <!-- Instalaciones de hoy -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">
        Instalaciones de Hoy
        {
          todayInstallations.length > 0 && (
            <span class="text-sm font-normal text-gray-500 ml-2">
              ({todayInstallations.length})
            </span>
          )
        }
      </h2>
    </div>

    {
      todayInstallations.length > 0 ? (
        <div class="space-y-3">
          {todayInstallations.map((installation) => (
            <InstallationCardCompact
              installation={installation}
              href={`/installer/installations/${installation.id}`}
              showDate={false}
            />
          ))}
        </div>
      ) : (
        <div class="card bg-gray-50 border-dashed">
          <div class="text-center py-6">
            <svg
              class="w-12 h-12 text-gray-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p class="text-gray-500">No tienes instalaciones programadas para hoy</p>
          </div>
        </div>
      )
    }
  </div>

  <!-- Próximas instalaciones -->
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Próximas Instalaciones</h2>
      <Button variant="ghost" size="sm" href="/installer/installations">
        Ver todas
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </Button>
    </div>

    {
      upcomingInstallations.length > 0 ? (
        <div class="space-y-3">
          {upcomingInstallations.map((installation) => (
            <InstallationCardCompact
              installation={installation}
              href={`/installer/installations/${installation.id}`}
              showDate={true}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay instalaciones próximas"
          description="Las instalaciones asignadas aparecerán aquí."
        />
      )
    }
  </div>
</DashboardLayout>
```

**Verificación:** Dashboard muestra datos del installer

---

## Paso 4: Crear lista de instalaciones del installer

**Archivo:** `src/pages/installer/installations/index.astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Select from '../../../components/ui/Select.astro';
import Button from '../../../components/ui/Button.astro';
import InstallationCardCompact from '../../../components/installations/InstallationCardCompact.astro';
import EmptyState from '../../../components/ui/EmptyState.astro';
import { getMyInstallations } from '../../../lib/queries/installer';
import type { InstallationStatus } from '../../../lib/supabase';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener filtros de URL
const url = Astro.url;
const statusFilter = url.searchParams.get('status') as InstallationStatus | null;

// Obtener instalaciones
const installations = await getMyInstallations(accessToken, user.id, {
  status: statusFilter || undefined
});

// Opciones de filtro
const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' }
];

// Agrupar por fecha
interface GroupedInstallations {
  [date: string]: typeof installations;
}

function groupByDate(items: typeof installations): GroupedInstallations {
  const groups: GroupedInstallations = {};

  items.forEach((item) => {
    const date = new Date(item.scheduled_at).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });

  return groups;
}

const groupedInstallations = groupByDate(installations);
const dates = Object.keys(groupedInstallations);
---

<DashboardLayout title="Mis Instalaciones" user={user}>
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Mis Instalaciones</h1>
    <p class="text-gray-600 mt-1">
      {installations.length} instalación{installations.length !== 1 ? 'es' : ''}
    </p>
  </div>

  <!-- Filtros -->
  <form method="GET" class="flex flex-wrap items-end gap-4 mb-6">
    <div class="w-48">
      <Select name="status" options={statusOptions} value={statusFilter || ''} />
    </div>

    <Button type="submit" size="sm">Filtrar</Button>

    {
      statusFilter && (
        <Button variant="ghost" size="sm" href="/installer/installations">
          Limpiar
        </Button>
      )
    }
  </form>

  <!-- Lista agrupada por fecha -->
  {
    dates.length > 0 ? (
      <div class="space-y-8">
        {dates.map((date) => (
          <div>
            <h2 class="text-sm font-medium text-gray-500 mb-3 capitalize">{date}</h2>
            <div class="space-y-3">
              {groupedInstallations[date].map((installation) => (
                <InstallationCardCompact
                  installation={installation}
                  href={`/installer/installations/${installation.id}`}
                  showDate={false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        title="No tienes instalaciones"
        description="Las instalaciones que te asignen aparecerán aquí."
      />
    )
  }
</DashboardLayout>
```

**Verificación:** Lista accesible en `/installer/installations`

---

## Paso 5: Crear página placeholder de detalle

**Archivo:** `src/pages/installer/installations/[id].astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import { getMyInstallationById } from '../../../lib/queries/installer';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';
const { id } = Astro.params;

// Obtener instalación
const installation = await getMyInstallationById(accessToken, user.id, id!);

if (!installation) {
  return Astro.redirect('/installer/installations');
}
---

<DashboardLayout title={installation.client_name} user={user}>
  <div class="card">
    <h1 class="text-xl font-bold">{installation.client_name}</h1>
    <p class="text-gray-500">Detalle completo en Fase 13</p>
  </div>
</DashboardLayout>
```

**Verificación:** Página placeholder accesible

---

## Paso 6: Probar dashboard installer

### Preparación: Crear datos de prueba

1. Login como admin
2. Crear 2-3 instalaciones
3. Asignar al menos una al installer de prueba
4. Programar una para hoy, otra para mañana

### Test 1: Ver dashboard

1. Login como installer
2. **Esperado:** Ver stats y lista de instalaciones

### Test 2: Ver instalaciones de hoy

1. Si hay instalaciones para hoy, deben aparecer
2. **Esperado:** Mostrar hora sin fecha

### Test 3: Ver próximas instalaciones

1. Instalaciones futuras deben aparecer
2. **Esperado:** Mostrar fecha completa

### Test 4: Ver lista completa

1. Click "Ver todas"
2. **Esperado:** Lista agrupada por fecha

### Test 5: Filtrar por status

1. Seleccionar "En Progreso"
2. Click Filtrar
3. **Esperado:** Solo muestra ese status

**Verificación:** Todos los tests pasan

---

## Checklist Final Fase 12

- [ ] `src/lib/queries/installer.ts` creado con queries
- [ ] `src/components/installations/InstallationCardCompact.astro` creado
- [ ] `src/pages/installer/index.astro` con stats e instalaciones
- [ ] `src/pages/installer/installations/index.astro` con lista filtrable
- [ ] `src/pages/installer/installations/[id].astro` placeholder
- [ ] Stats se calculan correctamente
- [ ] Instalaciones de hoy se muestran
- [ ] Lista agrupada por fecha funciona
- [ ] Filtros funcionan

---

## Siguiente Fase

→ `13-INSTALLER-UPDATE.md` - Actualizar instalaciones (status, notas, materiales)

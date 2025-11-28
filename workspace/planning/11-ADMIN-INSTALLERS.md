# Fase 11: Admin Installers - Gestión de Instaladores

## Objetivo

Implementar la gestión de instaladores para admin: listar, ver perfil, editar, y ver sus instalaciones.

## Pre-requisitos

- Fases 01-10 completadas

---

## Paso 1: Crear acciones de usuarios

**Archivo:** `src/lib/actions/users.ts`

```typescript
import { createServerClient, type UserUpdate } from '../supabase';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Actualizar usuario (admin puede editar cualquier installer)
export async function updateUser(
  accessToken: string,
  id: string,
  data: UserUpdate
): Promise<ActionResult> {
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

// Cambiar rol de usuario
export async function changeUserRole(
  accessToken: string,
  id: string,
  role: 'admin' | 'installer'
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { error } = await client.from('users').update({ role }).eq('id', id);

  if (error) {
    console.error('Error changing role:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Verificación:** Archivo existe

---

## Paso 2: Extender queries de usuarios

**Archivo:** `src/lib/queries/users.ts` (Añadir al final)

```typescript
// Añadir estas funciones al archivo existente:

// Obtener todos los usuarios (admins e installers)
export async function getAllUsers(accessToken: string): Promise<User[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data;
}

// Obtener estadísticas de un instalador
export async function getInstallerStats(
  accessToken: string,
  installerId: string
): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('installations')
    .select('status')
    .eq('installer_id', installerId)
    .is('archived_at', null);

  if (error || !data) {
    return { total: 0, pending: 0, inProgress: 0, completed: 0 };
  }

  return {
    total: data.length,
    pending: data.filter((i) => i.status === 'pending').length,
    inProgress: data.filter((i) => i.status === 'in_progress').length,
    completed: data.filter((i) => i.status === 'completed').length
  };
}

// Obtener instalaciones de un instalador
export async function getInstallerInstallations(
  accessToken: string,
  installerId: string,
  limit?: number
): Promise<Installation[]> {
  const client = createServerClient(accessToken);

  let query = client
    .from('installations')
    .select('*')
    .eq('installer_id', installerId)
    .is('archived_at', null)
    .order('scheduled_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching installer installations:', error);
    return [];
  }

  return data;
}
```

**Importante:** Añadir import de `Installation` al inicio del archivo:

```typescript
import { createServerClient, type User, type Installation } from '../supabase';
```

**Verificación:** Archivo actualizado sin errores

---

## Paso 3: Actualizar lista de instaladores

**Archivo:** `src/pages/admin/installers/index.astro` (Reemplazar)

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';
import Badge from '../../../components/ui/Badge.astro';
import EmptyState from '../../../components/ui/EmptyState.astro';
import { getAllUsers, getInstallerStats } from '../../../lib/queries/users';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener todos los usuarios
const allUsers = await getAllUsers(accessToken);

// Separar por rol
const installers = allUsers.filter((u) => u.role === 'installer');
const admins = allUsers.filter((u) => u.role === 'admin');

// Obtener stats para cada installer
const installersWithStats = await Promise.all(
  installers.map(async (installer) => {
    const stats = await getInstallerStats(accessToken, installer.id);
    return { ...installer, stats };
  })
);

// Formatear fecha
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
---

<DashboardLayout title="Instaladores" user={user}>
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Equipo</h1>
  </div>

  <!-- Info sobre nuevos usuarios -->
  <div class="card mb-6 bg-blue-50 border-blue-200">
    <div class="flex gap-3">
      <svg
        class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div class="text-sm text-blue-800">
        <p class="font-medium">¿Cómo añadir nuevos instaladores?</p>
        <p class="mt-1">
          Los nuevos usuarios se crean automáticamente cuando hacen login con Google. Por defecto
          son "installer". Puedes cambiar su rol desde su perfil.
        </p>
      </div>
    </div>
  </div>

  <!-- Admins -->
  <div class="mb-8">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      Administradores ({admins.length})
    </h2>

    {
      admins.length > 0 ? (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div class="card">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-lg font-semibold text-purple-600">
                    {admin.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-medium text-gray-900 truncate">{admin.full_name}</h3>
                    <Badge variant="purple" size="sm">
                      Admin
                    </Badge>
                  </div>
                  <p class="text-sm text-gray-500 truncate">{admin.email}</p>
                  {admin.id === user.id && <p class="text-xs text-primary-600 mt-1">Tú</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p class="text-gray-500">No hay administradores</p>
      )
    }
  </div>

  <!-- Instaladores -->
  <div>
    <h2 class="text-lg font-semibold text-gray-900 mb-4">
      Instaladores ({installers.length})
    </h2>

    {
      installersWithStats.length > 0 ? (
        <div class="card overflow-hidden p-0">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Instalador
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contacto
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Pendientes
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  En Progreso
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Completadas
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Desde
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {installersWithStats.map((installer) => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="font-medium text-blue-600">
                          {installer.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{installer.full_name}</div>
                        <div class="text-sm text-gray-500">{installer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-600">{installer.phone_number || '-'}</td>
                  <td class="px-4 py-4 text-center">
                    <span
                      class={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        installer.stats.pending > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {installer.stats.pending}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span
                      class={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                        installer.stats.inProgress > 0
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {installer.stats.inProgress}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {installer.stats.completed}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-600">
                    {formatDate(installer.created_at)}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <a
                      href={`/admin/installers/${installer.id}`}
                      class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver perfil
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No hay instaladores"
          description="Los instaladores aparecerán aquí cuando hagan login con Google."
        />
      )
    }
  </div>
</DashboardLayout>
```

**Verificación:** Lista muestra usuarios organizados por rol

---

## Paso 4: Crear página de perfil de instalador

**Archivo:** `src/pages/admin/installers/[id].astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';
import Input from '../../../components/ui/Input.astro';
import Textarea from '../../../components/ui/Textarea.astro';
import Badge from '../../../components/ui/Badge.astro';
import Alert from '../../../components/ui/Alert.astro';
import Modal from '../../../components/ui/Modal.astro';
import StatusBadge from '../../../components/installations/StatusBadge.astro';
import EmptyState from '../../../components/ui/EmptyState.astro';
import {
  getUserById,
  getInstallerStats,
  getInstallerInstallations
} from '../../../lib/queries/users';
import { updateUser, changeUserRole } from '../../../lib/actions/users';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';
const { id } = Astro.params;

// Obtener instalador
let installer = await getUserById(accessToken, id!);

if (!installer) {
  return Astro.redirect('/admin/installers');
}

const stats = await getInstallerStats(accessToken, id!);
const installations = await getInstallerInstallations(accessToken, id!, 10);

let error: string | null = null;
let success: string | null = null;

// Procesar formulario
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const action = formData.get('_action');

  if (action === 'make_admin') {
    const result = await changeUserRole(accessToken, id!, 'admin');
    if (result.success) {
      return Astro.redirect('/admin/installers');
    } else {
      error = result.error || 'Error al cambiar rol';
    }
  } else if (action === 'make_installer') {
    const result = await changeUserRole(accessToken, id!, 'installer');
    if (result.success) {
      installer = await getUserById(accessToken, id!);
      success = 'Rol cambiado a installer';
    } else {
      error = result.error || 'Error al cambiar rol';
    }
  } else {
    // Actualizar perfil
    const data = {
      full_name: formData.get('full_name') as string,
      phone_number: (formData.get('phone_number') as string) || null,
      company_details: (formData.get('company_details') as string) || null
    };

    const result = await updateUser(accessToken, id!, data);

    if (result.success) {
      installer = await getUserById(accessToken, id!);
      success = 'Perfil actualizado correctamente';
    } else {
      error = result.error || 'Error al actualizar';
    }
  }
}

// Formatear fechas
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const isAdmin = installer!.role === 'admin';
const isSelf = installer!.id === user.id;
---

<DashboardLayout title={installer!.full_name} user={user}>
  <!-- Breadcrumb -->
  <nav class="mb-6">
    <ol class="flex items-center gap-2 text-sm text-gray-500">
      <li><a href="/admin" class="hover:text-gray-700">Dashboard</a></li>
      <li>/</li>
      <li><a href="/admin/installers" class="hover:text-gray-700">Equipo</a></li>
      <li>/</li>
      <li class="text-gray-900">{installer!.full_name}</li>
    </ol>
  </nav>

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div class="flex items-center gap-4">
      <div
        class={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold ${
          isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
        }`}
      >
        {installer!.full_name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900">{installer!.full_name}</h1>
          <Badge variant={isAdmin ? 'purple' : 'blue'}>
            {isAdmin ? 'Admin' : 'Installer'}
          </Badge>
          {isSelf && <Badge variant="gray">Tú</Badge>}
        </div>
        <p class="text-gray-500">{installer!.email}</p>
      </div>
    </div>

    {
      !isSelf && (
        <div>
          {isAdmin ? (
            <Button variant="secondary" onclick="openDemoteModal()">
              Cambiar a Installer
            </Button>
          ) : (
            <Button variant="secondary" onclick="openPromoteModal()">
              Promover a Admin
            </Button>
          )}
        </div>
      )
    }
  </div>

  {
    error && (
      <Alert variant="error" title="Error" class="mb-6" dismissible>
        {error}
      </Alert>
    )
  }

  {
    success && (
      <Alert variant="success" title="Éxito" class="mb-6" dismissible>
        {success}
      </Alert>
    )
  }

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna izquierda: Formulario -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Formulario de edición -->
      <form method="POST" class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Información del Perfil</h2>

        <div class="space-y-4">
          <Input name="full_name" label="Nombre Completo" value={installer!.full_name} required />

          <Input
            name="phone_number"
            label="Teléfono"
            type="tel"
            value={installer!.phone_number}
            placeholder="+34 600 000 000"
          />

          <Textarea
            name="company_details"
            label="Detalles de la Empresa"
            value={installer!.company_details}
            placeholder="Información adicional..."
            rows={3}
          />

          <div class="pt-4">
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </div>
      </form>

      <!-- Instalaciones recientes -->
      {
        !isAdmin && (
          <div class="card">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Instalaciones Recientes</h2>
              <a
                href={`/admin/installations?installer=${installer!.id}`}
                class="text-sm text-primary-600 hover:text-primary-700"
              >
                Ver todas
              </a>
            </div>

            {installations.length > 0 ? (
              <div class="space-y-3">
                {installations.map((inst) => (
                  <a
                    href={`/admin/installations/${inst.id}`}
                    class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 -mx-3"
                  >
                    <div>
                      <div class="font-medium text-gray-900">{inst.client_name}</div>
                      <div class="text-sm text-gray-500">{formatDateTime(inst.scheduled_at)}</div>
                    </div>
                    <StatusBadge status={inst.status} size="sm" />
                  </a>
                ))}
              </div>
            ) : (
              <p class="text-gray-500 text-sm">No hay instalaciones asignadas</p>
            )}
          </div>
        )
      }
    </div>

    <!-- Columna derecha: Stats -->
    <div class="space-y-6">
      <!-- Info básica -->
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500 mb-3">Información</h3>

        <dl class="space-y-3">
          <div>
            <dt class="text-xs text-gray-400">Email</dt>
            <dd class="text-sm text-gray-900">{installer!.email}</dd>
          </div>

          {
            installer!.phone_number && (
              <div>
                <dt class="text-xs text-gray-400">Teléfono</dt>
                <dd class="text-sm text-gray-900">{installer!.phone_number}</dd>
              </div>
            )
          }

          <div>
            <dt class="text-xs text-gray-400">Miembro desde</dt>
            <dd class="text-sm text-gray-900">{formatDate(installer!.created_at)}</dd>
          </div>
        </dl>
      </div>

      <!-- Stats de instalaciones (solo para installers) -->
      {
        !isAdmin && (
          <div class="card">
            <h3 class="text-sm font-medium text-gray-500 mb-3">Estadísticas</h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Total asignadas</span>
                <span class="font-semibold text-gray-900">{stats.total}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Pendientes</span>
                <span class="font-semibold text-yellow-600">{stats.pending}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">En progreso</span>
                <span class="font-semibold text-blue-600">{stats.inProgress}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Completadas</span>
                <span class="font-semibold text-green-600">{stats.completed}</span>
              </div>
            </div>
          </div>
        )
      }
    </div>
  </div>

  <!-- Modal promover a admin -->
  <Modal id="promote" title="Promover a Administrador">
    <p class="text-gray-600">
      ¿Estás seguro de que quieres promover a <strong>{installer!.full_name}</strong> a Administrador?
      Tendrá acceso completo al sistema.
    </p>

    <Fragment slot="footer">
      <Button variant="secondary" onclick="closePromoteModal()">Cancelar</Button>
      <form method="POST" class="inline">
        <input type="hidden" name="_action" value="make_admin" />
        <Button type="submit">Promover</Button>
      </form>
    </Fragment>
  </Modal>

  <!-- Modal degradar a installer -->
  <Modal id="demote" title="Cambiar a Installer">
    <p class="text-gray-600">
      ¿Estás seguro de que quieres cambiar a <strong>{installer!.full_name}</strong> a Installer? Perderá
      acceso de administrador.
    </p>

    <Fragment slot="footer">
      <Button variant="secondary" onclick="closeDemoteModal()">Cancelar</Button>
      <form method="POST" class="inline">
        <input type="hidden" name="_action" value="make_installer" />
        <Button type="submit" variant="danger">Cambiar Rol</Button>
      </form>
    </Fragment>
  </Modal>
</DashboardLayout>
```

**Verificación:** Página accesible en `/admin/installers/[id]`

---

## Paso 5: Eliminar página new (no necesaria)

Los instaladores se crean automáticamente cuando hacen login con Google, así que no necesitamos página de creación.

**Acción:** Eliminar `src/pages/admin/installers/new.astro` si existe.

```bash
rm -f src/pages/admin/installers/new.astro
```

**Verificación:** Archivo eliminado

---

## Paso 6: Probar gestión de instaladores

### Test 1: Ver lista de equipo

1. Ir a `/admin/installers`
2. **Esperado:** Ver admins y installers separados

### Test 2: Ver perfil de instalador

1. Click "Ver perfil" en un installer
2. **Esperado:** Ver info, stats e instalaciones recientes

### Test 3: Editar perfil

1. Modificar nombre o teléfono
2. Guardar
3. **Esperado:** Datos actualizados

### Test 4: Promover a admin

1. Click "Promover a Admin" (en otro usuario, no tú mismo)
2. Confirmar
3. **Esperado:** Usuario movido a sección Admins

### Test 5: Degradar a installer

1. En perfil de admin, click "Cambiar a Installer"
2. Confirmar
3. **Esperado:** Usuario movido a sección Installers

**Nota:** No puedes cambiar tu propio rol.

**Verificación:** Todos los tests pasan

---

## Checklist Final Fase 11

- [ ] `src/lib/actions/users.ts` creado
- [ ] `src/lib/queries/users.ts` actualizado con nuevas funciones
- [ ] `src/pages/admin/installers/index.astro` muestra equipo
- [ ] `src/pages/admin/installers/[id].astro` muestra perfil
- [ ] Editar perfil funciona
- [ ] Promover a admin funciona
- [ ] Degradar a installer funciona
- [ ] No se puede cambiar propio rol

---

## Siguiente Fase

→ `12-INSTALLER-DASHBOARD.md` - Dashboard del installer

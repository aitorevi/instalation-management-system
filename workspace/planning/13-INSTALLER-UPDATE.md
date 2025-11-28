# Fase 13: Installer Update - Actualizar Instalaciones

## Objetivo

Permitir al installer actualizar el status de sus instalaciones, añadir notas y gestionar materiales.

## Pre-requisitos

- Fases 01-12 completadas

---

## Paso 1: Crear acciones para installer

**Archivo:** `src/lib/actions/installer.ts`

```typescript
import { createServerClient, type InstallationStatus, type MaterialInsert } from '../supabase';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Actualizar status de instalación (installer NO puede poner 'cancelled')
export async function updateInstallationStatus(
  accessToken: string,
  installationId: string,
  userId: string,
  status: InstallationStatus
): Promise<ActionResult> {
  // Validar que no sea cancelled
  if (status === 'cancelled') {
    return { success: false, error: 'No tienes permiso para cancelar instalaciones' };
  }

  const client = createServerClient(accessToken);

  // Verificar que la instalación pertenece al installer
  const { data: installation } = await client
    .from('installations')
    .select('installer_id')
    .eq('id', installationId)
    .single();

  if (!installation || installation.installer_id !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { error } = await client.from('installations').update({ status }).eq('id', installationId);

  if (error) {
    console.error('Error updating status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Actualizar notas de instalación
export async function updateInstallationNotes(
  accessToken: string,
  installationId: string,
  userId: string,
  notes: string
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  // Verificar propiedad
  const { data: installation } = await client
    .from('installations')
    .select('installer_id')
    .eq('id', installationId)
    .single();

  if (!installation || installation.installer_id !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { error } = await client.from('installations').update({ notes }).eq('id', installationId);

  if (error) {
    console.error('Error updating notes:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Añadir material
export async function addMaterial(
  accessToken: string,
  installationId: string,
  userId: string,
  description: string
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  // Verificar propiedad
  const { data: installation } = await client
    .from('installations')
    .select('installer_id')
    .eq('id', installationId)
    .single();

  if (!installation || installation.installer_id !== userId) {
    return { success: false, error: 'No tienes acceso a esta instalación' };
  }

  const { data: material, error } = await client
    .from('materials')
    .insert({ installation_id: installationId, description })
    .select()
    .single();

  if (error) {
    console.error('Error adding material:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: material };
}

// Eliminar material
export async function deleteMaterial(
  accessToken: string,
  materialId: string,
  userId: string
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  // Verificar que el material pertenece a una instalación del installer
  const { data: material } = await client
    .from('materials')
    .select(
      `
      id,
      installation:installations!inner (
        installer_id
      )
    `
    )
    .eq('id', materialId)
    .single();

  if (!material || (material.installation as any).installer_id !== userId) {
    return { success: false, error: 'No tienes acceso a este material' };
  }

  const { error } = await client.from('materials').delete().eq('id', materialId);

  if (error) {
    console.error('Error deleting material:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Verificación:** Archivo existe sin errores

---

## Paso 2: Crear queries de materiales

**Archivo:** `src/lib/queries/materials.ts`

```typescript
import { createServerClient, type Material } from '../supabase';

// Obtener materiales de una instalación
export async function getMaterialsByInstallation(
  accessToken: string,
  installationId: string
): Promise<Material[]> {
  const client = createServerClient(accessToken);

  const { data, error } = await client
    .from('materials')
    .select('*')
    .eq('installation_id', installationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }

  return data;
}
```

**Verificación:** Archivo existe

---

## Paso 3: Crear componente MaterialsList

**Archivo:** `src/components/installations/MaterialsList.astro`

```astro
---
import Button from '../ui/Button.astro';
import type { Material } from '../../lib/supabase';

interface Props {
  materials: Material[];
  installationId: string;
  editable?: boolean;
}

const { materials, installationId, editable = false } = Astro.props;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
---

<div class="space-y-4">
  {
    editable && (
      <form method="POST" class="flex gap-2">
        <input type="hidden" name="_action" value="add_material" />
        <input
          type="text"
          name="description"
          placeholder="Añadir material utilizado..."
          required
          class="input flex-1"
        />
        <Button type="submit" size="sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Añadir
        </Button>
      </form>
    )
  }

  {
    materials.length > 0 ? (
      <ul class="space-y-2">
        {materials.map((material) => (
          <li class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex-1 min-w-0">
              <p class="text-gray-900">{material.description}</p>
              <p class="text-xs text-gray-500 mt-0.5">{formatDate(material.created_at)}</p>
            </div>

            {editable && (
              <form method="POST" class="ml-4">
                <input type="hidden" name="_action" value="delete_material" />
                <input type="hidden" name="material_id" value={material.id} />
                <button
                  type="submit"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar material"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p class="text-gray-500 text-sm py-4 text-center">No hay materiales registrados</p>
    )
  }
</div>
```

**Verificación:** Archivo existe

---

## Paso 4: Crear página de detalle de instalación (installer)

**Archivo:** `src/pages/installer/installations/[id].astro` (Reemplazar)

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';
import Textarea from '../../../components/ui/Textarea.astro';
import Alert from '../../../components/ui/Alert.astro';
import StatusBadge from '../../../components/installations/StatusBadge.astro';
import MaterialsList from '../../../components/installations/MaterialsList.astro';
import { getMyInstallationById } from '../../../lib/queries/installer';
import { getMaterialsByInstallation } from '../../../lib/queries/materials';
import {
  updateInstallationStatus,
  updateInstallationNotes,
  addMaterial,
  deleteMaterial
} from '../../../lib/actions/installer';
import type { InstallationStatus } from '../../../lib/supabase';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';
const { id } = Astro.params;

// Obtener instalación
let installation = await getMyInstallationById(accessToken, user.id, id!);

if (!installation) {
  return Astro.redirect('/installer/installations');
}

let materials = await getMaterialsByInstallation(accessToken, id!);

let error: string | null = null;
let success: string | null = null;

// Procesar formulario
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const action = formData.get('_action');

  if (action === 'update_status') {
    const status = formData.get('status') as InstallationStatus;
    const result = await updateInstallationStatus(accessToken, id!, user.id, status);

    if (result.success) {
      installation = await getMyInstallationById(accessToken, user.id, id!);
      success = 'Estado actualizado';
    } else {
      error = result.error || 'Error al actualizar estado';
    }
  } else if (action === 'update_notes') {
    const notes = formData.get('notes') as string;
    const result = await updateInstallationNotes(accessToken, id!, user.id, notes);

    if (result.success) {
      installation = await getMyInstallationById(accessToken, user.id, id!);
      success = 'Notas guardadas';
    } else {
      error = result.error || 'Error al guardar notas';
    }
  } else if (action === 'add_material') {
    const description = formData.get('description') as string;
    const result = await addMaterial(accessToken, id!, user.id, description);

    if (result.success) {
      materials = await getMaterialsByInstallation(accessToken, id!);
      success = 'Material añadido';
    } else {
      error = result.error || 'Error al añadir material';
    }
  } else if (action === 'delete_material') {
    const materialId = formData.get('material_id') as string;
    const result = await deleteMaterial(accessToken, materialId, user.id);

    if (result.success) {
      materials = await getMaterialsByInstallation(accessToken, id!);
      success = 'Material eliminado';
    } else {
      error = result.error || 'Error al eliminar material';
    }
  }
}

// Helpers
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount: number | null): string {
  if (!amount) return '-';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Status que el installer puede seleccionar (NO cancelled)
const allowedStatuses: { value: InstallationStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' }
];

const isCompleted = installation!.status === 'completed';
const isCancelled = installation!.status === 'cancelled';
---

<DashboardLayout title={installation!.client_name} user={user}>
  <!-- Breadcrumb -->
  <nav class="mb-6">
    <ol class="flex items-center gap-2 text-sm text-gray-500">
      <li><a href="/installer" class="hover:text-gray-700">Dashboard</a></li>
      <li>/</li>
      <li><a href="/installer/installations" class="hover:text-gray-700">Instalaciones</a></li>
      <li>/</li>
      <li class="text-gray-900">{installation!.client_name}</li>
    </ol>
  </nav>

  {
    error && (
      <Alert variant="error" title="Error" class="mb-6" dismissible>
        {error}
      </Alert>
    )
  }

  {
    success && (
      <Alert variant="success" class="mb-6" dismissible>
        {success}
      </Alert>
    )
  }

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna principal -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Header con status -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-xl font-bold text-gray-900">{installation!.client_name}</h1>
              <StatusBadge status={installation!.status} />
            </div>
            <p class="text-gray-500 mt-1">{installation!.client_address}</p>
          </div>

          {/* Botones de acción rápida */}
          {
            !isCancelled && (
              <div class="flex gap-2">
                {installation!.status === 'pending' && (
                  <form method="POST">
                    <input type="hidden" name="_action" value="update_status" />
                    <input type="hidden" name="status" value="in_progress" />
                    <Button type="submit" size="sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Iniciar
                    </Button>
                  </form>
                )}

                {installation!.status === 'in_progress' && (
                  <form method="POST">
                    <input type="hidden" name="_action" value="update_status" />
                    <input type="hidden" name="status" value="completed" />
                    <Button type="submit" size="sm" class="bg-green-600 hover:bg-green-700">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Completar
                    </Button>
                  </form>
                )}
              </div>
            )
          }
        </div>

        {/* Cambiar status manualmente */}
        {
          !isCancelled && (
            <div class="mt-6 pt-6 border-t border-gray-200">
              <form method="POST" class="flex flex-wrap items-end gap-4">
                <input type="hidden" name="_action" value="update_status" />
                <div>
                  <label class="label">Cambiar estado</label>
                  <select name="status" class="input w-auto">
                    {allowedStatuses.map((s) => (
                      <option value={s.value} selected={installation!.status === s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="secondary" size="sm">
                  Actualizar
                </Button>
              </form>
            </div>
          )
        }

        {
          isCancelled && (
            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-red-600">
                Esta instalación ha sido cancelada por el administrador.
              </p>
            </div>
          )
        }
      </div>

      <!-- Notas -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Notas</h2>

        <form method="POST">
          <input type="hidden" name="_action" value="update_notes" />
          <Textarea
            name="notes"
            value={installation!.notes}
            placeholder="Añade notas sobre la instalación..."
            rows={4}
            disabled={isCancelled}
          />
          {
            !isCancelled && (
              <div class="mt-4">
                <Button type="submit" variant="secondary">
                  Guardar Notas
                </Button>
              </div>
            )
          }
        </form>
      </div>

      <!-- Materiales -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Materiales Utilizados</h2>
        <MaterialsList materials={materials} installationId={id!} editable={!isCancelled} />
      </div>
    </div>

    <!-- Columna lateral -->
    <div class="space-y-6">
      <!-- Fecha y hora -->
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500 mb-3">Programación</h3>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg
              class="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900 capitalize">
              {formatDate(installation!.scheduled_at)}
            </p>
            <p class="text-sm text-gray-500">{formatTime(installation!.scheduled_at)}</p>
          </div>
        </div>
      </div>

      <!-- Contacto del cliente -->
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500 mb-3">Contacto</h3>

        <div class="space-y-3">
          {
            installation!.client_phone && (
              <a
                href={`tel:${installation!.client_phone}`}
                class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span class="text-gray-900">{installation!.client_phone}</span>
              </a>
            )
          }

          {
            installation!.client_email && (
              <a
                href={`mailto:${installation!.client_email}`}
                class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-gray-900 truncate">{installation!.client_email}</span>
              </a>
            )
          }

          {/* Link a Google Maps */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(installation!.client_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-gray-900">Ver en mapa</span>
            <svg
              class="w-4 h-4 text-gray-400 ml-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              ></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Cobro -->
      {
        installation!.collect_payment && (
          <div class="card border-green-200 bg-green-50">
            <h3 class="text-sm font-medium text-green-800 mb-2">Cobro Requerido</h3>
            <p class="text-2xl font-bold text-green-700">
              {formatCurrency(installation!.amount_to_collect)}
            </p>
          </div>
        )
      }
    </div>
  </div>
</DashboardLayout>
```

**Verificación:** Página completa accesible

---

## Paso 5: Probar funcionalidades del installer

### Test 1: Ver detalle de instalación

1. Login como installer
2. Ir a una instalación asignada
3. **Esperado:** Ver todos los detalles, contacto, mapa

### Test 2: Cambiar status a "En Progreso"

1. En instalación pendiente, click "Iniciar"
2. **Esperado:** Status cambia a "En Progreso"

### Test 3: Cambiar status a "Completada"

1. Click "Completar"
2. **Esperado:** Status cambia a "Completada"

### Test 4: Intentar status "Cancelada"

1. El select NO debe mostrar opción "Cancelada"
2. **Esperado:** Solo pending, in_progress, completed

### Test 5: Añadir nota

1. Escribir en campo de notas
2. Click "Guardar Notas"
3. **Esperado:** Notas guardadas, mensaje de éxito

### Test 6: Añadir material

1. Escribir descripción de material
2. Click "Añadir"
3. **Esperado:** Material aparece en lista

### Test 7: Eliminar material

1. Click icono papelera en un material
2. **Esperado:** Material eliminado

### Test 8: Contactar cliente

1. Click en teléfono → Abre app de llamadas
2. Click en email → Abre app de correo
3. Click "Ver en mapa" → Abre Google Maps

### Test 9: Instalación cancelada

1. Como admin, cancelar una instalación
2. Como installer, ver esa instalación
3. **Esperado:** No puede editar, mensaje de cancelación

**Verificación:** Todos los tests pasan

---

## Checklist Final Fase 13

- [ ] `src/lib/actions/installer.ts` con acciones
- [ ] `src/lib/queries/materials.ts` con query
- [ ] `src/components/installations/MaterialsList.astro` creado
- [ ] `src/pages/installer/installations/[id].astro` completo
- [ ] Cambiar status funciona (excepto cancelled)
- [ ] Guardar notas funciona
- [ ] Añadir material funciona
- [ ] Eliminar material funciona
- [ ] Links de contacto funcionan
- [ ] Instalación cancelada no es editable

---

## Siguiente Fase

→ `14-PWA-SETUP.md` - Configurar PWA (manifest, icons, service worker)

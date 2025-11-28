# Fase 10: Admin Installations - CRUD Completo

## Objetivo

Implementar el CRUD completo de instalaciones para admin: listar, crear, ver, editar, archivar.

## Pre-requisitos

- Fases 01-09 completadas

---

## Paso 1: Crear acciones de instalaciones

**Archivo:** `src/lib/actions/installations.ts`

```typescript
import { createServerClient, type InstallationInsert, type InstallationUpdate } from '../supabase';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Crear instalación
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

  return { success: true, data: installation };
}

// Actualizar instalación
export async function updateInstallation(
  accessToken: string,
  id: string,
  data: InstallationUpdate
): Promise<ActionResult> {
  const client = createServerClient(accessToken);

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

  return { success: true, data: installation };
}

// Archivar instalación (soft delete)
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

// Restaurar instalación archivada
export async function restoreInstallation(accessToken: string, id: string): Promise<ActionResult> {
  const client = createServerClient(accessToken);

  const { error } = await client.from('installations').update({ archived_at: null }).eq('id', id);

  if (error) {
    console.error('Error restoring installation:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

**Verificación:** Archivo existe sin errores TypeScript

---

## Paso 2: Crear componente InstallationForm

**Archivo:** `src/components/installations/InstallationForm.astro`

```astro
---
import Input from '../ui/Input.astro';
import Textarea from '../ui/Textarea.astro';
import Select from '../ui/Select.astro';
import Checkbox from '../ui/Checkbox.astro';
import Button from '../ui/Button.astro';
import type { Installation, User } from '../../lib/supabase';

interface Props {
  installation?: Installation | null;
  installers: User[];
  action: string;
  submitLabel?: string;
}

const { installation, installers, action, submitLabel = 'Guardar' } = Astro.props;

// Opciones de instaladores
const installerOptions = [
  { value: '', label: 'Sin asignar' },
  ...installers.map((i) => ({ value: i.id, label: i.full_name }))
];

// Opciones de status
const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

// Formatear fecha para input datetime-local
function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
}
---

<form method="POST" action={action} class="space-y-6">
  <!-- Datos del Cliente -->
  <div class="card">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Datos del Cliente</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        name="client_name"
        label="Nombre del Cliente"
        value={installation?.client_name}
        required
        placeholder="Nombre completo"
      />

      <Input
        name="client_phone"
        label="Teléfono"
        type="tel"
        value={installation?.client_phone}
        placeholder="+34 600 000 000"
      />

      <Input
        name="client_email"
        label="Email"
        type="email"
        value={installation?.client_email}
        placeholder="cliente@email.com"
        class="md:col-span-2"
      />

      <Input
        name="client_address"
        label="Dirección"
        value={installation?.client_address}
        required
        placeholder="Calle, número, ciudad"
        class="md:col-span-2"
      />
    </div>
  </div>

  <!-- Programación y Asignación -->
  <div class="card">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Programación</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        name="scheduled_at"
        label="Fecha y Hora"
        type="datetime-local"
        value={formatDateForInput(installation?.scheduled_at)}
        required
      />

      <Select
        name="installer_id"
        label="Instalador Asignado"
        options={installerOptions}
        value={installation?.installer_id || ''}
      />

      {
        installation && (
          <Select
            name="status"
            label="Estado"
            options={statusOptions}
            value={installation.status}
          />
        )
      }
    </div>
  </div>

  <!-- Pago -->
  <div class="card">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Cobro</h3>

    <div class="space-y-4">
      <Checkbox
        name="collect_payment"
        label="Requiere cobro al cliente"
        checked={installation?.collect_payment}
        id="collect-payment-checkbox"
      />

      <div id="amount-field" class={installation?.collect_payment ? '' : 'hidden'}>
        <Input
          name="amount_to_collect"
          label="Cantidad a Cobrar (€)"
          type="number"
          value={installation?.amount_to_collect}
          placeholder="0.00"
          hint="Dejar vacío si no aplica"
        />
      </div>
    </div>
  </div>

  <!-- Notas -->
  <div class="card">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Notas</h3>

    <Textarea
      name="notes"
      label="Notas adicionales"
      value={installation?.notes}
      placeholder="Información adicional sobre la instalación..."
      rows={4}
    />
  </div>

  <!-- Botones -->
  <div class="flex items-center justify-end gap-4">
    <Button variant="secondary" href="/admin/installations"> Cancelar </Button>
    <Button type="submit">
      {submitLabel}
    </Button>
  </div>
</form>

<script>
  // Toggle campo de cantidad según checkbox de cobro
  const checkbox = document.getElementById('collect-payment-checkbox') as HTMLInputElement;
  const amountField = document.getElementById('amount-field');

  checkbox?.addEventListener('change', () => {
    if (checkbox.checked) {
      amountField?.classList.remove('hidden');
    } else {
      amountField?.classList.add('hidden');
    }
  });
</script>
```

**Verificación:** Archivo existe

---

## Paso 3: Crear página de nueva instalación

**Archivo:** `src/pages/admin/installations/new.astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import InstallationForm from '../../../components/installations/InstallationForm.astro';
import Alert from '../../../components/ui/Alert.astro';
import { getInstallers } from '../../../lib/queries/users';
import { createInstallation } from '../../../lib/actions/installations';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener instaladores para el select
const installers = await getInstallers(accessToken);

let error: string | null = null;

// Procesar formulario
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();

  const data = {
    client_name: formData.get('client_name') as string,
    client_address: formData.get('client_address') as string,
    client_phone: (formData.get('client_phone') as string) || null,
    client_email: (formData.get('client_email') as string) || null,
    scheduled_at: new Date(formData.get('scheduled_at') as string).toISOString(),
    installer_id: (formData.get('installer_id') as string) || null,
    collect_payment: formData.has('collect_payment'),
    amount_to_collect: formData.get('amount_to_collect')
      ? parseFloat(formData.get('amount_to_collect') as string)
      : null,
    notes: (formData.get('notes') as string) || null
  };

  const result = await createInstallation(accessToken, data);

  if (result.success) {
    return Astro.redirect('/admin/installations');
  } else {
    error = result.error || 'Error al crear la instalación';
  }
}
---

<DashboardLayout title="Nueva Instalación" user={user}>
  <!-- Breadcrumb -->
  <nav class="mb-6">
    <ol class="flex items-center gap-2 text-sm text-gray-500">
      <li><a href="/admin" class="hover:text-gray-700">Dashboard</a></li>
      <li>/</li>
      <li><a href="/admin/installations" class="hover:text-gray-700">Instalaciones</a></li>
      <li>/</li>
      <li class="text-gray-900">Nueva</li>
    </ol>
  </nav>

  <h1 class="text-2xl font-bold text-gray-900 mb-6">Nueva Instalación</h1>

  {
    error && (
      <Alert variant="error" title="Error" class="mb-6" dismissible>
        {error}
      </Alert>
    )
  }

  <InstallationForm
    installers={installers}
    action="/admin/installations/new"
    submitLabel="Crear Instalación"
  />
</DashboardLayout>
```

**Verificación:** Página accesible en `/admin/installations/new`

---

## Paso 4: Actualizar lista de instalaciones

**Archivo:** `src/pages/admin/installations/index.astro` (Reemplazar)

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import Button from '../../../components/ui/Button.astro';
import Input from '../../../components/ui/Input.astro';
import Select from '../../../components/ui/Select.astro';
import StatusBadge from '../../../components/installations/StatusBadge.astro';
import EmptyState from '../../../components/ui/EmptyState.astro';
import Badge from '../../../components/ui/Badge.astro';
import { getInstallations } from '../../../lib/queries/installations';
import { getInstallers } from '../../../lib/queries/users';
import type { InstallationStatus } from '../../../lib/supabase';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';

// Obtener filtros de URL
const url = Astro.url;
const statusFilter = url.searchParams.get('status') as InstallationStatus | null;
const installerFilter = url.searchParams.get('installer');
const searchFilter = url.searchParams.get('search');
const showArchived = url.searchParams.get('archived') === 'true';

// Obtener datos
const installations = await getInstallations(accessToken, {
  status: statusFilter || undefined,
  installerId: installerFilter || undefined,
  search: searchFilter || undefined,
  includeArchived: showArchived
});

const installers = await getInstallers(accessToken);

// Opciones de filtros
const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const installerOptions = [
  { value: '', label: 'Todos los instaladores' },
  ...installers.map((i) => ({ value: i.id, label: i.full_name }))
];

// Helpers
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
---

<DashboardLayout title="Instalaciones" user={user}>
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Instalaciones</h1>
    <Button href="/admin/installations/new">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"
        ></path>
      </svg>
      Nueva Instalación
    </Button>
  </div>

  <!-- Filtros -->
  <form method="GET" class="card mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Input name="search" type="search" placeholder="Buscar cliente..." value={searchFilter} />

      <Select name="status" options={statusOptions} value={statusFilter || ''} />

      <Select name="installer" options={installerOptions} value={installerFilter || ''} />

      <div class="flex items-end gap-2">
        <Button type="submit" class="flex-1">Filtrar</Button>
        <Button variant="secondary" href="/admin/installations">Limpiar</Button>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-200">
      <label class="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="archived"
          value="true"
          checked={showArchived}
          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Mostrar archivadas
      </label>
    </div>
  </form>

  <!-- Resultados -->
  <div class="text-sm text-gray-500 mb-4">
    {installations.length} instalación{installations.length !== 1 ? 'es' : ''} encontrada{
      installations.length !== 1 ? 's' : ''
    }
  </div>

  {
    installations.length > 0 ? (
      <div class="card overflow-hidden p-0">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instalador
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cobro
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {installations.map((installation) => (
                <tr class={installation.archived_at ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      {installation.archived_at && (
                        <Badge variant="gray" size="sm">
                          Archivada
                        </Badge>
                      )}
                      <div>
                        <div class="font-medium text-gray-900">{installation.client_name}</div>
                        <div class="text-sm text-gray-500 truncate max-w-xs">
                          {installation.client_address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-600">
                    {formatDate(installation.scheduled_at)}
                  </td>
                  <td class="px-4 py-4 text-sm">
                    {installation.installer ? (
                      <span class="text-gray-900">{installation.installer.full_name}</span>
                    ) : (
                      <span class="text-yellow-600">Sin asignar</span>
                    )}
                  </td>
                  <td class="px-4 py-4">
                    <StatusBadge status={installation.status} size="sm" />
                  </td>
                  <td class="px-4 py-4 text-sm">
                    {installation.collect_payment ? (
                      <span class="text-green-600 font-medium">
                        {formatCurrency(installation.amount_to_collect)}
                      </span>
                    ) : (
                      <span class="text-gray-400">-</span>
                    )}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <a
                      href={`/admin/installations/${installation.id}`}
                      class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalles
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <EmptyState
        title="No hay instalaciones"
        description="Crea tu primera instalación para empezar."
      >
        <Button href="/admin/installations/new">Nueva Instalación</Button>
      </EmptyState>
    )
  }
</DashboardLayout>
```

**Verificación:** Lista muestra instalaciones con filtros

---

## Paso 5: Crear página de detalle/edición de instalación

**Archivo:** `src/pages/admin/installations/[id].astro`

```astro
---
import DashboardLayout from '../../../layouts/DashboardLayout.astro';
import InstallationForm from '../../../components/installations/InstallationForm.astro';
import Button from '../../../components/ui/Button.astro';
import Alert from '../../../components/ui/Alert.astro';
import Modal from '../../../components/ui/Modal.astro';
import StatusBadge from '../../../components/installations/StatusBadge.astro';
import Badge from '../../../components/ui/Badge.astro';
import { getInstallationById } from '../../../lib/queries/installations';
import { getInstallers } from '../../../lib/queries/users';
import {
  updateInstallation,
  archiveInstallation,
  restoreInstallation
} from '../../../lib/actions/installations';

const user = Astro.locals.user;
const accessToken = Astro.cookies.get('sb-access-token')?.value || '';
const { id } = Astro.params;

// Obtener instalación
let installation = await getInstallationById(accessToken, id!);

if (!installation) {
  return Astro.redirect('/admin/installations');
}

const installers = await getInstallers(accessToken);

let error: string | null = null;
let success: string | null = null;

// Procesar formulario
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const action = formData.get('_action');

  if (action === 'archive') {
    const result = await archiveInstallation(accessToken, id!);
    if (result.success) {
      return Astro.redirect('/admin/installations');
    } else {
      error = result.error || 'Error al archivar';
    }
  } else if (action === 'restore') {
    const result = await restoreInstallation(accessToken, id!);
    if (result.success) {
      installation = await getInstallationById(accessToken, id!);
      success = 'Instalación restaurada correctamente';
    } else {
      error = result.error || 'Error al restaurar';
    }
  } else {
    // Actualizar instalación
    const data = {
      client_name: formData.get('client_name') as string,
      client_address: formData.get('client_address') as string,
      client_phone: (formData.get('client_phone') as string) || null,
      client_email: (formData.get('client_email') as string) || null,
      scheduled_at: new Date(formData.get('scheduled_at') as string).toISOString(),
      installer_id: (formData.get('installer_id') as string) || null,
      status: formData.get('status') as any,
      collect_payment: formData.has('collect_payment'),
      amount_to_collect: formData.get('amount_to_collect')
        ? parseFloat(formData.get('amount_to_collect') as string)
        : null,
      notes: (formData.get('notes') as string) || null
    };

    const result = await updateInstallation(accessToken, id!, data);

    if (result.success) {
      installation = await getInstallationById(accessToken, id!);
      success = 'Instalación actualizada correctamente';
    } else {
      error = result.error || 'Error al actualizar';
    }
  }
}

// Formatear fecha
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
---

<DashboardLayout title="Instalación" user={user}>
  <!-- Breadcrumb -->
  <nav class="mb-6">
    <ol class="flex items-center gap-2 text-sm text-gray-500">
      <li><a href="/admin" class="hover:text-gray-700">Dashboard</a></li>
      <li>/</li>
      <li><a href="/admin/installations" class="hover:text-gray-700">Instalaciones</a></li>
      <li>/</li>
      <li class="text-gray-900">{installation!.client_name}</li>
    </ol>
  </nav>

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
    <div>
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-gray-900">{installation!.client_name}</h1>
        <StatusBadge status={installation!.status} />
        {installation!.archived_at && <Badge variant="gray">Archivada</Badge>}
      </div>
      <p class="text-gray-500 mt-1">{installation!.client_address}</p>
    </div>

    <div class="flex items-center gap-2">
      {
        installation!.archived_at ? (
          <form method="POST">
            <input type="hidden" name="_action" value="restore" />
            <Button type="submit" variant="secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Restaurar
            </Button>
          </form>
        ) : (
          <Button variant="danger" onclick="openArchiveModal()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            Archivar
          </Button>
        )
      }
    </div>
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

  <!-- Info adicional -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="card">
      <p class="text-sm text-gray-500">Creada</p>
      <p class="font-medium">{formatDate(installation!.created_at)}</p>
    </div>

    {
      installation!.completed_at && (
        <div class="card">
          <p class="text-sm text-gray-500">Completada</p>
          <p class="font-medium">{formatDate(installation!.completed_at)}</p>
        </div>
      )
    }

    {
      installation!.installer && (
        <div class="card">
          <p class="text-sm text-gray-500">Instalador asignado</p>
          <p class="font-medium">{installation!.installer.full_name}</p>
        </div>
      )
    }
  </div>

  <!-- Formulario de edición -->
  {
    !installation!.archived_at && (
      <InstallationForm
        installation={installation}
        installers={installers}
        action={`/admin/installations/${id}`}
        submitLabel="Guardar Cambios"
      />
    )
  }

  <!-- Modal de confirmación para archivar -->
  <Modal id="archive" title="Archivar Instalación">
    <p class="text-gray-600">
      ¿Estás seguro de que quieres archivar esta instalación? Podrás restaurarla más tarde si es
      necesario.
    </p>

    <Fragment slot="footer">
      <Button variant="secondary" onclick="closeArchiveModal()">Cancelar</Button>
      <form method="POST" class="inline">
        <input type="hidden" name="_action" value="archive" />
        <Button type="submit" variant="danger">Archivar</Button>
      </form>
    </Fragment>
  </Modal>
</DashboardLayout>
```

**Verificación:** Página accesible en `/admin/installations/[id]`

---

## Paso 6: Probar CRUD completo

### Test 1: Crear instalación

1. Ir a `/admin/installations/new`
2. Llenar formulario con datos de prueba
3. Click "Crear Instalación"
4. **Esperado:** Redirige a lista, instalación aparece

### Test 2: Ver instalación

1. Click "Ver detalles" en una instalación
2. **Esperado:** Muestra detalles y formulario de edición

### Test 3: Editar instalación

1. Modificar algún campo
2. Click "Guardar Cambios"
3. **Esperado:** Muestra mensaje de éxito, datos actualizados

### Test 4: Cambiar status

1. Cambiar status a "En Progreso"
2. Guardar
3. **Esperado:** Badge de status cambia

### Test 5: Archivar instalación

1. Click "Archivar"
2. Confirmar en modal
3. **Esperado:** Redirige a lista, instalación no visible (sin filtro)

### Test 6: Ver archivadas

1. En lista, marcar "Mostrar archivadas"
2. Click "Filtrar"
3. **Esperado:** Instalación archivada aparece con badge "Archivada"

### Test 7: Restaurar instalación

1. Click "Ver detalles" en instalación archivada
2. Click "Restaurar"
3. **Esperado:** Instalación restaurada, formulario editable

**Verificación:** Todos los tests pasan

---

## Checklist Final Fase 10

- [ ] `src/lib/actions/installations.ts` con CRUD actions
- [ ] `src/components/installations/InstallationForm.astro` creado
- [ ] `src/pages/admin/installations/new.astro` funciona
- [ ] `src/pages/admin/installations/index.astro` con filtros
- [ ] `src/pages/admin/installations/[id].astro` con edición
- [ ] Crear instalación funciona
- [ ] Editar instalación funciona
- [ ] Archivar instalación funciona
- [ ] Restaurar instalación funciona
- [ ] Filtros funcionan correctamente

---

## Siguiente Fase

→ `11-ADMIN-INSTALLERS.md` - Gestión de instaladores

# Informe de Revisión Arquitectónica - IMS (Installation Management System)

**Fecha:** 5 de diciembre de 2025
**Versión del Proyecto:** 0.1.0
**Framework:** Astro 5 (SSR) + Supabase
**Revisor:** Análisis Arquitectónico Completo

---

## Resumen Ejecutivo

El proyecto IMS está construido con **Astro 5** en modo SSR y **Supabase** como backend. La aplicación tiene buena base técnica y testing, pero presenta **desviaciones significativas** respecto a las mejores prácticas de **Vertical Slicing Architecture** establecidas en las directrices del proyecto.

### Puntos Positivos

- Configuración TypeScript estricta
- Buena cobertura de tests (11 archivos de tests unitarios + 1 integración)
- Middleware robusto con autenticación y gestión de sesión
- RLS policies implementadas correctamente (asumido por la arquitectura)
- PWA configurada con Service Worker y manifest
- Integración de push notifications

### Problemas Críticos Identificados

1. **Arquitectura horizontal en lugar de vertical** (incumple Vertical Slicing)
2. **Duplicación masiva de código en componentes** (237 líneas en InstallationCard.astro)
3. **Lógica de negocio mezclada con presentación** (en archivos .astro)
4. **Falta de Astro Actions** (se usa POST manual en lugar de Actions API)
5. **Componentes no reutilizables** debido a acoplamiento
6. **Código JavaScript en cliente innecesario** (violación de "Zero JS by Default")

---

## 1. Análisis de Arquitectura

### 1.1 Estructura Actual (Horizontal - NO RECOMENDADO)

```
src/
├── components/          # ❌ Agrupación por TIPO (horizontal)
│   ├── ui/             # ❌ Componentes genéricos mezclados
│   ├── layout/         # ❌ Layouts mezclados con componentes
│   ├── installations/  # ❌ Feature-specific pero fuera de features/
│   └── notifications/  # ❌ Feature-specific pero fuera de features/
├── lib/                # ❌ Todo mezclado sin separación por features
│   ├── actions/        # ❌ No son Astro Actions reales
│   ├── queries/        # ❌ Separación artificial queries/actions
│   ├── supabase.ts
│   ├── auth.ts
│   └── ...
├── pages/              # ✅ Correcto (file-based routing)
└── types/              # ✅ Correcto
```

**Problemas:**

- Viola el principio de **Vertical Slicing** establecido en CLAUDE.md
- Componentes feature-specific (`installations/`, `notifications/`) NO están en `features/`
- Dificulta escalabilidad: para una nueva feature se tocan múltiples carpetas
- No hay colocation de tests con implementación
- Lógica de negocio dispersa en `lib/actions/` y `lib/queries/`

### 1.2 Estructura Recomendada (Vertical Slicing)

```
src/
├── features/                    # ✅ Business logic por feature
│   ├── installations/           # Feature: Gestión de instalaciones
│   │   ├── components/          # Componentes privados de esta feature
│   │   │   ├── InstallationCard.astro
│   │   │   ├── InstallationCard.test.ts
│   │   │   ├── InstallationCardCompact.astro
│   │   │   ├── InstallationForm.astro
│   │   │   ├── StatusBadge.astro
│   │   │   └── MaterialsList.astro
│   │   ├── logic/               # Lógica de negocio
│   │   │   ├── queries.ts       # Queries de Supabase
│   │   │   ├── queries.test.ts
│   │   │   ├── mutations.ts     # Mutations (create/update/delete)
│   │   │   └── mutations.test.ts
│   │   └── InstallationFeature.astro  # Entry point (si es necesario)
│   │
│   ├── auth/                    # Feature: Autenticación
│   │   ├── logic/
│   │   │   ├── session.ts
│   │   │   ├── session.test.ts
│   │   │   ├── session-timeout.ts
│   │   │   └── session-timeout.test.ts
│   │   └── middleware/
│   │       └── auth-middleware.ts
│   │
│   ├── notifications/           # Feature: Push notifications
│   │   ├── components/
│   │   │   └── PushSubscribe.astro
│   │   ├── logic/
│   │   │   ├── push-client.ts
│   │   │   ├── push-client.test.ts
│   │   │   ├── push-server.ts
│   │   │   └── push-server.test.ts
│   │   └── api/
│   │       ├── subscribe.ts
│   │       └── unsubscribe.ts
│   │
│   └── shared/                  # ✅ Componentes UI reutilizables
│       ├── Button.astro
│       ├── Button.test.ts
│       ├── Input.astro
│       ├── Select.astro
│       ├── Modal.astro
│       ├── Toast.astro
│       ├── Badge.astro
│       ├── StatCard.astro
│       └── EmptyState.astro
│
├── layouts/                     # ✅ Layouts globales
├── pages/                       # ✅ File-based routing (mantener delgado)
├── middleware/                  # ✅ Middleware global
├── lib/                         # ✅ Solo utilidades globales
│   ├── supabase.ts             # Cliente de Supabase
│   ├── env.ts                  # Validación de env vars
│   └── page-utils.ts           # Helpers para páginas
└── types/                       # ✅ Tipos globales
```

**Ventajas:**

- ✅ Cada feature es **autónoma y aislada**
- ✅ Tests **colocados junto al código** que prueban
- ✅ Fácil identificar qué archivos tocar para una feature específica
- ✅ Reducción de dependencias cruzadas
- ✅ Mejor tree-shaking (código no usado se elimina fácilmente)
- ✅ Escalabilidad: nuevas features = nueva carpeta en `features/`

---

## 2. Problemas Críticos por Categoría

### 🔴 CRÍTICO: Duplicación de Código

**Archivo:** `InstallationCard.astro` (237 líneas)
**Problema:** El componente duplica TODO el markup dependiendo de si `href` está presente o no.

**Código Actual (Duplicado):**

```jsx
{
  href ? (
    <a href={href} class="...">
      {/* 100+ líneas de markup */}
    </a>
  ) : (
    <div class="...">{/* EXACTAMENTE LAS MISMAS 100+ líneas duplicadas */}</div>
  );
}
```

**Impacto:**

- 🔴 Mantenimiento: cualquier cambio debe hacerse en 2 lugares
- 🔴 Bugs potenciales por inconsistencias
- 🔴 Violación del principio DRY (Don't Repeat Yourself)

**Solución Recomendada:**

```jsx
---
// src/features/installations/components/InstallationCard.astro
import StatusBadge from './StatusBadge.astro';
import type { InstallationWithInstaller } from '../logic/queries';

interface Props {
  installation: InstallationWithInstaller | Installation;
  showActions?: boolean;
  href?: string;
}

const { installation, showActions = true, href } = Astro.props;
const Component = href ? 'a' : 'div';
const linkProps = href ? { href } : {};
---

<Component
  {...linkProps}
  class:list={[
    'block bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow',
    href && 'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500'
  ]}
>
  {/* Markup UNA SOLA VEZ */}
  <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-2">
        <h3 class="text-lg font-semibold text-gray-900">{installation.client_name}</h3>
        <StatusBadge status={installation.status} />
      </div>
      <p class="text-sm text-gray-600">{installation.installation_type}</p>
    </div>
  </div>

  {/* ... resto del markup (UNA SOLA VEZ) ... */}

  {showActions && !href && (
    <div class="flex gap-2 pt-4 border-t border-gray-100">
      <a
        href={`/admin/installations/${installation.id}`}
        class="flex-1 text-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
      >
        Ver detalles
      </a>
    </div>
  )}
</Component>
```

**Beneficios:**

- ✅ Reducción de 237 líneas a ~80 líneas (66% menos código)
- ✅ Mantenimiento centralizado
- ✅ Sin duplicación

---

### 🔴 CRÍTICO: Falta de Astro Actions

**Problema:** El proyecto NO usa **Astro Actions API**, implementando POST manual en `.astro` pages.

**Código Actual (Incorrecto):**

```jsx
---
// src/pages/admin/installations/new.astro
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const data = {
    client_name: formData.get('client_name') as string,
    // ... más campos
  };
  const result = await createInstallation(accessToken, data);
  if (result.success) {
    return Astro.redirect('/admin/installations');
  }
}
---
```

**Problemas:**

- ❌ Mezcla lógica de presentación con lógica de negocio
- ❌ No hay validación con Zod
- ❌ No es type-safe
- ❌ No aprovecha Progressive Enhancement de Astro
- ❌ Difícil de testear

**Solución Recomendada (Astro Actions):**

```typescript
// src/features/installations/actions.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const installations = {
  create: defineAction({
    input: z.object({
      client_name: z.string().min(1, 'El nombre es requerido'),
      client_phone: z.string().regex(/^\+?[\d\s-]+$/, 'Teléfono inválido'),
      client_email: z.string().email('Email inválido'),
      address: z.string().min(1, 'La dirección es requerida'),
      installation_type: z.string().min(1, 'El tipo es requerido'),
      scheduled_date: z.string().datetime().nullable(),
      assigned_to: z.string().uuid().nullable(),
      notes: z.string().nullable()
    }),
    handler: async (input, context) => {
      const { cookies } = context;
      const accessToken = cookies.get('sb-access-token')?.value;

      if (!accessToken) {
        throw new Error('No autenticado');
      }

      const client = createServerClient(accessToken);

      const { data, error } = await client.from('installations').insert(input).select().single();

      if (error) {
        throw new Error(`Error al crear instalación: ${error.message}`);
      }

      // Send push notification if assigned
      if (data.assigned_to) {
        await sendPushNotification(data.assigned_to, {
          title: 'Nueva instalación asignada',
          body: `${data.client_name} - ${data.address}`,
          url: `/installer/installations/${data.id}`
        });
      }

      return data;
    }
  }),

  update: defineAction({
    /* ... */
  }),
  archive: defineAction({
    /* ... */
  })
};
```

```typescript
// src/actions/index.ts
import { installations } from '@/features/installations/actions';
import { users } from '@/features/users/actions';

export const server = {
  installations,
  users
};
```

```jsx
---
// src/pages/admin/installations/new.astro
import { actions } from 'astro:actions';
import DashboardLayout from '@layouts/DashboardLayout.astro';
import InstallationForm from '@/features/installations/components/InstallationForm.astro';

const user = getUser(Astro);
const installers = await getInstallers();

const result = Astro.getActionResult(actions.installations.create);
---

<DashboardLayout title="Nueva Instalación" user={user}>
  <h1>Nueva Instalación</h1>

  <InstallationForm
    installers={installers}
    action={actions.installations.create}
    errors={result?.error?.fields}
  />

  {result?.error && <Toast variant="error" message={result.error.message} />}
</DashboardLayout>
```

**Beneficios:**

- ✅ Validación automática con Zod
- ✅ Type-safety completo
- ✅ Progressive enhancement
- ✅ Separación clara de responsabilidades
- ✅ Fácil de testear (unit test de la action)
- ✅ Errores tipados y manejados consistentemente

---

### 🔴 CRÍTICO: JavaScript en Cliente Innecesario

**Problema:** Uso de `<script>` tags en componentes cuando NO es necesario.

**Ejemplo 1: Sidebar.astro (líneas 132-151)**

```jsx
<script>
  const menuButton = document.getElementById('mobile-menu-button');
  const closeButton = document.getElementById('mobile-menu-close');
  const sidebar = document.getElementById('mobile-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');

  function openSidebar() {
    sidebar?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
  }
  // ... más código JS
</script>
```

**Problema:**

- ❌ JavaScript ejecutándose en CADA navegación
- ❌ Viola "Zero JS by Default"
- ❌ Puede hacerse con CSS puro o `client:load` solo cuando sea necesario

**Solución Recomendada:**

**Opción 1: CSS Puro (preferida)**

```jsx
---
// src/features/shared/MobileSidebar.astro
---

<input type="checkbox" id="mobile-menu-toggle" class="peer sr-only" />

<label
  for="mobile-menu-toggle"
  class="lg:hidden cursor-pointer"
  aria-label="Abrir menú"
>
  <svg>{/* Icono hamburguesa */}</svg>
</label>

{/* Overlay */}
<label
  for="mobile-menu-toggle"
  class="fixed inset-0 z-40 bg-black/50 hidden peer-checked:block lg:hidden"
></label>

{/* Sidebar */}
<aside class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform -translate-x-full peer-checked:translate-x-0 transition-transform lg:hidden">
  {/* Contenido del sidebar */}
</aside>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
```

**Opción 2: Web Component (si se necesita lógica compleja)**

```jsx
---
// src/features/shared/MobileSidebar.astro
---

<mobile-sidebar>
  <button slot="trigger">{/* Hamburger */}</button>
  <nav slot="content">{/* Menu items */}</nav>
</mobile-sidebar>

<script>
  class MobileSidebar extends HTMLElement {
    constructor() {
      super();
      const trigger = this.querySelector('[slot="trigger"]');
      const content = this.querySelector('[slot="content"]');
      // ... lógica
    }
  }

  customElements.define('mobile-sidebar', MobileSidebar);
</script>
```

**Beneficios:**

- ✅ Cero JavaScript por defecto
- ✅ Funciona sin JS (accesibilidad)
- ✅ Mejor performance
- ✅ Menos código a mantener

---

### 🟠 ALTO: Mezcla de Lógica de Negocio con Presentación

**Problema:** Funciones de formateo, transformación de datos y lógica en componentes `.astro`.

**Ejemplo: InstallationCard.astro (líneas 23-41)**

```jsx
---
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
---
```

**Problemas:**

- ❌ Funciones duplicadas en múltiples archivos
- ❌ No hay tests para estas funciones
- ❌ Violación de Single Responsibility Principle
- ❌ Difícil reutilización

**Solución Recomendada:**

```typescript
// src/lib/formatters/dates.ts
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateTime(dateString: string | null): string {
  if (!dateString) return 'Sin fecha';
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}
```

```typescript
// src/lib/formatters/dates.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatTime } from './dates';

describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate('2025-12-05T10:30:00Z')).toBe('5 dic 2025');
  });

  it('should return "Sin fecha" for null', () => {
    expect(formatDate(null)).toBe('Sin fecha');
  });
});

describe('formatTime', () => {
  it('should format time correctly', () => {
    expect(formatTime('2025-12-05T10:30:00Z')).toBe('10:30');
  });
});
```

```jsx
---
// src/features/installations/components/InstallationCard.astro
import { formatDate, formatTime } from '@/lib/formatters/dates';
import StatusBadge from './StatusBadge.astro';
// ...
---

{/* Usar las funciones importadas */}
<span>{formatDate(installation.scheduled_date)}</span>
```

**Beneficios:**

- ✅ Código reutilizable
- ✅ Testeado unitariamente
- ✅ Componentes más limpios
- ✅ Único lugar para mantener

---

### 🟠 ALTO: Separación Artificial queries/actions

**Problema:** Separación entre `lib/queries/` y `lib/actions/` es artificial y crea confusión.

**Estructura Actual:**

```
lib/
├── queries/
│   ├── installations.ts    # SELECT queries
│   ├── users.ts
│   └── materials.ts
└── actions/
    ├── installations.ts    # INSERT/UPDATE/DELETE
    └── users.ts
```

**Problemas:**

- ❌ Misma entidad (Installation) dividida en 2 archivos
- ❌ No sigue pattern de Vertical Slicing
- ❌ Confusión: ¿dónde va cada función?
- ❌ `actions/` NO son Astro Actions reales

**Solución Recomendada:**

```
features/
└── installations/
    └── logic/
        ├── queries.ts         # Todas las queries de lectura
        ├── queries.test.ts
        ├── mutations.ts       # Todas las mutaciones (create/update/delete)
        ├── mutations.test.ts
        └── types.ts           # Tipos específicos de la feature
```

```typescript
// src/features/installations/logic/queries.ts
import { supabase, createServerClient } from '@/lib/supabase';
import type { InstallationFilters } from './types';

export async function getInstallations(accessToken: string, filters?: InstallationFilters) {
  const client = createServerClient(accessToken);
  // ... queries
}

export async function getInstallationById(accessToken: string, id: string) {
  // ... query
}

export async function getInstallationStats() {
  // ... stats
}
```

```typescript
// src/features/installations/logic/mutations.ts
import { createServerClient } from '@/lib/supabase';
import { sendPushNotification } from '@/features/notifications/logic/push-server';

export async function createInstallation(accessToken: string, data: InstallationInsert) {
  const client = createServerClient(accessToken);
  // ... mutation
}

export async function updateInstallation(
  accessToken: string,
  id: string,
  data: InstallationUpdate
) {
  // ... mutation
}
```

**Beneficios:**

- ✅ Lógica de negocio colocada con la feature
- ✅ Claridad: queries vs mutations
- ✅ Fácil encontrar código relacionado
- ✅ Preparado para migrar a Astro Actions

---

### 🟠 ALTO: Type Guards innecesarios

**Problema:** Type guards complejos para verificar tipos en runtime.

**Código Actual (InstallationCard.astro, líneas 16-21):**

```jsx
---
const hasInstaller = (
  inst: InstallationWithInstaller | Installation
): inst is InstallationWithInstaller => {
  return 'installer' in inst;
};
---

{hasInstaller(installation) && installation.installer && (
  <div>...</div>
)}
```

**Problema:**

- ❌ Sobrecomplexidad innecesaria
- ❌ El tipo debería ser conocido desde el origen
- ❌ Confusión sobre qué tipo recibe el componente

**Solución Recomendada:**

**Opción 1: Componentes específicos**

```jsx
---
// src/features/installations/components/InstallationCardFull.astro
import type { InstallationWithInstaller } from '../logic/types';

interface Props {
  installation: InstallationWithInstaller; // Tipo específico
}

const { installation } = Astro.props;
---

{/* Siempre tiene installer, no hay dudas */}
{installation.installer && (
  <div>
    <span>{installation.installer.full_name}</span>
  </div>
)}
```

```jsx
---
// src/features/installations/components/InstallationCardSimple.astro
import type { Installation } from '../logic/types';

interface Props {
  installation: Installation; // Sin installer
}
---
{/* No muestra installer */}
```

**Opción 2: Union type con discriminator**

```typescript
// src/features/installations/logic/types.ts
export type InstallationView =
  | { type: 'full'; data: InstallationWithInstaller }
  | { type: 'simple'; data: Installation };
```

```jsx
---
interface Props {
  view: InstallationView;
}

const { view } = Astro.props;
---

{view.type === 'full' && view.data.installer && (
  <div>{view.data.installer.full_name}</div>
)}
```

**Beneficios:**

- ✅ Type safety en compile time
- ✅ Sin necesidad de type guards
- ✅ Código más claro

---

### 🟡 MEDIO: Componentes no reutilizables

**Problema:** Componentes en `components/ui/` que tienen dependencias innecesarias.

**Ejemplo: StatCard.astro**

```jsx
---
interface Props {
  label: string;
  value: number;
  icon: 'clipboard' | 'clock' | 'check' | 'users'; // ❌ Hardcoded icons
  color: 'blue' | 'yellow' | 'green' | 'purple';   // ❌ Hardcoded colors
}
---
```

**Problema:**

- ❌ No es verdaderamente reutilizable (iconos hardcodeados)
- ❌ Difícil extender con nuevos iconos
- ❌ Acoplado a casos de uso específicos

**Solución Recomendada:**

```jsx
---
// src/features/shared/StatCard.astro
interface Props {
  label: string;
  value: number | string;
  variant?: 'blue' | 'yellow' | 'green' | 'purple' | 'red' | 'gray';
  class?: string;
}

const { label, value, variant = 'blue', class: className = '' } = Astro.props;

const variantClasses = {
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-gray-50 text-gray-600',
};
---

<div class={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <p class="text-sm text-gray-600 mb-1">{label}</p>
      <p class="text-2xl font-bold text-gray-900">{value}</p>
    </div>

    {Astro.slots.has('icon') && (
      <div class={`p-3 rounded-lg ${variantClasses[variant]}`}>
        <slot name="icon" />
      </div>
    )}
  </div>

  {Astro.slots.has('default') && (
    <div class="mt-4 pt-4 border-t border-gray-100">
      <slot />
    </div>
  )}
</div>
```

**Uso:**

```jsx
<StatCard label="Total Instalaciones" value={stats.total} variant="blue">
  <svg slot="icon" class="w-6 h-6" fill="none" stroke="currentColor">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>

  <p slot="default" class="text-sm text-gray-500">
    +12% desde el mes pasado
  </p>
</StatCard>
```

**Beneficios:**

- ✅ Verdaderamente reutilizable
- ✅ Flexible con slots
- ✅ Cualquier icono puede usarse
- ✅ Extensible para nuevos casos de uso

---

## 3. Problemas de Performance y Optimización

### 🟡 MEDIO: Falta de optimización de imágenes

**Problema:** No se usa `<Image>` de Astro para optimización automática.

**Solución:**

```jsx
---
import { Image } from 'astro:assets';
import logo from '@/assets/logo.png';
---

<Image
  src={logo}
  alt="IMS Logo"
  width={200}
  height={50}
  format="webp"
  quality={80}
/>
```

### 🟡 MEDIO: Service Worker con estrategia básica

**Archivo:** `public/sw.js`

**Recomendación:** Usar Workbox para estrategias de caché más robustas.

```javascript
// public/sw.js con Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);
```

---

## 4. Problemas de Accesibilidad

### 🟡 MEDIO: Falta de atributos ARIA en componentes interactivos

**Ejemplo: Modal.astro**

```jsx
{
  /* Falta role, aria-labelledby, aria-modal */
}
<div id={`modal-${id}`} class="...">
  <div class="modal-content">
    <h2>{title}</h2>
    {/* ... */}
  </div>
</div>;
```

**Solución:**

```jsx
<div
  id={`modal-${id}`}
  role="dialog"
  aria-modal="true"
  aria-labelledby={`modal-title-${id}`}
  class="..."
>
  <div class="modal-content">
    <h2 id={`modal-title-${id}`}>{title}</h2>
    {/* ... */}
  </div>
</div>
```

### 🟡 MEDIO: Botones sin labels accesibles

**Ejemplo: Botones de iconos sin texto**

```jsx
<button type="submit" class="...">
  <svg>{/* Icon */}</svg>
  {/* ❌ No hay texto para screen readers */}
</button>
```

**Solución:**

```jsx
<button type="submit" class="..." aria-label="Eliminar instalación">
  <svg aria-hidden="true">{/* Icon */}</svg>
  <span class="sr-only">Eliminar instalación</span>
</button>
```

---

## 5. Testing

### ✅ POSITIVO: Buena cobertura de tests unitarios

El proyecto tiene **11 archivos de tests unitarios** + 1 test de integración:

- `lib/push.test.ts`
- `lib/auth.test.ts`
- `lib/env.test.ts`
- `lib/session-timeout.test.ts`
- `lib/queries/users.test.ts`
- `lib/queries/materials.test.ts`
- `lib/queries/installer.test.ts`
- `lib/page-utils.test.ts`
- `lib/actions/users.test.ts`
- `lib/actions/installer.test.ts`
- `pages/api/push/subscribe.integration.test.ts`

### 🟡 MEDIO: Falta de tests para componentes

**Problema:** No hay tests para componentes `.astro`.

**Recomendación:**

```typescript
// src/features/shared/Button.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, it, expect } from 'vitest';
import Button from './Button.astro';

describe('Button Component', () => {
  it('should render with primary variant', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Button, {
      props: { variant: 'primary' },
      slots: { default: 'Click me' }
    });

    expect(result).toContain('bg-primary-600');
    expect(result).toContain('Click me');
  });

  it('should render as link when href is provided', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Button, {
      props: { href: '/test' },
      slots: { default: 'Link' }
    });

    expect(result).toContain('<a');
    expect(result).toContain('href="/test"');
  });
});
```

### 🟡 MEDIO: Faltan tests E2E

**Recomendación:** Implementar tests E2E con Playwright para flujos completos:

```typescript
// e2e/admin-installation-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Installation Flow', () => {
  test('should create, view and archive installation', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.click('text=Iniciar sesión con Google');

    // Create installation
    await page.goto('/admin/installations/new');
    await page.fill('[name="client_name"]', 'Test Client');
    await page.fill('[name="client_phone"]', '+34600000000');
    await page.fill('[name="client_email"]', 'test@example.com');
    await page.fill('[name="address"]', 'Test Address 123');
    await page.fill('[name="installation_type"]', 'Fibra óptica');
    await page.click('button[type="submit"]');

    // Verify redirect and creation
    await expect(page).toHaveURL('/admin/installations');
    await expect(page.locator('text=Test Client')).toBeVisible();

    // View installation
    await page.click('text=Test Client');
    await expect(page.locator('h1')).toContainText('Test Client');

    // Archive installation
    await page.click('text=Archivar');
    await page.click('button:has-text("Archivar")'); // Confirm modal
    await expect(page).toHaveURL('/admin/installations');
  });
});
```

---

## 6. Seguridad

### ✅ POSITIVO: Buena configuración de seguridad

- ✅ Cookies HttpOnly para tokens
- ✅ Middleware de autenticación robusto
- ✅ Session timeout implementado
- ✅ CSRF protection implícito (mismo origen)

### 🟡 MEDIO: Falta validación de entrada

**Problema:** No se valida input del usuario antes de queries.

**Recomendación:** Usar Zod para validar TODAS las entradas:

```typescript
// src/features/installations/logic/schemas.ts
import { z } from 'zod';

export const InstallationFilterSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  installerId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().max(200).optional()
});

export const CreateInstallationSchema = z.object({
  client_name: z.string().min(1).max(100),
  client_phone: z.string().regex(/^\+?[\d\s-]+$/),
  client_email: z.string().email(),
  address: z.string().min(1).max(200),
  installation_type: z.string().min(1).max(50),
  scheduled_date: z.string().datetime().nullable(),
  assigned_to: z.string().uuid().nullable(),
  notes: z.string().max(1000).nullable()
});
```

---

## 7. Plan de Acción Priorizado

### Fase 1: Crítico (1-2 semanas)

**Priority 1: Migrar a Vertical Slicing**

- [ ] Crear estructura `src/features/`
- [ ] Mover `components/installations/` → `features/installations/components/`
- [ ] Mover `components/notifications/` → `features/notifications/components/`
- [ ] Mover `components/ui/` → `features/shared/`
- [ ] Mover `lib/queries/installations.ts` + `lib/actions/installations.ts` → `features/installations/logic/`
- [ ] Actualizar imports en todo el proyecto

**Priority 2: Implementar Astro Actions**

- [ ] Crear `src/actions/index.ts`
- [ ] Migrar `createInstallation` a Astro Action
- [ ] Migrar `updateInstallation` a Astro Action
- [ ] Migrar `archiveInstallation` a Astro Action
- [ ] Añadir validación Zod a todas las actions
- [ ] Actualizar páginas para usar `Astro.getActionResult()`

**Priority 3: Eliminar duplicación en InstallationCard**

- [ ] Refactorizar usando componente dinámico (`a` vs `div`)
- [ ] Reducir de 237 líneas a ~80 líneas
- [ ] Añadir tests unitarios

### Fase 2: Alto (2-3 semanas)

**Priority 4: Eliminar JavaScript innecesario**

- [ ] Refactorizar Sidebar a CSS puro o Web Component
- [ ] Revisar otros `<script>` tags y evaluar necesidad
- [ ] Implementar client directives solo cuando sea necesario

**Priority 5: Extraer lógica de negocio**

- [ ] Crear `lib/formatters/dates.ts` con funciones de formateo
- [ ] Crear tests para formatters
- [ ] Refactorizar componentes para usar formatters
- [ ] Crear `lib/validators/` para validaciones comunes

**Priority 6: Mejorar componentes reutilizables**

- [ ] Refactorizar StatCard para usar slots
- [ ] Refactorizar Button para mejor extensibilidad
- [ ] Refactorizar Modal con ARIA completo
- [ ] Documentar componentes con Storybook (opcional)

### Fase 3: Medio (3-4 semanas)

**Priority 7: Testing**

- [ ] Añadir tests para componentes Astro
- [ ] Implementar tests E2E con Playwright
- [ ] Configurar coverage threshold (80%+)
- [ ] Añadir tests de accesibilidad automatizados

**Priority 8: Optimización**

- [ ] Implementar `<Image>` component de Astro
- [ ] Optimizar Service Worker con Workbox
- [ ] Implementar lazy loading para componentes pesados
- [ ] Añadir preload de recursos críticos

**Priority 9: Accesibilidad**

- [ ] Añadir atributos ARIA faltantes
- [ ] Implementar skip navigation
- [ ] Probar con screen readers
- [ ] Asegurar contraste de colores WCAG AA

### Fase 4: Bajo (4-6 semanas)

**Priority 10: Documentación**

- [ ] Documentar arquitectura en `docs/architecture.md`
- [ ] Crear guías de contribución específicas
- [ ] Documentar componentes reutilizables
- [ ] Crear ADRs (Architecture Decision Records)

---

## 8. Ejemplos de Refactoring

### Ejemplo Completo: Feature de Instalaciones

**ANTES:**

```
src/
├── components/
│   └── installations/
│       ├── InstallationCard.astro (237 líneas)
│       ├── InstallationForm.astro
│       └── StatusBadge.astro
├── lib/
│   ├── queries/
│   │   └── installations.ts
│   └── actions/
│       └── installations.ts
└── pages/
    └── admin/
        └── installations/
            ├── index.astro
            ├── new.astro
            └── [id].astro
```

**DESPUÉS:**

```
src/
├── features/
│   └── installations/
│       ├── components/
│       │   ├── InstallationCard.astro (80 líneas)
│       │   ├── InstallationCard.test.ts
│       │   ├── InstallationCardCompact.astro
│       │   ├── InstallationForm.astro
│       │   ├── InstallationForm.test.ts
│       │   ├── StatusBadge.astro
│       │   └── MaterialsList.astro
│       ├── logic/
│       │   ├── queries.ts
│       │   ├── queries.test.ts
│       │   ├── mutations.ts
│       │   ├── mutations.test.ts
│       │   ├── types.ts
│       │   └── schemas.ts
│       └── actions.ts (Astro Actions)
└── pages/
    └── admin/
        └── installations/
            ├── index.astro (delgado, solo composición)
            ├── new.astro (delgado, usa actions)
            └── [id].astro (delgado, usa actions)
```

---

## 9. Métricas de Mejora Esperadas

| Métrica                       | Actual   | Objetivo | Mejora         |
| ----------------------------- | -------- | -------- | -------------- |
| Líneas de código duplicado    | ~400     | <50      | -87%           |
| Tests de componentes          | 0        | 15+      | +∞             |
| Cobertura de tests            | ~60%     | 85%+     | +25%           |
| JavaScript en cliente         | Alto     | Bajo     | -70%           |
| Tiempo de navegación          | Baseline | -20%     | Más rápido     |
| Arquitectura Vertical Slicing | 0%       | 100%     | Cumplimiento   |
| Uso de Astro Actions          | 0%       | 100%     | Best practices |
| Accesibilidad (WCAG AA)       | Parcial  | 100%     | Completo       |

---

## 10. Conclusión

El proyecto IMS tiene una **base sólida** pero requiere **refactoring arquitectónico significativo** para cumplir con las mejores prácticas de Astro 5 y Vertical Slicing establecidas en las directrices del proyecto.

### Prioridades Inmediatas:

1. **Migrar a Vertical Slicing** (crítico para escalabilidad)
2. **Implementar Astro Actions** (crítico para type-safety y validación)
3. **Eliminar duplicación de código** (crítico para mantenibilidad)

### Beneficios del Refactoring:

- ✅ **Escalabilidad:** Nuevas features no impactan código existente
- ✅ **Mantenibilidad:** Código centralizado y bien organizado
- ✅ **Type-safety:** Validación automática con Zod
- ✅ **Performance:** Menos JavaScript en cliente
- ✅ **Testing:** Mejor cobertura y facilidad para testear
- ✅ **Developer Experience:** Código más claro y fácil de navegar

### Riesgo de NO Refactorizar:

- ❌ Deuda técnica creciente
- ❌ Dificultad para añadir nuevas features
- ❌ Bugs por código duplicado
- ❌ Performance degradada con más JavaScript
- ❌ Dificultad para onboarding de nuevos desarrolladores

**Recomendación Final:** Ejecutar Fase 1 (Crítico) de inmediato antes de añadir nuevas features. El refactoring ahora evitará problemas mayores en el futuro.

---

**Generado:** 5 de diciembre de 2025
**Revisor:** Claude Code (Astro 5 Expert)

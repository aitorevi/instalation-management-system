# 🏗️ Arquitectura del Proyecto IMS

Esta guía documenta la arquitectura técnica del proyecto **IMS (Installation Management System)**, una Progressive Web Application construida con Astro 5 y Supabase.

## 📊 Visión General

IMS es una aplicación web full-stack que permite gestionar instalaciones con dos roles de usuario:

- **Admin**: Gestiona instalaciones, asigna instaladores, y tiene acceso completo al sistema
- **Installer**: Visualiza instalaciones asignadas y actualiza su progreso

### Stack Tecnológico

```
Frontend:
├── Astro 5 (SSR)               # Framework principal
├── Tailwind CSS                # Estilos
└── TypeScript                  # Type safety

Backend:
├── Supabase Auth               # Autenticación (Google OAuth)
├── PostgreSQL (Supabase)       # Base de datos
└── Row Level Security (RLS)    # Autorización

PWA:
├── Service Worker              # Offline support
├── Web App Manifest            # Instalabilidad
└── Push Notifications          # VAPID (opcional)

Testing:
├── Vitest                      # Unit & Integration tests
└── Playwright                  # E2E tests

Deployment:
└── Vercel                      # Hosting y CI/CD
```

## 🗂️ Estructura del Proyecto

```
instalation-management-system/
├── .docs/                      # 📚 Documentación del proyecto
│   ├── setup-local.md          # Guía de configuración local
│   └── arquitectura.md         # Este archivo
│
├── .husky/                     # 🪝 Git hooks
│   └── pre-commit              # Format & lint antes de commit
│
├── e2e/                        # 🎭 Tests E2E con Playwright
│   ├── admin/                  # Tests de funcionalidades admin
│   └── installer/              # Tests de funcionalidades installer
│
├── public/                     # 📦 Assets estáticos (servidos tal cual)
│   ├── icons/                  # Iconos PWA (192x192, 512x512)
│   ├── manifest.json           # Web App Manifest
│   ├── sw.js                   # Service Worker
│   └── offline.html            # Página offline
│
├── src/
│   ├── components/             # 🧩 Componentes Astro reutilizables
│   │   ├── ui/                 # Componentes genéricos (Button, Input, etc.)
│   │   ├── layout/             # Componentes de layout (Header, Sidebar)
│   │   └── installations/      # Componentes específicos de instalaciones
│   │
│   ├── layouts/                # 📐 Layouts de página
│   │   ├── BaseLayout.astro    # Layout base (HTML, head, scripts)
│   │   ├── AuthLayout.astro    # Layout para páginas de auth
│   │   └── DashboardLayout.astro # Layout para admin/installer
│   │
│   ├── lib/                    # 🔧 Lógica de negocio y utilidades
│   │   ├── actions/            # Server actions (mutations)
│   │   ├── queries/            # Data fetching (queries)
│   │   ├── supabase.ts         # Configuración de Supabase client
│   │   ├── auth.ts             # Lógica de autenticación
│   │   ├── session-timeout.ts  # Manejo de timeouts de sesión
│   │   └── env.ts              # Validación de variables de entorno
│   │
│   ├── middleware/             # 🛡️ Middleware de Astro
│   │   └── index.ts            # Auth + role-based access control
│   │
│   ├── pages/                  # 📄 Páginas (rutas basadas en archivos)
│   │   ├── admin/              # Rutas de admin
│   │   │   ├── installations/  # CRUD de instalaciones
│   │   │   └── installers/     # Gestión de instaladores
│   │   ├── installer/          # Rutas de installer
│   │   │   └── installations/  # Ver instalaciones asignadas
│   │   ├── auth/               # Callbacks de autenticación
│   │   └── index.astro         # Página principal (redirige según rol)
│   │
│   └── types/                  # 📝 Tipos TypeScript
│       ├── database.ts         # Tipos generados de Supabase
│       └── index.ts            # Tipos personalizados
│
├── supabase/
│   └── migrations/             # 🗄️ Migraciones de base de datos
│       ├── 001_initial_schema.sql    # Schema inicial + RLS
│       └── 002_auth_trigger.sql      # Trigger de creación de usuarios
│
├── workspace/                  # 📋 Documentación de planificación
│   ├── context/                # Contexto del proyecto
│   └── planning/               # Fases de implementación
│
├── .env                        # ⚙️ Variables de entorno (NO COMMITEAR)
├── .env.example                # Ejemplo de variables de entorno
├── astro.config.mjs            # Configuración de Astro
├── package.json                # Dependencias del proyecto
├── tsconfig.json               # Configuración de TypeScript
├── tailwind.config.mjs         # Configuración de Tailwind
├── vitest.config.ts            # Configuración de tests unitarios
├── vitest.config.integration.ts # Configuración de tests de integración
└── playwright.config.ts        # Configuración de tests E2E
```

## 🗄️ Modelo de Datos

### Diagrama ER

```
┌─────────────────┐         ┌──────────────────────┐
│  auth.users     │         │      users           │
│  (Supabase)     │◄────────│                      │
│                 │   FK    │  - id (UUID, PK)     │
│  - id           │         │  - email             │
│  - email        │         │  - full_name         │
└─────────────────┘         │  - phone_number      │
                            │  - company_details   │
                            │  - role (enum)       │
                            │  - created_at        │
                            └──────────────────────┘
                                       ▲
                                       │
                                       │ assigned_to
                                       │ created_by
                                       │
                            ┌──────────────────────┐
                            │  installations       │
                            │                      │
                            │  - id (UUID, PK)     │
                            │  - client_name       │
                            │  - client_email      │
                            │  - client_phone      │
                            │  - address           │
                            │  - installation_type │
                            │  - notes             │
                            │  - status (enum)     │
                            │  - assigned_to (FK)  │
                            │  - created_by (FK)   │
                            │  - scheduled_date    │
                            │  - completed_at      │
                            │  - archived_at       │
                            │  - created_at        │
                            │  - updated_at        │
                            └──────────────────────┘
                                       │
                                       │ installation_id
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │    materials         │
                            │                      │
                            │  - id (UUID, PK)     │
                            │  - installation_id   │
                            │  - description       │
                            │  - created_at        │
                            └──────────────────────┘
```

### Tablas

#### **users**

Almacena información de usuarios autenticados.

- **id**: UUID, referencia a `auth.users(id)` de Supabase
- **email**: Correo electrónico del usuario
- **full_name**: Nombre completo
- **phone_number**: Teléfono (opcional)
- **company_details**: Detalles de la empresa (opcional)
- **role**: `admin` | `installer` (enum)
- **created_at**: Timestamp de creación

#### **installations**

Almacena instalaciones.

- **id**: UUID, clave primaria
- **client_name**: Nombre del cliente
- **client_email**: Email del cliente
- **client_phone**: Teléfono del cliente
- **address**: Dirección de la instalación
- **installation_type**: Tipo de instalación (texto libre)
- **notes**: Notas adicionales (opcional)
- **status**: `pending` | `in_progress` | `completed` | `cancelled` (enum)
- **assigned_to**: UUID del instalador asignado (FK a `users.id`)
- **created_by**: UUID del admin que creó la instalación (FK a `users.id`)
- **scheduled_date**: Fecha programada de instalación
- **completed_at**: Timestamp de completado (auto-calculado por trigger)
- **archived_at**: Timestamp de archivado (soft delete)
- **created_at**: Timestamp de creación
- **updated_at**: Timestamp de última actualización (auto-actualizado por trigger)

#### **materials**

Almacena materiales usados en instalaciones.

- **id**: UUID, clave primaria
- **installation_id**: UUID de la instalación (FK a `installations.id`)
- **description**: Descripción del material
- **created_at**: Timestamp de creación

### Enums

```sql
user_role: 'admin' | 'installer'
installation_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
```

### Índices

```sql
idx_installations_assigned_to    -- Optimiza queries por instalador asignado
idx_installations_status         -- Optimiza queries por estado
idx_installations_created_by     -- Optimiza queries por creador
idx_installations_archived       -- Optimiza queries de instalaciones activas
idx_materials_installation_id    -- Optimiza queries de materiales por instalación
```

### Vistas

```sql
active_installations -- Instalaciones no archivadas (archived_at IS NULL)
```

### Triggers

1. **handle_installation_completed**: Actualiza `completed_at` y `updated_at` automáticamente
2. **handle_new_user** (en 002_auth_trigger.sql): Crea registro en `users` al registrarse en Supabase Auth

## 🔒 Seguridad: Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. La autorización se maneja a nivel de base de datos.

### Políticas RLS

#### **users**

| Rol       | Acción | Política                                                 |
| --------- | ------ | -------------------------------------------------------- |
| Admin     | ALL    | Acceso completo a todos los usuarios                     |
| Installer | SELECT | Solo puede leer su propio usuario                        |
| Installer | UPDATE | Solo puede actualizar su propio usuario (excepto el rol) |

#### **installations**

| Rol       | Acción | Política                                                      |
| --------- | ------ | ------------------------------------------------------------- |
| Admin     | ALL    | Acceso completo a todas las instalaciones                     |
| Installer | SELECT | Solo puede leer instalaciones asignadas a él o creadas por él |
| Installer | UPDATE | Solo puede actualizar instalaciones asignadas a él            |

#### **materials**

| Rol       | Acción | Política                                              |
| --------- | ------ | ----------------------------------------------------- |
| Admin     | ALL    | Acceso completo a todos los materiales                |
| Installer | SELECT | Solo puede leer materiales de sus instalaciones       |
| Installer | INSERT | Solo puede crear materiales en sus instalaciones      |
| Installer | UPDATE | Solo puede actualizar materiales de sus instalaciones |
| Installer | DELETE | Solo puede eliminar materiales de sus instalaciones   |

### Funciones Helper para RLS

```sql
get_user_role(user_id UUID) → user_role    -- Obtiene el rol de un usuario
is_admin(user_id UUID) → BOOLEAN           -- Verifica si un usuario es admin
```

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

```
1. Usuario hace clic en "Login con Google"
   │
   ├─→ Redirect a Google OAuth (Supabase maneja el proceso)
   │
2. Usuario autoriza en Google
   │
   ├─→ Redirect a /auth/callback (con código de autorización)
   │
3. Supabase valida el código y crea sesión
   │
   ├─→ Trigger crea registro en tabla users (si no existe)
   │
4. Callback guarda tokens en cookies (httpOnly)
   │   - sb-access-token
   │   - sb-refresh-token
   │
5. Redirect según rol (admin → /admin, installer → /installer)
```

### Middleware de Protección

El archivo `src/middleware/index.ts` protege todas las rutas excepto las públicas:

**Rutas Públicas**:

- `/login`
- `/auth/callback`
- `/auth/logout`
- Assets estáticos (`/_*`, archivos con extensión, `/api/*`)

**Protección por Rol**:

- Rutas `/admin/*` → Solo accesibles para `role: 'admin'`
- Rutas `/installer/*` → Solo accesibles para `role: 'installer'`

**Manejo de Sesiones**:

- **Session timeout**: 24 horas de inactividad máxima
- **Inactivity timeout**: 30 minutos sin actividad
- Se verifica en cada request
- Al expirar, redirige a `/login` con reason code

### Cookies de Sesión

```typescript
sb - access - token; // JWT de acceso (7 días de expiración)
sb - refresh - token; // JWT de refresh (30 días de expiración)
session - created - at; // Timestamp de creación de sesión
last - activity; // Timestamp de última actividad
```

Todas las cookies son:

- `httpOnly: true` → No accesibles desde JavaScript
- `secure: true` en producción → Solo HTTPS
- `sameSite: 'lax'` → Protección contra CSRF

## 🎨 Arquitectura Frontend

### Patrón de Componentes

**Componentes UI Genéricos** (`src/components/ui/`):

- `Button.astro`, `Input.astro`, `Select.astro`, etc.
- Reutilizables, sin lógica de negocio
- Props tipados con TypeScript

**Componentes de Dominio** (`src/components/installations/`):

- `InstallationCard.astro`, `InstallationForm.astro`, etc.
- Específicos del dominio de instalaciones
- Pueden usar componentes UI

**Layouts** (`src/layouts/`):

- `BaseLayout.astro`: HTML base, head, scripts PWA
- `AuthLayout.astro`: Para páginas de login
- `DashboardLayout.astro`: Con Header y Sidebar para admin/installer

### Patrón de Datos: Queries y Actions

El proyecto separa la lógica de datos en dos tipos:

#### **Queries** (`src/lib/queries/`)

Para lectura de datos (SELECT):

```typescript
// src/lib/queries/installations.ts
export async function getInstallations(client: SupabaseClient) {
  const { data, error } = await client
    .from('installations')
    .select('*, assigned_to:users(*)')
    .eq('archived_at', null);

  if (error) throw error;
  return data;
}
```

#### **Actions** (`src/lib/actions/`)

Para mutaciones (INSERT, UPDATE, DELETE):

```typescript
// src/lib/actions/installations.ts
export async function createInstallation(client: SupabaseClient, data: InstallationInsert) {
  const { data: installation, error } = await client
    .from('installations')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return installation;
}
```

### Rutas y Páginas

Astro usa **file-based routing**:

```
src/pages/
├── index.astro                 → / (redirect según rol)
├── login.astro                 → /login
├── error.astro                 → /error
├── auth/
│   ├── callback.astro          → /auth/callback
│   └── logout.astro            → /auth/logout
├── admin/
│   ├── index.astro             → /admin (dashboard)
│   ├── installations/
│   │   ├── index.astro         → /admin/installations (lista)
│   │   ├── new.astro           → /admin/installations/new (crear)
│   │   └── [id].astro          → /admin/installations/:id (detalle)
│   └── installers/
│       ├── index.astro         → /admin/installers (lista)
│       └── [id].astro          → /admin/installers/:id (detalle)
└── installer/
    ├── index.astro             → /installer (dashboard)
    └── installations/
        ├── index.astro         → /installer/installations (lista)
        └── [id].astro          → /installer/installations/:id (detalle)
```

### Server-Side Rendering (SSR)

Todo el renderizado ocurre en el servidor:

```typescript
// Ejemplo: src/pages/admin/installations/index.astro
---
const client = getSupabaseClient(Astro.cookies);
const installations = await getInstallations(client);
---

<DashboardLayout title="Instalaciones">
  {installations.map(inst => (
    <InstallationCard installation={inst} />
  ))}
</DashboardLayout>
```

**Ventajas**:

- SEO-friendly
- Sin hydration overhead
- Datos siempre frescos
- No expone lógica de negocio al cliente

## 📱 Progressive Web App (PWA)

### Service Worker

**Ubicación**: `public/sw.js`

**Estrategias de cache**:

1. **Install**: Precachea assets estáticos (icons, manifest, offline.html)
2. **Fetch**: Network-first para contenido dinámico
   - Si la red falla, intenta cache
   - Si no hay cache y es navegación, muestra offline.html

**Eventos manejados**:

- `install`: Cachea assets estáticos
- `activate`: Limpia caches antiguas
- `fetch`: Maneja requests con estrategia network-first
- `push`: Recibe notificaciones push
- `notificationclick`: Maneja clicks en notificaciones

### Web App Manifest

**Ubicación**: `public/manifest.json`

```json
{
  "name": "IMS - Installation Management System",
  "short_name": "IMS",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" }
  ]
}
```

### Push Notifications (Opcional)

Usa **VAPID** (Voluntary Application Server Identification):

1. Generar claves: `npx web-push generate-vapid-keys`
2. Configurar en `.env`:
   - `PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
3. Solicitar permiso en frontend
4. Enviar notificaciones desde backend/Edge Functions

## 🧪 Testing

### Unit Tests (Vitest)

**Archivos**: `*.test.ts`

```typescript
// src/lib/auth.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './auth';

describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });
});
```

**Comando**: `npm test`

### Integration Tests (Vitest + Supabase)

**Archivos**: `*.integration.test.ts`

```typescript
// src/lib/queries/installations.integration.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { getInstallations } from './installations';

describe('getInstallations', () => {
  const client = createClient(url, key);

  it('should fetch installations', async () => {
    const installations = await getInstallations(client);
    expect(installations).toBeInstanceOf(Array);
  });
});
```

**Comando**: `npm run test:integration`

### E2E Tests (Playwright)

**Archivos**: `e2e/**/*.spec.ts`

```typescript
// e2e/admin/create-installation.spec.ts
import { test, expect } from '@playwright/test';

test('admin can create installation', async ({ page }) => {
  await page.goto('/admin/installations/new');
  await page.fill('[name="client_name"]', 'John Doe');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/admin\/installations\/\w+/);
});
```

**Comandos**:

- `npm run test:e2e` → Headless
- `npm run test:e2e:debug` → UI mode

## 🚀 Deployment (Vercel)

### Configuración

El proyecto está configurado para desplegar en Vercel:

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  adapter: vercel()
});
```

### Variables de Entorno en Vercel

Configurar en Vercel Dashboard:

```
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
PUBLIC_APP_URL=https://tu-app.vercel.app
PUBLIC_VAPID_PUBLIC_KEY=opcional
VAPID_PRIVATE_KEY=opcional
VAPID_SUBJECT=opcional
```

### Build y Deploy

```bash
# Local preview de producción
npm run build
npm run preview

# Deploy automático en Vercel
git push origin main  # Auto-deploy desde main branch
```

## 🔄 Flujos de Usuario

### Admin: Crear Instalación

```
1. Admin navega a /admin/installations
   │
2. Click en "Nueva Instalación"
   │
3. Completa formulario (InstallationForm.astro)
   │
4. Submit → POST request a página
   │
5. Server ejecuta createInstallation() action
   │
6. RLS verifica que user.role === 'admin'
   │
7. INSERT en tabla installations
   │
8. Redirect a /admin/installations/:id
```

### Installer: Actualizar Estado

```
1. Installer navega a /installer/installations/:id
   │
2. Ve detalles de instalación asignada
   │
3. Cambia estado a "In Progress" / "Completed"
   │
4. Submit → POST request a página
   │
5. Server ejecuta updateInstallation() action
   │
6. RLS verifica que installation.assigned_to === auth.uid()
   │
7. UPDATE en tabla installations
   │
8. Trigger actualiza updated_at y completed_at
   │
9. Redirect a /installer/installations/:id
```

## 🎯 Patrones y Convenciones

### Nomenclatura de Archivos

- **Componentes Astro**: PascalCase (`Button.astro`, `InstallationCard.astro`)
- **Utilidades TS**: kebab-case (`auth.ts`, `session-timeout.ts`)
- **Tests unitarios**: `*.test.ts`
- **Tests integración**: `*.integration.test.ts`
- **Tests E2E**: `*.spec.ts`

### Aliases de Imports

```typescript
import { ... } from '@/...'            // src/
import { ... } from '@components/...'  // src/components/
import { ... } from '@lib/...'         // src/lib/
import { ... } from '@layouts/...'     // src/layouts/
import { ... } from '@types/...'       // src/types/
```

### Manejo de Errores

```typescript
// En queries y actions
try {
  const { data, error } = await client.from('table').select();
  if (error) throw error;
  return data;
} catch (error) {
  // Log error en servidor
  console.error('Error description:', error);
  throw error; // Re-throw para manejarlo en la página
}

// En páginas Astro
try {
  const data = await someAction(client, params);
} catch (error) {
  return Astro.redirect('/error?message=' + encodeURIComponent(error.message));
}
```

### Validación de Variables de Entorno

```typescript
// src/lib/env.ts
export function validateEnv() {
  const required = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY', 'PUBLIC_APP_URL'];

  for (const key of required) {
    if (!import.meta.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }
}
```

## 🔧 Mantenimiento

### Actualizar Tipos de Supabase

Después de cambios en el schema:

```bash
npm run db:types
```

Esto regenera `src/types/database.ts` con los últimos tipos de Supabase.

### Migraciones de Base de Datos

1. Crear nueva migración:

   ```bash
   npx supabase migration new nombre_descriptivo
   ```

2. Editar archivo SQL en `supabase/migrations/`

3. Aplicar localmente (si usas Supabase local):

   ```bash
   npx supabase db reset
   ```

4. Aplicar en remoto:
   ```bash
   npx supabase db push
   ```

### Linting y Formato

Antes de cada commit, Husky ejecuta automáticamente:

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

## 📚 Recursos Adicionales

- **Fases de Desarrollo**: Ver `PHASE_XX_SUMMARY.md` en raíz del proyecto
- **Documentación de Setup**: `.docs/setup-local.md`
- **Guía de Contribución**: `CLAUDE.md`
- **Planning**: `workspace/planning/`

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"

- Verifica que `.env` existe y tiene las variables necesarias
- Reinicia el servidor de desarrollo

### Error: "User does not have role"

- Verifica que el usuario existe en la tabla `users` de Supabase
- Asigna un rol (`admin` o `installer`) en la columna `role`

### Tests fallan después de cambios en schema

- Regenera tipos: `npm run db:types`
- Verifica que las políticas RLS están correctas

### Service Worker no se actualiza

- Incrementa `CACHE_NAME` en `public/sw.js`
- Fuerza actualización: DevTools > Application > Service Workers > Update

---

**Última actualización**: Diciembre 2025

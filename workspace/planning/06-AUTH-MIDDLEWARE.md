# Fase 06: Auth Middleware

## Objetivo

Crear middleware que protege las rutas según el rol del usuario.

## Pre-requisitos

- Fases 01-05 completadas
- Login funcionando correctamente

---

## Paso 1: Crear middleware de autenticación

**Archivo:** `src/middleware/index.ts`

```typescript
import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser, isAdmin, isInstaller } from '../lib/auth';

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/logout'];

// Rutas que requieren rol admin
const ADMIN_ROUTES_PREFIX = '/admin';

// Rutas que requieren rol installer
const INSTALLER_ROUTES_PREFIX = '/installer';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return next();
  }

  // Permitir assets estáticos
  if (pathname.startsWith('/_') || pathname.includes('.') || pathname.startsWith('/api')) {
    return next();
  }

  // Obtener usuario actual
  const { user, error } = await getCurrentUser(context.cookies);

  // Si no hay usuario autenticado, redirigir a login
  if (!user) {
    return context.redirect('/login');
  }

  // Verificar acceso a rutas de admin
  if (pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
    if (!isAdmin(user)) {
      // Installer intentando acceder a admin → redirigir a su dashboard
      return context.redirect('/installer');
    }
  }

  // Verificar acceso a rutas de installer
  if (pathname.startsWith(INSTALLER_ROUTES_PREFIX)) {
    if (!isInstaller(user)) {
      // Admin intentando acceder a installer → redirigir a su dashboard
      return context.redirect('/admin');
    }
  }

  // Añadir usuario al contexto local para uso en páginas
  context.locals.user = user;

  return next();
});
```

**Verificación:** Archivo existe en `src/middleware/`

---

## Paso 2: Declarar tipos para locals

**Archivo:** `src/env.d.ts` (Actualizar)

```typescript
/// <reference types="astro/client" />

import type { User } from './lib/supabase';

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

// Tipos para Astro.locals
declare namespace App {
  interface Locals {
    user: User;
  }
}
```

**Verificación:** Archivo actualizado con namespace App

---

## Paso 3: Actualizar páginas admin para usar locals

**Archivo:** `src/pages/admin/index.astro` (Actualizar)

```astro
---
// Usuario disponible desde middleware
const user = Astro.locals.user;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Dashboard | IMS</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🔧 Admin Dashboard</h1>
      <p class="text-gray-600 mb-2">Bienvenido, {user.full_name}</p>
      <p class="text-sm text-gray-500 mb-4">Rol: {user.role}</p>
      <a href="/auth/logout" class="text-primary-600 hover:underline">Cerrar Sesión</a>
    </div>
  </body>
</html>
```

**Verificación:** Muestra nombre del usuario

---

## Paso 4: Actualizar páginas installer para usar locals

**Archivo:** `src/pages/installer/index.astro` (Actualizar)

```astro
---
// Usuario disponible desde middleware
const user = Astro.locals.user;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Installer Dashboard | IMS</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">👷 Installer Dashboard</h1>
      <p class="text-gray-600 mb-2">Bienvenido, {user.full_name}</p>
      <p class="text-sm text-gray-500 mb-4">Rol: {user.role}</p>
      <a href="/auth/logout" class="text-primary-600 hover:underline">Cerrar Sesión</a>
    </div>
  </body>
</html>
```

**Verificación:** Muestra nombre del usuario

---

## Paso 5: Probar protección de rutas

### Test 1: Usuario no autenticado

1. Cerrar sesión: `http://localhost:4321/auth/logout`
2. Intentar acceder a: `http://localhost:4321/admin`
3. **Esperado:** Redirige a `/login`

### Test 2: Usuario admin

1. Login con usuario admin
2. Acceder a: `http://localhost:4321/admin`
3. **Esperado:** Muestra dashboard admin con nombre
4. Intentar: `http://localhost:4321/installer`
5. **Esperado:** Redirige a `/admin`

### Test 3: Usuario installer

Para probar, necesitas un segundo usuario con rol installer:

1. En Supabase SQL Editor:

```sql
-- Crear un installer de prueba (después de que haga login)
UPDATE users SET role = 'installer' WHERE email = 'otro-email@gmail.com';
```

2. Login con ese usuario
3. Acceder a: `http://localhost:4321/installer`
4. **Esperado:** Muestra dashboard installer con nombre
5. Intentar: `http://localhost:4321/admin`
6. **Esperado:** Redirige a `/installer`

**Verificación:** Todos los tests pasan

---

## Paso 6: Crear helper para obtener usuario en páginas

**Archivo:** `src/lib/page-utils.ts`

```typescript
import type { AstroGlobal } from 'astro';
import type { User } from './supabase';

// Obtener usuario desde Astro.locals (después del middleware)
export function getUser(Astro: AstroGlobal): User {
  return Astro.locals.user;
}

// Verificar si el usuario es admin
export function requireAdmin(Astro: AstroGlobal): User {
  const user = Astro.locals.user;
  if (user.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return user;
}

// Verificar si el usuario es installer
export function requireInstaller(Astro: AstroGlobal): User {
  const user = Astro.locals.user;
  if (user.role !== 'installer') {
    throw new Error('Unauthorized');
  }
  return user;
}
```

**Verificación:** Archivo existe en `src/lib/`

---

## Checklist Final Fase 06

- [ ] `src/middleware/index.ts` creado con lógica de protección
- [ ] `src/env.d.ts` actualizado con namespace App.Locals
- [ ] `src/pages/admin/index.astro` usa Astro.locals.user
- [ ] `src/pages/installer/index.astro` usa Astro.locals.user
- [ ] Usuario no auth redirige a /login
- [ ] Admin no puede acceder a /installer
- [ ] Installer no puede acceder a /admin
- [ ] `src/lib/page-utils.ts` creado con helpers

---

## Siguiente Fase

→ `07-LAYOUTS.md` - Crear layouts base para la aplicación

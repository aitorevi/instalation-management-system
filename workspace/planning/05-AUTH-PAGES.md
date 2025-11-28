# Fase 05: Auth Pages

## Objetivo

Crear las páginas de login, callback OAuth y logout.

## Pre-requisitos

- Fases 01-04 completadas
- Google OAuth configurado y funcionando

---

## Paso 1: Crear AuthLayout

**Archivo:** `src/layouts/AuthLayout.astro`

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="IMS - Sistema de Gestión de Instalaciones" />
    <title>{title} | IMS</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body
    class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4"
  >
    <slot />
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

**Verificación:** Archivo existe en `src/layouts/`

---

## Paso 2: Crear página de Login

**Archivo:** `src/pages/login.astro`

```astro
---
import AuthLayout from '../layouts/AuthLayout.astro';
import { getCurrentUser } from '../lib/auth';

// Si ya está logueado, redirigir
const { user } = await getCurrentUser(Astro.cookies);

if (user) {
  const redirectUrl = user.role === 'admin' ? '/admin' : '/installer';
  return Astro.redirect(redirectUrl);
}

// URL para login con Google
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const appUrl = import.meta.env.PUBLIC_APP_URL;
const googleAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${appUrl}/auth/callback`)}`;
---

<AuthLayout title="Iniciar Sesión">
  <div class="w-full max-w-md">
    <!-- Logo/Header -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4"
      >
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          ></path>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">IMS</h1>
      <p class="text-gray-600 mt-1">Sistema de Gestión de Instalaciones</p>
    </div>

    <!-- Card de Login -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-900 text-center mb-6">Iniciar Sesión</h2>

      <!-- Botón Google -->
      <a
        href={googleAuthUrl}
        class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          ></path>
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          ></path>
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          ></path>
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          ></path>
        </svg>
        <span class="text-gray-700 font-medium">Continuar con Google</span>
      </a>

      <p class="text-center text-sm text-gray-500 mt-6">Solo usuarios autorizados pueden acceder</p>
    </div>

    <!-- Footer -->
    <p class="text-center text-sm text-gray-400 mt-8">
      &copy; 2024 IMS. Todos los derechos reservados.
    </p>
  </div>
</AuthLayout>
```

**Verificación:** Archivo existe en `src/pages/`

---

## Paso 3: Crear página de Callback OAuth

**Archivo:** `src/pages/auth/callback.astro`

```astro
---
import AuthLayout from '../../layouts/AuthLayout.astro';
import { supabase } from '../../lib/supabase';

// Obtener código de la URL
const code = Astro.url.searchParams.get('code');
const error = Astro.url.searchParams.get('error');
const errorDescription = Astro.url.searchParams.get('error_description');

let authError: string | null = null;
let redirectUrl = '/login';

if (error) {
  authError = errorDescription || error;
} else if (code) {
  // Intercambiar código por sesión
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    authError = exchangeError.message;
  } else if (data.session) {
    // Guardar tokens en cookies
    Astro.cookies.set('sb-access-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    Astro.cookies.set('sb-refresh-token', data.session.refresh_token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 días
    });

    // Obtener rol del usuario para redirigir
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    redirectUrl = userData?.role === 'admin' ? '/admin' : '/installer';

    // Redirigir
    return Astro.redirect(redirectUrl);
  }
} else {
  authError = 'No authorization code received';
}
---

<AuthLayout title="Procesando...">
  <div class="w-full max-w-md">
    <div class="card text-center">
      {
        authError ? (
          <>
            <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
            <p class="text-gray-600 mb-6">{authError}</p>
            <a href="/login" class="btn-primary">
              Volver a Intentar
            </a>
          </>
        ) : (
          <>
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <svg class="w-6 h-6 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Procesando...</h2>
            <p class="text-gray-600">Verificando autenticación</p>
          </>
        )
      }
    </div>
  </div>
</AuthLayout>
```

**Verificación:** Archivo existe en `src/pages/auth/`

---

## Paso 4: Crear API de Logout

**Archivo:** `src/pages/auth/logout.astro`

```astro
---
import { signOut } from '../../lib/auth';

// Limpiar cookies
signOut(Astro.cookies);

// Redirigir al login
return Astro.redirect('/login');
---
```

**Verificación:** Archivo existe en `src/pages/auth/`

---

## Paso 5: Actualizar página index

**Archivo:** `src/pages/index.astro`

```astro
---
import { getCurrentUser } from '../lib/auth';

// Obtener usuario actual
const { user } = await getCurrentUser(Astro.cookies);

// Redirigir según estado de auth
if (!user) {
  return Astro.redirect('/login');
}

// Redirigir según rol
const redirectUrl = user.role === 'admin' ? '/admin' : '/installer';
return Astro.redirect(redirectUrl);
---
```

**Verificación:** Archivo actualizado

---

## Paso 6: Crear páginas placeholder para dashboards

**Archivo:** `src/pages/admin/index.astro`

```astro
---
// Placeholder - será reemplazado en Fase 09
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
      <p class="text-gray-600 mb-4">Placeholder - Fase 09</p>
      <a href="/auth/logout" class="text-primary-600 hover:underline">Cerrar Sesión</a>
    </div>
  </body>
</html>
```

**Verificación:** Archivo existe en `src/pages/admin/`

---

**Archivo:** `src/pages/installer/index.astro`

```astro
---
// Placeholder - será reemplazado en Fase 12
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
      <p class="text-gray-600 mb-4">Placeholder - Fase 12</p>
      <a href="/auth/logout" class="text-primary-600 hover:underline">Cerrar Sesión</a>
    </div>
  </body>
</html>
```

**Verificación:** Archivo existe en `src/pages/installer/`

---

## Paso 7: Probar flujo completo

1. Iniciar servidor: `npm run dev`
2. Ir a `http://localhost:4321`
3. Debería redirigir a `/login`
4. Click en "Continuar con Google"
5. Autenticarse con Google
6. Debería redirigir a `/admin` o `/installer` según tu rol
7. Click en "Cerrar Sesión"
8. Debería volver a `/login`

**Verificación:** Todo el flujo funciona correctamente

---

## Checklist Final Fase 05

- [ ] `src/layouts/AuthLayout.astro` creado
- [ ] `src/pages/login.astro` con botón de Google
- [ ] `src/pages/auth/callback.astro` procesa OAuth
- [ ] `src/pages/auth/logout.astro` limpia cookies
- [ ] `src/pages/index.astro` redirige según auth
- [ ] `src/pages/admin/index.astro` placeholder
- [ ] `src/pages/installer/index.astro` placeholder
- [ ] Flujo login → dashboard → logout funciona

---

## Siguiente Fase

→ `06-AUTH-MIDDLEWARE.md` - Proteger rutas por rol

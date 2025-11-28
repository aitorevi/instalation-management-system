# Fase 07: Layouts

## Objetivo

Crear los layouts base de la aplicación: BaseLayout y DashboardLayout.

## Pre-requisitos

- Fases 01-06 completadas

---

## Paso 1: Crear BaseLayout

**Archivo:** `src/layouts/BaseLayout.astro`

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Sistema de Gestión de Instalaciones' } = Astro.props;
const appUrl = import.meta.env.PUBLIC_APP_URL;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2563eb" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="IMS" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />

    <title>{title} | IMS</title>
  </head>
  <body class="min-h-screen bg-gray-50">
    <slot />

    <!-- Service Worker Registration -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => console.log('SW registered'))
            .catch((err) => console.log('SW registration failed:', err));
        });
      }
    </script>
  </body>
</html>

<style is:global>
  @import '../styles/global.css';
</style>
```

**Verificación:** Archivo existe en `src/layouts/`

---

## Paso 2: Crear componente Header

**Archivo:** `src/components/layout/Header.astro`

```astro
---
import type { User } from '../../lib/supabase';

interface Props {
  user: User;
}

const { user } = Astro.props;
const isAdmin = user.role === 'admin';
---

<header class="bg-white border-b border-gray-200 sticky top-0 z-30">
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo + Mobile menu button -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          id="mobile-menu-button"
          aria-label="Abrir menú"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <a href={isAdmin ? '/admin' : '/installer'} class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
          </div>
          <span class="font-semibold text-gray-900 hidden sm:block">IMS</span>
        </a>
      </div>

      <!-- User menu -->
      <div class="flex items-center gap-4">
        <div class="hidden sm:flex items-center gap-2 text-sm">
          <span class="text-gray-600">{user.full_name}</span>
          <span
            class={`px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
          >
            {isAdmin ? 'Admin' : 'Installer'}
          </span>
        </div>

        <a
          href="/auth/logout"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Cerrar sesión"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  </div>
</header>
```

**Verificación:** Archivo existe en `src/components/layout/`

---

## Paso 3: Crear componente Sidebar

**Archivo:** `src/components/layout/Sidebar.astro`

```astro
---
import type { User } from '../../lib/supabase';

interface Props {
  user: User;
  currentPath: string;
}

const { user, currentPath } = Astro.props;
const isAdmin = user.role === 'admin';

// Definir navegación según rol
const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: 'home' },
  { href: '/admin/installations', label: 'Instalaciones', icon: 'clipboard' },
  { href: '/admin/installers', label: 'Instaladores', icon: 'users' }
];

const installerNav = [
  { href: '/installer', label: 'Dashboard', icon: 'home' },
  { href: '/installer/installations', label: 'Mis Instalaciones', icon: 'clipboard' }
];

const navItems = isAdmin ? adminNav : installerNav;

// Helper para verificar ruta activa
function isActive(href: string): boolean {
  if (href === '/admin' || href === '/installer') {
    return currentPath === href;
  }
  return currentPath.startsWith(href);
}

// Iconos SVG
const icons: Record<string, string> = {
  home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>',
  clipboard:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>',
  users:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>'
};
---

<!-- Desktop Sidebar -->
<aside
  class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-16"
>
  <nav class="flex-1 px-4 py-6 space-y-1">
    {
      navItems.map((item) => (
        <a
          href={item.href}
          class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            set:html={icons[item.icon]}
          />
          {item.label}
        </a>
      ))
    }
  </nav>
</aside>

<!-- Mobile Sidebar (overlay) -->
<div id="mobile-sidebar-overlay" class="fixed inset-0 z-40 bg-black/50 lg:hidden hidden"></div>

<aside
  id="mobile-sidebar"
  class="fixed inset-y-0 left-0 z-50 w-64 bg-white transform -translate-x-full transition-transform lg:hidden"
>
  <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
    <span class="font-semibold text-gray-900">IMS</span>
    <button
      type="button"
      class="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
      id="mobile-menu-close"
      aria-label="Cerrar menú"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>

  <nav class="px-4 py-6 space-y-1">
    {
      navItems.map((item) => (
        <a
          href={item.href}
          class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            set:html={icons[item.icon]}
          />
          {item.label}
        </a>
      ))
    }
  </nav>

  <!-- User info en mobile -->
  <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
        <span class="text-sm font-medium text-gray-600">
          {user.full_name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
        <p class="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  </div>
</aside>

<script>
  // Toggle mobile sidebar
  const menuButton = document.getElementById('mobile-menu-button');
  const closeButton = document.getElementById('mobile-menu-close');
  const sidebar = document.getElementById('mobile-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');

  function openSidebar() {
    sidebar?.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar?.classList.add('-translate-x-full');
    overlay?.classList.add('hidden');
  }

  menuButton?.addEventListener('click', openSidebar);
  closeButton?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
</script>
```

**Verificación:** Archivo existe en `src/components/layout/`

---

## Paso 4: Crear DashboardLayout

**Archivo:** `src/layouts/DashboardLayout.astro`

```astro
---
import BaseLayout from './BaseLayout.astro';
import Header from '../components/layout/Header.astro';
import Sidebar from '../components/layout/Sidebar.astro';
import type { User } from '../lib/supabase';

interface Props {
  title: string;
  user: User;
}

const { title, user } = Astro.props;
const currentPath = Astro.url.pathname;
---

<BaseLayout title={title}>
  <div class="min-h-screen">
    <Header user={user} />
    <Sidebar user={user} currentPath={currentPath} />

    <!-- Main content -->
    <main class="lg:pl-64 pt-16">
      <div class="px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>
  </div>
</BaseLayout>
```

**Verificación:** Archivo existe en `src/layouts/`

---

## Paso 5: Actualizar página Admin Dashboard

**Archivo:** `src/pages/admin/index.astro` (Reemplazar completamente)

```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';

const user = Astro.locals.user;
---

<DashboardLayout title="Dashboard" user={user}>
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    <p class="text-gray-600 mt-1">Bienvenido de nuevo, {user.full_name}</p>
  </div>

  <!-- Stats Grid - Placeholder -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>

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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>

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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>

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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Placeholder para contenido futuro -->
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Próximas Instalaciones</h2>
    <p class="text-gray-500">El contenido se añadirá en la Fase 09</p>
  </div>
</DashboardLayout>
```

**Verificación:** Página muestra layout completo con sidebar

---

## Paso 6: Actualizar página Installer Dashboard

**Archivo:** `src/pages/installer/index.astro` (Reemplazar completamente)

```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';

const user = Astro.locals.user;
---

<DashboardLayout title="Dashboard" user={user}>
  <!-- Page Header -->
  <div class="mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Mis Instalaciones</h1>
    <p class="text-gray-600 mt-1">Bienvenido, {user.full_name}</p>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">En Progreso</p>
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>

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
          <p class="text-2xl font-semibold text-gray-900">--</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Placeholder -->
  <div class="card">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Instalaciones de Hoy</h2>
    <p class="text-gray-500">El contenido se añadirá en la Fase 12</p>
  </div>
</DashboardLayout>
```

**Verificación:** Página muestra layout completo con sidebar

---

## Paso 7: Verificar todo funciona

1. `npm run dev`
2. Login como admin → Ver dashboard con sidebar y header
3. Click en menú mobile (en pantalla pequeña) → Funciona
4. Logout y login como installer → Ver dashboard de installer
5. Verificar que navegación muestra items correctos según rol

**Verificación:** Todo el layout funciona correctamente

---

## Checklist Final Fase 07

- [ ] `src/layouts/BaseLayout.astro` con meta PWA
- [ ] `src/components/layout/Header.astro` con user menu
- [ ] `src/components/layout/Sidebar.astro` con nav por rol
- [ ] `src/layouts/DashboardLayout.astro` integra todo
- [ ] Admin dashboard usa DashboardLayout
- [ ] Installer dashboard usa DashboardLayout
- [ ] Sidebar mobile funciona (toggle)
- [ ] Navegación muestra items según rol

---

## Siguiente Fase

→ `08-UI-COMPONENTS.md` - Crear componentes UI reutilizables

# Fase 01: Project Setup

## Objetivo

Crear el proyecto Astro con todas las dependencias necesarias y configuración base.

## Pre-requisitos

- Node.js 18+ instalado
- npm o pnpm disponible

---

## Paso 1: Crear proyecto Astro

```bash
npm create astro@latest ims -- --template minimal --typescript strict --git --install
cd ims
```

**Verificación:** Existe carpeta `ims/` con `package.json`

---

## Paso 2: Instalar dependencias

```bash
npm install @astrojs/tailwind @astrojs/vercel tailwindcss @supabase/supabase-js
```

**Dependencias instaladas:**

- `@astrojs/tailwind` - Integración Tailwind
- `@astrojs/vercel` - Adapter para deploy
- `tailwindcss` - CSS framework
- `@supabase/supabase-js` - Cliente Supabase

**Verificación:** `package.json` contiene las 4 dependencias

---

## Paso 3: Configurar Astro

**Archivo:** `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()]
});
```

**Verificación:** Archivo existe con contenido exacto

---

## Paso 4: Configurar Tailwind

**Archivo:** `tailwind.config.mjs`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
};
```

**Verificación:** Archivo existe en raíz del proyecto

---

## Paso 5: Crear estilos globales

**Archivo:** `src/styles/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-gray-50 text-gray-900 min-h-screen;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-secondary {
    @apply btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500;
  }

  .btn-danger {
    @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }

  .input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
}
```

**Verificación:** Archivo existe en `src/styles/`

---

## Paso 6: Crear .env.example

**Archivo:** `.env.example`

```env
# Supabase (Settings > API en dashboard)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App
PUBLIC_APP_URL=http://localhost:4321

# Push Notifications (generar con: npx web-push generate-vapid-keys)
PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

**Verificación:** Archivo existe en raíz

---

## Paso 7: Actualizar .gitignore

**Archivo:** `.gitignore`

```
# Dependencies
node_modules/

# Build
dist/
.vercel/
.astro/

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

**Verificación:** `.gitignore` contiene `.env`

---

## Paso 8: Crear estructura de carpetas

```bash
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/installations
mkdir -p src/components/notifications
mkdir -p src/layouts
mkdir -p src/lib
mkdir -p src/middleware
mkdir -p src/types
mkdir -p src/pages/auth
mkdir -p src/pages/admin/installations
mkdir -p src/pages/admin/installers
mkdir -p src/pages/installer/installations
mkdir -p supabase/migrations
mkdir -p supabase/functions/notify-installer
mkdir -p public/icons
```

**Verificación:** Todas las carpetas existen

---

## Paso 9: Crear página temporal

**Archivo:** `src/pages/index.astro`

```astro
---
// Página temporal - será reemplazada en Fase 06
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IMS - Setup Complete</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">✅ IMS Setup Complete</h1>
      <p class="text-gray-600">Fase 01 completada correctamente</p>
    </div>
  </body>
</html>
```

**Verificación:** Archivo existe

---

## Paso 10: Verificar que compila

```bash
npm run dev
```

**Verificación:**

1. No hay errores en consola
2. Navegador en `http://localhost:4321` muestra "IMS Setup Complete"
3. Ctrl+C para detener

---

## Checklist Final Fase 01

- [ ] Proyecto creado con `npm create astro`
- [ ] 4 dependencias instaladas
- [ ] `astro.config.mjs` configurado con SSR + Vercel + Tailwind
- [ ] `tailwind.config.mjs` con colores primary
- [ ] `src/styles/global.css` con clases base
- [ ] `.env.example` creado
- [ ] `.gitignore` actualizado
- [ ] Estructura de carpetas creada
- [ ] `npm run dev` funciona sin errores

---

## Siguiente Fase

→ `02-SUPABASE-SETUP.md` - Crear proyecto en Supabase y aplicar schema

# Fase 14: PWA Setup

## Objetivo

Configurar la aplicación como PWA: manifest, iconos, service worker para funcionamiento offline básico.

## Pre-requisitos

- Fases 01-13 completadas

---

## Paso 1: Crear iconos de la aplicación

### Opción A: Generar iconos manualmente

Necesitas crear estos iconos en `public/icons/`:

- `icon-192.png` (192x192 px)
- `icon-512.png` (512x512 px)
- `apple-touch-icon.png` (180x180 px)

**Diseño sugerido:** Fondo azul (#2563eb) con icono de edificio/casa en blanco.

### Opción B: Usar placeholder temporal

**Archivo:** `public/icons/icon-192.png`

Crear un placeholder usando ImageMagick (si está disponible):

```bash
convert -size 192x192 xc:#2563eb -fill white -gravity center -pointsize 80 -annotate 0 "IMS" public/icons/icon-192.png
```

O simplemente descargar/crear manualmente iconos simples.

**Verificación:** Existen los 3 archivos de iconos

---

## Paso 2: Crear favicon SVG

**Archivo:** `public/favicon.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#2563eb"/>
  <path d="M50 20 L80 45 L80 80 L20 80 L20 45 Z" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="40" y="55" width="20" height="25" fill="white" rx="2"/>
  <circle cx="50" cy="38" r="8" fill="white"/>
</svg>
```

**Verificación:** Archivo existe en `public/`

---

## Paso 3: Crear Web App Manifest

**Archivo:** `public/manifest.json`

```json
{
  "name": "IMS - Installation Management System",
  "short_name": "IMS",
  "description": "Sistema de gestión de instalaciones",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "lang": "es",
  "dir": "ltr"
}
```

**Verificación:** Archivo existe en `public/`

---

## Paso 4: Crear Service Worker básico

**Archivo:** `public/sw.js`

```javascript
const CACHE_NAME = 'ims-cache-v1';

// Assets estáticos para cachear
const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instalar: cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Activar inmediatamente sin esperar
        return self.skipWaiting();
      })
  );
});

// Activar: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Tomar control de todas las páginas
        return self.clients.claim();
      })
  );
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Ignorar requests de API/auth
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.includes('supabase')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si es exitoso, guardar en cache
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si es navegación, mostrar página offline
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Escuchar mensajes (para futuras notificaciones push)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notifications (preparado para Fase 15)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  };

  event.waitUntil(self.registration.showNotification(data.title || 'IMS', options));
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Buscar ventana existente
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

**Verificación:** Archivo existe en `public/`

---

## Paso 5: Crear página offline

**Archivo:** `public/offline.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sin conexión | IMS</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .container {
        text-align: center;
        max-width: 400px;
      }

      .icon {
        width: 80px;
        height: 80px;
        background: #fee2e2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
      }

      .icon svg {
        width: 40px;
        height: 40px;
        color: #dc2626;
      }

      h1 {
        font-size: 24px;
        color: #1f2937;
        margin-bottom: 12px;
      }

      p {
        color: #6b7280;
        margin-bottom: 24px;
        line-height: 1.5;
      }

      button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }

      button:hover {
        background: #1d4ed8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          ></path>
        </svg>
      </div>

      <h1>Sin conexión</h1>
      <p>No tienes conexión a internet. Verifica tu conexión e intenta de nuevo.</p>

      <button onclick="location.reload()">Reintentar</button>
    </div>
  </body>
</html>
```

**Verificación:** Archivo existe en `public/`

---

## Paso 6: Verificar registro del Service Worker

El registro ya está en `BaseLayout.astro` (creado en Fase 07). Verificar que existe:

```astro
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
```

**Verificación:** Script existe en BaseLayout.astro

---

## Paso 7: Probar PWA

### Test 1: Verificar manifest

1. Abrir DevTools (F12)
2. Ir a Application > Manifest
3. **Esperado:** Ver datos del manifest correctamente

### Test 2: Verificar Service Worker

1. En DevTools > Application > Service Workers
2. **Esperado:** Service Worker registrado y activo

### Test 3: Verificar instalabilidad

1. En Chrome, debería aparecer el icono de instalar en la barra de direcciones
2. O en DevTools > Application > Manifest, sección "Installability"
3. **Esperado:** "Installable" o similar

### Test 4: Instalar PWA

1. Click en "Instalar" (o desde menú de Chrome > "Instalar IMS")
2. **Esperado:** App se instala y se puede abrir como aplicación independiente

### Test 5: Probar offline

1. En DevTools > Network, activar "Offline"
2. Recargar la página
3. **Esperado:** Ver página offline.html
4. Desactivar offline

### Test 6: Probar en móvil

1. Abrir la app en móvil
2. En Safari (iOS): Compartir > Añadir a pantalla de inicio
3. En Chrome (Android): Menú > Instalar aplicación
4. **Esperado:** Se instala como app nativa

**Verificación:** Todos los tests pasan

---

## Paso 8: (Opcional) Crear iconos reales

Si quieres iconos profesionales, puedes:

1. Usar una herramienta online como [PWA Asset Generator](https://pwa-asset-generator.nicholaslatifi.com/)
2. Diseñar en Figma/Canva y exportar
3. Usar un generador de iconos

**Recomendación:** Un icono simple con fondo azul (#2563eb) y un símbolo de edificio o herramienta en blanco.

---

## Checklist Final Fase 14

- [ ] `public/favicon.svg` creado
- [ ] `public/icons/icon-192.png` existe
- [ ] `public/icons/icon-512.png` existe
- [ ] `public/icons/apple-touch-icon.png` existe
- [ ] `public/manifest.json` configurado
- [ ] `public/sw.js` implementado
- [ ] `public/offline.html` creado
- [ ] Registro de SW en BaseLayout.astro
- [ ] Manifest se carga correctamente
- [ ] Service Worker se registra
- [ ] App es instalable
- [ ] Página offline funciona

---

## Siguiente Fase

→ `15-PUSH-NOTIFICATIONS.md` - Implementar notificaciones push

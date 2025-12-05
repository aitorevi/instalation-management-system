# Progressive Web App (PWA) - IMS

Este documento describe la configuración y uso de la Progressive Web App del sistema IMS.

## 📋 Tabla de Contenidos

- [Características PWA](#características-pwa)
- [Configuración Técnica](#configuración-técnica)
- [Instalación para Usuarios](#instalación-para-usuarios)
- [Verificación y Testing](#verificación-y-testing)
- [Troubleshooting](#troubleshooting)
- [Desarrollo](#desarrollo)

## ✨ Características PWA

La aplicación IMS está configurada como una Progressive Web App, lo que proporciona:

- **📱 Instalable**: Se puede instalar en dispositivos móviles y escritorio como una aplicación nativa
- **🔔 Notificaciones Push**: Soporte para notificaciones push usando VAPID
- **📶 Offline**: Funcionalidad básica offline con Service Worker
- **⚡ Rendimiento**: Cache de recursos estáticos para carga rápida
- **🎨 Pantalla Completa**: Se ejecuta en modo standalone sin barras del navegador

## 🔧 Configuración Técnica

### Archivos Principales

```
public/
├── manifest.json          # Web App Manifest con configuración PWA
├── sw.js                  # Service Worker para cache y notificaciones
├── offline.html           # Página mostrada cuando no hay conexión
└── icons/
    ├── icon-192.png       # Icono para Android/Chrome
    └── icon-512.png       # Icono de alta resolución
```

### Manifest (`public/manifest.json`)

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
  ]
}
```

### Service Worker (`public/sw.js`)

El Service Worker implementa:

- **Cache de recursos estáticos**: favicon, manifest, iconos, página offline
- **Network-first con fallback**: Intenta red primero, luego cache
- **Página offline**: Muestra `/offline.html` cuando no hay conexión
- **Push notifications**: Manejo de notificaciones push con VAPID
- **Actualización automática**: Limpia caches antiguos al actualizar

### Registro del Service Worker

El Service Worker se registra automáticamente en todos los layouts:

```astro
<!-- src/layouts/BaseLayout.astro y AuthLayout.astro -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[SW] Registered'))
        .catch((err) => console.error('[SW] Registration failed:', err));
    });
  }
</script>
```

## 📱 Instalación para Usuarios

### Android (Chrome)

#### Opción 1: Banner Automático

Chrome puede mostrar un banner de instalación automáticamente después de que el usuario:

- Visite la aplicación al menos 2 veces
- Con al menos 5 minutos entre visitas
- En días diferentes

**Nota**: Chrome es conservador con el banner para evitar spam. No siempre aparece inmediatamente.

#### Opción 2: Instalación Manual (Recomendado)

1. Abre la aplicación en Chrome: `https://instalation-management-system.vercel.app/`
2. Toca el menú (tres puntos verticales) en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Add to Home screen"**
4. Confirma la instalación
5. La app aparecerá en tu pantalla de inicio y cajón de aplicaciones

### iOS (Safari)

**Nota**: Safari NO muestra banner automático. La instalación siempre es manual.

1. Abre la aplicación en Safari: `https://instalation-management-system.vercel.app/`
2. Toca el botón de **compartir** (cuadrado con flecha hacia arriba) en la parte inferior
3. Desplázate hacia abajo en el menú
4. Selecciona **"Añadir a la pantalla de inicio"** o **"Add to Home Screen"**
5. Personaliza el nombre si lo deseas
6. Toca **"Añadir"**
7. La app aparecerá como icono en tu pantalla de inicio

### Desktop (Chrome/Edge)

1. Abre la aplicación en Chrome o Edge
2. Busca el icono de instalación (➕) en la barra de direcciones
3. Haz clic y confirma la instalación
4. La app se instalará como aplicación de escritorio

## 🧪 Verificación y Testing

### Verificar en Chrome DevTools

1. Abre la aplicación en Chrome
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Application**

#### Manifest

- Navega a **Manifest** en el panel izquierdo
- Verifica que toda la configuración se muestre correctamente
- Revisa que los iconos carguen sin errores
- Usa el botón **"Add to homescreen"** para forzar instalación

#### Service Workers

- Navega a **Service Workers** en el panel izquierdo
- Debes ver `/sw.js` con estado **"activated and is running"**
- Verifica que no haya errores en la consola

#### Cache Storage

- Navega a **Cache Storage**
- Debes ver `ims-cache-v1` con recursos cacheados:
  - `/favicon.svg`
  - `/manifest.json`
  - `/icons/icon-192.png`
  - `/icons/icon-512.png`
  - `/offline.html`

### Testing de Instalación

#### Lighthouse (Chrome DevTools)

1. Abre DevTools → Pestaña **Lighthouse**
2. Selecciona **"Progressive Web App"**
3. Haz clic en **"Analyze page load"**
4. Revisa el puntaje PWA (debería ser >90)

#### Verificar Criterios de Instalación

En DevTools → Application → Manifest, verifica:

- ✅ Se sirve sobre HTTPS
- ✅ Incluye un Web App Manifest con:
  - `name` o `short_name`
  - `icons` (debe incluir 192px y 512px)
  - `start_url`
  - `display` (debe ser `standalone`, `fullscreen`, o `minimal-ui`)
- ✅ Registra un Service Worker con evento `fetch`

### Testing Offline

1. Abre DevTools → Network
2. Marca la casilla **"Offline"**
3. Recarga la página
4. Deberías ver la página `/offline.html` en lugar de error de conexión

## 🔍 Troubleshooting

### El banner de instalación no aparece (Android Chrome)

**Posibles causas:**

1. **Criterios de instalación no cumplidos**
   - Chrome requiere 2+ visitas en días diferentes
   - Solución: Usa instalación manual desde el menú

2. **Ya instalaste la app antes**
   - Chrome no muestra el banner si ya está instalada
   - Solución: Desinstala y prueba de nuevo, o verifica en el cajón de apps

3. **HTTPS no disponible**
   - PWA requiere HTTPS (excepto `localhost`)
   - Solución: Verifica que estés en producción con HTTPS

4. **Service Worker no registrado**
   - Revisa DevTools → Application → Service Workers
   - Solución: Verifica errores en consola del navegador

### La app no funciona offline

1. **Verifica el Service Worker**:
   - DevTools → Application → Service Workers debe mostrar estado "activated"

2. **Verifica el cache**:
   - DevTools → Application → Cache Storage debe tener recursos

3. **Limpia y recarga**:
   ```javascript
   // En consola del navegador
   navigator.serviceWorker.getRegistrations().then((registrations) => {
     registrations.forEach((reg) => reg.unregister());
   });
   caches.keys().then((keys) => {
     keys.forEach((key) => caches.delete(key));
   });
   ```

### Notificaciones push no funcionan

1. **Verifica permisos**:
   - En el navegador, revisa configuración → Permisos → Notificaciones

2. **Verifica VAPID keys**:
   - Asegúrate de que las variables de entorno estén configuradas:
     - `PUBLIC_VAPID_PUBLIC_KEY`
     - `VAPID_PRIVATE_KEY`
     - `VAPID_SUBJECT`

3. **Testing en local**:
   - Push requiere HTTPS (no funciona en desarrollo local sin certificado)

### Service Worker no actualiza

```javascript
// Fuerza actualización en consola
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((reg) => reg.update());
});
```

O usa DevTools → Application → Service Workers → Click en "Update"

## 🛠️ Desarrollo

### Requisitos

Para que la PWA funcione correctamente:

1. **HTTPS en producción**
   - Vercel proporciona HTTPS automáticamente
   - En local, `localhost` también funciona

2. **Archivos en `/public`**:
   - `manifest.json`
   - `sw.js`
   - `offline.html`
   - `icons/icon-192.png`
   - `icons/icon-512.png`

3. **Registro en layouts**:
   - El script de registro debe estar en todos los layouts principales

### Modificar el Service Worker

Si modificas `public/sw.js`, **debes cambiar** `CACHE_NAME`:

```javascript
// Incrementa la versión cuando cambies el SW
const CACHE_NAME = 'ims-cache-v2'; // v1 → v2
```

Esto asegura que se limpie el cache antiguo y se descargue el nuevo.

### Testing Local

```bash
# Inicia el servidor de desarrollo
npm run dev

# Abre en Chrome
http://localhost:4321

# Verifica en DevTools que el SW se registre correctamente
```

**Nota**: El banner de instalación puede no aparecer en local, pero puedes forzar instalación desde DevTools → Application → Manifest → "Add to homescreen"

### Deployment

El despliegue en Vercel incluye automáticamente todos los archivos del directorio `public/`:

```bash
# Build local para verificar
npm run build

# Los archivos PWA deben estar en .vercel/output/static/
ls -la .vercel/output/static/

# Desplegar
git push origin main  # Si está conectado con Vercel
# O manualmente:
npx vercel --prod
```

### URLs de Producción

- **Principal**: https://instalation-management-system.vercel.app/
- **Manifest**: https://instalation-management-system.vercel.app/manifest.json
- **Service Worker**: https://instalation-management-system.vercel.app/sw.js

### Debug en Producción

```bash
# Verificar manifest
curl https://instalation-management-system.vercel.app/manifest.json

# Verificar service worker
curl https://instalation-management-system.vercel.app/sw.js

# Verificar iconos
curl -I https://instalation-management-system.vercel.app/icons/icon-192.png
curl -I https://instalation-management-system.vercel.app/icons/icon-512.png
```

Todos deben devolver **200 OK**.

## 📚 Referencias

- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Progressive Web Apps - web.dev](https://web.dev/progressive-web-apps/)
- [Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Workbox (Service Worker library)](https://developers.google.com/web/tools/workbox)

## 🔒 Seguridad

- **HTTPS obligatorio**: Las PWAs solo funcionan con HTTPS en producción
- **Permisos explícitos**: Los usuarios deben dar permiso para notificaciones
- **VAPID keys**: Las claves VAPID deben mantenerse seguras (nunca en repositorio público)
- **Service Worker scope**: Limitado al origen de la aplicación

## ✅ Checklist de Despliegue

Antes de lanzar a producción:

- [ ] Manifest.json configurado correctamente
- [ ] Iconos 192px y 512px creados y optimizados
- [ ] Service Worker registrado en todos los layouts
- [ ] Variables de entorno VAPID configuradas en Vercel
- [ ] Probado en Chrome Android
- [ ] Probado en Safari iOS
- [ ] Lighthouse PWA score >90
- [ ] Funcionalidad offline verificada
- [ ] Notificaciones push funcionando

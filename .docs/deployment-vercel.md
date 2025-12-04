# 🚀 Guía de Deployment en Vercel

Esta guía te ayudará a desplegar el proyecto **IMS (Installation Management System)** en Vercel.

## 📋 Requisitos Previos

Antes de empezar:

- [x] Proyecto funcionando en local
- [x] Google OAuth configurado en Supabase
- [x] Usuario admin creado en la base de datos
- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Proyecto subido a GitHub (recomendado)

## 🚀 Paso 1: Preparar el Proyecto

### 1.1 Verificar Build

Asegúrate de que el proyecto hace build correctamente:

```bash
npm run build
```

Si el build es exitoso, verás un mensaje como:

```
[@astrojs/vercel] Copying static files to .vercel/output/static
[build] Server built in X.XXs
[build] Complete!
```

### 1.2 Verificar Configuración de Astro

El proyecto ya está configurado para Vercel. Verifica que `astro.config.mjs` tiene:

```javascript
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel()
  // ...
});
```

✅ Ya está configurado en tu proyecto.

## 🌐 Paso 2: Configurar Vercel

### Opción A: Deploy desde GitHub (Recomendado)

#### 2.1 Subir Proyecto a GitHub

Si aún no lo has hecho:

```bash
# Agregar archivos
git add .

# Commit
git commit -m "chore: prepare for Vercel deployment"

# Push
git push origin main
```

#### 2.2 Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Click en **"Add New..."** > **"Project"**
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Astro
5. **NO hagas deploy todavía**, primero configura las variables de entorno

### Opción B: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## ⚙️ Paso 3: Configurar Variables de Entorno

En el dashboard de Vercel, antes de hacer deploy:

### 3.1 Variables Obligatorias

En **Settings** > **Environment Variables**, agrega:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://taqfbhvhhhxmacwtwhdc.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Application Configuration
PUBLIC_APP_URL=https://tu-proyecto.vercel.app

# Push Notifications (opcional)
PUBLIC_VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key
VAPID_SUBJECT=mailto:tu-email@example.com
```

**⚠️ IMPORTANTE**:

- `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` deben ser las mismas que usas en local
- `PUBLIC_APP_URL` debe ser la URL de tu proyecto en Vercel (la verás después del primer deploy)

### 3.2 Obtener URL de Vercel

Si aún no sabes tu URL:

1. Primero haz un deploy inicial sin `PUBLIC_APP_URL` (el proyecto funcionará parcialmente)
2. Vercel te asignará una URL como: `https://tu-proyecto-xyz123.vercel.app`
3. Copia esa URL
4. Ve a **Settings** > **Environment Variables**
5. Edita `PUBLIC_APP_URL` y pon tu URL real
6. Redeploy el proyecto

## 🔐 Paso 4: Actualizar Google OAuth

Ahora que tienes tu URL de producción, necesitas actualizar Google OAuth:

### 4.1 Actualizar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a tu proyecto
3. **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. En **Authorized JavaScript origins**, agrega:
   ```
   https://tu-proyecto.vercel.app
   ```
6. En **Authorized redirect URIs**, ya debería estar:
   ```
   https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/callback
   ```
7. **Save**

### 4.2 Verificar Supabase

Las credenciales de Google OAuth en Supabase son las mismas para local y producción, así que no necesitas cambiar nada allí.

## 🎯 Paso 5: Deploy

### Desde Vercel Dashboard

1. Click en **"Deploy"**
2. Espera a que termine el build (1-2 minutos)
3. Una vez completado, verás tu URL de producción

### Desde Vercel CLI

```bash
vercel --prod
```

## ✅ Paso 6: Verificar Deployment

### 6.1 Checklist de Verificación

- [ ] El sitio abre correctamente en la URL de Vercel
- [ ] Puedes hacer clic en "Login con Google"
- [ ] Google OAuth te redirige correctamente
- [ ] Después de login, ves el dashboard de admin
- [ ] Puedes crear una instalación
- [ ] El Service Worker se registra correctamente
- [ ] La app es instalable (PWA)

### 6.2 Verificar Service Worker

1. Abre DevTools (F12)
2. Ve a **Application** > **Service Workers**
3. Deberías ver tu Service Worker registrado

### 6.3 Verificar PWA

En dispositivos móviles o desktop:

- Chrome/Edge: Debería aparecer un ícono de "Instalar" en la barra de dirección
- iOS Safari: **Share** > **Add to Home Screen**

## 🔄 Paso 7: Configurar Auto-Deploy

Si usas GitHub:

1. En Vercel, ve a **Settings** > **Git**
2. Verifica que **Auto Deploy** está habilitado
3. Cada push a `main` hará auto-deploy

Configura branches:

- **Production Branch**: `main` (auto-deploy a producción)
- **Preview Deployments**: Todas las demás branches

## 🌍 Paso 8: Configurar Dominio Personalizado (Opcional)

Si tienes un dominio propio:

### 8.1 Agregar Dominio en Vercel

1. Ve a **Settings** > **Domains**
2. Click en **"Add"**
3. Ingresa tu dominio (ej: `ims.tuempresa.com`)
4. Sigue las instrucciones para configurar DNS

### 8.2 Actualizar Variables de Entorno

Una vez que tu dominio esté activo:

1. Ve a **Settings** > **Environment Variables**
2. Actualiza `PUBLIC_APP_URL` con tu dominio personalizado
3. Redeploy el proyecto

### 8.3 Actualizar Google OAuth

Vuelve a Google Cloud Console y agrega tu dominio personalizado a las **Authorized JavaScript origins**.

## 📊 Monitoreo y Logs

### Ver Logs de Deployment

1. En Vercel, ve a **Deployments**
2. Click en el deployment que quieres revisar
3. Ve a **Functions** para ver logs de cada función serverless

### Ver Logs en Tiempo Real

```bash
vercel logs
```

### Analytics

Vercel proporciona analytics automáticos:

- **Analytics**: Tráfico, performance, Core Web Vitals
- **Speed Insights**: Métricas de velocidad

## 🚨 Troubleshooting

### Error: "Missing environment variables"

**Solución**:

- Verifica que todas las variables están configuradas en Vercel
- Asegúrate de que los nombres coinciden exactamente (case-sensitive)
- Redeploy después de agregar variables

### Error: "Google OAuth redirect mismatch"

**Solución**:

- Verifica que tu URL de Vercel está en las **Authorized JavaScript origins**
- Verifica que la redirect URI de Supabase está en **Authorized redirect URIs**
- Limpia cookies y vuelve a intentar

### Error: "Cannot read properties of undefined"

**Solución**:

- Probablemente falta una variable de entorno
- Revisa los logs en Vercel > Deployments > Functions
- Verifica que `PUBLIC_APP_URL` está configurado

### Build falla en Vercel

**Solución**:

- Verifica que `npm run build` funciona en local
- Revisa los logs de build en Vercel
- Asegúrate de que todas las dependencias están en `package.json`

### Service Worker no se actualiza

**Solución**:

- Incrementa la versión de `CACHE_NAME` en `public/sw.js`
- Haz push y redeploy
- En DevTools: Application > Service Workers > Unregister

## 🔧 Configuración Avanzada

### Variables de Entorno por Environment

Puedes tener diferentes valores para:

- **Production**: Variables que se usan en `main`
- **Preview**: Variables para branches de preview
- **Development**: Variables para development local

### Headers y Redirects

En `vercel.json` (opcional):

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

### Build Configuration

En `vercel.json` (opcional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".vercel/output",
  "framework": "astro"
}
```

## 📱 PWA en Producción

### Verificar PWA

Usa [Lighthouse](https://developers.google.com/web/tools/lighthouse):

1. Abre DevTools
2. Ve a **Lighthouse**
3. Selecciona **Progressive Web App**
4. Click en **"Generate report"**

Deberías obtener un score alto (>90).

### Instalar en Dispositivos

#### Android (Chrome)

1. Abre la app en Chrome
2. Toca el menú (⋮)
3. Selecciona **"Instalar app"**

#### iOS (Safari)

1. Abre la app en Safari
2. Toca el botón de compartir
3. Selecciona **"Add to Home Screen"**

#### Desktop (Chrome/Edge)

1. Abre la app
2. Busca el ícono de instalación en la barra de dirección
3. Click en **"Install"**

## 🎉 ¡Listo!

Tu aplicación está desplegada en Vercel. Ahora puedes:

- Compartir la URL con tu equipo
- Instalar la PWA en dispositivos móviles
- Configurar auto-deploy para futuros cambios
- Monitorear analytics y performance

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/vercel/)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🔄 Workflow de Desarrollo

### Proceso Recomendado

1. **Desarrollo local**: Trabaja en una branch (`feature/nueva-feature`)
2. **Push**: Sube cambios a GitHub
3. **Preview Deploy**: Vercel crea automáticamente un preview
4. **Review**: Prueba el preview antes de mergear
5. **Merge**: Mergea a `main`
6. **Production Deploy**: Auto-deploy a producción

### CI/CD

El proyecto ya tiene configurado:

- ✅ Husky (pre-commit hooks)
- ✅ ESLint
- ✅ Prettier
- ✅ Tests (unit + integration + E2E)

Puedes agregar más checks en Vercel:

1. Ve a **Settings** > **Git**
2. Habilita **"Ignored Build Step"** si quieres que Vercel haga checks antes de deploy

---

**Última actualización**: Diciembre 2025

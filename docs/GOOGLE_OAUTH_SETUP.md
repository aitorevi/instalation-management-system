# Google OAuth Setup - IMS

Esta guía te ayudará a configurar Google OAuth para el sistema IMS.

## 📋 Pre-requisitos

- Cuenta de Google
- Proyecto Supabase creado y configurado
- URL del proyecto Supabase: `https://taqfbhvhhhxmacwtwhdc.supabase.co`

---

## Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Click en el selector de proyecto (arriba)
3. Click **"New Project"**
4. Configurar:
   - **Project name:** `IMS` (o el nombre que prefieras)
   - **Organization:** Dejar el default
5. Click **"Create"**
6. Esperar a que se cree y seleccionarlo

---

## Paso 2: Configurar Pantalla de Consentimiento OAuth

1. En el menú lateral, ir a **APIs & Services** > **OAuth consent screen**
2. Seleccionar **External** (para permitir cualquier cuenta Google)
3. Click **"Create"**
4. Llenar formulario:
   - **App name:** `IMS - Installation Management`
   - **User support email:** Tu email
   - **Developer contact information:** Tu email
5. Click **"Save and Continue"**
6. En **Scopes**, click **"Save and Continue"** (no añadir nada extra)
7. En **Test users**, click **"Save and Continue"** (no necesario)
8. Click **"Back to Dashboard"**

---

## Paso 3: Crear Credenciales OAuth

1. Ir a **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Configurar:
   - **Application type:** Web application
   - **Name:** `IMS Web Client`

4. En **Authorized JavaScript origins**, añadir:

   ```
   http://localhost:4321
   https://taqfbhvhhhxmacwtwhdc.supabase.co
   ```

5. En **Authorized redirect URIs**, añadir:

   ```
   https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/callback
   ```

6. Click **"Create"**

7. Se mostrará un popup con:
   - **Client ID:** `xxxx.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-xxxx`

8. **GUARDAR AMBOS VALORES** (los necesitas en el siguiente paso)

---

## Paso 4: Configurar Google en Supabase

1. Ir a tu proyecto en [supabase.com/dashboard/project/taqfbhvhhhxmacwtwhdc](https://supabase.com/dashboard/project/taqfbhvhhhxmacwtwhdc)
2. Ir a **Authentication** > **Providers**
3. Buscar **Google** en la lista
4. Click para expandir
5. Habilitar el toggle **"Enable Sign in with Google"**
6. Llenar:
   - **Client ID:** El que copiaste de Google
   - **Client Secret:** El que copiaste de Google
7. Click **"Save"**

---

## Paso 5: Configurar Redirect URLs en Supabase

1. En Supabase, ir a **Authentication** > **URL Configuration**
2. Verificar/configurar:
   - **Site URL:** `http://localhost:4321` (para desarrollo)
   - **Redirect URLs:** Añadir:
     ```
     http://localhost:4321/auth/callback
     ```

---

## Paso 6: Aplicar Migración de Trigger

1. En Supabase Dashboard, ir a **SQL Editor**
2. Click **"New query"**
3. Copiar el contenido de `supabase/migrations/002_auth_trigger.sql`
4. Pegar en el editor
5. Click **"Run"** (o Ctrl+Enter)
6. Debe mostrar "Success. No rows returned"

Este trigger crea automáticamente un registro en la tabla `users` cuando alguien se registra con Google OAuth.

---

## Paso 7: Crear Primer Usuario Admin

### 7.1 Hacer Login con Google (Primera Vez)

1. Iniciar el proyecto: `npm run dev`
2. En el navegador, ir a:
   ```
   https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:4321/auth/callback
   ```
3. Debería redirigir a Google para login
4. Después de login, redirige a `localhost:4321/auth/callback`
5. (El callback puede dar error 404 si aún no existe la página, pero el usuario se creó)

### 7.2 Verificar Usuario Creado

1. En Supabase > **Authentication** > **Users**, deberías ver tu usuario
2. En Supabase > **SQL Editor**, ejecutar:
   ```sql
   SELECT * FROM users;
   ```
   Deberías ver tu usuario con `role = 'installer'`

### 7.3 Convertir a Admin

En Supabase > **SQL Editor**, ejecutar (reemplaza con TU email):

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'tu-email@gmail.com';

-- Verificar
SELECT id, email, full_name, role FROM users;
```

Tu usuario ahora debe tener `role = 'admin'`

---

## Paso 8 (Producción): Añadir Dominio de Vercel

**NOTA:** Hacer esto cuando hagas deploy a Vercel

### En Google Cloud Console

1. Ir a **Credentials** > Tu OAuth Client
2. Añadir a **Authorized JavaScript origins:**
   ```
   https://tu-app.vercel.app
   ```
3. Añadir a **Authorized redirect URIs:**
   ```
   https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/callback
   ```

### En Supabase

1. Ir a **Authentication** > **URL Configuration**
2. Cambiar **Site URL** a: `https://tu-app.vercel.app`
3. Añadir a **Redirect URLs:**
   ```
   https://tu-app.vercel.app/auth/callback
   ```

---

## ✅ Checklist de Verificación

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] OAuth Client ID creado con redirect URIs correctos
- [ ] Google provider habilitado en Supabase con Client ID/Secret
- [ ] Redirect URLs configuradas en Supabase
- [ ] Migración `002_auth_trigger.sql` aplicada en Supabase
- [ ] Login con Google probado (aunque dé 404 en callback)
- [ ] Tu usuario aparece en Supabase > Authentication > Users
- [ ] Tu usuario aparece en tabla `users` con role 'installer'
- [ ] Tu usuario actualizado a role 'admin'

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

- Verifica que la redirect URI en Google Cloud Console sea exactamente:
  `https://taqfbhvhhhxmacwtwhdc.supabase.co/auth/v1/callback`

### No se crea el usuario en tabla `users`

- Verifica que el trigger `on_auth_user_created` existe en Supabase
- Ejecuta el SQL de `002_auth_trigger.sql` nuevamente

### Usuario creado pero no puedo hacer nada

- Verifica que tu usuario tiene `role = 'admin'` en la tabla `users`
- Ejecuta el UPDATE para convertirlo a admin

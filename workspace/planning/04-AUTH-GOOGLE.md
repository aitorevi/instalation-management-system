# Fase 04: Auth Google

## Objetivo

Configurar Google OAuth en Google Cloud Console y Supabase para permitir login con Google.

## Pre-requisitos

- Cuenta de Google
- Proyecto Supabase creado (Fase 02)

---

## Paso 1: Crear proyecto en Google Cloud Console

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Click en el selector de proyecto (arriba)
3. Click "New Project"
4. Configurar:
   - **Project name:** `IMS` (o el nombre que prefieras)
   - **Organization:** Dejar el default
5. Click "Create"
6. Esperar a que se cree y seleccionarlo

**Verificación:** Proyecto creado y seleccionado

---

## Paso 2: Configurar pantalla de consentimiento OAuth

1. En el menú lateral, ir a **APIs & Services** > **OAuth consent screen**
2. Seleccionar **External** (para permitir cualquier cuenta Google)
3. Click "Create"
4. Llenar formulario:
   - **App name:** `IMS - Installation Management`
   - **User support email:** Tu email
   - **Developer contact information:** Tu email
5. Click "Save and Continue"
6. En **Scopes**, click "Save and Continue" (no añadir nada extra)
7. En **Test users**, click "Save and Continue" (no necesario)
8. Click "Back to Dashboard"

**Verificación:** Consent screen configurado

---

## Paso 3: Crear credenciales OAuth

1. Ir a **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Configurar:
   - **Application type:** Web application
   - **Name:** `IMS Web Client`
4. En **Authorized JavaScript origins**, añadir:
   ```
   http://localhost:4321
   https://TU-PROYECTO.supabase.co
   ```
5. En **Authorized redirect URIs**, añadir:

   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```

   **IMPORTANTE:** Reemplazar `TU-PROYECTO` con tu project ID de Supabase

6. Click "Create"

7. Se mostrará un popup con:
   - **Client ID:** `xxxx.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-xxxx`
8. **GUARDAR AMBOS VALORES** (los necesitas en el siguiente paso)

**Verificación:** Tienes Client ID y Client Secret guardados

---

## Paso 4: Configurar Google en Supabase

1. Ir a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Ir a **Authentication** > **Providers**
3. Buscar **Google** en la lista
4. Click para expandir
5. Habilitar el toggle "Enable Sign in with Google"
6. Llenar:
   - **Client ID:** El que copiaste de Google
   - **Client Secret:** El que copiaste de Google
7. Click "Save"

**Verificación:** Google aparece como "Enabled" en la lista de providers

---

## Paso 5: Configurar Redirect URLs en Supabase

1. En Supabase, ir a **Authentication** > **URL Configuration**
2. Verificar/configurar:
   - **Site URL:** `http://localhost:4321` (para desarrollo)
   - **Redirect URLs:** Añadir:
     ```
     http://localhost:4321/auth/callback
     ```

**Verificación:** URLs configuradas

---

## Paso 6: (Producción) Añadir dominio de Vercel

**NOTA:** Hacer esto cuando hagas deploy a Vercel

1. En Google Cloud Console > Credentials > Tu OAuth Client:
   - Añadir a **Authorized JavaScript origins:**
     ```
     https://tu-app.vercel.app
     ```
   - Añadir a **Authorized redirect URIs:**
     ```
     https://TU-PROYECTO.supabase.co/auth/v1/callback
     ```

2. En Supabase > Authentication > URL Configuration:
   - Cambiar **Site URL** a: `https://tu-app.vercel.app`
   - Añadir a **Redirect URLs:**
     ```
     https://tu-app.vercel.app/auth/callback
     ```

**Verificación:** (Solo cuando hagas deploy)

---

## Paso 7: Crear primer usuario admin (Manual)

Para que la app funcione, necesitas al menos un usuario admin.

1. En Supabase > **SQL Editor**
2. Ejecutar este query (después de que alguien haga login):

```sql
-- Primero, haz login con Google para crear tu auth.users
-- Luego, ejecuta esto para convertirte en admin:

UPDATE users
SET role = 'admin'
WHERE email = 'TU-EMAIL@gmail.com';
```

**IMPORTANTE:**

- Primero alguien debe hacer login con Google
- Eso crea el usuario en auth.users
- Necesitas un trigger para crear el registro en `users` (lo creamos a continuación)

---

## Paso 8: Crear trigger para nuevos usuarios

En Supabase > **SQL Editor**, ejecutar:

```sql
-- Función que crea usuario en nuestra tabla cuando se registra en auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'installer'  -- Por defecto todos son installer
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**Verificación:** Query ejecuta sin errores

---

## Paso 9: Verificar flujo de auth (Manual)

1. Iniciar el proyecto: `npm run dev`
2. En otra pestaña del navegador, ir a:
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:4321/auth/callback
   ```
3. Debería redirigir a Google para login
4. Después de login, redirige a `localhost:4321/auth/callback?code=xxx`
5. (El callback dará error 404 porque aún no existe la página)

**Verificación:**

- Google login funciona
- Redirige correctamente (aunque dé 404)
- En Supabase > Authentication > Users, aparece tu usuario

---

## Paso 10: Convertir primer usuario a admin

En Supabase > **SQL Editor**:

```sql
-- Verificar que se creó el usuario
SELECT * FROM users;

-- Convertir a admin (usar TU email real)
UPDATE users
SET role = 'admin'
WHERE email = 'tu-email@gmail.com';

-- Verificar
SELECT id, email, full_name, role FROM users;
```

**Verificación:** Tu usuario tiene `role = 'admin'`

---

## Checklist Final Fase 04

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth consent screen configurado
- [ ] OAuth Client ID creado con redirect URIs correctos
- [ ] Google provider habilitado en Supabase con Client ID/Secret
- [ ] Redirect URLs configuradas en Supabase
- [ ] Trigger `handle_new_user` creado
- [ ] Flujo de login probado (aunque dé 404 en callback)
- [ ] Tu usuario aparece en Supabase > Authentication > Users
- [ ] Tu usuario tiene role 'admin' en tabla users

---

## Siguiente Fase

→ `05-AUTH-PAGES.md` - Crear páginas de login y callback

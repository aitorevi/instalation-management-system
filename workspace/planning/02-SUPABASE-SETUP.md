# Fase 02: Supabase Setup

## Objetivo

Crear proyecto en Supabase, aplicar el schema SQL y obtener credenciales.

## Pre-requisitos

- Cuenta en [supabase.com](https://supabase.com)
- Fase 01 completada

---

## Paso 1: Crear proyecto en Supabase

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New project"
3. Configurar:
   - **Name:** `ims` (o el nombre que prefieras)
   - **Database Password:** Generar uno seguro y guardarlo
   - **Region:** Elegir el más cercano
4. Click "Create new project"
5. Esperar ~2 minutos a que se aprovisione

**Verificación:** Dashboard del proyecto visible

---

## Paso 2: Obtener credenciales API

1. En el dashboard del proyecto, ir a **Settings** (engranaje izquierda)
2. Click en **API** en el menú
3. Copiar:
   - **Project URL** (ej: `https://xxxx.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

**Verificación:** Tienes URL y anon key copiados

---

## Paso 3: Crear archivo .env local

**Archivo:** `.env` (en raíz del proyecto Astro)

```env
PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...TU-KEY-COMPLETA
PUBLIC_APP_URL=http://localhost:4321
```

**IMPORTANTE:** Reemplazar con tus valores reales

**Verificación:** `.env` existe y tiene valores reales (no los de ejemplo)

---

## Paso 4: Crear archivo de migración

**Archivo:** `supabase/migrations/001_initial_schema.sql`

Copiar el contenido COMPLETO de `REF-DATABASE-SCHEMA.md`

El archivo debe contener:

- Tipos ENUM (user_role, installation_status)
- Tabla users
- Tabla installations con índices
- Tabla materials
- Vista active_installations
- Trigger handle_installation_completed
- Funciones RLS (get_user_role, is_admin)
- Todas las políticas RLS

**Verificación:** Archivo existe con ~200 líneas de SQL

---

## Paso 5: Aplicar migración en Supabase

### Opción A: SQL Editor (Recomendada para primera vez)

1. En Supabase Dashboard, ir a **SQL Editor** (icono de terminal)
2. Click "New query"
3. Pegar TODO el contenido de `001_initial_schema.sql`
4. Click "Run" (o Ctrl+Enter)
5. Debe mostrar "Success. No rows returned"

### Opción B: CLI de Supabase (si lo tienes instalado)

```bash
# Instalar CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link proyecto (necesitas project-ref de la URL)
supabase link --project-ref TU-PROJECT-REF

# Aplicar migraciones
supabase db push
```

**Verificación:** No hay errores al ejecutar

---

## Paso 6: Verificar tablas creadas

1. En Supabase Dashboard, ir a **Table Editor**
2. Verificar que existen:
   - `users` (con columnas: id, email, full_name, phone_number, company_details, role, created_at)
   - `installations` (con todas las columnas incluyendo archived_at)
   - `materials` (con id, installation_id, description, created_at)

**Verificación:** Las 3 tablas aparecen en Table Editor

---

## Paso 7: Verificar RLS habilitado

1. En Table Editor, click en tabla `users`
2. Click en "RLS" (arriba a la derecha)
3. Debe mostrar "RLS is enabled" en verde
4. Repetir para `installations` y `materials`

**Verificación:** Las 3 tablas tienen RLS enabled

---

## Paso 8: Verificar políticas RLS

1. Ir a **Authentication** > **Policies**
2. Verificar que existen políticas para:
   - `users`: admin_full_access_users, installer_read_own_user, installer_update_own_user
   - `installations`: admin_full_access_installations, installer_read_own_installations, installer_update_own_installations
   - `materials`: admin_full_access_materials, installer_read/insert/update/delete_own_materials

**Verificación:** ~10 políticas listadas

---

## Paso 9: Instalar Supabase CLI localmente (Opcional pero recomendado)

```bash
npm install -D supabase
```

Añadir script a `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "db:types": "npx supabase gen types typescript --project-id TU-PROJECT-REF > src/types/database.ts"
  }
}
```

**Nota:** Reemplazar `TU-PROJECT-REF` con tu project ID (lo encuentras en Settings > General)

**Verificación:** Script añadido a package.json

---

## Paso 10: Generar tipos TypeScript

```bash
npm run db:types
```

**Verificación:**

- Archivo `src/types/database.ts` creado
- Contiene interfaces para `users`, `installations`, `materials`

---

## Checklist Final Fase 02

- [ ] Proyecto Supabase creado
- [ ] URL y anon key obtenidos
- [ ] `.env` creado con credenciales reales
- [ ] Migración SQL creada en `supabase/migrations/`
- [ ] SQL ejecutado sin errores
- [ ] 3 tablas visibles en Table Editor
- [ ] RLS habilitado en las 3 tablas
- [ ] Políticas RLS creadas (~10 políticas)
- [ ] Script `db:types` en package.json
- [ ] `src/types/database.ts` generado

---

## Siguiente Fase

→ `03-SUPABASE-CLIENT.md` - Crear cliente Supabase en el proyecto

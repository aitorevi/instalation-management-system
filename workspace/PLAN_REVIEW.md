# Plan Review - IMS Project

## Architectural & Standards Compliance Review

**Fecha**: 2025-11-28
**Revisado por**: Architecture Guardian + Documentation Keeper Agents
**Documentos revisados**: workspace/planning/\*.md (Fases 00-15)
**Estándares**: CLAUDE.md + senior-code-reviewer.md + architecture-guardian.md

---

## 🚨 CRITICAL ISSUES (Must fix before implementation)

### 1. ❌ **TAILWIND CSS CONTRADICTION**

**Ubicación**:

- `00-FOLDER-STRUCTURE.md` (línea 13, 133-154)
- `01-PROJECT-SETUP.md` (línea 3)
- Múltiples fases (05, 07, 08, etc.)

**Problema**:

- **CLAUDE.md** dice explícitamente: "**Styling**: CSS puro (mobile-first con min-width media queries)"
- **01-PROJECT-SETUP.md** título dice: "SIN Tailwind"
- **01-PROJECT-SETUP.md** Paso 4 dice: "Crear estilos globales con CSS puro mobile-first"
- **PERO 00-FOLDER-STRUCTURE.md** muestra:
  ```javascript
  // astro.config.mjs
  import tailwind from '@astrojs/tailwind'; // ❌ NO DEBE ESTAR
  integrations: [tailwind()]; // ❌ NO DEBE ESTAR
  ```
- **Y 00-FOLDER-STRUCTURE.md** incluye: `tailwind.config.mjs` ❌

**Impacto**:

- Contradicción total entre especificación (CSS puro) y arquitectura mostrada (Tailwind)
- Los desarrolladores no sabrán qué usar
- El CSS creado en 01-PROJECT-SETUP.md Paso 4 sería ignorado

**Solución**:

1. **Eliminar de `00-FOLDER-STRUCTURE.md`**:
   - Línea 13: `tailwind.config.mjs`
   - Líneas 133-154: Toda la sección de configuración de Tailwind

2. **Actualizar `00-FOLDER-STRUCTURE.md` astro.config.mjs** a:

   ```javascript
   import { defineConfig } from 'astro/config';
   import vercel from '@astrojs/vercel';

   export default defineConfig({
     output: 'server',
     adapter: vercel()
     // NO Tailwind - usamos CSS puro
   });
   ```

3. **Revisar TODAS las fases** y reemplazar referencias a clases Tailwind con clases CSS puras del global.css

---

### 2. ❌ **USO DE CLASES TAILWIND EN COMPONENTES CUANDO DEBE SER CSS PURO**

**Ubicación**:

- `05-AUTH-PAGES.md` (login.astro, callback.astro)
- `07-LAYOUTS.md` (Header.astro, Sidebar.astro, DashboardLayout.astro)
- `08-UI-COMPONENTS.md` (todos los componentes)

**Problema**:
Los archivos de planificación muestran componentes usando clases Tailwind:

```astro
<!-- Ejemplo en 05-AUTH-PAGES.md -->
<body
  class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4"
></body>
```

Clases Tailwind encontradas:

- `min-h-screen`, `bg-gradient-to-br`, `from-primary-50`, `to-primary-100`
- `flex`, `items-center`, `justify-center`, `p-4`
- `rounded-lg`, `hover:bg-gray-50`, `transition-colors`

**Impacto**:

- Si seguimos 01-PROJECT-SETUP.md, NO se instala Tailwind
- Estas clases NO funcionarán
- El proyecto NO compilará correctamente

**Solución**:
Todas las fases deben usar SOLO clases del `global.css` creado en Paso 4:

- `.btn`, `.btn-primary`, `.btn-secondary`
- `.input`, `.label`, `.card`
- `.container`, `.flex`, `.items-center`, `.justify-center`
- Utility classes definidas en global.css

**Acción requerida**:

- Revisar fases 05-15
- Reemplazar TODAS las clases Tailwind por clases CSS puras
- O agregar las clases necesarias a `global.css`

---

## ⚠️ IMPORTANT CONCERNS (Should address soon)

### 3. ⚠️ **INCONSISTENCIA EN NAMING CONVENTIONS**

**Ubicación**: Múltiples archivos

**Análisis**:
✅ **Correcto**:

- `src/lib/supabase.ts` (kebab-case para utility) ✓
- `src/lib/auth.ts` (kebab-case para utility) ✓
- `Button.astro`, `Input.astro` (PascalCase para componentes) ✓
- `DashboardLayout.astro` (PascalCase para layout) ✓

⚠️ **Revisar**:

- `src/lib/page-utils.ts` - Correcto kebab-case, pero nombre genérico
  - **Sugerencia**: Renombrar a `astro-helpers.ts` (más descriptivo)

✅ **Tests** (cuando se implementen):

- `auth.test.ts`, `supabase.test.ts` (correcto)
- `installations.integration.test.ts` (correcto)

**Recomendación**:

- Mantener convenciones actuales
- Considerar renombrar `page-utils.ts` → `astro-helpers.ts`

---

### 4. ⚠️ **FALTA DOCUMENTACIÓN DE RLS EN ALGUNAS FASES**

**Ubicación**: Fases 09-13 (operaciones CRUD)

**Problema**:
Las fases de CRUD (10, 11, 13) no mencionan explícitamente que:

- Las operaciones dependen COMPLETAMENTE de RLS
- No se debe hacer validación client-side de permisos
- El cliente Supabase usará el anon key (respeta RLS)

**Ejemplo**:
En `10-ADMIN-INSTALLATIONS.md` al crear instalación, debería mencionar:

```typescript
// ✅ CORRECTO - RLS policies se encargan de validar permisos
const { data, error } = await supabase
  .from('installations')
  .insert({ ... });

// ❌ INCORRECTO - NUNCA hacer esto
if (user.role === 'admin') {
  await supabase.from('installations').insert({ ... });
}
```

**Solución**:
Agregar sección en fases 09-13:

```markdown
## Nota Importante: Row Level Security (RLS)

- Todas las operaciones respetan las políticas RLS configuradas en Fase 02
- NO es necesario validar permisos en el cliente
- El middleware protege las rutas, RLS protege los datos
- Usar siempre el cliente con anon key (creado en Fase 03)
```

---

### 5. ⚠️ **TYPES DE ASTRO.LOCALS DECLARADOS DOS VECES**

**Ubicación**: `06-AUTH-MIDDLEWARE.md`

**Problema**:
En Paso 2, se actualiza `src/env.d.ts` para agregar:

```typescript
declare namespace App {
  interface Locals {
    user: User;
  }
}
```

Pero en `03-SUPABASE-CLIENT.md` ya se creó `src/env.d.ts` sin este namespace.

**Impacto**: Leve - es correcto actualizar el archivo
**Recomendación**: Clarificar en 06-AUTH-MIDDLEWARE.md que se está ACTUALIZANDO el archivo existente:

```markdown
## Paso 2: Actualizar tipos para locals

**Archivo:** `src/env.d.ts` (⚠️ ACTUALIZAR archivo existente de Fase 03)

Agregar al final del archivo:
```

---

## 💡 SUGGESTIONS (Consider for improvement)

### 6. 💡 **MEJORAR DOCUMENTACIÓN DE ERROR HANDLING**

**Ubicación**: Todas las fases CRUD (09-13)

**Sugerencia**:
Los ejemplos de código muestran:

```typescript
const { data, error } = await supabase.from('...').select();
```

Pero NO muestran cómo manejar `error`.

**Recomendación**:
Agregar ejemplos de error handling:

```typescript
const { data, error } = await supabase.from('installations').select('*');

if (error) {
  console.error('Error fetching installations:', error);
  // Mostrar mensaje al usuario
  return;
}

// Usar data...
```

---

### 7. 💡 **AGREGAR VALIDACIÓN DE ENV VARS EN FASE 03**

**Ubicación**: `03-SUPABASE-CLIENT.md` (Paso 2)

**Actual**:

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

**Sugerencia mejorada**:

```typescript
if (!supabaseUrl) {
  throw new Error('Missing PUBLIC_SUPABASE_URL environment variable. Check .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing PUBLIC_SUPABASE_ANON_KEY environment variable. Check .env file.');
}
```

**Razón**: Mensajes de error más descriptivos facilitan debugging

---

### 8. 💡 **DOCUMENTAR ORDEN DE IMPORTS**

**Sugerencia**: Agregar a CLAUDE.md una convención de orden de imports:

```typescript
// 1. Astro imports
import { defineConfig } from 'astro/config';
import type { AstroGlobal } from 'astro';

// 2. External libraries
import { createClient } from '@supabase/supabase-js';

// 3. Internal libs (path aliases)
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

// 4. Components
import Button from '@components/ui/Button.astro';

// 5. Styles (if any)
import '@/styles/global.css';
```

---

## ✅ WELL DONE - Patterns to Highlight

### ✅ Excellent Security Patterns

1. **Middleware Protection** (Fase 06):
   - Protección a nivel de ruta ✓
   - Validación de roles correcta ✓
   - No confía en client-side ✓

2. **RLS Policies** (Fase 02):
   - Políticas granulares por tabla ✓
   - Funciones helper (is_admin, get_user_role) ✓
   - Trigger para crear usuarios automáticamente ✓

3. **Cookie Management** (Fase 05):
   - httpOnly: true ✓
   - secure: import.meta.env.PROD ✓
   - sameSite: 'lax' ✓
   - maxAge apropiados ✓

### ✅ Good Code Organization

1. **File Structure** (00-FOLDER-STRUCTURE.md):
   - Separación clara por dominio ✓
   - Componentes organizados (ui/, layout/, installations/) ✓
   - Rutas protegidas por carpeta (admin/, installer/) ✓

2. **Type Safety**:
   - Tipos generados desde Supabase ✓
   - Interfaces bien definidas ✓
   - Type exports centralizados ✓

### ✅ Progressive Enhancement Approach

1. **Phased Implementation**:
   - Fases lógicas y secuenciales ✓
   - Cada fase verificable ✓
   - Dependencias claras ✓

---

## 📋 ACTION ITEMS - PRIORITY ORDER

### Priority 1 (BLOCKER - Must fix before starting Phase 01):

- [ ] **FIX-01**: Eliminar TODA referencia a Tailwind de `00-FOLDER-STRUCTURE.md`
- [ ] **FIX-02**: Actualizar `01-PROJECT-SETUP.md` Paso 3 para NO instalar Tailwind
- [ ] **FIX-03**: Revisar TODAS las fases 05-15 y reemplazar clases Tailwind con clases CSS puras

### Priority 2 (HIGH - Fix before implementing CRUD phases):

- [ ] **FIX-04**: Agregar nota de RLS en fases 09-13
- [ ] **FIX-05**: Clarificar actualización de `env.d.ts` en Fase 06
- [ ] **FIX-06**: Mejorar ejemplos de error handling en fases CRUD

### Priority 3 (MEDIUM - Nice to have):

- [ ] **IMPROVE-01**: Renombrar `page-utils.ts` → `astro-helpers.ts`
- [ ] **IMPROVE-02**: Mejorar mensajes de error de validación de env vars
- [ ] **IMPROVE-03**: Documentar convención de orden de imports en CLAUDE.md

---

## CONCLUSIÓN

**Estado actual del plan**: ⚠️ **REQUIRES MAJOR FIXES**

**Razón principal**:

- Contradicción crítica entre especificación (CSS puro) y arquitectura (Tailwind)
- El proyecto NO funcionará si se sigue tal cual está

**Tiempo estimado para fixes**:

- Priority 1: ~2 horas (revisar y reemplazar Tailwind en 11 archivos)
- Priority 2: ~30 minutos
- Priority 3: ~15 minutos

**Recomendación**:

1. **NO empezar implementación** hasta corregir Priority 1
2. Decidir definitivamente: ¿CSS puro o Tailwind?
3. Si CSS puro (según CLAUDE.md): Aplicar todos los fixes de Priority 1
4. Si Tailwind: Actualizar CLAUDE.md y 01-PROJECT-SETUP.md

---

**Siguiente paso sugerido**:
Crear issues/tasks para cada FIX item y asignar prioridades antes de continuar.

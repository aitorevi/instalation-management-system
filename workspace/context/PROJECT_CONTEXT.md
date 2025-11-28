# IMS - Installation Management System

## Plan de Implementación

### Descripción del Proyecto

PWA para gestión de instalaciones con Astro 5 + Supabase + Vercel.

**Roles:**

- **Admin**: Gestión completa (CRUD instalaciones, gestión instaladores, cancelaciones)
- **Installer**: Ver asignaciones, actualizar status (excepto cancelled), añadir notas/materiales

**Stack:**

- Astro 5 (SSR + PWA)
- Supabase (PostgreSQL + Auth + Edge Functions)
- Google OAuth
- Tailwind CSS
- TypeScript

---

## Índice de Fases

| Fase | Archivo                     | Descripción                                            | Tiempo Est. |
| ---- | --------------------------- | ------------------------------------------------------ | ----------- |
| 01   | `01-PROJECT-SETUP.md`       | Crear proyecto Astro, dependencias, config base        | 15 min      |
| 02   | `02-SUPABASE-SETUP.md`      | Crear proyecto Supabase, aplicar schema, generar tipos | 20 min      |
| 03   | `03-SUPABASE-CLIENT.md`     | Cliente Supabase + helpers en el proyecto              | 10 min      |
| 04   | `04-AUTH-GOOGLE.md`         | Configurar Google OAuth en Supabase Console            | 15 min      |
| 05   | `05-AUTH-PAGES.md`          | Login page + OAuth callback                            | 20 min      |
| 06   | `06-AUTH-MIDDLEWARE.md`     | Middleware protección de rutas por rol                 | 15 min      |
| 07   | `07-LAYOUTS.md`             | BaseLayout, AuthLayout, DashboardLayout                | 25 min      |
| 08   | `08-UI-COMPONENTS.md`       | Button, Input, Badge, Modal, StatusBadge               | 30 min      |
| 09   | `09-ADMIN-DASHBOARD.md`     | Dashboard principal admin + lista instalaciones        | 30 min      |
| 10   | `10-ADMIN-INSTALLATIONS.md` | CRUD completo de instalaciones                         | 45 min      |
| 11   | `11-ADMIN-INSTALLERS.md`    | Gestión de instaladores                                | 30 min      |
| 12   | `12-INSTALLER-DASHBOARD.md` | Dashboard installer + sus instalaciones                | 30 min      |
| 13   | `13-INSTALLER-UPDATE.md`    | Actualizar status + notas + materiales                 | 30 min      |
| 14   | `14-PWA-SETUP.md`           | Manifest, icons, service worker básico                 | 20 min      |
| 15   | `15-PUSH-NOTIFICATIONS.md`  | VAPID, suscripción, Edge Function                      | 40 min      |

**Tiempo total estimado: ~6 horas**

---

## Cómo Usar Este Plan

### Para ejecutar con Claude (Sonnet/Haiku):

```
Lee el archivo [FASE].md y ejecútalo paso a paso.
El proyecto está en /dev/ims.
Confirma cada paso completado antes de continuar.
```

### Orden de ejecución:

1. Ejecutar fases en orden numérico (01 → 15)
2. No saltar fases (hay dependencias)
3. Cada fase incluye verificación al final
4. Si una verificación falla, revisar antes de continuar

---

## Archivos de Referencia

| Archivo                   | Contenido                       |
| ------------------------- | ------------------------------- |
| `REF-DATABASE-SCHEMA.md`  | Schema SQL completo con RLS     |
| `REF-ENV-VARIABLES.md`    | Variables de entorno necesarias |
| `REF-FOLDER-STRUCTURE.md` | Estructura final esperada       |

---

## Notas Importantes

1. **Supabase**: Necesitas cuenta en supabase.com
2. **Google OAuth**: Necesitas proyecto en Google Cloud Console
3. **Variables de entorno**: Nunca commitear `.env` real
4. **Tipos**: Regenerar tipos después de cambios en schema

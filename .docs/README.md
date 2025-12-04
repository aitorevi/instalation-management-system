# 📚 Documentación del Proyecto IMS

Bienvenido a la documentación del **IMS (Installation Management System)**.

## 📄 Documentos Disponibles

### 🚀 [Setup Local](./setup-local.md)

Guía completa para configurar el proyecto en tu ordenador local desde cero.

**Incluye**:

- Requisitos previos
- Instalación de dependencias
- Configuración de variables de entorno
- Configuración de Google OAuth
- Verificación de la configuración
- Troubleshooting común

**Úsala cuando**: Acabas de clonar el proyecto o lo estás configurando en un nuevo ordenador.

---

### ✅ [Próximos Pasos](./proximos-pasos.md)

Checklist de configuraciones manuales que debes hacer para terminar el setup.

**Incluye**:

- Configurar Google OAuth (paso a paso)
- Asignar rol de admin a tu usuario
- Configurar push notifications (opcional)
- Crear usuarios de prueba
- Verificar que todo funciona

**Úsala cuando**: Ya instalaste el proyecto y necesitas completar la configuración.

---

### 🏗️ [Arquitectura](./arquitectura.md)

Documentación técnica completa de la arquitectura del proyecto.

**Incluye**:

- Estructura del proyecto
- Modelo de datos y esquema de base de datos
- Row Level Security (RLS) y políticas
- Patrones de autenticación y autorización
- Arquitectura frontend (componentes, layouts, routing)
- Progressive Web App (PWA) y Service Worker
- Testing (Unit, Integration, E2E)
- Deployment en Vercel
- Flujos de usuario
- Patrones y convenciones del código

**Úsala cuando**: Necesitas entender cómo funciona el proyecto o vas a desarrollar nuevas features.

---

### ✨ [Features Implementadas](./features-implementadas.md)

Lista exhaustiva de todas las features implementadas en el proyecto.

**Incluye**:

- Autenticación y seguridad
- Gestión de usuarios
- Gestión de instalaciones (Admin e Installer)
- Gestión de materiales
- Componentes UI
- PWA
- Testing
- Developer Experience
- Resumen estadístico

**Úsala cuando**: Quieres saber qué está implementado y qué falta.

---

## 🎯 Estado Actual del Proyecto

### ✅ Features Implementadas

#### 🔐 Autenticación y Autorización

- [x] Google OAuth (Supabase Auth)
- [x] Manejo de sesiones con cookies httpOnly
- [x] Session timeout (24h máximo)
- [x] Inactivity timeout (30 min)
- [x] Middleware de protección de rutas
- [x] Role-based access control (Admin / Installer)
- [x] Row Level Security (RLS) en Supabase

#### 👤 Gestión de Usuarios

- [x] Tabla de usuarios con roles
- [x] Trigger automático de creación al registrarse
- [x] Admin puede ver todos los usuarios
- [x] Installers pueden ver/editar su perfil

#### 📦 Gestión de Instalaciones (Admin)

- [x] Crear instalaciones
- [x] Listar instalaciones (activas y archivadas)
- [x] Ver detalle de instalación
- [x] Editar instalación
- [x] Asignar instalador
- [x] Archivar instalación (soft delete)
- [x] Filtros por estado

#### 🔧 Gestión de Instalaciones (Installer)

- [x] Ver instalaciones asignadas
- [x] Ver detalle de instalación
- [x] Actualizar estado (pending → in_progress → completed)
- [x] Agregar/editar materiales usados
- [x] Notas de instalación

#### 🛠️ Materiales

- [x] Agregar materiales a instalación
- [x] Listar materiales de instalación
- [x] Editar descripción de material
- [x] Eliminar material

#### 🎨 UI/UX

- [x] Componentes UI reutilizables (Button, Input, Select, etc.)
- [x] Layouts responsive
- [x] Tailwind CSS para estilos
- [x] Dashboard para Admin e Installer
- [x] Navegación con Sidebar
- [x] Badges de estado visual
- [x] Empty states

#### 📱 Progressive Web App (PWA)

- [x] Web App Manifest
- [x] Service Worker con caching
- [x] Soporte offline básico
- [x] Instalable en móviles/desktop
- [x] Iconos PWA (192x192, 512x512)
- [x] Push Notifications (estructura lista, requiere configuración)

#### 🧪 Testing

- [x] Configuración de Vitest (unit tests)
- [x] Configuración de Playwright (E2E tests)
- [x] Tests unitarios para utilidades principales
- [x] Tests de integración para queries
- [x] Tests E2E para flujos principales

#### 🚀 Deployment

- [x] Configuración para Vercel
- [x] Adapter de Vercel configurado
- [x] SSR (Server-Side Rendering)

#### 🔧 Developer Experience

- [x] Husky con pre-commit hooks
- [x] ESLint configurado
- [x] Prettier configurado
- [x] TypeScript con types generados de Supabase
- [x] Path aliases (@/, @components/, etc.)

### ⚠️ Configuraciones Pendientes

#### 🔑 Google OAuth

**Estado**: Implementado pero requiere configuración manual

**Necesitas hacer**:

1. Crear credenciales en Google Cloud Console
2. Configurar en Supabase Dashboard
3. Agregar redirect URIs correctas

**Documentación**: Ver [setup-local.md](./setup-local.md#4-configurar-google-oauth-en-supabase)

#### 🔔 Push Notifications

**Estado**: Código implementado pero claves VAPID no configuradas

**Necesitas hacer**:

1. Generar claves VAPID: `npx web-push generate-vapid-keys`
2. Agregar claves al `.env`:
   - `PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`

**Documentación**: Ver [setup-local.md](./setup-local.md#33-variables-opcionales)

#### 👥 Usuarios Iniciales

**Estado**: Tabla creada pero sin usuarios

**Necesitas hacer**:

1. Registrarte con Google OAuth
2. Manualmente insertar rol en la base de datos:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'tu-email@example.com';
   ```
3. O usar Supabase Dashboard para editar la tabla

### 🚧 Features No Implementadas

Las siguientes features no están implementadas actualmente:

- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de datos (PDF, Excel)
- [ ] Historial de cambios (audit log)
- [ ] Notificaciones in-app
- [ ] Dashboard con estadísticas/gráficos
- [ ] Geolocalización de instalaciones
- [ ] Firma digital del cliente
- [ ] Fotos de instalaciones
- [ ] Chat entre admin e installers
- [ ] Roles adicionales (supervisor, etc.)

## 🔍 Explorando el Proyecto

### Para Nuevos Desarrolladores

1. **Lee primero**: [setup-local.md](./setup-local.md)
2. **Configura tu entorno**: Sigue los pasos de setup
3. **Explora la arquitectura**: [arquitectura.md](./arquitectura.md)
4. **Revisa el código**:
   - Empieza por `src/pages/` para entender las rutas
   - Luego `src/components/` para ver los componentes
   - Finalmente `src/lib/` para la lógica de negocio
5. **Lee los PHASE summaries**: `PHASE_XX_SUMMARY.md` en la raíz

### Estructura de Documentación

```
.docs/
├── README.md                    # Este archivo (índice)
├── setup-local.md               # Configuración local
├── proximos-pasos.md            # Checklist de configuraciones manuales
├── arquitectura.md              # Arquitectura técnica
└── features-implementadas.md    # Lista de features

Raíz del proyecto:
├── CLAUDE.md            # Guía para trabajar con Claude Code
├── PHASE_XX_SUMMARY.md  # Resumen de fases de desarrollo
└── workspace/           # Planificación del proyecto
```

## 📊 Resumen Técnico Rápido

```
Framework:     Astro 5 (SSR)
Backend:       Supabase (PostgreSQL + Auth)
Styling:       Tailwind CSS
Language:      TypeScript
Testing:       Vitest + Playwright
Deployment:    Vercel
Auth:          Google OAuth (Supabase)
Security:      RLS (Row Level Security)
PWA:           Service Worker + Manifest
```

## 🎓 Conceptos Clave

### Row Level Security (RLS)

La autorización está implementada **en la base de datos**, no en el código. Cada tabla tiene políticas RLS que verifican los permisos del usuario autenticado.

### Server-Side Rendering (SSR)

Todo el HTML se genera en el servidor. No hay hydration ni JavaScript pesado en el cliente.

### Middleware

Protege rutas automáticamente antes de que se ejecute la página.

### Queries vs Actions

- **Queries**: Lectura de datos (SELECT)
- **Actions**: Mutaciones (INSERT, UPDATE, DELETE)

## 🆘 ¿Necesitas Ayuda?

1. **Problemas de configuración**: Ver [setup-local.md](./setup-local.md)
2. **Dudas sobre arquitectura**: Ver [arquitectura.md](./arquitectura.md)
3. **Convenciones de código**: Ver `CLAUDE.md` en la raíz
4. **Planificación del proyecto**: Ver `workspace/planning/`

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: 0.1.0

# IMS - Installation Management System

Sistema de gestión de instalaciones desarrollado como Progressive Web Application (PWA) con Astro 5, Supabase y TypeScript.

## 🚀 Características

- **🔐 Autenticación**: Google OAuth via Supabase Auth
- **👥 Roles**: Administrador e Instalador con permisos diferenciados
- **📊 Gestión de Instalaciones**: CRUD completo con asignación a instaladores
- **🔔 Notificaciones Push**: Sistema de notificaciones en tiempo real
- **📱 PWA**: Instalable en móviles y escritorio, funciona offline
- **🎨 UI Moderna**: Interfaz responsive con Tailwind CSS
- **⚡ SSR**: Server-Side Rendering con Astro 5

## 📋 Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (SSR mode)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Edge Functions)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Deployment**: Vercel
- **PWA**: Service Worker + Web App Manifest + Push Notifications

## 🛠️ Instalación

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Supabase (gratuita)
- Git

### Setup Local

```bash
# Clonar repositorio
git clone <repository-url>
cd instalation-management-system

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:4321`

### Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz con:

```env
# Supabase Configuration (REQUIRED)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration (REQUIRED)
PUBLIC_APP_URL=http://localhost:4321

# VAPID Keys for Push Notifications (OPTIONAL - needed for notifications)
PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com

# Supabase Service Role (REQUIRED - for server-side operations)
# WARNING: Keep this secret, never expose in client code
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📱 Progressive Web App (PWA)

La aplicación está completamente configurada como PWA e incluye:

- ✅ Web App Manifest
- ✅ Service Worker con cache offline
- ✅ Notificaciones Push (VAPID)
- ✅ Instalable en móviles y escritorio

### Instalar la App en tu Dispositivo

#### Android (Chrome)

1. Abre `https://instalation-management-system.vercel.app/`
2. Menú (⋮) → **"Instalar aplicación"**
3. Confirma la instalación

#### iOS (Safari)

1. Abre `https://instalation-management-system.vercel.app/`
2. Botón compartir (□↑) → **"Añadir a pantalla de inicio"**
3. Confirma

**📚 Documentación completa**: Ver [docs/PWA.md](./docs/PWA.md)

### Configurar Notificaciones Push

Para habilitar notificaciones push en tu instalación:

1. **Generar VAPID keys**:

   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Añadir keys al `.env`**:

   ```env
   PUBLIC_VAPID_PUBLIC_KEY=<clave-pública-generada>
   VAPID_PRIVATE_KEY=<clave-privada-generada>
   VAPID_SUBJECT=mailto:admin@tudominio.com
   ```

3. **Configurar en producción (Vercel)**:
   - Añade las mismas variables en Vercel Dashboard > Settings > Environment Variables
   - Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` está configurada

4. **Activar notificaciones como instalador**:
   - Login como instalador
   - En el dashboard, sección "Notificaciones"
   - Click "Activar" y permitir en el navegador

**Compatibilidad**: Chrome, Edge, Firefox, Safari 16.4+ (iOS 16.4+)

**Seguridad**: Las notificaciones requieren HTTPS en producción. En desarrollo local, `localhost` está permitido.

## 🧞 Comandos Disponibles

| Comando                    | Descripción                       |
| -------------------------- | --------------------------------- |
| `npm install`              | Instala dependencias              |
| `npm run dev`              | Inicia servidor de desarrollo     |
| `npm run build`            | Build de producción               |
| `npm run preview`          | Preview del build local           |
| `npm run lint`             | Ejecuta ESLint                    |
| `npm run format`           | Formatea código con Prettier      |
| `npm run format:check`     | Verifica formato sin modificar    |
| `npm test`                 | Ejecuta tests unitarios           |
| `npm run test:integration` | Tests de integración con Supabase |
| `npm run test:e2e`         | Tests E2E con Playwright          |

### Supabase Local Development

```bash
# Iniciar Supabase local
npx supabase start

# Detener Supabase local
npx supabase stop

# Reset base de datos local
npx supabase db reset

# Generar tipos TypeScript
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

# Crear nueva migración
npx supabase migration new <name>

# Aplicar migraciones a remoto
npx supabase db push
```

## 📂 Estructura del Proyecto

```
instalation-management-system/
├── src/
│   ├── components/          # Componentes Astro reutilizables
│   │   ├── ui/              # Componentes UI genéricos
│   │   ├── layout/          # Componentes de layout
│   │   ├── installations/   # Componentes de instalaciones
│   │   └── notifications/   # Componentes de notificaciones
│   ├── layouts/             # Layouts principales
│   │   ├── BaseLayout.astro
│   │   └── AuthLayout.astro
│   ├── lib/                 # Utilidades y clientes
│   │   └── supabase.ts      # Cliente de Supabase
│   ├── middleware/          # Middleware de autenticación
│   ├── pages/               # Rutas (file-based routing)
│   │   ├── admin/           # Páginas admin
│   │   ├── installer/       # Páginas instalador
│   │   ├── auth/            # Autenticación
│   │   └── index.astro      # Home
│   └── types/               # TypeScript types
├── public/                  # Assets estáticos
│   ├── manifest.json        # PWA Manifest
│   ├── sw.js                # Service Worker
│   ├── offline.html         # Página offline
│   └── icons/               # Iconos PWA
├── docs/                    # Documentación
│   └── PWA.md               # Documentación PWA
├── workspace/               # Planning y contexto
│   ├── context/
│   └── planning/
└── astro.config.mjs         # Configuración Astro
```

## 🎯 Path Aliases

El proyecto usa aliases de TypeScript configurados en `tsconfig.json`:

```typescript
import { ... } from '@/...'           // src/
import { ... } from '@components/...' // src/components/
import { ... } from '@lib/...'        // src/lib/
import { ... } from '@layouts/...'    // src/layouts/
import { ... } from '@types/...'      // src/types/
```

## 🔒 Seguridad

- **Row Level Security (RLS)**: Todas las tablas tienen políticas RLS configuradas
- **Authentication**: Google OAuth via Supabase Auth
- **Middleware**: Protección de rutas basada en roles
- **HTTPS**: Requerido en producción para PWA y autenticación

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Integration tests (requiere Supabase)
npm run test:integration

# E2E tests
npm run test:e2e

# E2E con UI (recomendado para desarrollo)
npm run test:e2e:debug

# Coverage
npm run test:coverage
```

### Convención de Naming

- `*.test.ts` - Unit tests (sin dependencias externas)
- `*.integration.test.ts` - Integration tests (requieren Supabase)
- `*.spec.ts` (en `e2e/`) - E2E tests con Playwright

## 🚀 Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno en Vercel:
   - `PUBLIC_SUPABASE_URL` (requerido)
   - `PUBLIC_SUPABASE_ANON_KEY` (requerido)
   - `SUPABASE_SERVICE_ROLE_KEY` (requerido)
   - `PUBLIC_APP_URL` (requerido)
   - `PUBLIC_VAPID_PUBLIC_KEY` (opcional - para notificaciones)
   - `VAPID_PRIVATE_KEY` (opcional - para notificaciones)
   - `VAPID_SUBJECT` (opcional - para notificaciones)
3. Deploy automático en cada push a `main`

**URL de Producción**: https://instalation-management-system.vercel.app/

### Manual Deploy

```bash
# Build
npm run build

# Deploy con Vercel CLI
npx vercel --prod
```

## 📚 Documentación

- **Documentación del Proyecto**: Ver `workspace/context/PROJECT_CONTEXT.md`
- **Planning por Fases**: Ver `workspace/planning/`
- **Guía PWA**: Ver `docs/PWA.md`
- **Variables de Entorno**: Ver `.env.example`

## 🤝 Contribución

### Workflow

1. **Crear branch**: `feature/<task-number>-<description>` o `fix/<description>`
2. **Desarrollar**: Seguir clean code y best practices
3. **Testing**: Añadir tests para nueva funcionalidad
4. **Pre-commit**: Ejecutar `npm run build` y tests
5. **Commit**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
6. **Pull Request**: Descripción clara y tests pasando

### Formato de Commits

```bash
feat: add installation status tracking
feat(auth): implement Google OAuth login
fix: correct installer assignment logic
docs: update PWA documentation
test: add integration tests for installations
chore: update dependencies
```

**IMPORTANTE**: NO añadir atribuciones de AI, co-author tags, o mensajes "Generated with AI" en commits.

### Code Style

- **ESLint** para linting
- **Prettier** para formateo
- Hooks pre-commit configurados con Husky (opcional)

## 📖 Recursos

- [Astro Documentation](https://docs.astro.build)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PWA Documentation](./docs/PWA.md)

## 📄 Licencia

[Incluir licencia del proyecto]

## 👨‍💻 Autor

[Incluir información del autor]

---

Para más información sobre desarrollo, consulta `CLAUDE.md` y los archivos en `workspace/`.

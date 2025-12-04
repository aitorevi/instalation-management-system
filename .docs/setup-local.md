# 🚀 Guía de Configuración Local - IMS

Esta guía te ayudará a configurar el proyecto **IMS (Installation Management System)** en tu ordenador local.

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Git**
- Un **proyecto en Supabase** (remoto o local con Docker)

## 🔧 Pasos de Configuración

### 1. Clonar el Repositorio

Si aún no has clonado el proyecto:

```bash
git clone <url-del-repositorio>
cd instalation-management-system
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias del proyecto, incluyendo:

- Astro 5
- Supabase Client
- Tailwind CSS
- Vitest (testing)
- Playwright (E2E testing)
- Husky (Git hooks)

### 3. Configurar Variables de Entorno

#### 3.1 Crear archivo `.env`

El proyecto incluye un archivo `.env.example`. Crea tu propio `.env`:

```bash
cp .env.example .env
```

#### 3.2 Configurar Credenciales de Supabase

Abre el archivo `.env` y configura las credenciales de tu proyecto en Supabase:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-aqui

# Application Configuration
PUBLIC_APP_URL=http://localhost:4321

# Push Notifications (OPCIONAL por ahora)
PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
```

**¿Dónde encontrar las credenciales de Supabase?**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a: **Settings** > **API**
3. Copia:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`

#### 3.3 Variables Opcionales

Las claves VAPID son necesarias solo si quieres probar las **push notifications**. Por ahora puedes dejarlas vacías. Para generarlas más adelante:

```bash
npx web-push generate-vapid-keys
```

### 4. Configurar Google OAuth en Supabase

El proyecto utiliza **Google OAuth** para autenticación. Necesitas configurarlo en Supabase:

#### 4.1 Crear Credenciales en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a: **APIs & Services** > **Credentials**
4. Click en **Create Credentials** > **OAuth 2.0 Client ID**
5. Selecciona **Web application**
6. Configura:
   - **Authorized JavaScript origins**:
     - `http://localhost:4321`
     - `https://tu-proyecto-id.supabase.co`
   - **Authorized redirect URIs**:
     - `https://tu-proyecto-id.supabase.co/auth/v1/callback`
7. Guarda el **Client ID** y **Client Secret**

#### 4.2 Configurar en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a: **Authentication** > **Providers**
3. Busca **Google** y habilítalo
4. Ingresa:
   - **Client ID** (de Google Cloud)
   - **Client Secret** (de Google Cloud)
5. Guarda los cambios

### 5. Verificar la Base de Datos

El proyecto incluye migraciones en `supabase/migrations/`. Si tu proyecto en Supabase ya tiene la base de datos configurada (porque lo clonaste de otro ordenador), **no necesitas hacer nada más**.

Si necesitas aplicar las migraciones en un nuevo proyecto de Supabase:

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Aplicar migraciones
npx supabase db push
```

### 6. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:4321**

### 7. Probar la Aplicación

1. Abre el navegador en `http://localhost:4321`
2. Deberías ver la página de login
3. Haz clic en **Login con Google**
4. Si todo está configurado correctamente, serás redirigido a Google OAuth

**Nota importante**: Para poder hacer login, tu cuenta de Google debe estar registrada en la tabla `users` de Supabase con un rol asignado (`admin` o `installer`).

## 🧪 Comandos Útiles

### Desarrollo

```bash
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build de producción
```

### Testing

```bash
npm test                 # Unit tests
npm run test:watch       # Unit tests en modo watch
npm run test:integration # Tests de integración (requiere Supabase)
npm run test:e2e         # Tests E2E con Playwright
npm run test:e2e:debug   # Playwright en modo UI
npm run test:coverage    # Reporte de cobertura
```

### Linting y Formato

```bash
npm run lint             # ESLint
npm run format           # Formatear código con Prettier
npm run format:check     # Verificar formato sin modificar
```

### Supabase

```bash
npm run db:types         # Regenerar tipos de TypeScript desde Supabase
```

## 🔍 Verificación de la Configuración

### Checklist de Configuración ✅

- [ ] Node.js v18+ instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado y configurado
- [ ] Credenciales de Supabase en `.env`
- [ ] Google OAuth configurado en Supabase
- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Login con Google funcionando

### Problemas Comunes

#### 1. Error: "Missing Supabase environment variables"

**Solución**: Verifica que el archivo `.env` existe y tiene las variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` correctamente configuradas.

#### 2. Error al hacer login con Google

**Solución**:

- Verifica que Google OAuth está habilitado en Supabase
- Confirma que las redirect URIs en Google Cloud Console incluyen tu URL de Supabase
- Asegúrate de que tu usuario existe en la tabla `users` con un rol asignado

#### 3. Build falla con errores de tipos

**Solución**: Regenera los tipos de Supabase:

```bash
npm run db:types
```

#### 4. "npm run dev" no inicia

**Solución**:

- Verifica que el puerto 4321 no esté ocupado
- Borra `node_modules` y `package-lock.json`, luego ejecuta `npm install`

## 📦 Estructura del Proyecto

```
instalation-management-system/
├── .docs/                    # Documentación del proyecto
├── .husky/                   # Git hooks (pre-commit, etc.)
├── e2e/                      # Tests E2E con Playwright
├── public/                   # Assets estáticos
│   ├── icons/                # Iconos PWA
│   ├── manifest.json         # Web App Manifest
│   └── sw.js                 # Service Worker
├── src/
│   ├── components/           # Componentes Astro
│   ├── layouts/              # Layouts de página
│   ├── lib/                  # Lógica de negocio y utilidades
│   ├── middleware/           # Middleware de Astro (auth, roles)
│   ├── pages/                # Páginas (rutas)
│   └── types/                # Tipos TypeScript
├── supabase/
│   └── migrations/           # Migraciones de base de datos
├── workspace/                # Documentación de fases del proyecto
├── .env                      # Variables de entorno (NO COMMITEAR)
├── .env.example              # Ejemplo de variables de entorno
├── astro.config.mjs          # Configuración de Astro
├── package.json              # Dependencias del proyecto
└── tsconfig.json             # Configuración de TypeScript
```

## 🚀 Próximos Pasos

Una vez que tengas el proyecto funcionando en local:

1. **Revisa la arquitectura**: Lee `.docs/arquitectura.md` para entender cómo está organizado el código
2. **Explora el código**: Familiarízate con los componentes en `src/components/` y las páginas en `src/pages/`
3. **Prueba las features**:
   - Crea una instalación (como admin)
   - Asigna un instalador
   - Visualiza instalaciones (como instalador)
4. **Lee la documentación de fases**: Los archivos `PHASE_XX_SUMMARY.md` en la raíz documentan cada fase de desarrollo

## 📚 Recursos Adicionales

- [Documentación de Astro](https://docs.astro.build)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [CLAUDE.md](../CLAUDE.md) - Guía para trabajar con Claude Code en este proyecto

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas que no están cubiertos en esta guía:

1. Revisa los archivos `PHASE_XX_SUMMARY.md` para entender mejor la implementación
2. Consulta el archivo `CLAUDE.md` para convenciones del proyecto
3. Revisa los issues en el repositorio de GitHub

---

**Última actualización**: Diciembre 2025

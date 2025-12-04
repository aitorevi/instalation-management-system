# Deuda Técnica - Proyecto IMS

Este documento registra la deuda técnica acumulada durante el desarrollo del proyecto IMS, organizada por fase.

---

## 📋 Resumen Ejecutivo

- **Total de items pendientes**: 59
- **Prioridad Alta**: 26 items
- **Prioridad Media**: 24 items
- **Prioridad Baja**: 9 items
- **Fecha de última actualización**: 2025-12-03

---

## Fase 07: Layouts

### Estado General

✅ **Completado**:

- BaseLayout básico con meta tags esenciales
- Header con logo, user info y botón logout
- Sidebar con navegación según rol (admin/installer)
- Sidebar mobile con overlay funcional
- DashboardLayout integrando Header y Sidebar
- Admin dashboard actualizado con stats cards (placeholders)
- Installer dashboard actualizado con stats cards (placeholders)
- Build exitoso

🚧 **Pendiente**: PWA features, iconos/favicon completos, estilos globales avanzados, tests E2E

---

### 1. PWA Meta Tags y Manifest (Prioridad: BAJA)

**Contexto**: Las features PWA están planificadas para la Fase 14 (PWA Setup), pero algunos meta tags básicos del plan original de Fase 07 fueron omitidos para evitar duplicar trabajo.

**Archivo**: `src/layouts/BaseLayout.astro`

- [ ] **Agregar PWA meta tags completos**
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
  - `<meta name="apple-mobile-web-app-title" content="IMS">`
  - Tiempo estimado: 15 min

- [ ] **Agregar favicon y app icons**
  - Crear `public/favicon.svg`
  - Crear `public/icons/apple-touch-icon.png`
  - Agregar `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`
  - Agregar `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`
  - Tiempo estimado: 30 min (diseño + implementación)

- [ ] **Crear Web App Manifest**
  - Archivo: `public/manifest.json`
  - Configurar nombre, descripción, iconos, colores
  - Agregar `<link rel="manifest" href="/manifest.json">` en BaseLayout
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 1.25 horas

**Nota**: Estas tareas se completarán en la Fase 14 (PWA Setup) de forma más comprehensiva.

---

### 2. Service Worker Registration (Prioridad: BAJA)

**Contexto**: El plan original incluye registro de Service Worker en BaseLayout, pero esta funcionalidad completa está planificada para Fase 14.

**Archivo**: `src/layouts/BaseLayout.astro`

- [ ] **Agregar script de registro de Service Worker**
  - Script en BaseLayout que registra `/sw.js`
  - Console logs para debug de registro
  - Tiempo estimado: 15 min

**Archivo**: `public/sw.js` (NUEVO)

- [ ] **Crear Service Worker básico**
  - Cache de assets estáticos
  - Estrategia de cache-first o network-first
  - Manejo de offline fallback
  - Tiempo estimado: 2 horas

**Tiempo total estimado**: 2.25 horas

**Nota**: Esta funcionalidad se implementará completamente en Fase 14 (PWA Setup).

---

### 3. Estilos Globales Avanzados (Prioridad: MEDIA)

**Contexto**: BaseLayout no incluye referencia a estilos globales. Los estilos están inline en Tailwind, pero podrían centralizarse.

**Archivo**: `src/styles/global.css`

- [ ] **Verificar estilos globales existentes**
  - Revisar si `src/styles/global.css` existe
  - Si no existe, crearlo con estilos base
  - Tiempo estimado: 30 min

**Archivo**: `src/layouts/BaseLayout.astro`

- [ ] **Importar estilos globales en BaseLayout**
  - Agregar `<style is:global>` con import de `../styles/global.css`
  - Verificar que estilos se aplican correctamente
  - Tiempo estimado: 15 min

**Archivo**: `src/styles/global.css`

- [ ] **Definir variables CSS custom properties**
  - Colores del tema (primary, secondary, etc.)
  - Espaciados consistentes
  - Sombras y borders radius
  - Tiempo estimado: 45 min

**Tiempo total estimado**: 1.5 horas

---

### 4. Tests E2E de Layouts (Prioridad: MEDIA)

**Archivo**: `e2e/layouts.spec.ts` (NUEVO)

**Header Tests**:

- [ ] **Test: Header displays user info correctly**
  - Login como admin
  - Verificar nombre de usuario visible
  - Verificar badge de rol (Admin/Installer)
  - Tiempo estimado: 30 min

- [ ] **Test: Header logo link redirects correctly**
  - Admin: Logo redirige a `/admin`
  - Installer: Logo redirige a `/installer`
  - Tiempo estimado: 20 min

- [ ] **Test: Header logout button works**
  - Click en botón logout
  - Verificar redirect a `/auth/logout`
  - Tiempo estimado: 20 min

**Sidebar Desktop Tests**:

- [ ] **Test: Sidebar displays correct nav items for admin**
  - Login como admin
  - Viewport desktop (1920x1080)
  - Verificar items: Dashboard, Instalaciones, Instaladores
  - Tiempo estimado: 30 min

- [ ] **Test: Sidebar displays correct nav items for installer**
  - Login como installer
  - Viewport desktop
  - Verificar items: Dashboard, Mis Instalaciones
  - Tiempo estimado: 30 min

- [ ] **Test: Sidebar active state works**
  - Navegar a `/admin/installations`
  - Verificar que item "Instalaciones" tiene clase `bg-primary-50`
  - Tiempo estimado: 20 min

**Sidebar Mobile Tests**:

- [ ] **Test: Mobile sidebar toggle opens/closes**
  - Viewport mobile (375x667)
  - Click en hamburger button
  - Verificar sidebar slide-in (no tiene clase `-translate-x-full`)
  - Click en overlay
  - Verificar sidebar cierra
  - Tiempo estimado: 45 min

- [ ] **Test: Mobile sidebar close button works**
  - Abrir sidebar mobile
  - Click en botón close (X)
  - Verificar sidebar cierra
  - Tiempo estimado: 20 min

- [ ] **Test: Mobile sidebar displays user info**
  - Abrir sidebar mobile
  - Verificar avatar con inicial del usuario
  - Verificar nombre completo
  - Verificar email
  - Tiempo estimado: 30 min

**Responsive Tests**:

- [ ] **Test: Sidebar hides on mobile, shows on desktop**
  - Viewport mobile: Sidebar no visible
  - Viewport desktop: Sidebar visible
  - Tiempo estimado: 20 min

- [ ] **Test: Header responsive behavior**
  - Mobile: User name hidden, solo avatar
  - Desktop: User name visible con badge
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 5 horas

---

### 5. Accessibility Audits - Layouts (Prioridad: MEDIA)

**Archivo**: `e2e/layouts-accessibility.spec.ts` (NUEVO)

- [ ] **Test: Header passes axe-core scan**
  - Login como admin
  - Ejecutar `await checkA11y(page, 'header')`
  - Verificar sin violaciones críticas
  - Tiempo estimado: 30 min

- [ ] **Test: Sidebar passes axe-core scan**
  - Desktop sidebar scan
  - Mobile sidebar scan (abierto)
  - Tiempo estimado: 45 min

- [ ] **Test: Header is keyboard navigable**
  - Tab navigation: Logo → Logout button
  - Enter activa links
  - Focus indicators visibles
  - Tiempo estimado: 30 min

- [ ] **Test: Sidebar is keyboard navigable**
  - Tab through all nav items
  - Enter activa navegación
  - Focus trap en mobile sidebar (cuando abierto)
  - Tiempo estimado: 45 min

- [ ] **Test: Mobile menu button has proper ARIA**
  - `aria-label="Abrir menú"` presente
  - `aria-expanded` actualiza en toggle
  - Tiempo estimado: 30 min

- [ ] **Test: Sidebar nav items have proper semantics**
  - Nav wrapped en `<nav>` tag
  - Links tienen href válidos
  - Active state comunicado a screen readers
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 3.5 horas

---

### 6. Visual Consistency - Layouts (Prioridad: MEDIA)

- [ ] **Verify card styles consistency**
  - Revisar stats cards en admin dashboard
  - Verificar clases: `bg-white rounded-lg shadow-sm border border-gray-200 p-6`
  - Aplicar mismas clases en installer dashboard
  - Tiempo estimado: 30 min

- [ ] **Verify icon consistency**
  - Todos los íconos SVG con `class="w-5 h-5"` o `w-6 h-6`
  - Stroke-width consistente (2)
  - Colores consistentes por tipo (blue-600, yellow-600, etc.)
  - Tiempo estimado: 30 min

- [ ] **Create card component for reusability**
  - Archivo: `src/components/ui/StatCard.astro` (NUEVO)
  - Props: icon, iconColor, label, value
  - Refactorizar dashboards para usar componente
  - Tiempo estimado: 1 hora

**Tiempo total estimado**: 2 horas

---

### 7. Performance Optimization - Layouts (Prioridad: BAJA)

- [ ] **Measure layout shift (CLS)**
  - E2E test con Lighthouse
  - CLS < 0.1 para buena UX
  - Tiempo estimado: 30 min

- [ ] **Optimize sidebar toggle animation**
  - Usar CSS transform en lugar de JS
  - GPU acceleration con `will-change`
  - Tiempo estimado: 45 min

- [ ] **Lazy load user avatar**
  - Si avatar es imagen, usar loading="lazy"
  - Para inicial, no necesario
  - Tiempo estimado: 15 min

**Tiempo total estimado**: 1.5 horas

---

### 8. Documentation - Layouts (Prioridad: MEDIA)

**Archivo**: `workspace/ui-patterns.md` (ACTUALIZAR)

- [ ] **Document layout structure**
  - BaseLayout usage
  - DashboardLayout usage
  - Cuándo usar cada layout
  - Tiempo estimado: 30 min

- [ ] **Document navigation patterns**
  - Cómo agregar nuevos items de navegación
  - Cómo manejar rutas activas
  - Role-based navigation
  - Tiempo estimado: 45 min

- [ ] **Document responsive behavior**
  - Breakpoints (lg: 1024px)
  - Mobile sidebar toggle
  - Header responsive changes
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 1.75 horas

---

## 📊 Resumen de Tiempo Estimado - Fase 07

| Categoría                | Prioridad | Items  | Tiempo Estimado |
| ------------------------ | --------- | ------ | --------------- |
| PWA Meta Tags y Manifest | BAJA      | 3      | 1.25 horas      |
| Service Worker           | BAJA      | 2      | 2.25 horas      |
| Estilos Globales         | MEDIA     | 3      | 1.5 horas       |
| Tests E2E Layouts        | MEDIA     | 13     | 5 horas         |
| Accessibility Audits     | MEDIA     | 6      | 3.5 horas       |
| Visual Consistency       | MEDIA     | 3      | 2 horas         |
| Performance              | BAJA      | 3      | 1.5 horas       |
| Documentation            | MEDIA     | 3      | 1.75 horas      |
| **TOTAL**                | -         | **36** | **18.75 horas** |

---

## Fase 06: Auth Middleware

### Estado General

✅ **Completado**:

- Middleware core con protección de rutas y RBAC
- Session timeout (absoluto e inactividad)
- Tests unitarios (58/58 pasando)
- Error page y manejo de errores
- Dashboards con información de usuario
- Build exitoso

🚧 **Pendiente**: Testing E2E, auditorías de accesibilidad, verificación responsive

---

### 1. Tests E2E - Protected Routes (Prioridad: ALTA)

**Contexto**: Los tests E2E están scaffoldeados pero la mayoría están con `test.skip` porque requieren autenticación real con usuarios de prueba configurados en Supabase.

**Archivo**: `e2e/auth-middleware.spec.ts`

- [ ] **Test: Unauthenticated user accessing /admin**
  - Remover `test.skip`
  - Verificar redirect a `/login?reason=unauthorized`
  - Tiempo estimado: 30 min

- [ ] **Test: Unauthenticated user accessing /installer**
  - Remover `test.skip`
  - Verificar redirect a `/login?reason=unauthorized`
  - Tiempo estimado: 30 min

- [ ] **Test: Unauthenticated user accessing root route**
  - Remover `test.skip`
  - Verificar redirect a `/login?reason=unauthorized`
  - Tiempo estimado: 20 min

- [ ] **Test: Admin user can access /admin**
  - Configurar usuario admin de prueba en Supabase
  - Usar helper `loginAsAdmin(page)` con credenciales reales
  - Verificar carga exitosa del dashboard
  - Verificar nombre y rol mostrados
  - Tiempo estimado: 1 hora

- [ ] **Test: Admin user accessing /installer redirects to /admin**
  - Usar helper `loginAsAdmin(page)`
  - Verificar redirect correcto
  - Tiempo estimado: 30 min

- [ ] **Test: Installer user can access /installer**
  - Configurar usuario installer de prueba en Supabase
  - Usar helper `loginAsInstaller(page)`
  - Verificar carga exitosa del dashboard
  - Tiempo estimado: 1 hora

- [ ] **Test: Installer user accessing /admin redirects to /installer**
  - Usar helper `loginAsInstaller(page)`
  - Verificar redirect correcto
  - Tiempo estimado: 30 min

- [ ] **Test: Admin user accessing / redirects to /admin**
  - Verificar redirect desde root
  - Tiempo estimado: 20 min

- [ ] **Test: Installer user accessing / redirects to /installer**
  - Verificar redirect desde root
  - Tiempo estimado: 20 min

**Requisitos previos**:

- Crear usuarios de prueba en Supabase (admin y installer)
- Documentar credenciales en `.env.test` o fixture
- Actualizar helpers de autenticación con credenciales reales

**Tiempo total estimado**: 5-6 horas

---

### 2. Tests E2E - Session Expiry (Prioridad: ALTA)

**Archivo**: `e2e/session-expiry.spec.ts`

- [ ] **Test: Expired session redirects to login with reason**
  - Login como admin
  - Simular expiración de sesión (clearear cookies o manipular timestamps)
  - Navegar a ruta protegida
  - Verificar redirect a `/login?reason=session-expired`
  - Verificar mensaje de sesión expirada visible
  - Tiempo estimado: 1 hora

- [ ] **Test: Session expiry banner has correct styling**
  - Verificar banner amarillo de warning (bg-yellow-50)
  - Verificar ícono de info visible
  - Verificar ARIA role="status"
  - Tiempo estimado: 30 min

- [ ] **Test: Login after session expiry works correctly**
  - Simular expiración
  - Click en "Continuar con Google"
  - Verificar OAuth flow
  - Verificar redirect a dashboard después de login
  - Tiempo estimado: 1 hora

**Tiempo total estimado**: 2.5 horas

---

### 3. Tests E2E - Session Timeout (Prioridad: ALTA)

**Archivo**: `e2e/session-timeout.spec.ts`

**Nota**: Este archivo ya tiene tests básicos pero algunos están marcados como `test.skip`.

- [ ] **Test: Absolute timeout redirects with correct message**
  - Login como usuario
  - Manipular cookie `sb-session-created` para simular timeout
  - Navegar a ruta protegida
  - Verificar redirect a `/login?reason=session-timeout`
  - Verificar mensaje mostrado
  - Tiempo estimado: 45 min

- [ ] **Test: Inactivity timeout redirects with correct message**
  - Login como usuario
  - Manipular cookie `sb-last-activity` para simular inactividad
  - Navegar a ruta protegida
  - Verificar redirect a `/login?reason=inactivity-timeout`
  - Verificar mensaje mostrado
  - Tiempo estimado: 45 min

- [ ] **Test: Session cookies cleared on timeout**
  - Simular timeout
  - Verificar que cookies `sb-access-token`, `sb-refresh-token`, `sb-session-created`, `sb-last-activity` son eliminadas
  - Tiempo estimado: 30 min

- [ ] **Test: New session creates timestamp cookies**
  - Login exitoso
  - Verificar que `sb-session-created` y `sb-last-activity` son creadas
  - Verificar valores de timestamps
  - Tiempo estimado: 30 min

- [ ] **Test: Login page displays timeout messages correctly**
  - Test para absolute timeout message
  - Test para inactivity timeout message
  - Verificar styling distintivo
  - Tiempo estimado: 45 min

**Tiempo total estimado**: 3 horas

---

### 4. Tests E2E - Error Page (Prioridad: ALTA)

**Archivo**: `e2e/error-handling.spec.ts`

- [ ] **Test: Error page displays with default message**
  - Navegar a `/error`
  - Verificar mensaje default visible
  - Tiempo estimado: 20 min

- [ ] **Test: Error page displays with custom message**
  - Navegar a `/error?message=Custom+error`
  - Verificar custom message visible
  - Tiempo estimado: 20 min

- [ ] **Test: Error page displays error code**
  - Navegar a `/error?message=Test&code=500`
  - Verificar código "500" visible
  - Tiempo estimado: 20 min

- [ ] **Test: Error page displays different error types**
  - Test `type=auth` → styling rojo
  - Test `type=forbidden` → styling amarillo
  - Test `type=generic` → styling gris
  - Tiempo estimado: 45 min

- [ ] **Test: "Volver a iniciar sesión" link works**
  - Click en link
  - Verificar navegación a `/login`
  - Tiempo estimado: 15 min

- [ ] **Test: "Ir al inicio" link works**
  - Click en link
  - Verificar navegación a `/`
  - Tiempo estimado: 15 min

- [ ] **Test: Error page has proper ARIA attributes**
  - Verificar `role="alert"`
  - Verificar `aria-live="assertive"`
  - Verificar keyboard accessibility
  - Tiempo estimado: 30 min

- [ ] **Test: Error page passes axe-core accessibility scan**
  - Instalar `@axe-core/playwright`
  - Ejecutar scan
  - Verificar sin violaciones críticas
  - Tiempo estimado: 45 min

**Tiempo total estimado**: 3 horas

---

### 5. Tests E2E - User Info Display (Prioridad: MEDIA)

**Archivo**: `e2e/user-info-display.spec.ts`

**Admin Dashboard**:

- [ ] **Test: Admin dashboard displays user full name**
  - Login como admin
  - Verificar nombre completo visible
  - Tiempo estimado: 20 min

- [ ] **Test: Admin dashboard displays user role**
  - Verificar rol "admin" visible
  - Tiempo estimado: 15 min

- [ ] **Test: Admin dashboard displays user initials**
  - Verificar avatar con iniciales
  - Verificar styling correcto
  - Tiempo estimado: 20 min

- [ ] **Test: Admin logout link works**
  - Click en logout
  - Verificar navegación a `/auth/logout`
  - Verificar sesión clearada
  - Verificar redirect a `/login`
  - Tiempo estimado: 30 min

**Installer Dashboard**:

- [ ] **Test: Installer dashboard displays user full name**
  - Login como installer
  - Verificar nombre completo visible
  - Tiempo estimado: 20 min

- [ ] **Test: Installer dashboard displays user role**
  - Verificar rol "installer" visible
  - Tiempo estimado: 15 min

- [ ] **Test: Installer dashboard displays user initials**
  - Verificar avatar con iniciales
  - Tiempo estimado: 20 min

- [ ] **Test: Installer logout link works**
  - Click en logout
  - Verificar flujo completo
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 2.5 horas

---

### 6. Tests E2E - Login Error Messages (Prioridad: MEDIA)

**Archivo**: `e2e/login-errors.spec.ts`

- [ ] **Test: Unauthorized error displays correctly**
  - Navegar a `/login?error=unauthorized`
  - Verificar banner rojo visible
  - Verificar mensaje "No tienes autorización"
  - Verificar `role="alert"`
  - Tiempo estimado: 30 min

- [ ] **Test: Invalid session error displays correctly**
  - Navegar a `/login?error=invalid_session`
  - Verificar mensaje correcto
  - Tiempo estimado: 20 min

- [ ] **Test: Access denied error displays correctly**
  - Navegar a `/login?error=access_denied`
  - Verificar mensaje "Acceso denegado"
  - Tiempo estimado: 20 min

- [ ] **Test: Session expired warning displays correctly**
  - Navegar a `/login?reason=session-expired`
  - Verificar banner amarillo
  - Verificar `role="status"`
  - Tiempo estimado: 30 min

- [ ] **Test: Error messages have proper ARIA roles**
  - Test distinción entre errors (role="alert") y warnings (role="status")
  - Test `aria-live` attributes
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 2 horas

---

### 7. Responsive Design Verification (Prioridad: MEDIA)

**Archivo**: `e2e/responsive-design.spec.ts` (NUEVO)

**Mobile (320px - 767px)**:

- [ ] **Test: Admin dashboard is usable on mobile**
  - Viewport 375x667 (iPhone SE)
  - Verificar user info legible
  - Verificar logout button tappable (min 44x44px)
  - Verificar sin scroll horizontal
  - Tiempo estimado: 45 min

- [ ] **Test: Installer dashboard is usable on mobile**
  - Viewport 375x667
  - Verificar user info legible
  - Verificar logout button tappable
  - Tiempo estimado: 30 min

- [ ] **Test: Error page is usable on mobile**
  - Verificar mensaje completo visible
  - Verificar botones full-width y tappables
  - Tiempo estimado: 30 min

- [ ] **Test: Login page is usable on mobile**
  - Verificar formulario usable
  - Verificar error banner legible
  - Tiempo estimado: 30 min

**Tablet (768px - 1023px)**:

- [ ] **Test: Admin dashboard adapts to tablet**
  - Viewport 768x1024 (iPad)
  - Verificar breakpoint styles (sm:)
  - Tiempo estimado: 30 min

- [ ] **Test: Installer dashboard adapts to tablet**
  - Viewport 768x1024
  - Verificar layout
  - Tiempo estimado: 30 min

**Desktop (1024px+)**:

- [ ] **Test: Admin dashboard optimized for desktop**
  - Viewport 1920x1080
  - Verificar breakpoint styles (lg:)
  - Verificar max-width (max-w-7xl)
  - Tiempo estimado: 30 min

- [ ] **Test: Installer dashboard optimized for desktop**
  - Viewport 1920x1080
  - Verificar layout desktop
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 4 horas

---

### 8. Accessibility Audits (Prioridad: ALTA)

**Archivo**: `e2e/accessibility.spec.ts` (NUEVO)

**Automated Testing (axe-core)**:

- [ ] **Setup: Install @axe-core/playwright**
  - `npm install -D @axe-core/playwright`
  - Configurar helper para scans
  - Tiempo estimado: 30 min

- [ ] **Test: Admin dashboard passes axe-core scan**
  - Login como admin
  - Ejecutar `await checkA11y(page)`
  - Verificar sin violaciones críticas/serias
  - Verificar color contrast WCAG AA (4.5:1)
  - Tiempo estimado: 45 min

- [ ] **Test: Installer dashboard passes axe-core scan**
  - Login como installer
  - Ejecutar scan
  - Tiempo estimado: 30 min

- [ ] **Test: Error page passes axe-core scan**
  - Scan de error page
  - Tiempo estimado: 30 min

- [ ] **Test: Login page passes axe-core scan**
  - Scan de login page
  - Tiempo estimado: 30 min

**Keyboard Navigation**:

- [ ] **Test: Admin dashboard is fully keyboard navigable**
  - Tab navigation completa
  - Focus indicators visibles
  - Tab order lógico
  - Logout activable con Enter
  - Tiempo estimado: 45 min

- [ ] **Test: Installer dashboard is fully keyboard navigable**
  - Tab navigation
  - Focus indicators
  - Tiempo estimado: 45 min

- [ ] **Test: Error page is fully keyboard navigable**
  - Links alcanzables con Tab
  - Activables con Enter
  - Tiempo estimado: 30 min

- [ ] **Test: Login page is fully keyboard navigable**
  - Botón Google login con Tab
  - Activable con Enter
  - Tiempo estimado: 30 min

**Screen Reader Testing (Manual)**:

- [ ] **Manual Test: Admin dashboard with screen reader**
  - Tool: NVDA (Windows) o VoiceOver (Mac)
  - Verificar landmarks anunciados
  - Verificar nombre y rol anunciados
  - Tiempo estimado: 45 min

- [ ] **Manual Test: Error page with screen reader**
  - Verificar alert anunciado inmediatamente
  - Verificar mensaje leído claramente
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 6 horas

---

### 9. Visual Consistency Review (Prioridad: MEDIA)

**Design System Compliance**:

- [ ] **Verify consistent color palette usage**
  - Revisar archivos: admin/index.astro, installer/index.astro, error.astro, login.astro
  - Verificar primary colors consistentes
  - Verificar error colors consistentes
  - Verificar warning colors consistentes
  - Tiempo estimado: 1 hora

- [ ] **Verify consistent typography**
  - Headings con font sizes consistentes
  - Body text consistente
  - Font weights consistentes
  - Tiempo estimado: 45 min

- [ ] **Verify consistent spacing**
  - Padding consistente en cards
  - Gaps consistentes
  - Margins consistentes
  - Tiempo estimado: 45 min

- [ ] **Verify consistent button styles**
  - Primary buttons consistentes
  - Secondary buttons consistentes
  - Focus states consistentes
  - Tiempo estimado: 45 min

**User Info Display Consistency**:

- [ ] **Verify admin and installer dashboards have identical user info layout**
  - Posición idéntica
  - Styling idéntico
  - Avatar size idéntico
  - Tiempo estimado: 30 min

- [ ] **Verify user initials generation is consistent**
  - Función `getInitials()` consistente
  - Manejo de edge cases
  - Uppercase correcto
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 4.5 horas

---

### 10. Performance Optimization (Prioridad: BAJA)

**Archivo**: `e2e/performance.spec.ts` (NUEVO, OPCIONAL)

- [ ] **Measure Time to First Byte (TTFB) for dashboard pages**
  - TTFB < 200ms local dev
  - TTFB < 500ms production
  - Tiempo estimado: 1 hora

- [ ] **Measure First Contentful Paint (FCP) for auth pages**
  - FCP < 1s
  - Tiempo estimado: 1 hora

- [ ] **Verify minimal client-side JavaScript**
  - Build app
  - Inspeccionar `dist/_astro/`
  - Verificar JS mínimo en dashboards
  - Tiempo estimado: 1 hora

**Tiempo total estimado**: 3 horas

---

### 11. Documentation (Prioridad: MEDIA)

**Component Documentation**:

- [ ] **Document user info display pattern**
  - Crear archivo: `workspace/ui-patterns.md`
  - Documentar layout de user info
  - Documentar helper `getInitials()`
  - Documentar responsive behavior
  - Tiempo estimado: 1 hora

- [ ] **Document error handling pattern**
  - Documentar uso de error page
  - Documentar query params (message, code, type)
  - Documentar error type styling
  - Tiempo estimado: 45 min

- [ ] **Document authentication flow UX**
  - Documentar session expiry UX
  - Documentar login error messaging
  - Documentar OAuth redirect flow
  - Tiempo estimado: 1 hora

**Testing Documentation**:

- [ ] **Document E2E testing patterns**
  - Actualizar `e2e/README.md`
  - Documentar cómo ejecutar E2E tests
  - Documentar uso de auth helpers
  - Documentar cómo agregar nuevos tests
  - Documentar manejo de fixtures de usuarios
  - Tiempo estimado: 1.5 horas

- [ ] **Document accessibility testing approach**
  - Documentar axe-core scans
  - Documentar keyboard navigation testing
  - Documentar WCAG compliance requirements
  - Tiempo estimado: 1 hora

**Tiempo total estimado**: 5.25 horas

---

### 12. Backend - Tests de Integración (Prioridad: BAJA)

**Archivo**: `src/lib/session-timeout.integration.test.ts` (OPCIONAL)

- [ ] **Test session timeout with real Supabase instance**
  - Usar Supabase local
  - Crear test user y autenticar
  - Simular absolute timeout
  - Simular inactivity timeout
  - Verificar session cleared
  - Limpiar test data
  - Tiempo estimado: 2 horas

**Archivo**: `src/middleware/index.test.ts` (OPCIONAL)

- [ ] **Add test: Session with absolute timeout redirects**
  - Mock `checkSessionTimeout()`
  - Verificar redirect a `/login?reason=session-timeout`
  - Tiempo estimado: 30 min

- [ ] **Add test: Session with inactivity timeout redirects**
  - Mock timeout inactivo
  - Verificar redirect correcto
  - Tiempo estimado: 30 min

- [ ] **Add test: Valid session updates last activity timestamp**
  - Mock `updateLastActivity()`
  - Verificar que se llama
  - Tiempo estimado: 30 min

- [ ] **Add test: New session creates session timestamp cookies**
  - Verificar cookies creadas
  - Tiempo estimado: 30 min

- [ ] **Add test: Session timeout is checked before RBAC**
  - Verificar orden de ejecución
  - Tiempo estimado: 30 min

- [ ] **Add test: Timeout checks don't interfere with existing middleware**
  - Test de regresión
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 5 horas

---

## 📊 Resumen de Tiempo Estimado por Categoría

| Categoría                    | Prioridad | Items  | Tiempo Estimado |
| ---------------------------- | --------- | ------ | --------------- |
| E2E Tests - Protected Routes | ALTA      | 9      | 5-6 horas       |
| E2E Tests - Session Expiry   | ALTA      | 3      | 2.5 horas       |
| E2E Tests - Session Timeout  | ALTA      | 5      | 3 horas         |
| E2E Tests - Error Page       | ALTA      | 8      | 3 horas         |
| E2E Tests - User Info        | MEDIA     | 8      | 2.5 horas       |
| E2E Tests - Login Errors     | MEDIA     | 5      | 2 horas         |
| Responsive Design            | MEDIA     | 8      | 4 horas         |
| Accessibility Audits         | ALTA      | 11     | 6 horas         |
| Visual Consistency           | MEDIA     | 6      | 4.5 horas       |
| Performance                  | BAJA      | 3      | 3 horas         |
| Documentation                | MEDIA     | 5      | 5.25 horas      |
| Backend Integration Tests    | BAJA      | 7      | 5 horas         |
| **TOTAL**                    | -         | **49** | **46.75 horas** |

---

## 🎯 Plan de Acción Recomendado

### Fase 1: Crítico (Prioridad ALTA) - 19.5 horas

Completar antes de avanzar a Fase 07:

1. ✅ Configurar usuarios de prueba en Supabase (admin + installer)
2. E2E Tests - Protected Routes (5-6h)
3. E2E Tests - Session Expiry (2.5h)
4. E2E Tests - Session Timeout (3h)
5. E2E Tests - Error Page (3h)
6. Accessibility Audits (6h)

### Fase 2: Importante (Prioridad MEDIA) - 18.25 horas

Completar para producción:

1. E2E Tests - User Info (2.5h)
2. E2E Tests - Login Errors (2h)
3. Responsive Design Verification (4h)
4. Visual Consistency Review (4.5h)
5. Documentation (5.25h)

### Fase 3: Opcional (Prioridad BAJA) - 8 horas

Nice to have:

1. Performance Optimization (3h)
2. Backend Integration Tests (5h)

---

## 📝 Notas Importantes

### Prerequisitos para E2E Tests

Antes de comenzar con E2E tests, necesitas:

1. **Usuarios de prueba en Supabase**:
   - Admin: `admin-test@example.com` (configurar en Supabase)
   - Installer: `installer-test@example.com` (configurar en Supabase)

2. **Configurar `.env.test`**:

   ```bash
   # Test User Credentials (for E2E)
   TEST_ADMIN_EMAIL=admin-test@example.com
   TEST_ADMIN_PASSWORD=test-password-123
   TEST_INSTALLER_EMAIL=installer-test@example.com
   TEST_INSTALLER_PASSWORD=test-password-123
   ```

3. **Actualizar helpers de autenticación** en `e2e/helpers/auth.ts`:
   - Usar credenciales reales en lugar de mocks
   - Implementar flujo de OAuth real si es necesario

### Testing Strategy

- **Tests unitarios**: ✅ 58/58 pasando (completado)
- **Tests E2E**: 🚧 Scaffoldeados, mayoría pendiente
- **Tests de integración**: 🚧 Opcionales

### Herramientas Necesarias

- [ ] Instalar: `@axe-core/playwright` para accessibility scans
- [ ] Configurar: Test users en Supabase
- [ ] Documentar: Credenciales de test en lugar seguro

---

## 🔄 Actualización del Documento

Este documento debe actualizarse:

- ✅ Cuando se completen items (marcar como completado)
- ✅ Cuando se agregue nueva deuda técnica
- ✅ Cuando cambien las prioridades
- ✅ Al final de cada fase de desarrollo

**Última actualización**: 2025-12-03 (Fase 06 core completa, pendiente testing comprehensivo)

---

## Fase 12: Installer Dashboard

### Estado General

✅ **Completado**:

- Dashboard principal con estadísticas (Hoy, Pendientes, En Progreso, Completadas)
- Instalaciones de hoy (sin fecha, solo hora)
- Próximas instalaciones (con fecha completa)
- Lista completa con filtros por status
- Agrupación inteligente por fechas
- Componente InstallationCardCompact reutilizable
- Queries específicas del installer con RLS
- Unit tests backend
- Página placeholder de detalle

🚧 **Pendiente**: Features adicionales propuestos, E2E tests completos

---

### 1. Notificaciones y Alertas Visuales (Prioridad: MEDIA)

**Contexto**: Durante la planificación de Fase 12, se identificó la necesidad de alertas visuales para instalaciones urgentes o que requieren atención especial. Se pospuso para implementar en fase posterior.

**Archivo**: `src/pages/installer/index.astro`

- [ ] **Agregar indicadores de urgencia**
  - Instalaciones con hora próxima (< 1 hora) mostrar banner naranja
  - Instalaciones con cobro pendiente mostrar badge verde destacado
  - Instalaciones atrasadas (pasada su hora) mostrar banner rojo
  - Tiempo estimado: 1 hora

**Archivo**: `src/components/installations/InstallationCardCompact.astro`

- [ ] **Agregar estilos de urgencia**
  - Border color dinámico según urgencia (red-500, orange-500, yellow-500)
  - Ícono de alerta en instalaciones urgentes
  - Animación sutil de pulso en instalaciones < 30 min
  - Tiempo estimado: 1.5 horas

**Archivo**: `src/lib/queries/installer.ts`

- [ ] **Agregar query para instalaciones urgentes**
  - `getUrgentInstallations()` - Instalaciones próximas (< 2 horas)
  - `getOverdueInstallations()` - Instalaciones pasadas sin completar
  - Incluir en stats del dashboard
  - Tiempo estimado: 1 hora

**Archivo**: `src/pages/installer/index.astro`

- [ ] **Agregar sección de alertas**
  - Banner destacado arriba del dashboard si hay urgentes/atrasadas
  - Lista compacta de instalaciones que requieren atención
  - Botón "Ver detalles" para cada una
  - Tiempo estimado: 1.5 horas

**Tests**:

- [ ] **Unit tests para lógica de urgencia**
  - Test cálculo de tiempo restante
  - Test clasificación de urgencia (urgent, warning, normal)
  - Tiempo estimado: 1 hora

**Tiempo total estimado**: 6 horas

---

### 2. Búsqueda Rápida de Instalaciones (Prioridad: MEDIA)

**Contexto**: Se identificó la necesidad de búsqueda rápida por nombre de cliente o dirección para facilitar el acceso a instalaciones específicas. Se pospuso para fase posterior.

**Archivo**: `src/pages/installer/installations/index.astro`

- [ ] **Agregar barra de búsqueda**
  - Input con ícono de búsqueda
  - Placeholder "Buscar por cliente o dirección..."
  - Submit button o búsqueda on-change (debounced)
  - Tiempo estimado: 1 hora

**Archivo**: `src/lib/queries/installer.ts`

- [ ] **Agregar query de búsqueda**
  - `searchMyInstallations(accessToken, userId, searchTerm)`
  - Búsqueda en client_name, client_address, client_phone
  - Case-insensitive con `ilike`
  - Respetar RLS (solo instalaciones asignadas)
  - Tiempo estimado: 1.5 horas

**Archivo**: `src/components/ui/SearchInput.astro` (NUEVO)

- [ ] **Crear componente reutilizable de búsqueda**
  - Props: name, placeholder, value, autofocus
  - Ícono de búsqueda SVG integrado
  - Clear button (X) si hay valor
  - Estilos consistentes con design system
  - Tiempo estimado: 1 hora

**Archivo**: `src/pages/installer/installations/index.astro`

- [ ] **Integrar búsqueda con filtros existentes**
  - Combo de búsqueda + status filter
  - Query param `?q=...&status=...`
  - Indicador de resultados encontrados
  - Botón "Limpiar búsqueda" si hay término activo
  - Tiempo estimado: 1.5 horas

**Frontend Enhancement**:

- [ ] **Agregar búsqueda en tiempo real (opcional)**
  - Client-side JS con debounce (300ms)
  - Evitar submit en cada keystroke
  - Progressive enhancement (funciona sin JS)
  - Tiempo estimado: 2 horas

**Tests**:

- [ ] **Unit tests para query de búsqueda**
  - Test búsqueda por nombre (case insensitive)
  - Test búsqueda por dirección
  - Test búsqueda por teléfono
  - Test búsqueda sin resultados
  - Test RLS (no muestra instalaciones de otros)
  - Tiempo estimado: 1.5 horas

- [ ] **E2E tests para búsqueda**
  - Test búsqueda exitosa muestra resultados
  - Test búsqueda sin resultados muestra empty state
  - Test combinación búsqueda + filtro status
  - Test limpiar búsqueda restaura lista completa
  - Tiempo estimado: 2 horas

**Tiempo total estimado**: 10.5 horas

---

### 3. Tests E2E - Installer Dashboard (Prioridad: ALTA)

**Contexto**: Los tests E2E se pospusieron para implementar después de la Fase 13 (update de instalaciones), permitiendo testear el flujo completo.

**Archivo**: `e2e/installer-dashboard.spec.ts` (NUEVO)

**Dashboard Stats Tests**:

- [ ] **Test: Dashboard displays correct stats**
  - Login como installer
  - Verificar 4 tarjetas de stats visibles
  - Verificar números correctos (basados en fixtures)
  - Tiempo estimado: 1 hora

- [ ] **Test: Stats update after creating installation**
  - Login como admin
  - Crear instalación asignada a installer
  - Login como installer
  - Verificar stats actualizadas
  - Tiempo estimado: 1.5 horas

**Today Installations Tests**:

- [ ] **Test: Today installations section displays correctly**
  - Crear instalación para hoy
  - Login como installer
  - Verificar sección "Instalaciones de Hoy"
  - Verificar solo muestra hora (no fecha)
  - Tiempo estimado: 1 hora

- [ ] **Test: Empty state for today installations**
  - Login como installer sin instalaciones hoy
  - Verificar empty state visible
  - Verificar mensaje correcto
  - Tiempo estimado: 30 min

**Upcoming Installations Tests**:

- [ ] **Test: Upcoming installations display correctly**
  - Crear 3 instalaciones futuras
  - Verificar sección "Próximas Instalaciones"
  - Verificar muestra fecha completa
  - Verificar orden ascendente por fecha
  - Tiempo estimado: 1 hora

- [ ] **Test: "Ver todas" link navigates correctly**
  - Click en "Ver todas"
  - Verificar navegación a `/installer/installations`
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 5.5 horas

---

**Archivo**: `e2e/installer-installations-list.spec.ts` (NUEVO)

**List Display Tests**:

- [ ] **Test: Installations list displays all installations**
  - Crear 5 instalaciones para installer
  - Navegar a `/installer/installations`
  - Verificar 5 instalaciones visibles
  - Tiempo estimado: 1 hora

- [ ] **Test: Installations grouped by date**
  - Crear instalaciones en 3 fechas diferentes
  - Verificar agrupación correcta
  - Verificar headers de fecha formateados
  - Tiempo estimado: 1.5 horas

- [ ] **Test: Empty state for no installations**
  - Login como installer sin instalaciones
  - Verificar empty state
  - Tiempo estimado: 30 min

**Filter Tests**:

- [ ] **Test: Filter by status works**
  - Crear instalaciones con diferentes status
  - Seleccionar "En Progreso"
  - Click Filtrar
  - Verificar solo muestra ese status
  - Tiempo estimado: 1 hora

- [ ] **Test: Clear filter restores full list**
  - Aplicar filtro
  - Click "Limpiar"
  - Verificar todas las instalaciones visibles
  - Tiempo estimado: 30 min

**Navigation Tests**:

- [ ] **Test: Click on installation navigates to detail**
  - Click en InstallationCardCompact
  - Verificar navegación a `/installer/installations/[id]`
  - Tiempo estimado: 30 min

**Responsive Tests**:

- [ ] **Test: List is usable on mobile**
  - Viewport 375x667
  - Verificar cards legibles
  - Verificar filtros usables
  - Tiempo estimado: 45 min

**Tiempo total estimado**: 5.75 horas

---

**Archivo**: `e2e/installer-installation-detail.spec.ts` (NUEVO)

**Placeholder Tests (Fase 12)**:

- [ ] **Test: Detail page placeholder displays**
  - Navegar a `/installer/installations/[valid-id]`
  - Verificar placeholder visible
  - Verificar mensaje "Detalle completo en Fase 13"
  - Tiempo estimado: 30 min

- [ ] **Test: Invalid installation redirects to list**
  - Navegar a `/installer/installations/invalid-uuid`
  - Verificar redirect a `/installer/installations`
  - Tiempo estimado: 30 min

- [ ] **Test: Cannot view other installer's installation**
  - Crear instalación asignada a otro installer
  - Intentar acceder como installer actual
  - Verificar redirect o error 403
  - Tiempo estimado: 45 min

**Full Detail Tests (Fase 13)**:

- [ ] **Test: Detail page displays installation info**
  - Implementar en Fase 13
  - Tiempo estimado: TBD

- [ ] **Test: Update status works**
  - Implementar en Fase 13
  - Tiempo estimado: TBD

**Tiempo total estimado**: 1.75 horas

---

**Archivo**: `e2e/installer-accessibility.spec.ts` (NUEVO)

**Accessibility Tests**:

- [ ] **Test: Dashboard passes axe-core scan**
  - Login como installer
  - Ejecutar `await checkA11y(page)`
  - Verificar sin violaciones críticas
  - Tiempo estimado: 45 min

- [ ] **Test: Installations list passes axe-core scan**
  - Navegar a lista
  - Ejecutar scan
  - Tiempo estimado: 30 min

- [ ] **Test: Dashboard is keyboard navigable**
  - Tab navigation completa
  - Verificar focus indicators
  - Enter activa links
  - Tiempo estimado: 45 min

- [ ] **Test: Stats cards have proper semantics**
  - Verificar números tienen `aria-label` descriptivo
  - Verificar contraste de colores
  - Tiempo estimado: 30 min

**Tiempo total estimado**: 2.5 horas

---

### Resumen Fase 12 - Tiempo Estimado

| Categoría                 | Prioridad | Items  | Tiempo Estimado |
| ------------------------- | --------- | ------ | --------------- |
| Notificaciones y Alertas  | MEDIA     | 5      | 6 horas         |
| Búsqueda Rápida           | MEDIA     | 7      | 10.5 horas      |
| E2E Tests - Dashboard     | ALTA      | 6      | 5.5 horas       |
| E2E Tests - List          | ALTA      | 7      | 5.75 horas      |
| E2E Tests - Detail        | ALTA      | 3      | 1.75 horas      |
| E2E Tests - Accessibility | ALTA      | 4      | 2.5 horas       |
| **TOTAL**                 | -         | **32** | **32 horas**    |

---

## ✅ Criterios de Aceptación

La Fase 06 estará **100% completa** cuando:

1. ✅ Todos los tests unitarios pasen (58/58) - **COMPLETADO**
2. ⬜ Todos los tests E2E de prioridad ALTA pasen
3. ⬜ Todas las páginas pasen axe-core accessibility scans
4. ⬜ Todas las páginas sean keyboard navigable
5. ⬜ Diseño responsive verificado (mobile, tablet, desktop)
6. ⬜ Documentación de patrones UI completada
7. ⬜ Documentación de testing completada
8. ✅ Build exitoso sin errores - **COMPLETADO**

---

**Nota Final**: El core de Fase 06 está funcional y listo para uso. La deuda técnica registrada aquí representa testing comprehensivo, auditorías de calidad, y documentación que aseguran el código sea production-ready, mantenible, y accesible.

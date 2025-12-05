# Deuda Técnica - IMS

Este documento rastrea la deuda técnica conocida y las mejoras futuras planificadas para el proyecto IMS.

## 📋 Tabla de Contenidos

- [Push Notifications](#push-notifications)
- [Testing](#testing)
- [Performance](#performance)
- [Seguridad](#seguridad)
- [UX/UI](#uxui)

---

## 🔔 Push Notifications

### Tests de Integración para API Endpoints

**Prioridad**: Media
**Esfuerzo estimado**: 4-6 horas
**Creado**: 2025-12-05

**Descripción:**
Actualmente los endpoints `/api/push/subscribe` y `/api/push/unsubscribe` carecen de tests de integración completos que verifiquen la interacción con Supabase.

**Tareas:**

- [ ] Configurar Supabase test instance o usar local Supabase
- [ ] Crear usuario de prueba con credenciales en `.env.test`
- [ ] Implementar tests de integración para `POST /api/push/subscribe`
  - Verificar creación de suscripción
  - Verificar upsert (actualización de suscripción existente)
  - Verificar autenticación requerida
  - Verificar validación de datos
- [ ] Implementar tests de integración para `POST /api/push/unsubscribe`
  - Verificar eliminación de suscripción
  - Verificar autenticación requerida
  - Verificar manejo de suscripción inexistente
- [ ] Configurar cleanup automático de datos de prueba

**Archivo base creado:**

```
src/pages/api/push/subscribe.integration.test.ts
```

**Bloqueadores:**

- Requiere Supabase test instance configurada
- Requiere usuario de prueba con credenciales

**Referencias:**

- PR #10 - Push Notifications Implementation

---

### Tests Unitarios para push-server.ts

**Prioridad**: Media
**Esfuerzo estimado**: 4-6 horas
**Creado**: 2025-12-05

**Descripción:**
El módulo `push-server.ts` no tiene tests unitarios. Debido a sus dependencias externas (Supabase, web-push), requiere mocking extensivo.

**Tareas:**

- [ ] Mockear `createClient` de Supabase
- [ ] Mockear `webpush.sendNotification`
- [ ] Mockear variables de entorno
- [ ] Test: `sendPushNotification` con usuario sin suscripciones
- [ ] Test: `sendPushNotification` con una suscripción exitosa
- [ ] Test: `sendPushNotification` con múltiples dispositivos
- [ ] Test: Limpieza de suscripciones obsoletas (410/404)
- [ ] Test: Manejo de errores de Supabase
- [ ] Test: Manejo de errores de web-push
- [ ] Test: Tracking de notificaciones fallidas

**Cobertura objetivo:**

- 90%+ line coverage
- 85%+ branch coverage

**Referencias:**

- `src/lib/push-server.ts`

---

### Component Tests para PushSubscribe.astro

**Prioridad**: Baja
**Esfuerzo estimado**: 6-8 horas
**Creado**: 2025-12-05

**Descripción:**
El componente `PushSubscribe.astro` no tiene tests de componente. Los tests E2E cubren el flujo completo pero no los detalles de implementación del componente.

**Tareas:**

- [ ] Investigar Astro testing utilities o usar JSDOM
- [ ] Configurar testing environment para componentes Astro
- [ ] Test: Renderizado inicial con todos los estados
- [ ] Test: Interacción con toggle button
- [ ] Test: Manejo de estado `operationInProgress`
- [ ] Test: Mensajes de alerta (success, error, warning)
- [ ] Test: Auto-hide de mensajes de éxito
- [ ] Test: Accesibilidad (ARIA labels, roles)
- [ ] Test: Actualización de icono según estado

**Bloqueadores:**

- Astro no tiene testing utilities oficiales estables
- Requiere investigación de mejores prácticas

**Alternativas:**

- Usar tests E2E existentes como sustituto temporal
- Esperar a Astro testing utilities oficiales

**Referencias:**

- `src/components/notifications/PushSubscribe.astro`
- Tests E2E: `e2e/push-notifications.spec.ts`

---

## 🧪 Testing

### Coverage Reports Automatizados

**Prioridad**: Baja
**Esfuerzo estimado**: 2 horas
**Creado**: 2025-12-05

**Descripción:**
No hay reportes de cobertura automatizados ni umbrales mínimos configurados.

**Tareas:**

- [ ] Configurar `vitest` coverage reporter
- [ ] Añadir script `npm run test:coverage`
- [ ] Configurar umbrales mínimos:
  - Line coverage: 80%
  - Branch coverage: 75%
  - Function coverage: 80%
- [ ] Generar reporte HTML
- [ ] Añadir badge de coverage al README
- [ ] Configurar CI/CD para generar reportes automáticos

**Configuración sugerida:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      lines: 80,
      branches: 75,
      functions: 80
    }
  }
});
```

---

### Tests para Instalaciones Actions

**Prioridad**: Media-Alta
**Esfuerzo estimado**: 4 horas
**Creado**: 2025-12-05

**Descripción:**
Los actions en `src/lib/actions/installations.ts` no tienen tests, incluyendo la lógica de envío de notificaciones push.

**Tareas:**

- [ ] Test: `createInstallation` sin installer_id (no envía notificación)
- [ ] Test: `createInstallation` con installer_id (envía notificación)
- [ ] Test: `updateInstallation` sin cambio de installer (no envía notificación)
- [ ] Test: `updateInstallation` con nuevo installer (envía notificación)
- [ ] Test: `archiveInstallation` exitoso
- [ ] Test: `restoreInstallation` exitoso
- [ ] Test: Manejo de errores de Supabase
- [ ] Test: Fire-and-forget de notificaciones (no afecta resultado)

**Referencias:**

- `src/lib/actions/installations.ts:28-40`
- `src/lib/actions/installations.ts:69-81`

---

## ⚡ Performance

### Optimización de Service Worker Cache

**Prioridad**: Baja
**Esfuerzo estimado**: 2-3 horas
**Creado**: 2025-12-05

**Descripción:**
El Service Worker usa una estrategia simple de cache. Podría optimizarse para mejor performance offline.

**Tareas:**

- [ ] Implementar cache de API responses (con expiración)
- [ ] Pre-cache de rutas críticas
- [ ] Estrategia stale-while-revalidate para assets
- [ ] Limpieza automática de cache antiguo
- [ ] Cache de imágenes con compresión

**Herramientas sugeridas:**

- Workbox (Google's PWA toolkit)
- Cache API con TTL

**Referencias:**

- `public/sw.js`

---

### Lazy Loading de Componentes Pesados

**Prioridad**: Baja
**Esfuerzo estimado**: 3-4 horas
**Creado**: 2025-12-05

**Descripción:**
Algunos componentes podrían cargarse de forma lazy para mejorar el tiempo de carga inicial.

**Tareas:**

- [ ] Identificar componentes pesados (>20KB)
- [ ] Implementar lazy loading con `client:visible`
- [ ] Implementar lazy loading con `client:idle`
- [ ] Medir impacto en Lighthouse scores

**Referencias:**

- [Astro Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)

---

## 🔒 Seguridad

### Rate Limiting para API Endpoints

**Prioridad**: Media
**Esfuerzo estimado**: 3-4 horas
**Creado**: 2025-12-05

**Descripción:**
Los endpoints de push notifications no tienen rate limiting, lo que podría permitir abuso.

**Tareas:**

- [ ] Implementar rate limiting en `/api/push/subscribe`
  - Límite: 10 requests por minuto por usuario
- [ ] Implementar rate limiting en `/api/push/unsubscribe`
  - Límite: 5 requests por minuto por usuario
- [ ] Usar Redis o memory cache para tracking
- [ ] Responder con `429 Too Many Requests`
- [ ] Añadir headers `Retry-After`

**Librerías sugeridas:**

- `@upstash/ratelimit` (con Vercel KV)
- `express-rate-limit` (si se usa Express)

---

### Validación de VAPID Keys en Build Time

**Prioridad**: Media
**Esfuerzo estimado**: 1 hora
**Creado**: 2025-12-05

**Descripción:**
Las VAPID keys se validan en runtime. Deberían validarse en build time para evitar despliegues incorrectos.

**Tareas:**

- [ ] Crear script de validación pre-build
- [ ] Verificar formato de VAPID public key (base64)
- [ ] Verificar formato de VAPID private key
- [ ] Verificar formato de VAPID subject (mailto:)
- [ ] Integrar en `npm run build`

**Ejemplo:**

```bash
#!/bin/bash
# scripts/validate-vapid.sh
if [[ ! $PUBLIC_VAPID_PUBLIC_KEY =~ ^[A-Za-z0-9_-]{87}$ ]]; then
  echo "Invalid VAPID public key format"
  exit 1
fi
```

---

## 🎨 UX/UI

### Mejoras en Mensajes de Error

**Prioridad**: Baja
**Esfuerzo estimado**: 2 horas
**Creado**: 2025-12-05

**Descripción:**
Algunos mensajes de error podrían ser más específicos y útiles para el usuario.

**Tareas:**

- [ ] Diferenciar entre error de red y error de permisos
- [ ] Mostrar pasos específicos para habilitar notificaciones según browser
- [ ] Añadir enlaces a documentación de ayuda
- [ ] Mejorar mensajes de error 410/404 (suscripción obsoleta)
- [ ] Añadir mensaje cuando Service Worker no está disponible

**Mensajes sugeridos:**

- "Tu suscripción expiró. Activa las notificaciones de nuevo."
- "Para activar notificaciones en Chrome: Configuración > Privacidad > Notificaciones"

---

### Notificaciones In-App (Fallback)

**Prioridad**: Baja
**Esfuerzo estimado**: 6-8 horas
**Creado**: 2025-12-05

**Descripción:**
Si las push notifications fallan, no hay fallback in-app para notificar al usuario.

**Tareas:**

- [ ] Crear sistema de notificaciones in-app
- [ ] Polling cada 30 segundos para nuevas asignaciones
- [ ] Badge counter en navbar
- [ ] Lista de notificaciones no leídas
- [ ] Marcar como leído
- [ ] Persistir estado en localStorage

**Casos de uso:**

- Usuario denegó permisos de notificaciones
- Browser no soporta push notifications
- Service Worker no disponible

---

## 📊 Métricas y Monitoring

### Tracking de Push Notifications

**Prioridad**: Media
**Esfuerzo estimado**: 4-6 horas
**Creado**: 2025-12-05

**Descripción:**
No hay métricas sobre el éxito/fallo de notificaciones push.

**Tareas:**

- [ ] Crear tabla `push_notification_logs`
  - `id`, `user_id`, `installation_id`, `sent_at`, `status`, `error`
- [ ] Registrar cada intento de envío
- [ ] Dashboard de métricas:
  - Tasa de éxito/fallo
  - Errores más comunes
  - Usuarios con notificaciones fallidas
  - Suscripciones obsoletas eliminadas
- [ ] Alertas cuando tasa de fallo > 10%

**Herramientas sugeridas:**

- Supabase Analytics
- PostHog
- Google Analytics 4

---

## 🔧 Mantenimiento

### Limpieza Periódica de Suscripciones Inactivas

**Prioridad**: Baja
**Esfuerzo estimado**: 2-3 horas
**Creado**: 2025-12-05

**Descripción:**
Las suscripciones se limpian cuando fallan (410/404), pero no hay limpieza de suscripciones muy antiguas.

**Tareas:**

- [ ] Crear migration para añadir `last_used_at` a `push_subscriptions`
- [ ] Actualizar `last_used_at` en cada notificación exitosa
- [ ] Crear cron job (Vercel Cron o Supabase Edge Function)
- [ ] Eliminar suscripciones con `last_used_at` > 90 días
- [ ] Notificar usuario antes de eliminar (opcional)

**Supabase Edge Function sugerida:**

```sql
-- Ejecutar semanalmente
DELETE FROM push_subscriptions
WHERE updated_at < NOW() - INTERVAL '90 days';
```

---

## 📝 Priorización

| Prioridad | Items | Esfuerzo Total |
| --------- | ----- | -------------- |
| Alta      | 1     | 4 horas        |
| Media     | 6     | 25-33 horas    |
| Baja      | 9     | 30-39 horas    |

**Total**: ~59-76 horas de trabajo estimado

---

## 🎯 Sprint Sugerido

### Sprint 1 - Testing Core (1 semana)

- Tests de integración para API endpoints
- Tests unitarios para push-server.ts
- Tests para instalaciones actions

### Sprint 2 - Seguridad y Reliability (1 semana)

- Rate limiting
- Validación VAPID en build time
- Tracking de push notifications

### Sprint 3 - UX y Performance (1 semana)

- Mejoras en mensajes de error
- Optimización de Service Worker
- Coverage reports automatizados

### Sprint 4 - Features Avanzadas (2 semanas)

- Notificaciones in-app (fallback)
- Component tests para PushSubscribe
- Limpieza periódica de suscripciones
- Dashboard de métricas

---

## 📌 Notas

- Este documento debe revisarse y actualizarse trimestralmente
- Al completar items, moverlos a `CHANGELOG.md` con fecha de completado
- Prioridades pueden cambiar según necesidades del negocio
- Estimaciones son aproximadas y deben refinarse al planificar sprints

---

**Última actualización**: 2025-12-05
**Próxima revisión**: 2025-03-05

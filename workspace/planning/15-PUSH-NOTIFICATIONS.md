# Fase 15: Push Notifications

## Objetivo

Implementar notificaciones push para avisar a los instaladores cuando les asignan una instalación.

## Pre-requisitos

- Fases 01-14 completadas
- VAPID keys generadas

---

## Paso 1: Generar VAPID Keys

```bash
npx web-push generate-vapid-keys
```

**Output ejemplo:**

```
Public Key: BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Guardar en `.env`:**

```env
PUBLIC_VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:admin@tudominio.com
```

**Verificación:** Keys añadidas a `.env`

---

## Paso 2: Crear tabla para suscripciones push

En Supabase SQL Editor, ejecutar:

```sql
-- Tabla para guardar suscripciones push
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Un usuario puede tener múltiples dispositivos
    UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede ver/gestionar sus propias suscripciones
CREATE POLICY "users_manage_own_subscriptions" ON push_subscriptions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin puede ver todas (para enviar notificaciones)
CREATE POLICY "admin_read_all_subscriptions" ON push_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

**Verificación:** Tabla creada en Supabase

---

## Paso 3: Regenerar tipos TypeScript

```bash
npm run db:types
```

**Verificación:** `src/types/database.ts` actualizado con `push_subscriptions`

---

## Paso 4: Crear lib para push notifications

**Archivo:** `src/lib/push.ts`

```typescript
import { createServerClient } from './supabase';

// Verificar si el navegador soporta push
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Solicitar permiso para notificaciones
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  return await Notification.requestPermission();
}

// Obtener suscripción push actual o crear una nueva
export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      return subscription;
    }

    // Crear nueva suscripción
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

// Cancelar suscripción
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return false;
  }
}

// Guardar suscripción en base de datos
export async function saveSubscription(
  accessToken: string,
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  const client = createServerClient(accessToken);

  const subscriptionJson = subscription.toJSON();

  const { error } = await client.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh || '',
      auth: subscriptionJson.keys?.auth || ''
    },
    {
      onConflict: 'user_id,endpoint'
    }
  );

  if (error) {
    console.error('Error saving subscription:', error);
    return false;
  }

  return true;
}

// Eliminar suscripción de base de datos
export async function removeSubscription(
  accessToken: string,
  userId: string,
  endpoint: string
): Promise<boolean> {
  const client = createServerClient(accessToken);

  const { error } = await client
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('Error removing subscription:', error);
    return false;
  }

  return true;
}

// Helper: convertir VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
```

**Verificación:** Archivo existe sin errores

---

## Paso 5: Crear componente de suscripción push

**Archivo:** `src/components/notifications/PushSubscribe.astro`

```astro
---
interface Props {
  userId: string;
}

const { userId } = Astro.props;
const vapidPublicKey = import.meta.env.PUBLIC_VAPID_PUBLIC_KEY;
---

<div id="push-container" class="card" data-user-id={userId} data-vapid-key={vapidPublicKey}>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
        <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          ></path>
        </svg>
      </div>
      <div>
        <h3 class="font-medium text-gray-900">Notificaciones Push</h3>
        <p id="push-status" class="text-sm text-gray-500">Cargando...</p>
      </div>
    </div>

    <button id="push-toggle" class="btn-secondary" disabled> Cargando... </button>
  </div>

  <p id="push-error" class="text-sm text-red-600 mt-3 hidden"></p>
</div>

<script>
  import {
    isPushSupported,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    saveSubscription,
    removeSubscription
  } from '../../lib/push';

  const container = document.getElementById('push-container');
  const statusEl = document.getElementById('push-status');
  const toggleBtn = document.getElementById('push-toggle') as HTMLButtonElement;
  const errorEl = document.getElementById('push-error');

  const userId = container?.dataset.userId || '';
  const vapidKey = container?.dataset.vapidKey || '';

  let isSubscribed = false;
  let currentSubscription: PushSubscription | null = null;

  async function getAccessToken(): Promise<string> {
    // Obtener token de cookie (el mismo que usa el servidor)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find((c) => c.trim().startsWith('sb-access-token='));
    return tokenCookie?.split('=')[1] || '';
  }

  async function initPush() {
    // Verificar soporte
    if (!isPushSupported()) {
      statusEl!.textContent = 'Tu navegador no soporta notificaciones';
      toggleBtn!.style.display = 'none';
      return;
    }

    // Verificar permiso actual
    const permission = Notification.permission;

    if (permission === 'denied') {
      statusEl!.textContent = 'Notificaciones bloqueadas';
      toggleBtn!.textContent = 'Bloqueado';
      toggleBtn!.disabled = true;
      return;
    }

    // Verificar suscripción existente
    try {
      const registration = await navigator.serviceWorker.ready;
      currentSubscription = await registration.pushManager.getSubscription();
      isSubscribed = !!currentSubscription;

      updateUI();
      toggleBtn!.disabled = false;
    } catch (error) {
      console.error('Error checking subscription:', error);
      statusEl!.textContent = 'Error al verificar';
    }
  }

  function updateUI() {
    if (isSubscribed) {
      statusEl!.textContent = 'Activadas';
      statusEl!.className = 'text-sm text-green-600';
      toggleBtn!.textContent = 'Desactivar';
      toggleBtn!.className = 'btn bg-gray-200 text-gray-700 hover:bg-gray-300';
    } else {
      statusEl!.textContent = 'Desactivadas';
      statusEl!.className = 'text-sm text-gray-500';
      toggleBtn!.textContent = 'Activar';
      toggleBtn!.className = 'btn-primary';
    }
    errorEl!.classList.add('hidden');
  }

  function showError(message: string) {
    errorEl!.textContent = message;
    errorEl!.classList.remove('hidden');
  }

  async function toggleSubscription() {
    toggleBtn!.disabled = true;
    toggleBtn!.textContent = 'Procesando...';

    const accessToken = await getAccessToken();

    if (isSubscribed && currentSubscription) {
      // Desuscribirse
      try {
        await unsubscribeFromPush();
        await removeSubscription(accessToken, userId, currentSubscription.endpoint);
        isSubscribed = false;
        currentSubscription = null;
        updateUI();
      } catch (error) {
        showError('Error al desactivar notificaciones');
      }
    } else {
      // Suscribirse
      try {
        // Pedir permiso si es necesario
        const permission = await requestNotificationPermission();

        if (permission !== 'granted') {
          showError('Necesitas permitir las notificaciones');
          updateUI();
          toggleBtn!.disabled = false;
          return;
        }

        // Suscribirse
        currentSubscription = await subscribeToPush(vapidKey);

        if (!currentSubscription) {
          throw new Error('No se pudo crear la suscripción');
        }

        // Guardar en BD
        const saved = await saveSubscription(accessToken, userId, currentSubscription);

        if (!saved) {
          throw new Error('No se pudo guardar la suscripción');
        }

        isSubscribed = true;
        updateUI();
      } catch (error) {
        showError('Error al activar notificaciones');
        console.error(error);
      }
    }

    toggleBtn!.disabled = false;
  }

  // Event listeners
  toggleBtn?.addEventListener('click', toggleSubscription);

  // Inicializar
  initPush();
</script>

<style>
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
  }

  .btn-secondary {
    @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500;
  }
</style>
```

**Verificación:** Archivo existe

---

## Paso 6: Añadir suscripción al dashboard del installer

**Archivo:** `src/pages/installer/index.astro`

Añadir al final del contenido, antes de cerrar `</DashboardLayout>`:

```astro
---
// Añadir import al inicio
import PushSubscribe from '../../components/notifications/PushSubscribe.astro';
---

<!-- Antes del cierre de DashboardLayout, añadir: --><!-- Notificaciones Push -->
<div class="mt-8">
  <h2 class="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h2>
  <PushSubscribe userId={user.id} />
</div>
```

**Verificación:** Componente aparece en dashboard

---

## Paso 7: Crear Edge Function para enviar notificaciones

**Archivo:** `supabase/functions/notify-installer/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface PushPayload {
  installerId: string;
  title: string;
  body: string;
  url?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    const { installerId, title, body, url } = payload;

    // Obtener suscripciones del installer
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', installerId);

    if (error) {
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Enviar a cada suscripción
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        const notificationPayload = JSON.stringify({
          title,
          body,
          url: url || '/installer',
          actions: [{ action: 'view', title: 'Ver' }]
        });

        // Usar web-push via importmap
        const webPush = await import('npm:web-push@3.6.6');

        webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

        return webPush.sendNotification(pushSubscription, notificationPayload);
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        message: `Sent ${successful} notifications, ${failed} failed`,
        successful,
        failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

**Verificación:** Archivo existe

---

## Paso 8: Configurar secrets en Supabase

1. Ir a Supabase Dashboard > Settings > Edge Functions
2. Añadir secrets:
   - `VAPID_PUBLIC_KEY` = tu clave pública
   - `VAPID_PRIVATE_KEY` = tu clave privada
   - `VAPID_SUBJECT` = `mailto:tu@email.com`

**O via CLI:**

```bash
supabase secrets set VAPID_PUBLIC_KEY=tu_clave_publica
supabase secrets set VAPID_PRIVATE_KEY=tu_clave_privada
supabase secrets set VAPID_SUBJECT=mailto:tu@email.com
```

**Verificación:** Secrets configurados

---

## Paso 9: Deploy Edge Function

```bash
supabase functions deploy notify-installer
```

**Verificación:** Function desplegada

---

## Paso 10: Llamar a la función al asignar instalación

**Actualizar** `src/lib/actions/installations.ts`:

```typescript
// Añadir al final del archivo:

// Notificar al installer cuando se le asigna una instalación
export async function notifyInstaller(
  installerId: string,
  installationName: string,
  installationId: string
): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/notify-installer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        installerId,
        title: 'Nueva instalación asignada',
        body: `Se te ha asignado: ${installationName}`,
        url: `/installer/installations/${installationId}`
      })
    });

    if (!response.ok) {
      console.error('Error notifying installer:', await response.text());
    }
  } catch (error) {
    console.error('Error calling notify function:', error);
  }
}
```

**Luego**, actualizar la función `createInstallation` y `updateInstallation` para llamar a `notifyInstaller` cuando se asigne un installer.

**Verificación:** Función añadida

---

## Paso 11: Probar notificaciones

### Test 1: Activar notificaciones como installer

1. Login como installer
2. En dashboard, sección "Notificaciones"
3. Click "Activar"
4. Permitir en el navegador
5. **Esperado:** Status cambia a "Activadas"

### Test 2: Verificar suscripción guardada

1. En Supabase > Table Editor > push_subscriptions
2. **Esperado:** Ver registro con endpoint del navegador

### Test 3: Enviar notificación de prueba

1. Como admin, asignar una instalación al installer
2. **Esperado:** Installer recibe notificación push

### Test 4: Desactivar notificaciones

1. Como installer, click "Desactivar"
2. **Esperado:** Status cambia a "Desactivadas", registro eliminado de BD

### Test 5: Probar en móvil

1. Instalar PWA en móvil
2. Activar notificaciones
3. Enviar desde admin
4. **Esperado:** Notificación aparece en móvil

**Verificación:** Notificaciones funcionan

---

## Checklist Final Fase 15

- [ ] VAPID keys generadas y en `.env`
- [ ] Tabla `push_subscriptions` creada
- [ ] Tipos TypeScript regenerados
- [ ] `src/lib/push.ts` con helpers
- [ ] `PushSubscribe.astro` componente
- [ ] Componente añadido a dashboard installer
- [ ] Edge Function `notify-installer` creada
- [ ] Secrets configurados en Supabase
- [ ] Edge Function desplegada
- [ ] `notifyInstaller` función añadida
- [ ] Activar/desactivar notificaciones funciona
- [ ] Notificaciones se reciben correctamente

---

## 🎉 ¡Proyecto Completado!

Has completado todas las fases del IMS. La aplicación incluye:

- ✅ Autenticación con Google OAuth
- ✅ Roles Admin/Installer con permisos diferenciados
- ✅ CRUD completo de instalaciones
- ✅ Gestión de instaladores
- ✅ Dashboard personalizado por rol
- ✅ Actualización de status y materiales
- ✅ PWA instalable
- ✅ Notificaciones push

### Próximos pasos sugeridos:

1. Deploy a Vercel
2. Configurar dominio personalizado
3. Añadir más funcionalidades según necesidades
4. Optimizar rendimiento
5. Añadir tests

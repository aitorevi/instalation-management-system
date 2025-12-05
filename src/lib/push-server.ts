import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = import.meta.env.PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = import.meta.env.VAPID_PRIVATE_KEY;
const vapidSubject = import.meta.env.VAPID_SUBJECT;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
  throw new Error('Missing VAPID environment variables');
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

export interface SendPushNotificationResult {
  userId: string;
  totalDevices: number;
  successful: number;
  failed: number;
  errors: Array<{
    endpoint: string;
    error: string;
  }>;
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<SendPushNotificationResult> {
  const { data: subscriptions, error: fetchError } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (fetchError) {
    console.error('Error fetching push subscriptions:', fetchError);
    throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
  }

  if (!subscriptions || subscriptions.length === 0) {
    return {
      userId,
      totalDevices: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    data: payload.data || {}
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription: webpush.PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload);
        return { endpoint: sub.endpoint, success: true };
      } catch (error) {
        console.error(`Failed to send push notification to ${sub.endpoint}:`, error);
        return {
          endpoint: sub.endpoint,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    })
  );

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.filter(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
  ).length;

  const errors = results
    .filter((r) => r.status === 'fulfilled' && !r.value.success)
    .map((r) => {
      if (r.status === 'fulfilled') {
        return {
          endpoint: r.value.endpoint,
          error: r.value.error || 'Unknown error'
        };
      }
      return {
        endpoint: 'unknown',
        error: 'Promise rejected'
      };
    });

  console.log(
    `Push notification sent to user ${userId}: ${successful}/${subscriptions.length} successful`
  );

  return {
    userId,
    totalDevices: subscriptions.length,
    successful,
    failed,
    errors
  };
}

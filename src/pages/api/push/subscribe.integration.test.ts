import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../types/database';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables not set for integration tests');
}

describe('POST /api/push/subscribe - Integration Tests', () => {
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  let testUserId: string;
  let accessToken: string;

  beforeEach(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test-installer@example.com',
      password: 'test123456'
    });

    if (error || !data.session) {
      throw new Error('Failed to authenticate test user');
    }

    testUserId = data.user.id;
    accessToken = data.session.access_token;
  });

  afterEach(async () => {
    if (testUserId) {
      await supabase.from('push_subscriptions').delete().eq('user_id', testUserId);
    }
    await supabase.auth.signOut();
  });

  it('should save a new push subscription', async () => {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-1',
      keys: {
        p256dh: 'test-p256dh-key-1',
        auth: 'test-auth-key-1'
      }
    };

    const response = await fetch(`${supabaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${accessToken}`
      },
      body: JSON.stringify(subscription)
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    const { data: savedSub } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('endpoint', subscription.endpoint)
      .single();

    expect(savedSub).toBeTruthy();
    expect(savedSub?.p256dh).toBe(subscription.keys.p256dh);
    expect(savedSub?.auth).toBe(subscription.keys.auth);
  });

  it('should update existing subscription (upsert)', async () => {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-2',
      keys: {
        p256dh: 'test-p256dh-key-old',
        auth: 'test-auth-key-old'
      }
    };

    await fetch(`${supabaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${accessToken}`
      },
      body: JSON.stringify(subscription)
    });

    const updatedSubscription = {
      ...subscription,
      keys: {
        p256dh: 'test-p256dh-key-new',
        auth: 'test-auth-key-new'
      }
    };

    const response = await fetch(`${supabaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${accessToken}`
      },
      body: JSON.stringify(updatedSubscription)
    });

    expect(response.status).toBe(200);

    const { data: savedSub } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('endpoint', subscription.endpoint)
      .single();

    expect(savedSub?.p256dh).toBe('test-p256dh-key-new');
    expect(savedSub?.auth).toBe('test-auth-key-new');
  });

  it('should return 401 when not authenticated', async () => {
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint-3',
      keys: {
        p256dh: 'test-p256dh-key-3',
        auth: 'test-auth-key-3'
      }
    };

    const response = await fetch(`${supabaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should return 400 when subscription data is invalid', async () => {
    const invalidSubscription = {
      endpoint: '',
      keys: {}
    };

    const response = await fetch(`${supabaseUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${accessToken}`
      },
      body: JSON.stringify(invalidSubscription)
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});

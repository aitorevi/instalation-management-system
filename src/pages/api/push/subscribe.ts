import type { APIRoute } from 'astro';
import { getSupabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const client = getSupabaseClient(cookies);

    const {
      data: { user },
      error: authError
    } = await client.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription data. Required: endpoint, keys.p256dh, keys.auth'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { error: upsertError } = await client.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      {
        onConflict: 'user_id,endpoint'
      }
    );

    if (upsertError) {
      console.error('Error saving push subscription:', upsertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to save subscription',
          details: upsertError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

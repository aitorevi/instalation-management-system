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
    const { endpoint } = body;

    if (!endpoint) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request. Required: endpoint'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { error: deleteError } = await client
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    if (deleteError) {
      console.error('Error deleting push subscription:', deleteError);
      return new Response(
        JSON.stringify({
          error: 'Failed to delete subscription',
          details: deleteError.message
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
    console.error('Error in unsubscribe endpoint:', error);
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

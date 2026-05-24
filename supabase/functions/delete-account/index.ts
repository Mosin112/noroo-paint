// Supabase Edge Function — DELETE the calling user's auth.users row.
//
// Apple App Store requires any signup-capable app to offer in-app account
// deletion. Supabase exposes admin.deleteUser() only via the service-role key
// which can never ship in the mobile app, so the call lives here behind the
// authenticated user's JWT.
//
// FK ON DELETE CASCADE in db/schema.sql wipes profiles / addresses /
// saved_colours / orders / order_items as a side effect of removing the auth.users
// row, so nothing user-scoped survives.
//
// Deploy with the Supabase CLI:
//   supabase functions deploy delete-account --project-ref <your-ref>
//
// Required function-scoped secrets (Project Settings → Edge Functions → Secrets):
//   SUPABASE_URL              — your project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role key (NEVER ship to client)
//
// Both are populated by default for Edge Functions, but verify they exist
// in the dashboard before relying on deploys.

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_METHODS = 'POST, OPTIONS';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': ALLOWED_METHODS,
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json(405, { error: `Method not allowed. Use ${ALLOWED_METHODS}.` });
  }

  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return json(401, { error: 'Missing bearer token.' });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json(500, { error: 'Edge function not configured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secrets.' });
  }

  // 1) Resolve the caller's user id by validating their JWT against the same project.
  const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: getUserErr } = await userClient.auth.getUser();
  if (getUserErr || !user) {
    return json(401, { error: 'Invalid or expired session.' });
  }

  // 2) Delete the auth.users row using the service-role admin client. FK
  //    cascades to profile / addresses / saved_colours / orders / order_items.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) {
    return json(500, { error: `Failed to delete user: ${delErr.message}` });
  }

  return json(200, { ok: true, user_id: user.id });
});

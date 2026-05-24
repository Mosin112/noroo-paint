// API client — wires every PRD §11 endpoint to either Supabase (when configured)
// or local seed data (offline dev mode). The switch is driven by whether the
// Supabase env vars are set.
//
// PRD §2 specifies a NestJS service in the middle; for MVP we hit Supabase
// directly (RLS handles access control, Supabase Auth handles OTP). If a
// NestJS layer is added later, swap the Supabase calls below for axios.

import { supabase, SUPABASE_CONFIGURED } from './supabase';
import { SEED_PRODUCTS, PERTH_METRO_POSTCODES } from '../data/seedProducts';
import type {
  Product,
  ProductCategory,
  PaintFinish,
  TinSize,
  TintingBase,
  ZoneCheck,
  SavedColour,
} from '../types/domain';

const USE_SEED = !SUPABASE_CONFIGURED;

// ────────────────────────────────────────────────────────────────────────
// Products (PRD §11)
// ────────────────────────────────────────────────────────────────────────

export type ProductFilters = {
  category?: ProductCategory;
  finish?: PaintFinish;
  tin_size?: TinSize;
  tinting_base?: TintingBase;
};

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (USE_SEED) {
    return SEED_PRODUCTS.filter((p) => {
      if (!p.is_active) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.finish && p.finish !== filters.finish) return false;
      if (filters.tin_size && p.tin_size !== filters.tin_size) return false;
      if (filters.tinting_base && p.tinting_base !== filters.tinting_base) return false;
      return true;
    });
  }
  let q = supabase!.from('products').select('*').eq('is_active', true);
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.finish) q = q.eq('finish', filters.finish);
  if (filters.tin_size) q = q.eq('tin_size', filters.tin_size);
  if (filters.tinting_base) q = q.eq('tinting_base', filters.tinting_base);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Product[];
}

// ────────────────────────────────────────────────────────────────────────
// Zone check (Perth metro postcodes — PRD §8.2)
// ────────────────────────────────────────────────────────────────────────

export async function checkZone(postcode: string): Promise<ZoneCheck> {
  // Postcode list is static and ships with the app; no need to round-trip.
  const inZone = PERTH_METRO_POSTCODES.has(postcode.trim());
  return { in_zone: inZone, label: inZone ? 'Perth metro' : null };
}

// ────────────────────────────────────────────────────────────────────────
// Saved colours (PRD §11)
// ────────────────────────────────────────────────────────────────────────

export async function listSavedColours(): Promise<SavedColour[]> {
  if (USE_SEED) return [];
  const { data, error } = await supabase!
    .from('saved_colours')
    .select('id, brand, colour_name, last_used_at')
    .order('last_used_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedColour[];
}

export async function upsertSavedColour(
  brand: string | null,
  colour_name: string
): Promise<SavedColour> {
  if (USE_SEED) {
    return {
      id: `local-${Date.now()}`,
      brand,
      colour_name,
      last_used_at: new Date().toISOString(),
    };
  }
  // We can't use Postgres ON CONFLICT here — the unique index is on
  // (user_id, lower(coalesce(brand,'')), lower(colour_name)) which is an
  // expression index and incompatible with PostgREST's onConflict clause.
  // Do a manual check-then-update-or-insert with RLS doing the user-scoping.
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('Sign in required to save colours.');

  const brandNorm = (brand ?? '').trim().toLowerCase();
  const nameNorm = colour_name.trim().toLowerCase();
  const now = new Date().toISOString();

  const { data: existing, error: findErr } = await supabase!
    .from('saved_colours')
    .select('id, brand, colour_name, last_used_at')
    // ilike is case-insensitive; '' coalesce handles a NULL brand
    .ilike('colour_name', nameNorm)
    .or(`brand.is.null,brand.ilike.${brandNorm || '%'}`)
    .limit(20);
  if (findErr) throw findErr;

  // Verify the match against normalised forms (the OR above is wider than needed).
  const match = (existing ?? []).find(
    (r) =>
      (r.brand ?? '').trim().toLowerCase() === brandNorm &&
      r.colour_name.trim().toLowerCase() === nameNorm
  );

  if (match) {
    const { data, error } = await supabase!
      .from('saved_colours')
      .update({ last_used_at: now })
      .eq('id', match.id)
      .select()
      .single();
    if (error) throw error;
    return data as SavedColour;
  }

  const { data, error } = await supabase!
    .from('saved_colours')
    .insert({ user_id: user.id, brand, colour_name, last_used_at: now })
    .select()
    .single();
  if (error) throw error;
  return data as SavedColour;
}

export async function deleteSavedColour(id: string): Promise<void> {
  if (USE_SEED) return;
  const { error } = await supabase!.from('saved_colours').delete().eq('id', id);
  if (error) throw error;
}

// ────────────────────────────────────────────────────────────────────────
// Profile (name + phone) — PRD §10
// ────────────────────────────────────────────────────────────────────────

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  if (USE_SEED) return null;
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase!
    .from('profiles')
    .select('id, email, full_name, phone')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(patch: { full_name?: string; phone?: string }): Promise<Profile> {
  if (USE_SEED) {
    return { id: 'seed', email: null, full_name: patch.full_name ?? null, phone: patch.phone ?? null };
  }
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('Sign in required.');
  const { data, error } = await supabase!
    .from('profiles')
    .update(patch)
    .eq('id', user.id)
    .select('id, email, full_name, phone')
    .single();
  if (error) throw error;
  return data as Profile;
}

// ────────────────────────────────────────────────────────────────────────
// Addresses (PRD §11) — one default per user for MVP
// ────────────────────────────────────────────────────────────────────────

export type Address = {
  id: string;
  user_id: string;
  line1: string;
  suburb: string | null;
  postcode: string;
  state: string | null;
  country: string | null;
  is_default: boolean;
};

export async function getDefaultAddress(): Promise<Address | null> {
  if (USE_SEED) return null;
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase!
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Address | null;
}

export async function upsertDefaultAddress(input: {
  line1: string;
  suburb?: string;
  postcode: string;
}): Promise<Address> {
  if (USE_SEED) {
    return {
      id: 'seed', user_id: 'seed',
      line1: input.line1, suburb: input.suburb ?? null,
      postcode: input.postcode, state: 'WA', country: 'AU', is_default: true,
    };
  }
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('Sign in required.');

  // Find any existing default; otherwise insert a new row.
  const existing = await getDefaultAddress();
  if (existing) {
    const { data, error } = await supabase!
      .from('addresses')
      .update({ line1: input.line1, suburb: input.suburb ?? null, postcode: input.postcode })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as Address;
  }
  const { data, error } = await supabase!
    .from('addresses')
    .insert({
      user_id: user.id,
      line1: input.line1,
      suburb: input.suburb ?? null,
      postcode: input.postcode,
      is_default: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Address;
}

// ────────────────────────────────────────────────────────────────────────
// Orders (PRD §11.1)
// ────────────────────────────────────────────────────────────────────────

export type OrderRequest = {
  guest_email?: string;
  customer_name: string;
  customer_phone: string;
  delivery: { line1: string; suburb?: string; postcode: string };
  notes?: string;
  items: {
    product_id: string;
    brand: string | null;
    colour_name: string | null;
    quantity: number;
  }[];
};

export type OrderResponse = {
  id: string;
  order_number: string;
};

export async function postOrder(req: OrderRequest): Promise<OrderResponse> {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const orderPrefix = `${mm}${dd}`;

  if (USE_SEED) {
    return { id: `mock-${Date.now()}`, order_number: `${orderPrefix}-A` };
  }

  // Fetch product prices so we never trust client-side totals (PRD §11.1).
  const productIds = req.items.map((i) => i.product_id);
  const { data: products, error: pErr } = await supabase!
    .from('products')
    .select('id, name, tin_size, finish, price_aud')
    .in('id', productIds);
  if (pErr) throw pErr;

  const productById = new Map((products ?? []).map((p) => [p.id, p]));
  let subtotal = 0;
  for (const it of req.items) {
    const p = productById.get(it.product_id);
    if (!p) throw new Error(`Unknown product ${it.product_id}`);
    subtotal += Number(p.price_aud) * it.quantity;
  }
  const inZone = PERTH_METRO_POSTCODES.has(req.delivery.postcode.trim());
  if (!inZone) throw new Error('Delivery postcode is outside the Perth-metro zone.');
  const delivery = subtotal >= 400 ? 0 : 25;
  const gst = (subtotal + delivery) * 0.10;
  const total = subtotal + delivery + gst;

  // Next-letter suffix for today's orders (A, B, …, Z, AA, AB, …).
  const { data: todays, error: cErr } = await supabase!
    .from('orders')
    .select('order_number')
    .like('order_number', `${orderPrefix}-%`);
  if (cErr) throw cErr;
  const order_number = `${orderPrefix}-${nextSuffix(todays?.length ?? 0)}`;

  const { data: { user } } = await supabase!.auth.getUser();
  const { data: order, error: oErr } = await supabase!
    .from('orders')
    .insert({
      order_number,
      user_id: user?.id ?? null,
      guest_email: user ? null : (req.guest_email ?? null),
      customer_name: req.customer_name,
      customer_phone: req.customer_phone,
      delivery_address_line1: req.delivery.line1,
      delivery_postcode: req.delivery.postcode,
      delivery_suburb: req.delivery.suburb,
      subtotal_aud: subtotal,
      delivery_aud: delivery,
      gst_aud: gst,
      total_aud: total,
      notes: req.notes,
    })
    .select('id, order_number')
    .single();
  if (oErr) throw oErr;

  // Insert each line item with a snapshot of name/tin/finish so we still
  // render correctly if the product is later edited or removed.
  const items = req.items.map((it) => {
    const p = productById.get(it.product_id)!;
    return {
      order_id: order.id,
      product_id: it.product_id,
      product_name_snapshot: p.name,
      tin_size_snapshot: p.tin_size,
      finish_snapshot: p.finish,
      brand: it.brand,
      colour_name: it.colour_name,
      quantity: it.quantity,
      unit_price_aud: p.price_aud,
      line_total_aud: Number(p.price_aud) * it.quantity,
    };
  });
  const { error: iErr } = await supabase!.from('order_items').insert(items);
  if (iErr) throw iErr;

  return { id: order.id, order_number: order.order_number };
}

function nextSuffix(count: number): string {
  // A..Z then AA..AZ, BA..BZ, ... — base-26 with no zero digit.
  let n = count;
  let out = '';
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Waitlist (out-of-zone) — PRD §8.3
// ────────────────────────────────────────────────────────────────────────

export async function joinWaitlist(email: string, postcode: string): Promise<void> {
  if (USE_SEED) return;
  const { error } = await supabase!.from('waitlist').insert({ email, postcode });
  if (error) throw error;
}

// ────────────────────────────────────────────────────────────────────────
// Auth — passwordless OTP via Supabase (PRD §5)
// ────────────────────────────────────────────────────────────────────────

export async function requestOtp(email: string): Promise<void> {
  if (USE_SEED) return;
  const { error } = await supabase!.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export type VerifyResult = { userId: string | null; email: string | null };

export async function verifyOtp(email: string, code: string): Promise<VerifyResult> {
  if (USE_SEED) {
    if (!/^\d{6}$/.test(code)) {
      throw new Error("That code didn't match — try again");
    }
    return { userId: null, email };
  }
  const { data, error } = await supabase!.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });
  if (error) {
    // Surface Supabase's message verbatim — it differentiates expired vs.
    // mistyped tokens. PRD §5.3 says "That code didn't match — try again".
    throw new Error("That code didn't match — try again");
  }
  return { userId: data.user?.id ?? null, email: data.user?.email ?? email };
}

export async function signOutRemote(): Promise<void> {
  if (USE_SEED) return;
  await supabase!.auth.signOut();
}

// Returns the current session's user (if any) without forcing a network call.
export async function getCurrentUser(): Promise<{ id: string; email: string | null } | null> {
  if (USE_SEED) return null;
  const { data } = await supabase!.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
}

// Calls the delete-account Edge Function which verifies the caller's JWT and
// then uses the service-role key to remove the auth.users row. FK ON DELETE
// CASCADE in schema.sql wipes profile / addresses / saved_colours / orders.
// Apple App Store requires this; see supabase/functions/delete-account/.
export async function deleteAccount(): Promise<void> {
  if (USE_SEED) return;
  const { error } = await supabase!.functions.invoke('delete-account');
  if (error) throw error;
  await supabase!.auth.signOut();
}

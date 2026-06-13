// Supabase Edge Function — sends an order-confirmation email via Resend
// every time a customer places an order. Called by CheckoutScreen after
// postOrder() succeeds.
//
// Why server-side: the Resend API key must never ship in the mobile bundle.
// We also don't want the recipient address (ORDER_NOTIFICATION_EMAIL) to be
// editable by a tampered client — keep it as a function secret so an admin
// updates it via `supabase secrets set` without an app rebuild.
//
// Deploy:
//   supabase functions deploy send-order-email --project-ref <your-ref>
//   supabase secrets set RESEND_API_KEY=re_xxx \
//                        ORDER_NOTIFICATION_EMAIL=mohsin.hafeezit@gmail.com \
//                        ORDER_FROM_EMAIL='Paint Express <orders@axepayments.co>'

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

type Item = {
  name: string;
  tin_size?: string | null;
  finish?: string | null;
  brand?: string | null;
  colour_name?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Payload = {
  orderNumber: string;
  mode: 'delivery' | 'pickup';
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address?: { line1: string; line2?: string; suburb: string; postcode: string };
  pickupName?: string;
  pickupAddress?: string;
  pickupHours?: string;
  notes?: string;
  items: Item[];
  subtotal: number;
  delivery: number;
  gst: number;
  total: number;
};

// ─────────────────────────────────────────────────────────────────────────
// HTML / plain-text templates — minimal but readable. Mirror the v2.3
// Confirmed-screen layout: Order Details (deliver-to OR pick-up-from) then
// Order Summary with per-line item + totals.
// ─────────────────────────────────────────────────────────────────────────

function money(n: number): string {
  return '$' + (Math.round(n * 100) / 100).toFixed(2);
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml(p: Payload): string {
  const detail = p.mode === 'pickup'
    ? `
      <p style="margin:0;font-size:11px;color:#5c6a85;text-transform:uppercase;letter-spacing:.1em;font-weight:700">Pick up from</p>
      <p style="margin:6px 0 2px;font-size:15px;font-weight:700;color:#16233d">${escape(p.pickupName ?? '')}</p>
      <p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.pickupAddress ?? '')}</p>
      <p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.pickupHours ?? '')}</p>
      <p style="margin:10px 0 0;font-size:13px;color:#3a4a66">${escape(p.customerName)} · ${escape(p.customerPhone)}</p>
      ${p.customerEmail ? `<p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.customerEmail)}</p>` : ''}
    `
    : `
      <p style="margin:0;font-size:11px;color:#5c6a85;text-transform:uppercase;letter-spacing:.1em;font-weight:700">Deliver to</p>
      <p style="margin:6px 0 2px;font-size:15px;font-weight:700;color:#16233d">${escape(p.customerName)}</p>
      ${p.address?.line1 ? `<p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.address.line1)}</p>` : ''}
      ${p.address?.line2 ? `<p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.address.line2)}</p>` : ''}
      ${p.address?.suburb || p.address?.postcode
        ? `<p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(`${p.address?.suburb ?? ''} ${p.address?.postcode ?? ''}`.trim())}</p>`
        : ''}
      <p style="margin:10px 0 0;font-size:13px;color:#3a4a66">${escape(p.customerPhone)}</p>
      ${p.customerEmail ? `<p style="margin:2px 0;font-size:13px;color:#3a4a66">${escape(p.customerEmail)}</p>` : ''}
    `;

  const itemsRows = p.items.map((it) => {
    const colourBit = it.colour_name
      ? `${it.brand ? escape(it.brand) + ' ' : ''}${escape(it.colour_name)}`
      : null;
    const sub = colourBit ? `× ${it.quantity} · ${colourBit}` : `× ${it.quantity}`;
    const sizeBit = it.tin_size ? ` ${escape(it.tin_size)}` : '';
    return `
      <tr>
        <td style="padding:8px 0;vertical-align:top">
          <div style="font-size:13px;font-weight:600;color:#16233d">${escape(it.name)}${sizeBit}</div>
          <div style="font-size:11px;color:#5c6a85;margin-top:2px">${sub}</div>
        </td>
        <td style="padding:8px 0;text-align:right;vertical-align:top;font-size:13px;font-weight:700;color:#16233d;white-space:nowrap">${money(it.lineTotal)}</td>
      </tr>
    `;
  }).join('');

  const deliveryRow = p.mode === 'pickup'
    ? `<tr><td style="padding:6px 0;font-size:12.5px;color:#5c6a85">Pickup</td><td style="padding:6px 0;text-align:right;font-size:12.5px;font-weight:700;color:#1b7a4b">Free</td></tr>`
    : `<tr><td style="padding:6px 0;font-size:12.5px;color:#5c6a85">Delivery</td><td style="padding:6px 0;text-align:right;font-size:12.5px;font-weight:700;color:${p.delivery === 0 ? '#1b7a4b' : '#16233d'}">${p.delivery === 0 ? 'Free' : money(p.delivery)}</td></tr>`;

  const notesBlock = p.notes
    ? `<div style="margin-top:14px;padding:12px 14px;background:#fff;border-radius:10px"><div style="font-size:10px;color:#5c6a85;text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:6px">Notes</div><div style="font-size:13px;color:#3a4a66">${escape(p.notes)}</div></div>`
    : '';

  return `<!doctype html>
<html><body style="margin:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#16233d">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;width:100%;background:#fff;border-radius:14px;overflow:hidden">
        <tr><td style="background:#1f365c;padding:18px 22px;color:#fff">
          <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">New order</div>
          <div style="font-size:22px;font-weight:700;margin-top:4px">#${escape(p.orderNumber)}</div>
        </td></tr>
        <tr><td style="padding:18px 22px">
          <div style="padding:12px 14px;background:#fff;border:1px solid #e1e7f0;border-radius:12px">${detail}</div>
          ${notesBlock}
          <div style="margin-top:18px;font-size:10px;color:#5c6a85;text-transform:uppercase;letter-spacing:.1em;font-weight:700">Order summary</div>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:6px">
            ${itemsRows}
            <tr><td colspan="2" style="border-top:1px solid #e1e7f0;padding-top:2px"></td></tr>
            ${deliveryRow}
            <tr><td style="padding:6px 0;font-size:12.5px;color:#5c6a85">GST (10%)</td><td style="padding:6px 0;text-align:right;font-size:12.5px;font-weight:700;color:#16233d">${money(p.gst)}</td></tr>
            <tr><td colspan="2" style="border-top:1px solid #e1e7f0;padding-top:2px"></td></tr>
            <tr><td style="padding:10px 0;font-size:14px;font-weight:700;color:#16233d">Total</td><td style="padding:10px 0;text-align:right;font-size:16px;font-weight:700;color:#16233d">${money(p.total)}</td></tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;color:#c0341b;font-style:italic">No refunds on tinted product. All custom-tinted tins are final sale.</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#5c6a85">Paint Express · Noroo Paint</p>
    </td></tr>
  </table>
</body></html>`;
}

function buildText(p: Payload): string {
  const lines: string[] = [];
  lines.push(`Order #${p.orderNumber}`);
  lines.push('');
  if (p.mode === 'pickup') {
    lines.push('PICK UP FROM');
    lines.push(`  ${p.pickupName ?? ''}`);
    if (p.pickupAddress) lines.push(`  ${p.pickupAddress}`);
    if (p.pickupHours) lines.push(`  ${p.pickupHours}`);
  } else {
    lines.push('DELIVER TO');
    lines.push(`  ${p.customerName}`);
    if (p.address?.line1) lines.push(`  ${p.address.line1}`);
    if (p.address?.line2) lines.push(`  ${p.address.line2}`);
    if (p.address?.suburb || p.address?.postcode) {
      lines.push(`  ${(p.address.suburb ?? '')} ${(p.address.postcode ?? '')}`.trim());
    }
  }
  lines.push('');
  lines.push(`Customer: ${p.customerName} · ${p.customerPhone}`);
  if (p.customerEmail) lines.push(`Email: ${p.customerEmail}`);
  if (p.notes) { lines.push(''); lines.push(`Notes: ${p.notes}`); }
  lines.push('');
  lines.push('ITEMS');
  for (const it of p.items) {
    const colourBit = it.colour_name ? `${it.brand ? it.brand + ' ' : ''}${it.colour_name}` : '';
    const sub = colourBit ? `× ${it.quantity} · ${colourBit}` : `× ${it.quantity}`;
    lines.push(`  ${it.name}${it.tin_size ? ' ' + it.tin_size : ''} — ${sub} — ${money(it.lineTotal)}`);
  }
  lines.push('');
  lines.push(p.mode === 'pickup' ? `Pickup: Free` : `Delivery: ${p.delivery === 0 ? 'Free' : money(p.delivery)}`);
  lines.push(`GST (10%): ${money(p.gst)}`);
  lines.push(`Total: ${money(p.total)}`);
  lines.push('');
  lines.push('Paint Express · Noroo Paint');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────
// Edge Function entrypoint
// ─────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });

  // Auth — the Supabase gateway already requires a valid JWT for any
  // function call when authentication is enabled. We accept guest/anon
  // callers here so guest checkouts still trigger the email.
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  const TO_EMAIL = Deno.env.get('ORDER_NOTIFICATION_EMAIL');
  const FROM = Deno.env.get('ORDER_FROM_EMAIL') ?? 'Paint Express <orders@axepayments.co>';

  if (!RESEND_API_KEY) return json(500, { error: 'Server missing RESEND_API_KEY.' });
  if (!TO_EMAIL) return json(500, { error: 'Server missing ORDER_NOTIFICATION_EMAIL.' });

  // Resolve caller for logging / abuse tracking. Errors here are non-fatal.
  if (SUPABASE_URL && SERVICE_ROLE) {
    const auth = req.headers.get('Authorization') ?? '';
    if (auth.toLowerCase().startsWith('bearer ')) {
      const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
        global: { headers: { Authorization: auth } },
        auth: { persistSession: false },
      });
      await userClient.auth.getUser().catch(() => undefined);
    }
  }

  let body: Payload;
  try { body = await req.json(); }
  catch { return json(400, { error: 'Invalid JSON body.' }); }

  if (!body || !body.orderNumber || !body.items || body.items.length === 0) {
    return json(400, { error: 'Missing required order fields.' });
  }

  const subject = `New order #${body.orderNumber} · ${money(body.total)}`;
  const html = buildHtml(body);
  const textBody = buildText(body);

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: body.customerEmail ?? undefined,
      subject,
      html,
      text: textBody,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    return json(502, { error: `Resend rejected the email: ${resendRes.status}`, detail: errBody.slice(0, 500) });
  }

  return json(200, { ok: true });
});

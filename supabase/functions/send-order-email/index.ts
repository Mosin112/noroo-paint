// Supabase Edge Function — sends order-confirmation emails via Resend
// every time a customer places an order. Called by CheckoutScreen after
// postOrder() succeeds.
//
// Two emails per order:
//   - Fulfilment team (ORDER_NOTIFICATION_EMAIL secret) — heads-up that
//     a new order needs picking & dispatching.
//   - Customer (payload.customerEmail) — branded receipt with the same
//     summary, personalised greeting. Skipped if the customer didn't
//     leave an email (guest checkout where they opted not to provide one).
//
// Why server-side: the Resend API key must never ship in the mobile bundle.
// The recipient address (ORDER_NOTIFICATION_EMAIL) is a function secret so
// an admin updates it via `supabase secrets set` without an app rebuild.
//
// Deploy:
//   supabase functions deploy send-order-email --project-ref <your-ref>
//   supabase secrets set RESEND_API_KEY=re_xxx \
//                        ORDER_NOTIFICATION_EMAIL=team@example.com \
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

type Kind = 'customer' | 'fulfilment';

// ─────────────────────────────────────────────────────────────────────────
// Helpers
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

function firstName(full: string): string {
  const t = (full ?? '').trim();
  if (!t) return 'there';
  return t.split(/\s+/)[0];
}

// ─────────────────────────────────────────────────────────────────────────
// HTML template — single branded layout, headline + greeting flex per
// recipient kind. Finish lands inline between product name and tin size,
// e.g. "Noroo Norutone Premium Interior Paint — Matt 1L".
// ─────────────────────────────────────────────────────────────────────────

function buildHtml(p: Payload, kind: Kind): string {
  const itemsRows = p.items.map((it) => {
    const colourBit = it.colour_name
      ? `${it.brand ? escape(it.brand) + ' ' : ''}${escape(it.colour_name)}`
      : null;
    const subRight = colourBit ? `&times; ${it.quantity} &middot; ${colourBit}` : `&times; ${it.quantity}`;
    const finishBit = it.finish ? ` &mdash; ${escape(it.finish)}` : '';
    const sizeBit = it.tin_size ? ` ${escape(it.tin_size)}` : '';
    return `
      <tr><td style="padding:14px 16px; border-bottom:1px solid #f0f3f9;">
        <table role="presentation" width="100%"><tr>
          <td style="font-size:14px; font-weight:600; color:#16233d;">${escape(it.name)}${finishBit}${sizeBit}<div style="font-size:12px; font-weight:400; color:#6a7892; margin-top:2px;">${subRight}</div></td>
          <td align="right" style="font-size:14px; font-weight:700; color:#16233d; white-space:nowrap;">${money(it.lineTotal)}</td>
        </tr></table>
      </td></tr>`;
  }).join('');

  const deliveryRow = p.mode === 'pickup'
    ? `<tr><td style="padding:3px 0;">Pickup</td><td align="right" style="color:#1b7a4b; font-weight:700;">Free</td></tr>`
    : `<tr><td style="padding:3px 0;">Delivery</td><td align="right" style="color:${p.delivery === 0 ? '#1b7a4b' : '#16233d'}; font-weight:700;">${p.delivery === 0 ? 'Free' : money(p.delivery)}</td></tr>`;

  // Confirmation block flexes per recipient:
  //   - customer sees a personal greeting + reassurance
  //   - fulfilment team sees a brief "needs picking" cue
  const confirmation = kind === 'customer'
    ? `
      <div style="width:56px; height:56px; border-radius:50%; background:#1b7a4b; display:inline-block; line-height:56px; color:#fff; font-size:28px; box-shadow:0 0 0 8px #e7f4ee;">&#10003;</div>
      <h1 style="margin:16px 0 4px; font-size:22px; font-weight:800; color:#16233d;">Order received</h1>
      <p style="margin:0; font-size:14px; color:#5c6a85; line-height:1.5;">Thanks, ${escape(firstName(p.customerName))}. We&#39;ve got your order <strong style="color:#1f365c;">#${escape(p.orderNumber)}</strong>. Our team will be in touch shortly to confirm payment and dispatch.</p>`
    : `
      <div style="width:56px; height:56px; border-radius:50%; background:#1f365c; display:inline-block; line-height:56px; color:#fff; font-size:28px; box-shadow:0 0 0 8px #e7ecf6;">!</div>
      <h1 style="margin:16px 0 4px; font-size:22px; font-weight:800; color:#16233d;">New order received</h1>
      <p style="margin:0; font-size:14px; color:#5c6a85; line-height:1.5;">Order <strong style="color:#1f365c;">#${escape(p.orderNumber)}</strong> needs picking and dispatch. Customer details below.</p>`;

  // Deliver-to / Pick-up-from block.
  const deliveryBlock = p.mode === 'pickup'
    ? `
      <div style="font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6a7892; margin-bottom:8px;">Pick up from</div>
      <div style="border:1px solid #e7ebf3; border-radius:14px; padding:14px 16px;">
        <div style="font-size:14px; font-weight:700; color:#16233d;">${escape(p.pickupName ?? '')}</div>
        <div style="font-size:13px; color:#384663; margin-top:3px; line-height:1.5;">
          ${p.pickupAddress ? escape(p.pickupAddress) : ''}${p.pickupHours ? `<br>${escape(p.pickupHours)}` : ''}<br>${escape(p.customerName)} &middot; ${escape(p.customerPhone)}
        </div>
        <div style="display:inline-block; margin-top:10px; font-size:12px; font-weight:700; color:#1b7a4b; background:#e7f4ee; padding:6px 10px; border-radius:8px;">Ready when you are &middot; bring your order #</div>
      </div>`
    : `
      <div style="font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6a7892; margin-bottom:8px;">Deliver to</div>
      <div style="border:1px solid #e7ebf3; border-radius:14px; padding:14px 16px;">
        <div style="font-size:14px; font-weight:700; color:#16233d;">${escape(p.customerName)}</div>
        <div style="font-size:13px; color:#384663; margin-top:3px; line-height:1.5;">
          ${p.address?.line1 ? escape(p.address.line1) : ''}${p.address?.line2 ? `<br>${escape(p.address.line2)}` : ''}<br>${escape(`${p.address?.suburb ?? ''} ${p.address?.postcode ?? ''}`.trim())}<br>${escape(p.customerPhone)}
        </div>
        <div style="display:inline-block; margin-top:10px; font-size:12px; font-weight:700; color:#1b7a4b; background:#e7f4ee; padding:6px 10px; border-radius:8px;">Free within Perth Metro &middot; usually next business day</div>
      </div>`;

  const notesBlock = p.notes
    ? `<tr><td style="padding:8px 28px 4px;"><div style="background:#fff8e1; border:1px solid #f5e2a8; border-radius:12px; padding:11px 14px; font-size:12px; color:#3a4a66; line-height:1.5;"><strong style="color:#9a6a00;">Note from customer:</strong> ${escape(p.notes)}</div></td></tr>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>body{margin:0;background:#eef1f7;font-family:Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;}</style></head>
<body>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f7; margin:0; padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:#ffffff; border-radius:18px; box-shadow:0 8px 24px -10px rgba(20,30,60,.22); overflow:hidden;">

      <tr><td align="center" style="background:#1f365c; padding:26px 24px;">
        <div style="font-weight:800; font-size:22px; letter-spacing:.05em;"><span style="color:#ffffff;">PAINT</span> <span style="color:#ff5560;">EXPRESS</span></div>
        <div style="color:#aebbd3; font-size:13px; margin-top:6px;">Paint, delivered fast.</div>
      </td></tr>

      <tr><td style="padding:30px 28px 8px;" align="center">${confirmation}</td></tr>

      <tr><td style="padding:18px 28px 4px;">
        <div style="font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:#6a7892; margin-bottom:8px;">Order summary</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7ebf3; border-radius:14px; overflow:hidden;">
          ${itemsRows}
          <tr><td style="padding:10px 16px;">
            <table role="presentation" width="100%" style="font-size:13px; color:#384663;">
              ${deliveryRow}
              <tr><td style="padding:3px 0;">GST (10%)</td><td align="right" style="font-weight:600;">${money(p.gst)}</td></tr>
              <tr><td style="padding:9px 0 0; border-top:1px solid #e7ebf3; font-weight:800; color:#16233d;">Total</td><td align="right" style="padding:9px 0 0; border-top:1px solid #e7ebf3; font-weight:800; font-size:16px; color:#16233d;">${money(p.total)}</td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:16px 28px 4px;">${deliveryBlock}</td></tr>

      ${notesBlock}

      <tr><td style="padding:16px 28px 4px;">
        <div style="background:#fdecec; border:1px solid #f6cccc; border-radius:12px; padding:11px 14px; font-size:12px; color:#3a4a66; line-height:1.5;"><strong style="color:#e5141b;">No refunds on tinted product.</strong> All custom-tinted tins are final sale.</div>
      </td></tr>

      <tr><td style="border-top:1px solid #f0f3f9; padding:18px 28px; text-align:center;">
        <div style="font-size:11px; color:#6a7892; letter-spacing:.1em; text-transform:uppercase; font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;">Paint Express &middot; Noroo</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildText(p: Payload, kind: Kind): string {
  const lines: string[] = [];
  if (kind === 'customer') {
    lines.push(`Order received — #${p.orderNumber}`);
    lines.push('');
    lines.push(`Thanks, ${firstName(p.customerName)}. We've got your order. Our team will be in touch shortly to confirm payment and dispatch.`);
  } else {
    lines.push(`New order — #${p.orderNumber}`);
    lines.push('');
    lines.push('This order needs picking and dispatch. Customer details below.');
  }
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
    const finishBit = it.finish ? ` — ${it.finish}` : '';
    const sizeBit = it.tin_size ? ` ${it.tin_size}` : '';
    lines.push(`  ${it.name}${finishBit}${sizeBit} — ${sub} — ${money(it.lineTotal)}`);
  }
  lines.push('');
  lines.push(p.mode === 'pickup' ? `Pickup: Free` : `Delivery: ${p.delivery === 0 ? 'Free' : money(p.delivery)}`);
  lines.push(`GST (10%): ${money(p.gst)}`);
  lines.push(`Total: ${money(p.total)}`);
  lines.push('');
  lines.push('No refunds on tinted product. All custom-tinted tins are final sale.');
  lines.push('Paint Express · Noroo');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────
// Edge Function entrypoint
// ─────────────────────────────────────────────────────────────────────────

async function sendOne(opts: {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; status: number; detail: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from,
      to: opts.to,
      reply_to: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });
  if (res.ok) return { ok: true };
  return { ok: false, status: res.status, detail: (await res.text()).slice(0, 500) };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });

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

  // Fulfilment email — always sent.
  const fulfilmentSubject = `New order #${body.orderNumber} · ${money(body.total)}`;
  const fulfilmentRes = await sendOne({
    apiKey: RESEND_API_KEY,
    from: FROM,
    to: TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
    replyTo: body.customerEmail ?? undefined,
    subject: fulfilmentSubject,
    html: buildHtml(body, 'fulfilment'),
    text: buildText(body, 'fulfilment'),
  });

  // Customer email — only when the order actually carries an address we
  // can write to. Guests who didn't leave an email simply don't receive
  // one; the order still goes through.
  let customerRes: Awaited<ReturnType<typeof sendOne>> | { ok: true; skipped: true } = { ok: true, skipped: true };
  if (body.customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail)) {
    const customerSubject = `Order received — Paint Express #${body.orderNumber}`;
    customerRes = await sendOne({
      apiKey: RESEND_API_KEY,
      from: FROM,
      to: [body.customerEmail],
      subject: customerSubject,
      html: buildHtml(body, 'customer'),
      text: buildText(body, 'customer'),
    });
  }

  // Fail loudly only if the fulfilment email failed. A failed customer
  // copy is a soft fail — surfaced in the response so the caller can log
  // it but doesn't block the order.
  if (!fulfilmentRes.ok) {
    return json(502, { error: `Resend rejected the fulfilment email: ${fulfilmentRes.status}`, detail: fulfilmentRes.detail });
  }

  return json(200, {
    ok: true,
    fulfilment: 'sent',
    customer: 'skipped' in customerRes
      ? 'skipped'
      : customerRes.ok ? 'sent' : `failed:${customerRes.status}`,
  });
});

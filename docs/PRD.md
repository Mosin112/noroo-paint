# Product Requirements Document
## 1. Product Summary
Noroo Paint is a mobile-first, direct-to-consumer paint ordering app for the Perth metropolitan market, available on Android. Customers browse the Noroo paint catalogue, filter to the product that fits their job, specify the exact colour they want tinted, and place a delivery order. The MVP captures orders and emails the fulfilment team — no online payment, no inventory tracking, no admin panel. Phase 2 will add Stripe payments and an admin dashboard.

Target user. Two personas:

- Marcus the tradie — paints houses for a living, reorders the same products and colours repeatedly, needs the order placed in under 90 seconds while standing on a job site.
- First-time DIYer — painting one room, doesn't have an account, wants to check out as a guest without registering.

Success criteria for the MVP build.

- A customer in Perth can complete an order in under three minutes from cold open to confirmation.
- The order arrives in the fulfilment inbox and the database within 10 seconds of being placed.
- The app passes Apple and Google store review on first submission.
- The codebase is a single React Native project that builds iOS and Android bundles from one source tree.

## 2. Tech Stack (Non-Negotiable)
| Layer | Choice | Notes |
| Mobile | React Native (Expo, managed workflow) | Single codebase for iOS + Android. Use Expo EAS for builds and OTA updates. |
| Language | TypeScript | Strict mode on. |
| Navigation | React Navigation v6 | Native stack navigator for the order flow; bottom tab navigator for Catalogue / Basket / Account. |
| State | Zustand for global state (basket, auth, saved colours), React Query for server state | Keep it lean — no Redux. |
| Backend | Node.js + NestJS REST API on Railway | Lightweight; the proposal lists Express or NestJS — pick NestJS for structure. |
| Database | PostgreSQL via Supabase | Relational schema in §10. |
| Auth | Supabase Auth with passwordless OTP (email magic-link or 6-digit code) | See §5. |
| Email | AWS SES for transactional email (the proposal lists SendGrid/Resend as alternates; SES is in the separately-billed cost line, so default to SES) | Templates in §11. |
| File storage | Supabase Storage | Paint product images and accessory images. |
| Form validation | react-hook-form + zod |  |
| Analytics | Defer to Phase 2. No analytics SDK in MVP. |  |

The agency owns delivery; the customer (Noroo / Andrew) owns the codebase from day one.

## 3. Design System (Verbatim from Prototype)
Every value in this section is a direct lift from Paint Delivery Prototype.html. Do not reinterpret these — use them exactly.
### 3.1 Color tokens (CSS custom property names preserved)
| Token | Value | Purpose |
| --bg | #f6f3ec | App background (warm cream) |
| --paper | #fbf9f4 | Card / panel background |
| --ink | #1c1b18 | Primary text |
| --ink2 | #3a3833 | Secondary text |
| --muted | #7a766d | Tertiary / label text |
| --rule | #dcd6c8 | Borders, dividers |
| --rule2 | #efeadb | Subtle dividers (between list rows) |
| --accent | oklch(0.62 0.15 35) (≈ warm terracotta) | Primary CTA, selected state, required-field highlight, links |
| --good | #3a6b3e | Success state (delivery zone OK, order paid, free delivery) |
| --warn | #8b4a1a | Warning copy (e.g. "no refunds on tinted product") |
| Field border (resting) | #e3ddcc |  |
| Field border (hover) | #b8b09a |  |
| Selected tile background | #fdf3ec | Accent-tinted background when a tile is selected |
| Alert background | #fdf3ec |  |
| Alert border | #f1d9c8 |  |
| Pill (success) bg | #eef3ee |  |
| Pill (warn) bg | #fbeede |  |
| Quantity button bg | #f7f3e9 |  |
| Quantity button text | #6a665b |  |

### 3.2 Typography
Primary font stack. "Helvetica Neue", Helvetica, Arial, sans-serif — system-safe sans-serif, same on iOS and Android. Apply -webkit-font-smoothing: antialiased equivalent via style={{ fontFamily: 'Helvetica Neue', ... }} on RN; on Android fall back to Helvetica → Arial → system.

Monospace stack (used for small UPPERCASE labels and uppercase nav metadata). ui-monospace, Menlo, Consolas, monospace.

| Style | Size | Weight | Letter-spacing | Color | Used for |
| Screen H1 | 24px | 600 | -0.01em | --ink | Top of each screen ("Where's the paint going?", "Almost done") |
| Sub heading | 12.5px | 400 | normal | --muted | One-line explainer under H1 |
| Nav title | 14px | 600 | normal | --ink | Centre of top nav |
| Field label (lbl) | 9.5px | 400 | 0.1em | --muted (or --accent if required) | TINY UPPERCASE labels above inputs |
| Field value (val) | 14px | 600 | normal | --ink | Input text and selected values |
| Tile label (em) | 11px | 400 | 0.1em UPPERCASE | --muted | "WHERE" small caption on tiles |
| Tile title (t) | 15px | 600 | normal | --ink | "Indoor walls", "Outdoor walls" etc. |
| Chip | 12px | 400 | normal | --ink2 (or white on selected) | Finish chips, saved colour chips |
| Row title | 13px | 600 | normal | --ink | Product row primary line |
| Row subtitle | 11px | 400 | normal | --muted | Product row secondary line |
| Price | 13px | 600 | normal | --ink | Right-aligned price on product rows |
| CTA | 14px | 600 | normal | #fff (or accent on ghost) | Primary action button |
| Summary line | 13px | 400 (key) / 600 (value) | normal | --muted / --ink | Order summary key/value pairs |
| Alert body | 12px | 400 | normal | --ink2 | Info/warning callouts |
| Small note (warn) | 10.5px | 400 italic | normal | --warn | "No refunds on tinted product" |
| Status bar clock | 12px | 600 | normal | --ink | Top status row |
| Footer link | 12px | 400 underline | normal | --accent | "Continue as guest →", "‹ Back to checkout" |
| Progress bar | 3px tall, 2px radius | n/a | n/a | --rule2 resting, --accent filled | Top-of-screen step indicator |

### 3.3 Spacing, radii, shadows
| Property | Value |
| Phone screen padding (body) | 0 18px |
| Section margin (H1, sub) | 0 22px |
| Field padding | 10px 14px |
| Field border-radius | 10px |
| Tile padding | 18px 14px |
| Tile border-radius | 12px |
| Chip padding | 6px 12px |
| Chip border-radius | 99px (pill) |
| CTA padding | 14px |
| CTA border-radius | 12px |
| CTA margin | 14px 18px 18px (top, sides, bottom) |
| Summary card padding | 10px 14px |
| Summary card border-radius | 10px |
| Alert padding | 12px 14px |
| Alert border-radius | 10px |
| Progress bar gap | 4px |
| Status bar padding | 14px 26px 6px |
| Top nav padding | 8px 18px |
| Field margin-bottom | 8px |
| Field border (resting) | 1px solid #e3ddcc |
| Field border (required) | 1px solid --accent |
| Quantity control border-radius | 8px |

No drop shadows on in-screen elements. The only shadow is on the phone shell itself (off-screen in production).
### 3.4 Iconography
The prototype uses Unicode glyphs (‹ for back, ✓ for the green success check). For the production app, use Lucide icons (lucide-react-native):

- Back nav: ChevronLeft
- Menu/overflow: MoreVertical
- Success check: Check rendered inside a 64px round --good background
- Plus / minus on quantity stepper: Plus, Minus
- Trash for basket-item delete: Trash2
### 3.5 App icon and splash
App icon background: --ink (#1c1b18). Mark: a stylised paint-tin silhouette in --accent, or the Noroo wordmark in --bg (#f6f3ec). Splash: --bg background, brand mark centred, no animation. SparkX delivers both at Phase 1 sign-off.

## 4. Information Architecture & Navigation
The app uses a single linear order flow in MVP (auth → where → finish & product → colour → checkout → confirmation), augmented by three persistent areas reachable from a bottom tab bar after authentication:

Bottom Tab Bar (post-auth)
├── Shop        → starts/resumes the order flow
├── Basket      → list of items added (badge with count)
└── Account     → saved address, saved colours, order history, sign out

Order flow stack (5 progress segments matching the prototype's progress bar):

[1] Where ──▶ [2] Finish & Product ──▶ [3] Colour ──▶ [4] Pay ──▶ [5] Confirmed
│
└─▶ [4a] Out-of-zone (interstitial)

The Sign In screen sits before segment [1] and is bypassed by "Continue as guest".

react-navigation config:

- Root: Stack.Navigator
- Auth (Sign In) — modal presentation on cold start
- Main — Tab.Navigator with Shop, Basket, Account
- Inside Shop: nested Stack.Navigator with Where, Finish, Colour, Checkout, OutOfZone, Confirmed

Back-button behaviour mirrors the prototype: top-left ‹ returns to the previous step in the order stack (does not unwind further than Where). On Confirmed, the only action is Start another order which resets the basket and pops to Where.

## 5. Authentication (Proposal §2.1)
### 5.1 Behaviour
- Passwordless OTP. The user enters an email or mobile number. The backend sends a 6-digit code (email via SES, SMS via Twilio in Phase 2 — for MVP, email-only is acceptable; mobile field accepts the number but routes the OTP to a paired email if one exists, otherwise blocks with "Email is required for code delivery").
- Continue as guest. A footer link on the sign-in screen bypasses auth and creates an anonymous session. Guest sessions cannot save colours or addresses across reinstalls but persist locally for the install lifetime.
- Persistent sessions. Once a user verifies, the session refresh token is stored in secure storage (expo-secure-store). Re-opening the app keeps them signed in indefinitely until they sign out.
- Remembered data after first sign-in: delivery address, last order (for one-tap re-order in a future phase), and saved colours.
### 5.2 Sign In screen — spec
Lifted from prototype data-screen="signin".

┌─────────────────────────────────────┐
│ STATUS BAR  9:41           ●●● 100% │
├─────────────────────────────────────┤
│            Welcome                  │  ← nav title (no back, no menu)
├─────────────────────────────────────┤
│                                     │
│ Save your details                   │  ← H1 (24/600)
│ We'll remember your address,        │  ← sub (12.5/400 muted)
│ last order and saved colours.       │
│ Or continue as a guest.             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ EMAIL OR MOBILE *           │    │  ← required field
│  │ marcus@mccabe.com.au        │    │
│  └─────────────────────────────┘    │
│                                     │
│  We'll text or email you a 6-digit  │  ← 11.5px muted helper
│  code. No password to remember.     │
│                                     │
├─────────────────────────────────────┤
│      [ Send me a code ]             │  ← primary CTA, accent
│      Continue as guest →            │  ← footer link
└─────────────────────────────────────┘

Defaults & states.

- Email field pre-filled placeholder you@email.com. (Prototype seeds it with marcus@mccabe.com.au for demo — remove this in production.)
- "Send me a code" disabled until the field has a syntactically valid email or a 9–11 digit phone number.
- After tap: dispatch OTP request, navigate to a 6-digit code entry sheet (described in §5.3).
- "Continue as guest" → push state { userMode: 'guest' } and go to Where.
### 5.3 OTP entry screen (not in prototype — derived from proposal)
A modal sheet (not a full screen) that slides over the sign-in screen:

- Headline: Enter the 6-digit code
- Sub: We sent it to marcus@mccabe.com.au · Resend in 0:30
- Six character-boxes, auto-advance, paste-friendly.
- Resend link (disabled with countdown for 30s, then active).
- Primary CTA Verify is disabled until all six digits are filled.
- Use the same --accent, --rule, and field styling from §3.

On success → set auth token → navigate to Where. On failure → shake the code row (@keyframes shake from prototype's CSS, ported to RN as a withSequence Reanimated animation), show inline error That code didn't match — try again.

## 6. Product Catalogue & Filtering (Proposal §2.2)
### 6.1 What counts as a "product"
A product is a SKU at a specific tin size: e.g. "Trade Matt — 10L — $89" is one product. The same paint at 4L is a different product. Accessories (roller covers, frames, wall brushes, cutter brushes) are products too, in their own category with a different detail flow (§7.2).
### 6.2 Catalogue model
Every product has the following attributes (full schema in §10):

| Attribute | Type | Values |
| category | enum | Interior, Exterior, Ceilings, Trim, Undercoat, Premium All-in-One, Accessories |
| finish | enum (nullable for accessories) | Matt, Low Sheen, Semi Gloss, Gloss, Ultra Flat, Eggshell |
| tin_size | enum (nullable for accessories) | 1L, 4L, 10L |
| tinting_base | enum (nullable for accessories) | Tintable, White Base Only |
| name | string | e.g. "Trade Matt", "Value Matt", "9-inch Roller Cover" |
| price_aud | decimal | per-tin or per-unit |
| image_url | string | Supabase Storage path |
| swatch_hex | string | The colour shown in the small swatch on the product row when no real image is set. Prototype defaults to a rotating set: #e9e2cf, #f4ede0, #fafaf7, #fff, #d6c9a8, #fdf3ec, #3a4a55. |
| is_active | bool | Hides discontinued items |

### 6.3 Filters (all combinable, all clearable)
The prototype models filtering as a step-based wizard rather than a traditional filter bar — first pick Where (which maps to one or more category values), then pick Finish (sheen chip row), and the product list updates in place. The PRD extends this with two further filters required by the proposal:

| Filter | Surface | Default |
| Where → Category | Step 1 tiles (see §6.4) | none |
| Finish | Step 2 chip row (Matt default) | first available |
| Tin size | Secondary chip row below the finish chips, on the product list screen | All |
| Tinting base | Toggle: Tintable only / Include white-base | Tintable only |

A small Clear filters text link sits at the right of the chip row.
### 6.4 "Where" step — Category tiles (Step 1)
Lifted from prototype data-screen="where". Four tiles in a 2-column grid; tapping a tile selects it (accent border, #fdf3ec background) and auto-advances to Step 2 after 120ms.

| Tile label | Maps to category |
| Indoor walls | Interior |
| Outdoor walls | Exterior |
| Trim & doors | Trim |
| Ceiling | Ceilings |

A fifth and sixth tile are required by the proposal but not in the prototype — add them in the same grid pattern below the first four:

| Tile label | Maps to category |
| Undercoat | Undercoat |
| All-in-One | Premium All-in-One |
| Accessories | Accessories — taps directly to Step 2 but the accessories flow (§7.2) shows products with no finish/colour selection |

Below the grid, a persistent alert card:

Free delivery on Perth-metro orders $400+

(Background #fdf3ec, border #f1d9c8, --accent for "Free delivery".)
### 6.5 "Finish & product" step — Step 2
Lifted from prototype data-screen="finish". Chip row at the top, list of product rows below.

Chip row (selected chip uses --accent background and white text):

Matt Low Sheen Satin* Semi-Gloss Gloss

Reconciliation note: The prototype shows Satin. The proposal's enum is Matt, Low Sheen, Semi Gloss, Gloss, Ultra Flat, Eggshell — no Satin. Resolution: ship the proposal's enum. Replace the prototype's Satin chip with Eggshell and Ultra Flat and the chip row scrolls horizontally if all six don't fit.

Product rows. Each row:

┌─────────────────────────────────────┐
│ ▢  Trade Matt · 10L           $89   │
│    Indoor walls · Matt              │
└─────────────────────────────────────┘

- Left swatch: 28x28px, 6px radius, hex from swatch_hex (or product image thumbnail when available).
- Title: <name> · <tin_size> (13/600).
- Subtitle: <where label> · <finish> (11/muted).
- Right: price $NN (13/600).
- Row divider: 1px --rule2.
- Hover/press state: background #fafaf7.

Tapping a row stores state.product and navigates to Step 3 (Colour). For an accessory row, navigate directly to Step 3.5 (basket-add confirmation — see §7.2) since there is no colour to specify.
### 6.6 Search
Out of scope for MVP; navigation has no search affordance. Add to Phase 2.

## 7. Product Detail & Order Customisation (Proposal §2.3)
### 7.1 Paint products — Colour entry screen (Step 3)
Lifted from prototype data-screen="colour".

Layout:

Progress bar: ● ● ● ○ ○
Nav: ‹  Colour  ⋮
H1:  Write the colour
Sub: Be specific — mistakes cost a tin. Brand optional, name required.

[ BRAND (OPTIONAL) ]
[ e.g. Dulux                                ]

[ COLOUR NAME *  ]  ← required, accent border
[ e.g. Natural White                        ]

[ ORDER NOTES (OPTIONAL) ]
[ Anything else the office should know     ]  ← textarea, min-height 60px

YOUR SAVED COLOURS · TAP TO USE
[ Dulux Natural White ] [ Taubmans Crisp White ]
[ Dulux Lexicon Quarter ] [ Colorbond Monument ]

[ QUANTITY ]                      [ − ]  4  [ + ]

[ Continue to checkout ]

Field rules.

- Brand — optional, free-text. Persists with the order.
- Colour name — required. The "Continue to checkout" CTA is disabled until this has at least 1 non-whitespace character. If the user taps it while empty, animate a left-right shake (300ms, ±4px, ported from prototype's @keyframes shake) and focus the colour name input.
- Order notes — optional, free-text textarea.
- Quantity stepper — minimum 1, no enforced maximum. Default 4 (matches prototype state.qty = 4). − button disabled at qty=1.

Saved colours.

- Surfaced as horizontally-wrapping chips below the form.
- The currently-applied saved colour gets the hot styling (background --accent, white text).
- Tapping a chip fills both Brand and Colour-name inputs and applies hot styling to that chip only.
- Saved colours are stored per-user (see §10) and seeded from every previous order's (brand, colour_name) pair, deduplicated. The most-recently-used colour shows first.
- For a guest session, saved colours live in local async storage; they are not synced to a server account.

On "Continue to checkout": push the chosen (product, brand, colour_name, notes, qty) tuple to the basket as a basket item, then navigate to the Basket screen — not directly to Pay. (The prototype skips the basket screen because it's a single-item demo; MVP needs a real basket because the proposal §2.4 requires "Basket screen showing all added items".)
### 7.2 Accessories — paint-free flow
For products with category = Accessories:

- Step 3 is skipped (no brand, no colour, no saved colours).
- A confirmation sheet appears with: product image, name, tin/size if relevant, price, quantity stepper, Add to basket button.
- The basket item is recorded with brand = null, colour_name = null.

## 8. Basket & Checkout (Proposal §2.4)
### 8.1 Basket screen (new — derived from proposal §2.4; not in prototype)
Reached from the bottom tab or auto-pushed after adding an item.

Per-row content (reuse the row style from §6.5):

- Swatch / image
- Title: <product name> · <tin_size> (or just <product name> for accessories)
- Subtitle: <brand> <colour_name> (or Colour not yet specified if missing) · qty
- Right: line total $NN.NN and a trash icon

Bottom summary card (reuse the .summary style from prototype):

Subtotal       $356.00
Delivery       Free          (or  $25.00, depending on subtotal and zone)
GST            $35.60
─────────────────────
Total          $391.60

Delivery rule (from prototype renderSummary):

- Subtotal ≥ $400 AND address in Perth-metro → Free (rendered in --good).
- Subtotal < $400 AND address in Perth-metro → $25 flat.
- Address outside zone → blocked at checkout (§8.3), not at basket.

GST rule: (subtotal + delivery) * 0.10, displayed as a line item, rolled into Total.

Basket actions.

- Edit (taps back into the colour screen for that item).
- Delete (swipe-to-delete or trash icon).
- Continue to checkout primary CTA at the bottom.
- Empty state: paint-tin glyph, copy "Your basket is empty — pick a product to get started", CTA Browse paints → Where.
### 8.2 Checkout screen — "Pay"
Lifted from prototype data-screen="pay". Important: despite being titled "Pay", this screen does not process payment in MVP (see §13). The card field shown in the prototype is a Phase-2 placeholder and must be hidden in the MVP build. Submitting this screen sends the order and triggers the email — it is the "Place order" screen.

Layout:

Progress: ● ● ● ● ○
Nav: ‹  Pay  ⋮          (rename to "Place order" in MVP)
H1: Almost done
Sub: Address, contact details. Free over $400 in Perth metro.

[ DELIVER TO  ✓ Perth metro ]   ← green check + "Perth metro" inline
[ 14 Mill Lane, Joondalup 6027 ]

[ NAME & PHONE ]
[ Marcus McCabe · 0412 884 102 ]

(CARD FIELD — HIDDEN IN MVP; reinstate for Phase 2 Stripe integration)

┌─ Order summary ─────────────────┐
│ Trade Matt 10L × 4    $356.00   │
│ Colour: Dulux Natural White     │
│ Delivery              Free      │
│ GST                   $35.60    │
│ Total                 $391.60   │
└─────────────────────────────────┘

⚠ No refunds on tinted product.
All custom-tinted tins are final sale. See our terms.

[ Place order ]              ← CTA (renamed from "Pay & send order")

Address validation.

- The address field is editable. On blur, geocode (lightweight: postcode lookup against a static Perth-metro postcode list — Yanchep 6035 down to Mandurah 6210, full list to be supplied at kick-off).
- If the postcode is in-zone → small green pill "✓ Perth metro" appears inline with the label.
- If out of zone → push the Out-of-zone interstitial (§8.3). The Place-order button is disabled until the address is back in-zone.

Name & phone — single combined field in the prototype (Marcus McCabe · 0412 884 102). Keep this in MVP but parse into customer_name and customer_phone columns on save. Validation: name must be ≥ 2 chars; phone must be a 9–11 digit Australian-format number.
### 8.3 Out-of-zone interstitial
Lifted from prototype data-screen="oos".

Nav: ‹  Address
H1:  Sorry — not yet
Sub: We only deliver in the Perth metro at the moment.

[ POSTCODE ]
[ 6701 · outside delivery zone ]    ← accent text, readonly

┌─ Alert ──────────────────────────┐
│ Where we deliver                 │
│ Perth metro only — Yanchep in    │
│ the north down to Mandurah in    │
│ the south. We'll expand soon.    │
└──────────────────────────────────┘

[ Notify me when you expand ]    ← ghost CTA
‹ Back to checkout

Notify me when you expand collects an email (or uses the signed-in email) and stores a row in waitlist (email, postcode, created_at). Returns the user to checkout with the address still out-of-zone (and the Place-order button still disabled).
### 8.4 Order confirmation screen
Lifted from prototype data-screen="done".

Progress: ● ● ● ● ●
Nav: (no back)  Order #0428-A  ⋮

┌───┐
│ ✓ │   ← 64px green circle
└───┘

Order sent & paid                     ← rename: "Order sent"
Office aims to confirm and dispatch
within 1 hour. We'll push notify you
the moment it's out the door.

┌─ Order summary ─────────────────┐
│ (same content as checkout)      │
└─────────────────────────────────┘

⚠ No refunds on tinted product.    ← italic, --warn

[ Start another order ]            ← ghost CTA

Rename the "Order sent & paid" headline to "Order sent" in MVP (no payment was processed).

Order number format: #MMDD-X where X is a single uppercase letter rolling A→Z then AA→AZ per day. Generated server-side on insert.

Push notification ("the moment it's out the door"): out of scope for MVP. Leave the copy in but make it accurate by qualifying — change to "We'll email you when it's out the door." for MVP.

## 9. Account screen
Not shown in the prototype but required by the proposal (saved address, saved colours, last order, sign-out). Spec:

Nav: (no back)  Account  ⋮
H1: Your account

[ EMAIL ]
[ marcus@mccabe.com.au ]   ← readonly

[ DELIVERY ADDRESS ]
[ 14 Mill Lane, Joondalup 6027 ]   ← editable

[ NAME & PHONE ]
[ Marcus McCabe · 0412 884 102 ]

SAVED COLOURS
[ Dulux Natural White × ] [ Taubmans Crisp White × ] ...
↳ tap × to remove

RECENT ORDERS
─ #0428-A · 22 May · $391.60
─ #0421-C · 15 May · $189.00
↳ tap a row → read-only order detail

[ Sign out ]   ← ghost CTA, warn-coloured text


## 10. Data Model (Supabase / PostgreSQL)
-- users — managed by Supabase Auth; we extend with a profile table
create table profiles (
id uuid primary key references auth.users(id) on delete cascade,
email text,
phone text,
full_name text,
created_at timestamptz default now()
);

create table addresses (
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete cascade,
line1 text not null,
suburb text,
postcode text not null,
state text default 'WA',
country text default 'AU',
is_default boolean default true,
created_at timestamptz default now()
);

create type product_category as enum
('Interior','Exterior','Ceilings','Trim','Undercoat','Premium All-in-One','Accessories');
create type paint_finish as enum
('Matt','Low Sheen','Semi Gloss','Gloss','Ultra Flat','Eggshell');
create type tin_size as enum ('1L','4L','10L');
create type tinting_base as enum ('Tintable','White Base Only');

create table products (
id uuid primary key default gen_random_uuid(),
category product_category not null,
name text not null,
finish paint_finish,                  -- null for accessories
tin_size tin_size,                    -- null for accessories
tinting_base tinting_base,            -- null for accessories
price_aud numeric(10,2) not null,
image_url text,
swatch_hex text default '#e9e2cf',
is_active boolean default true,
created_at timestamptz default now()
);

create table saved_colours (
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete cascade,
brand text,
colour_name text not null,
last_used_at timestamptz default now(),
unique (user_id, lower(brand), lower(colour_name))
);

create table orders (
id uuid primary key default gen_random_uuid(),
order_number text unique not null,    -- e.g. "0522-A"
user_id uuid references profiles(id),  -- null for guest orders
guest_email text,                      -- captured if guest
customer_name text not null,
customer_phone text not null,
delivery_address_line1 text not null,
delivery_postcode text not null,
delivery_suburb text,
subtotal_aud numeric(10,2) not null,
delivery_aud numeric(10,2) not null,
gst_aud numeric(10,2) not null,
total_aud numeric(10,2) not null,
notes text,
status text default 'received',        -- received | confirmed | dispatched | cancelled
created_at timestamptz default now()
);

create table order_items (
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
product_id uuid references products(id),
product_name_snapshot text not null,
tin_size_snapshot tin_size,
finish_snapshot paint_finish,
brand text,                            -- nullable, optional
colour_name text,                      -- nullable for accessories
quantity integer not null check (quantity >= 1),
unit_price_aud numeric(10,2) not null,
line_total_aud numeric(10,2) not null
);

create table waitlist (
id uuid primary key default gen_random_uuid(),
email text not null,
postcode text not null,
created_at timestamptz default now()
);

Row-level security: profiles, addresses, saved_colours, orders, order_items all scoped to auth.uid(). Products are world-readable. Service role is used by the NestJS API server.

## 11. API Endpoints (NestJS)
Base URL: https://api.noroopaint.com.au/v1 (placeholder).

| Method | Path | Auth | Description |
| POST | /auth/otp/request | none | Body: { email }. Sends 6-digit code. |
| POST | /auth/otp/verify | none | Body: { email, code }. Returns session JWT. |
| POST | /auth/guest | none | Returns an anonymous session token. |
| GET | /products | optional | Query: category, finish, tin_size, tinting_base. Returns filtered list. |
| GET | /products/:id | optional | Single product. |
| GET | /saved-colours | required | List for the current user. |
| POST | /saved-colours | required | Body: { brand, colour_name }. Upserts (case-insensitive). |
| DELETE | /saved-colours/:id | required | Removes one. |
| GET | /addresses | required | List. |
| POST | /addresses | required | Create. |
| PATCH | /addresses/:id | required | Update. |
| POST | /orders | optional (guest allowed) | Body: full order (see §11.1). Triggers email. Returns { id, order_number }. |
| GET | /orders | required | Current user's orders. |
| GET | /orders/:order_number | required (or guest-token-bound) | Single order. |
| POST | /waitlist | none | Body: { email, postcode }. |
| GET | /zones/check | none | Query: postcode. Returns { in_zone: boolean, label: 'Perth metro' | null }. |

### 11.1 POST /orders request body
{
"guest_email": "marcus@mccabe.com.au",
"customer_name": "Marcus McCabe",
"customer_phone": "0412884102",
"delivery": {
"line1": "14 Mill Lane",
"suburb": "Joondalup",
"postcode": "6027"
},
"notes": "Leave at side gate",
"items": [
{
"product_id": "uuid-...",
"brand": "Dulux",
"colour_name": "Natural White",
"quantity": 4
}
]
}

Server computes subtotal, delivery, GST and total from product prices — never trust the client's totals. Server validates postcode is in the Perth-metro list before accepting.

## 12. Email Templates (Proposal §2.5)
Two emails fire on every successful POST /orders. Both rendered via AWS SES with HTML + plain-text alternatives.
### 12.1 Customer confirmation
- From: orders@noroopaint.com.au
- Subject: Order #0522-A confirmed — Noroo Paint
- Body (HTML, branded in design-system colors):
- Header band in --ink with the Noroo wordmark in --bg.
- Greeting: Hi Marcus,
- Confirmation copy: "Thanks for your order. We aim to confirm and dispatch within 1 hour. You'll get another email the moment it leaves us."
- Itemised table (same content as the in-app summary).
- Delivery address block.
- Footer note in --warn: "No refunds on tinted product. All custom-tinted tins are final sale."
- Footer with contact email and unsubscribe (transactional — no unsubscribe needed, but include physical address per CAN-SPAM equivalent AU rules).
### 12.2 Fulfilment team notification
- From: orders@noroopaint.com.au
- To: fulfilment@noroopaint.com.au (configurable)
- Subject: New order #0522-A · $391.60 · Joondalup 6027
- Body: plain, dense, scannable — full customer details, address, phone, every line item with brand+colour+notes, total, timestamp.

## 13. Out of Scope for MVP (Proposal §3)
These features are intentionally not built in MVP. Reflect them in the codebase as TODOs / feature flags so Phase 2 is fast to start.

| Item | Why deferred | Phase 2 path |
| Payment gateway (Stripe) | Proposal §3 explicitly out of scope; the prototype's "Pay" / card field is a design preview only. | Drop in Stripe React Native SDK; reuse the existing checkout screen and unhide the card field. |
| Web admin dashboard | Catalogue managed via SQL / Supabase Studio in MVP. | Next.js + Supabase admin. |
| Inventory management | No stock counts or hold-on-order. | Add stock columns to products, decrement on order. |
| Delivery / logistics integration | Manual dispatch by fulfilment team. | Integrate with a courier API (Sherpa, etc.). |
| Push notifications | The "out the door" notification copy will read as email-only in MVP. | Expo Notifications + a notify_token column. |
| Search bar | Filters alone are sufficient for MVP catalogue size. | Add a search input at the top of the product list. |
| Analytics | Defer to keep MVP lean. | Posthog / Amplitude. |
| SMS OTP | Email OTP only in MVP. | Twilio Verify. |

## 14. Delivery Timeline (Proposal §5)
| Phase | Weeks | Output |
| Phase 1 — Foundation | 1 | Project setup, schema, design system in code, navigation skeleton, auth screens |
| Phase 2 — Catalogue | 2–3 | Filter wizard, product list, product detail, colour entry, saved colours |
| Phase 3 — Basket & Orders | 4–5 | Basket, checkout, address validation, order POST, both email templates |
| Phase 4 — QA & Polish | 6 | Device testing (iOS + Android matrix), bug fixes, app icon, splash |
| Phase 5 — Submission | 7–8 | Store listings, screenshots, privacy policy, Apple + Google submission, review monitoring |

Apple review: 1–3 business days. Google review: 1–7 business days. Both factored into Phase 5.

## 15. Acceptance Criteria (build-readiness checklist)
A build is "done" when all of the following pass.

Auth

- User can sign up with email; 6-digit code arrives within 30s; entering it grants access.
- User can "Continue as guest" and place an order without an account.
- Signing in on a fresh install with a previously-used email restores saved address and saved colours.
- Killing and reopening the app keeps the user signed in.

Catalogue

- All 7 categories are tappable in step 1.
- All 6 finishes appear as chips and filter the product list.
- Tin-size and tinting-base filters work in combination with finish.
- Accessories category skips the colour step entirely.

Order flow

- Required field (colour name) blocks progression; empty submit triggers the shake animation.
- Saved colours surface as chips and one-tap fills the brand+name.
- Quantity stepper enforces ≥1 and updates the basket line total live.
- Subtotal, GST (10%), delivery (free ≥ $400 Perth metro, else $25), and total all compute correctly.
- Out-of-zone postcode (e.g. 6701) blocks checkout and shows the OOS interstitial.

Confirmation

- On submit, the customer receives the confirmation email within 10 seconds.
- The fulfilment inbox receives its notification email within 10 seconds.
- An order row + order_items rows exist in the database with all snapshot fields populated.
- The in-app confirmation screen shows the same summary and the correctly-formatted order number.

Design fidelity

- Every color value in §3.1 is wired as a token (theme constants) and used everywhere.
- Font family is Helvetica Neue across every text element.
- All radii and paddings match §3.3.
- Progress bar segments fill in sync with the user's position in the flow.

Store readiness

- Privacy policy URL is live and linked from the app and both store listings.
- App icon and splash use the brand palette.
- App passes Apple's review on first submission (no metadata rejections, no missing privacy declarations).
- App passes Google Play review on first submission.

## 16. Open Questions for Kick-off
To be resolved at the brief kick-off call (Proposal §8 Step 2):

- Final Perth-metro postcode list. Yanchep to Mandurah is the bound; we need the exhaustive list of postcodes considered in-zone for delivery checks.
- Brand assets. Final Noroo logo, app icon master file, brand colours if any deviate from the prototype palette.
- Privacy policy URL. Required for store submission.
- Fulfilment email. Confirm the address that receives the team notification.
- Initial catalogue. A CSV of every product (name, category, finish, tin size, tinting base, price, image) seeded into Supabase at Phase 1.
- Domain. Confirm noroopaint.com.au (or equivalent) for the API and email-sender domain. SES requires SPF/DKIM setup on this domain.
- Reconciliation: prototype's "Stripe" card field. Confirmed out-of-scope — hide for MVP, retain the visual design for Phase 2.

End of PRD.

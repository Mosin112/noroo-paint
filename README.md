# Noroo Paint — Mobile App

Mobile-first paint ordering app for the Perth metro market (iOS + Android), built per
the [PRD](./docs/PRD.md) and the SparkX clickable prototype.

This repo contains **Phase 1 — Foundation**: project setup, schema, design system in
code, navigation skeleton, and all order-flow screens running off seed data.

## Stack

| Layer          | Choice                                                          |
| -------------- | --------------------------------------------------------------- |
| Mobile         | React Native via **Expo (managed)** — single codebase, EAS-ready |
| Language       | TypeScript (strict)                                             |
| Navigation     | `@react-navigation/native` v7 (PRD called for v6; v7 ships with Expo SDK 56 and has the same API surface for our screens) |
| Server state   | `@tanstack/react-query`                                         |
| Client state   | `zustand`                                                       |
| Forms          | `react-hook-form` + `zod`                                       |
| Icons          | `lucide-react-native`                                           |
| Secure storage | `expo-secure-store` (session tokens)                            |
| API client     | `axios` (`src/api/client.ts`) — falls back to seed data when `EXPO_PUBLIC_API_BASE_URL` is unset |

Backend (NestJS + Supabase + AWS SES) is delivered in a separate repo per PRD §2; the
SQL schema for that backend lives at [`db/schema.sql`](./db/schema.sql).

## Getting started

```bash
npm install
npm run start        # opens Expo dev server
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run typecheck    # tsc --noEmit
```

You'll need the Expo Go app on a device, or a configured iOS/Android simulator.

### Environment

The API client reads one variable. With it unset, every call resolves against
local seed data so the UI is fully usable without a backend.

| Variable                     | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`   | Base URL for the NestJS API (e.g. `https://api.noroopaint.com.au/v1`) |

Set it in an `.env` file (Expo loads `EXPO_PUBLIC_*` automatically) when wiring
the real backend.

## Project layout

```
.
├── App.tsx                     # Root: providers + RootNavigator
├── app.json                    # Expo config (brand bg, slug, plugins)
├── db/schema.sql               # PRD §10 Postgres schema (Supabase-ready)
├── src/
│   ├── api/client.ts           # PRD §11 endpoints; seed fallback
│   ├── components/             # Themed primitives (CTA, Field, Tile, …)
│   ├── data/seedProducts.ts    # Offline catalogue + Perth postcode set
│   ├── navigation/             # RootStack → Tabs → ShopStack
│   ├── screens/
│   │   ├── auth/SignInScreen.tsx
│   │   ├── shop/{Where,Finish,Colour,Basket,Checkout,OutOfZone,Confirmed}Screen.tsx
│   │   └── account/AccountScreen.tsx
│   ├── state/                  # Zustand stores: auth, basket, savedColours
│   ├── theme/                  # PRD §3 tokens — colors, type, spacing
│   └── types/domain.ts         # Enums + type aliases mirroring §6 and §10
```

## Design system

Every token in PRD §3 is encoded in `src/theme/`. Components consume them only via
named tokens (`colors.accent`, `radii.tile`, etc.). No magic literals in screens.

Notable deviations from the prototype, all documented in the PRD itself:

- `Satin` chip → replaced with `Eggshell` + `Ultra Flat` (§6.5 reconciliation).
- "Pay & send order" CTA → renamed to "Place order" (MVP has no payment, §8.2).
- Card field on Checkout → hidden in MVP (§13).
- "Order sent & paid" → "Order sent" (§8.4).
- Push notification copy → "We'll email you when it's out the door" (§8.4).

## Order flow

```
SignIn (modal, or "Continue as guest")
  └── Tabs ─ Shop ┬─ Where ─ Finish ─ Colour ─ Basket ─ Checkout ─ Confirmed
                  │                                          └─ OutOfZone (modal)
                  ├─ Basket
                  └─ Account
```

Progress bar segments (1–5) align with the prototype: Where, Finish, Colour, Pay
(Place order), Confirmed.

## Phase 1 acceptance — what's in this scaffold

- [x] Expo TypeScript project boots
- [x] All design tokens in `src/theme/` are named and reused
- [x] Navigation: Root stack + Tabs + nested Shop stack with the prototype's 6 steps
- [x] All 10 screens render with the prototype's layout and copy
- [x] Sign-in (email/phone validation) + "Continue as guest"
- [x] Where → Finish → Colour wizard with seed catalogue
- [x] Basket with line totals, GST 10%, free-over-$400 delivery rule
- [x] Out-of-zone interstitial blocks Place order until address is back in zone
- [x] Order placement, mock order number `MMDD-A`, Confirmed screen
- [x] Saved colours store seeded; tap-to-fill on Colour screen
- [x] PRD §10 SQL schema committed at `db/schema.sql`

## What's next (Phase 2+)

- Real Supabase backend + Auth (OTP via SES) — replace seed branch in `api/client.ts`.
- OTP code-entry modal (`src/screens/auth/OtpModal.tsx` — stubbed, not yet rendered).
- Address geocoding & full Perth postcode list (PRD §16 — TBC at kick-off).
- Stripe payments (un-hide the card field on Checkout per §13).
- App icon + splash from brand assets.
- EAS Build configuration and store submission.

See PRD §13 for the full deferred list.

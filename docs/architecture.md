# architecture.md

System architecture for Oja Market v1. Optimised for a lean team, a ≤40 MB app bundle, and Nigerian tier-2 network conditions.

---

## Overview

```
┌─────────────────────────────────────────────┐
│  Mobile App (Flutter)                        │
│  Android-first · ≤40 MB · Yoruba + English  │
└──────────────┬──────────────────────────────┘
               │ HTTPS / REST
┌──────────────▼──────────────────────────────┐
│  API Layer (Supabase Edge Functions)         │
│  Auth · Listings · Search · Contacts · Admin │
└──────┬───────────────────┬───────────────────┘
       │                   │
┌──────▼──────┐    ┌───────▼────────┐
│  Supabase   │    │  Cloudinary    │
│  Postgres   │    │  Image CDN     │
│  Auth       │    │  Signed upload │
│  Realtime   │    └────────────────┘
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────┐
│  Worker Process (separate Supabase cron)     │
│  Listing expiry · Auto-close · Moderation   │
│  Notifications · Image validation            │
└──────┬──────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────┐
│  Admin Dashboard                             │
│  Retool or Supabase Studio (not custom-built)│
└─────────────────────────────────────────────┘
```

---

## Mobile app

**Framework:** Flutter (single codebase — Android primary, iOS secondary)  
**Bundle target:** ≤40 MB (enforced via `flutter build apk --split-per-abi`)  
**State management:** Riverpod  
**Navigation:** go_router  
**HTTP:** Dio with interceptor for Supabase JWT injection  
**Localisation:** flutter_localisation — `en` and `yo` ARB files loaded at startup, not on demand  
**Image display:** cached_network_image — cache-first, no re-fetch on revisit  
**No offline-first architecture in v1.** Network required. Graceful error states shown when offline. Deferred to v2.

---

## API layer

**Platform:** Supabase (Postgres + Auth + Edge Functions + Row Level Security)  
**Auth:** Phone/OTP via Supabase Auth. JWT issued on verification.  
**RLS:** All table access controlled by Row Level Security policies — no client bypasses the policy layer.  
**Edge Functions used for:**
- Listing create/update (validates enum fields, enforces listing limits per category)
- Contact tap recording
- Report submission
- Admin moderation actions

**Direct table access (RLS-gated):**
- Browse listings (unauthenticated read)
- Search (Postgres full-text on `listings.name`, `listings.description`)

**Response time SLAs (P95):**

| Endpoint type | Target |
|---------------|--------|
| Listing browse / search | ≤400 ms |
| Listing create / update | ≤600 ms |
| Auth (OTP verify) | ≤800 ms |
| Image upload (signed URL generation) | ≤500 ms |

---

## Database

**Engine:** Supabase-managed Postgres  
**Key design decisions:**
- `market_name` is an enum with `market_name_custom` overflow field — prevents free-text pollution
- `unit_label` is an enum with constrained custom override
- All tables carry `created_at`, `updated_at`, `deleted_at` — soft delete everywhere
- `ContactTap` table is the primary engagement metric — never truncated
- `Transaction` schema deferred to v2

See `db-migration-runner.md` for migration conventions.

---

## Image storage

**Provider:** Cloudinary  
**Upload flow:** App requests signed URL from Edge Function → uploads directly to Cloudinary → stores returned `public_id`  
**Tier:** Free tier at launch. Evaluate upgrade at **150 active vendors** (free tier math: 150 vendors × avg 8 listings × 1 image = 1,200 assets; free tier limit 10 GB storage / 20 GB bandwidth — tight at scale).  
**Security:** Unsigned uploads are rejected. All uploads via signed URL only.

---

## Worker process

Cron jobs run in a **dedicated Supabase Edge Function worker**, not inline with API request handlers.

**Rationale:** Mixing cron logic into request handlers creates timeout risk on long-running jobs and makes failure tracing ambiguous.

Jobs defined in `AGENTS.md`. Schedule:

| Job | Schedule |
|-----|----------|
| Listing expiry warning | 20:50 WAT daily |
| Auto-close shops | 21:00 WAT daily |
| Notification flush | Every 15 min |

---

## Notifications

**Push:** Firebase Cloud Messaging (FCM) — all non-critical alerts  
**WhatsApp:** Twilio WhatsApp Business API — account-critical only (new-device login, suspension, appeal outcome)  
**Cost warning:** WhatsApp free tier (1,000 conversations/month) exhausted in ~2 days at 500 vendors. Do not expand WhatsApp scope without budget approval.

---

## Admin dashboard

Use **Retool** or **Supabase Studio**. Do not build a custom admin UI in v1.

Covers: listing moderation queue, vendor suspension/appeal, report review, user lookup.

---

## What is explicitly out of scope for v1

| Feature | Status |
|---------|--------|
| Payment processing | v2 |
| Delivery / logistics | Not planned |
| Offline-first / local-first sync | v2 |
| Transaction schema | v2 |
| Weekly digest notifications | v2 |
| 7-day trend charts | v2 |
| SIM swap full mitigation | v2 |

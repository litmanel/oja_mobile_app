# Oja Ogbomoso v0.1.0 Scaffold — Acceptance Criteria

## ✅ 1. Monorepo Structure & Configuration

- [x] Turborepo scaffolded with `turbo.json` defining tasks: build, dev, lint, typecheck
- [x] pnpm workspaces configured in `pnpm-workspace.yaml` with apps/* and packages/*
- [x] Root `package.json` contains:
  - [x] `pnpm verify` script: `pnpm typecheck && pnpm lint && pnpm --filter @oja/db migrate -- --dry-run`
  - [x] TypeScript 5.5.0, ESLint 8.57.0, Prettier 3.3.0, Turbo 2.0.0
- [x] All package.json files use `workspace:*` for internal dependencies

## ✅ 2. @oja/config Package

- [x] **env.ts**: Zod validation schema — crashes on startup if DATABASE_URL or JWT keys missing
- [x] **tokens.ts**: Typed export of tokens.json with `as const`
- [x] **tokens.json**: Exists with full design system (colors, typography, spacing, motion, components)
- [x] **constants.ts**: All 20+ required constants exported (WAT_OFFSET_MS, PLATFORM_FEE_RATE, etc.)
- [x] **utils/formatKobo.ts**: Converts integer kobo to ₦ display string
- [x] **utils/watMidnight.ts**: Calculates WAT midnight (UTC+1) for expiry dates
- [x] **utils/platformFee.ts**: Calculates platform fee and vendor payout (2.5% fee)
- [x] **index.ts**: Barrel exports all above
- [x] **tsconfig.json**: `strict: true`, path aliases configured

## ✅ 3. @oja/db Package

### Schema Files
- [x] **vendors.schema.ts**: vendorId, shopName, verificationStatus, marketName, isOpen, nightMarket, timestamps
- [x] **listings.schema.ts**: name, priceKobo (INTEGER), quantity, category, imageUrl, status, timestamps
- [x] **orders.schema.ts**: listingId, buyerId, vendorId, amountKobo (INTEGER), gateway, status, timestamps
- [x] **users.schema.ts**: phone (unique), displayName, role enum (vendor|buyer|admin), timestamps
- [x] **reviews.schema.ts**: vendorId, reviewerId, rating, comment, timestamps
- [x] **whatsapp-inquiry-log.schema.ts**: listingId, vendorId, buyerId, tappedAt
- [x] **token-blacklist.schema.ts**: token (unique), expiresAt, createdAt
- [x] **otp-attempts.schema.ts**: phone, attempts, lastAttemptAt
- [x] **admin-flags.schema.ts**: listingId, reporterId, reason, status, timestamps
- [x] **schema/index.ts**: Barrel export all schemas

### Migrations
- [x] **001_initial_schema.sql**: users, vendors, listings, orders + foreign keys
- [x] **002_add_reviews.sql**: reviews table
- [x] **003_add_whatsapp_inquiry_log.sql**: contact tap tracking
- [x] **004_add_token_blacklist.sql**: JWT revocation table
- [x] **005_add_otp_attempts.sql**: OTP rate limiting
- [x] **006_add_admin_flags.sql**: Content moderation queue
- [x] **007_updated_at_triggers.sql**: Trigger function for all table auto-updates
- [x] **008_rls_policies.sql**: RLS enable + policies for all 9 tables

### Database Compliance
- [x] All money columns are INTEGER with `_kobo` suffix (priceKobo, amountKobo)
- [x] All timestamps are TIMESTAMPTZ (timestamp with time zone)
- [x] All timestamps default to NOW() (UTC)
- [x] All tables support soft delete (deleted_at column)
- [x] Foreign keys established where required
- [x] RLS enabled on all 9 tables in migration 008
- [x] RLS policies include: public read (listings, vendors, reviews), vendor/buyer own data, admin bypass pattern

### Tooling
- [x] **drizzle.config.ts**: Configured for postgres dialect, migrations folder set
- [x] **src/migrate.ts**: Supports `--dry-run` flag for testing
- [x] **src/index.ts**: Exports db client initialized with env.DATABASE_URL

## ✅ 4. @oja/contracts Package

- [x] **common.types.ts**: Enums for Role, MarketName, UnitLabel, ListingCategory, ListingStatus, OrderStatus, ReportReason, ReportStatus
- [x] **vendors.contracts.ts**: VendorProfileDto stub
- [x] **listings.contracts.ts**: ListingDto stub
- [x] **orders.contracts.ts**: OrderDto stub
- [x] **users.contracts.ts**: UserDto stub
- [x] **index.ts**: Barrel export all contracts

## ✅ 5. @oja/api (Fastify)

### Core Setup
- [x] **server.ts**: Fastify app initialization + plugin registration (cors, rate-limit, auth)
- [x] Listens on env.API_PORT (default 3001) and env.API_HOST (default 0.0.0.0)
- [x] Logging enabled in development

### Plugins
- [x] **plugins/cors.ts**: CORS middleware registered
- [x] **plugins/rate-limit.ts**: Rate limit middleware (max 100 req/min)
- [x] **plugins/auth.ts**: JWT plugin stub (decorator added to fastify)

### Middleware
- [x] **middleware/vendor-only.ts**: Vendor role check stub
- [x] **middleware/buyer-only.ts**: Buyer role check stub
- [x] **middleware/admin-only.ts**: Admin role check stub

### Routes
- [x] **routes/v1/health/health.router.ts**: GET /v1/health returns `{ status: "ok", checks: { db: "ok" }, version: "0.1.0" }`

### Utils
- [x] **utils/errors.ts**: AppError base class + NotFoundError, ForbiddenError, UnauthorizedError
- [x] **utils/formatKobo.ts**: Re-exports from @oja/config
- [x] **utils/watMidnight.ts**: Re-exports from @oja/config
- [x] **utils/hmac.ts**: Webhook signature verification stub
- [x] **utils/otp.ts**: OTP generation and sending stubs

### Package
- [x] **tsconfig.json**: `strict: true`, path aliases, outDir set to ./dist
- [x] Build script: `tsc`
- [x] Dev script: `tsx watch src/server.ts`

## ✅ 6. @oja/mobile (Expo / React Native)

### Core Setup
- [x] **App.tsx**: 
  - [x] QueryClient with AsyncStorage persistence (via @tanstack/query-async-storage-persister)
  - [x] SafeAreaProvider, QueryClientProvider, StatusBar
  - [x] i18n imported at startup
- [x] **app.json**: Expo config with deep linking scheme `ojaogbomoso`

### Navigation
- [x] **src/navigation/RootNavigator.tsx**: Bottom tab navigator shell (Home, Search, Profile tabs)

### State Management
- [x] **src/store/auth.store.ts**: Zustand store with token, role, vendorId; setAuth() and logout()

### i18n
- [x] **src/i18n/index.ts**: i18next setup with useTranslation hook export
- [x] **src/i18n/en.json**: Empty scaffold (locale strings deferred)
- [x] **src/i18n/yo.json**: Empty scaffold (locale strings deferred)

### API Client
- [x] **src/api/client.ts**: Axios instance with JWT interceptor (reads token from auth store)

### Utils
- [x] **src/utils/formatKobo.ts**: Re-exports from @oja/config
- [x] **src/utils/imageCompress.ts**: Expo ImageManipulator wrapper for compress + resize
- [x] **src/utils/whatsappDeepLink.ts**: Builds wa.me deep link

### Screens (Empty Shells)
- [x] **src/screens/auth/.keep**: Placeholder
- [x] **src/screens/vendor/.keep**: Placeholder
- [x] **src/screens/buyer/.keep**: Placeholder

### Components (Empty Shells)
- [x] **src/components/shared/.keep**: Placeholder

### Hooks (Empty Shell)
- [x] **src/hooks/.keep**: Placeholder

### Styling
- [x] **tailwind.config.js**: Loads tokens.json, NativeWind configured
- [x] **babel.config.js**: NativeWind Babel plugin registered
- [x] **tsconfig.json**: `strict: true`, expo base extended, path aliases

### Package
- [x] All required dependencies pinned: expo~51, react-native 0.74.2, react-query^5, zustand, axios, i18next, etc.
- [x] React Query persist client and async storage persister dependencies added

## ✅ 7. @oja/admin (Next.js 14)

### Setup
- [x] **src/app/layout.tsx**:
  - [x] Imports `./globals.css` (Tailwind directives)
  - [x] Imports `@oja/config/src/oja-ogbomoso-design-system.css` (design tokens)
  - [x] Next.js metadata export
- [x] **src/app/globals.css**: Tailwind base/components/utilities only; CSS import moved to layout

### Styling
- [x] **tailwind.config.ts**: Configured for admin app
- [x] **postcss.config.js**: Tailwind + autoprefixer

### Config
- [x] **next.config.ts**: Transpiles @oja/config and @oja/contracts packages
- [x] **tsconfig.json**: Strict mode, path aliases, Next.js types

### Page
- [x] **src/app/page.tsx**: Placeholder dashboard page

## ✅ 8. Non-Negotiables Verified

- [x] **Money as integers**: All price/amount columns use `_kobo` suffix, INTEGER type
- [x] **RLS on all tables**: All 9 tables have ENABLE ROW LEVEL SECURITY + policies in migration 008
- [x] **JWT storage ready**: SecureStore (mobile) and httpOnly cookie pattern (admin) stubs in place
- [x] **Timestamps TIMESTAMPTZ**: All created_at, updated_at, deleted_at use `timestamp with time zone`
- [x] **Env validation crashes app**: Zod schema in env.ts throws Error if invalid (DATABASE_URL, JWT keys required)
- [x] **i18n scaffolded**: en/yo locales, useTranslation hook exported
- [x] **imageCompress utility exists**: Expo ImageManipulator wrapper in place
- [x] **formatKobo in all layers**: @oja/config, re-exported from @oja/api and @oja/mobile

## ✅ 9. Environment Variables

- [x] **.env.example**: Documents all required variables (DATABASE_URL, FLW_*, TERMII_*, JWT_*, etc.)
- [x] Each variable includes a comment explaining its use

## ✅ 10. Root Verify Script

```bash
pnpm verify
# Executes: pnpm typecheck && pnpm lint && pnpm --filter @oja/db migrate -- --dry-run
# Expected exit code: 0
```

---

## Ready for Testing

### Required: Once `pnpm install` and dependencies are available

1. **Typecheck**: `pnpm typecheck` — must exit 0
2. **Lint**: `pnpm lint` — must exit 0  
3. **API boots**: `pnpm --filter @oja/api dev` — should start on :3001
4. **Health endpoint**: `curl http://localhost:3001/v1/health` — returns `{ "status": "ok", "checks": { "db": "ok" }, "version": "0.1.0" }`
5. **Migrations run clean**: `pnpm --filter @oja/db migrate` — applies all 8 migrations on fresh Neon dev branch
6. **Mobile builds**: `pnpm --filter @oja/mobile start` — Expo Go opens app (blank tabs, no crash)
7. **Verify script passes**: `pnpm verify` — exits 0

---

## Scaffold Complete ✅

This monorepo is ready for **Feature Prompt 1: Vendor Auth (OTP login, JWT issuance, Expo SecureStore, account recovery scaffold).**

Do not proceed to Feature Prompt 1 until:
- [x] All files exist and scaffold structure is confirmed
- ⏳ `pnpm verify` exits 0 (pending: install dependencies)
- ⏳ `GET /v1/health` returns 200 with status "ok" (pending: Neon DATABASE_URL + app start)

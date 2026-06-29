# code-style.md

Rules for the Oja Market codebase. Lean, consistent, reviewable.

---

## General

- **No dead code in main.** Commented-out blocks go in a branch, not a commit.
- **No TODOs in production code** without a linked issue number: `// TODO(#42): deferred to v2`.
- **Fail loudly in development, fail gracefully in production.** Never swallow exceptions silently.
- Line length: 100 characters. Enforced by formatter.
- All user-facing strings go through the localisation layer — no hardcoded English or Yoruba strings in widget/component code.

---

## Flutter (Dart)

**Formatter:** `dart format` — run on save, enforced in CI.  
**Linter:** `flutter_lints` package. Zero lint warnings in CI.

### Naming

| Kind | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `ListingCard` |
| Variables, functions | camelCase | `fetchListings()` |
| Constants | lowerCamelCase | `const maxListingsFood = 15` |
| Files | snake_case | `listing_card.dart` |
| Directories | snake_case | `features/listings/` |

### Structure

Feature-first, not layer-first:

```
lib/
  features/
    listings/
      data/          # repository, data sources, DTOs
      domain/        # models, use cases
      presentation/  # widgets, providers, screens
    vendors/
    search/
    auth/
    admin/
  shared/
    widgets/         # reusable UI components
    utils/
    constants/
  l10n/              # ARB files (en, yo)
```

### State

- Use **Riverpod** providers. No `setState` outside of truly local, ephemeral widget state (e.g. text field focus).
- Providers are defined at the feature level, not globally unless shared.
- AsyncNotifier for anything that touches the network.

### Error handling

```dart
// Preferred — explicit error state surfaced to UI
final result = await listingRepository.create(listing);
result.fold(
  onFailure: (e) => state = AsyncError(e, StackTrace.current),
  onSuccess: (l) => state = AsyncData(l),
);

// Never — silent swallow
try { ... } catch (_) {}
```

### Localisation

```dart
// Correct
Text(context.l10n.contactVendor)

// Wrong — hardcoded string
Text('Contact vendor')
```

ARB keys use camelCase: `contactVendor`, `listingExpiredToday`.  
Yoruba strings live in `app_yo.arb`. Both files updated together — no key can exist in one without the other.

---

## SQL / Supabase

- Table names: `snake_case` plural — `listings`, `contact_taps`, `reports`
- Column names: `snake_case` — `updated_at`, `market_name_custom`
- Every migration file: `YYYYMMDD_HHMMSS_description.sql` — see `db-migration-runner.md`
- No raw SQL in application code — go through the Supabase client or Edge Function
- Every query that filters by `vendor_id` or `user_id` must also filter by `deleted_at IS NULL`

```sql
-- Correct
SELECT * FROM listings
WHERE vendor_id = $1
  AND deleted_at IS NULL
  AND status = 'active';

-- Wrong — returns soft-deleted rows
SELECT * FROM listings WHERE vendor_id = $1;
```

---

## Edge Functions (TypeScript/Deno)

- One function per domain action: `create-listing`, `record-contact-tap`, `submit-report`
- Input validation at the top of every function before any DB call
- Return shape is always `{ data, error }` — never throw raw errors to the client
- No business logic in the router — handlers are thin; logic lives in service modules

```ts
// Correct
const validated = validateCreateListing(body);
if (!validated.ok) return errorResponse(400, validated.message);
const result = await listingService.create(validated.data);
return result.ok ? okResponse(result.data) : errorResponse(500, result.message);

// Wrong — logic in handler
if (!body.name || body.name.length > 80) { ... all logic inline ... }
```

---

## Git

- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/` prefixes
- Commit messages: imperative present tense — `Add listing expiry cron`, not `Added` or `Adding`
- PRs require one approval before merge to `main`
- `main` is always deployable

---

## What to avoid

| Pattern | Why |
|---------|-----|
| `dynamic` types in Dart | Defeats type safety |
| `BuildContext` across async gaps without mounted check | Crashes on widget unmount |
| Unsigned Cloudinary uploads | Security — see security.md |
| Direct table writes from mobile client bypassing RLS | All writes go through Edge Functions or verified RLS policies |
| Hardcoded WAT timezone offsets | Use `Africa/Lagos` tz identifier |

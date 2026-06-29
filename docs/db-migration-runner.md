# db-migration-runner.md

Migration conventions for Oja Market's Supabase Postgres database.

---

## File naming

```
supabase/migrations/
  20240101_000000_initial_schema.sql
  20240115_143000_add_contact_taps.sql
  20240120_090000_add_report_table.sql
  20240201_110000_add_night_market_flag.sql
```

Format: `YYYYMMDD_HHMMSS_description.sql`  
Description: snake_case, ≤50 chars, imperative — `add_`, `drop_`, `alter_`, `create_index_`.

---

## Core schema

### users
```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone        TEXT UNIQUE NOT NULL,          -- E.164, +234 prefix
  display_name TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'vendor' CHECK (role IN ('vendor', 'buyer', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
```

### shops
```sql
CREATE TABLE shops (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id         UUID NOT NULL REFERENCES users(id),
  market_name       TEXT NOT NULL CHECK (market_name IN (
                      'bodija', 'kuto', 'eke_awka', 'other'
                    )),
  market_name_custom TEXT,                    -- populated when market_name = 'other'
  stall_number      TEXT,
  is_open           BOOLEAN NOT NULL DEFAULT FALSE,
  night_market      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);
```

### listings
```sql
CREATE TABLE listings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID NOT NULL REFERENCES shops(id),
  vendor_id    UUID NOT NULL REFERENCES users(id),
  name         TEXT NOT NULL CHECK (char_length(name) BETWEEN 3 AND 80),
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK (price > 0),
  unit_label   TEXT NOT NULL CHECK (unit_label IN (
                 'kg','g','litre','piece','bag','bunch','custom'
               )),
  unit_custom  TEXT CHECK (char_length(unit_custom) <= 20),
  quantity     INT NOT NULL CHECK (quantity > 0),
  category     TEXT NOT NULL CHECK (category IN (
                 'food','clothing','household','electronics','other'
               )),
  image_url    TEXT,                          -- Cloudinary public_id
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
                 'active','expired','hidden_flagged','deleted'
               )),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);
```

### contact_taps
```sql
-- Primary engagement metric. Never truncate.
CREATE TABLE contact_taps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id),
  vendor_id   UUID NOT NULL REFERENCES users(id),
  buyer_id    UUID REFERENCES users(id),      -- NULL for unauthenticated taps
  tapped_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### reports
```sql
CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason      TEXT NOT NULL CHECK (reason IN (
                'wrong_price','inactive_vendor','offensive','spam','other'
              )),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                'pending','reviewed','dismissed'
              )),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Indexes

```sql
-- Listing browse (most common query)
CREATE INDEX idx_listings_shop_status ON listings(shop_id, status)
  WHERE deleted_at IS NULL;

-- Vendor dashboard
CREATE INDEX idx_listings_vendor ON listings(vendor_id)
  WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_listings_fts ON listings
  USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Report lookup for moderation agent
CREATE INDEX idx_reports_listing_pending ON reports(listing_id, created_at)
  WHERE status = 'pending';

-- Contact tap analytics
CREATE INDEX idx_contact_taps_vendor ON contact_taps(vendor_id, tapped_at);
```

---

## Row Level Security policies

```sql
-- Enable RLS on all tables
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops      ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_taps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports    ENABLE ROW LEVEL SECURITY;

-- Listings: anyone can read active non-deleted listings
CREATE POLICY "public read active listings"
  ON listings FOR SELECT
  USING (status = 'active' AND deleted_at IS NULL);

-- Listings: vendor can read and write own listings
CREATE POLICY "vendor manage own listings"
  ON listings FOR ALL
  USING (vendor_id = auth.uid());

-- Shops: public read
CREATE POLICY "public read shops"
  ON shops FOR SELECT
  USING (deleted_at IS NULL);

-- Shops: vendor owns their shop
CREATE POLICY "vendor manage own shop"
  ON shops FOR ALL
  USING (vendor_id = auth.uid());

-- Users: own record only
CREATE POLICY "user read own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "user update own record"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Contact taps: insert own, no read for non-admin
CREATE POLICY "authenticated insert contact tap"
  ON contact_taps FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Reports: insert own
CREATE POLICY "authenticated insert report"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
```

---

## Migration rules

1. **Never edit a committed migration.** Write a new one.
2. **Every migration is reversible.** Include a `-- DOWN:` comment block with the rollback SQL, even if you never expect to run it.
3. **Test migrations against a local Supabase instance** (`supabase db reset`) before pushing.
4. **No data migrations mixed with schema migrations.** Separate files.
5. **Enum changes via new column, not ALTER TYPE.** Postgres `ALTER TYPE ... ADD VALUE` cannot be rolled back within a transaction.

```sql
-- DOWN:
-- DROP INDEX IF EXISTS idx_listings_shop_status;
-- ALTER TABLE listings DROP COLUMN IF EXISTS night_market;
```

---

## Soft delete convention

All deletes set `deleted_at = NOW()`. No hard deletes in application code.

Every query filtering a soft-deletable table must include `deleted_at IS NULL` — enforced via a linter rule in code review.

The one exception: anonymised user records set `deleted_at` but retain the row for referential integrity. PII fields are overwritten, not nulled, so foreign keys remain valid.

---

## v2 additions (not implemented in v1)

```sql
-- Transaction table — deferred to v2
-- CREATE TABLE transactions (
--   id             UUID PRIMARY KEY,
--   listing_id     UUID REFERENCES listings(id),
--   buyer_id       UUID REFERENCES users(id),
--   vendor_id      UUID REFERENCES users(id),
--   amount         NUMERIC(10,2),
--   currency       TEXT DEFAULT 'NGN',
--   status         TEXT,   -- pending, completed, disputed, refunded
--   gateway_ref    TEXT,
--   created_at     TIMESTAMPTZ,
--   updated_at     TIMESTAMPTZ
-- );
```

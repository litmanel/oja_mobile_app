# api-router-scaffold.md

Scaffold and conventions for Supabase Edge Function API routes.

---

## Function structure

```
supabase/functions/
  _shared/
    auth.ts          # JWT verification helper
    response.ts      # ok() / error() response helpers
    validate.ts      # shared field validators
  create-listing/
    index.ts
  update-listing/
    index.ts
  record-contact-tap/
    index.ts
  submit-report/
    index.ts
  moderate-listing/
    index.ts         # admin only
```

One directory per action. No multi-method routers — each function has one job.

---

## Response shape

All responses follow this contract. Client code can always destructure `{ data, error }`.

```ts
// _shared/response.ts

export const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ data, error: null }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const error = (status: number, message: string) =>
  new Response(JSON.stringify({ data: null, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
```

---

## Auth helper

```ts
// _shared/auth.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function requireAuth(req: Request) {
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!jwt) throw new Error('UNAUTHORIZED');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('UNAUTHORIZED');

  return { supabase, user };
}

export async function requireAdmin(req: Request) {
  const { supabase, user } = await requireAuth(req);
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (data?.role !== 'admin') throw new Error('FORBIDDEN');
  return { supabase, user };
}
```

---

## Function scaffold

```ts
// supabase/functions/create-listing/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';
import { requireAuth } from '../_shared/auth.ts';
import { ok, error } from '../_shared/response.ts';
import { validateCreateListing } from '../_shared/validate.ts';

serve(async (req: Request) => {
  if (req.method !== 'POST') return error(405, 'Method not allowed');

  try {
    const { supabase, user } = await requireAuth(req);
    const body = await req.json();

    const validated = validateCreateListing(body);
    if (!validated.ok) return error(400, validated.message);

    // Enforce listing limit per category
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', validated.data.shopId)
      .eq('status', 'active');

    const limit = validated.data.category === 'food' ? 15 : 10;
    if ((count ?? 0) >= limit) return error(422, 'Listing limit reached');

    const { data: listing, error: dbError } = await supabase
      .from('listings')
      .insert({ ...validated.data, vendor_id: user.id })
      .select()
      .single();

    if (dbError) return error(500, 'Failed to create listing');
    return ok(listing, 201);

  } catch (e) {
    if (e.message === 'UNAUTHORIZED') return error(401, 'Unauthorized');
    if (e.message === 'FORBIDDEN')    return error(403, 'Forbidden');
    return error(500, 'Internal server error');
  }
});
```

---

## Validation helpers

```ts
// _shared/validate.ts

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

const UNIT_LABELS = ['kg', 'g', 'litre', 'piece', 'bag', 'bunch', 'custom'] as const;
const CATEGORIES  = ['food', 'clothing', 'household', 'electronics', 'other'] as const;

export function validateCreateListing(body: unknown): ValidationResult<CreateListingInput> {
  if (typeof body !== 'object' || body === null) 
    return { ok: false, message: 'Invalid request body' };

  const b = body as Record<string, unknown>;

  if (typeof b.name !== 'string' || b.name.length < 3 || b.name.length > 80)
    return { ok: false, message: 'name must be 3–80 characters' };

  if (typeof b.price !== 'number' || b.price <= 0 || b.price > 9_999_999)
    return { ok: false, message: 'price must be a positive number up to 9,999,999' };

  if (!UNIT_LABELS.includes(b.unit_label as typeof UNIT_LABELS[number]))
    return { ok: false, message: 'invalid unit_label' };

  if (!CATEGORIES.includes(b.category as typeof CATEGORIES[number]))
    return { ok: false, message: 'invalid category' };

  return { ok: true, data: b as CreateListingInput };
}
```

---

## Endpoint reference

| Function | Method | Auth | Description |
|----------|--------|------|-------------|
| `create-listing` | POST | Required | Create a listing. Enforces category listing limits. |
| `update-listing` | PATCH | Required (owner) | Update listing fields. Cannot change `vendor_id`. |
| `delete-listing` | DELETE | Required (owner) | Soft delete — sets `deleted_at`. |
| `record-contact-tap` | POST | Required | Log a contact tap. Triggers WhatsApp open on client. |
| `submit-report` | POST | Required | Submit a listing report. Triggers moderation agent if threshold met. |
| `moderate-listing` | POST | Admin only | Hide, reinstate, or escalate a listing. |
| `suspend-vendor` | POST | Admin only | Suspend vendor account. Triggers WhatsApp alert. |
| `generate-upload-url` | POST | Required | Returns a signed Cloudinary upload URL (60 s TTL). |

---

## Response time targets (P95)

| Endpoint type | Target |
|---------------|--------|
| Listing browse / search | ≤400 ms |
| Listing create / update | ≤600 ms |
| Auth OTP verify | ≤800 ms |
| Signed URL generation | ≤500 ms |

Measure at the Edge Function boundary, not the client.

# AGENTS.md

Defines every AI agent or automated worker in the Oja Market system: what it owns, what it must not touch, and how it fails.

---

## 1. Listing Expiry Agent

**Trigger:** Cron — daily at 20:50 WAT (10 min before close)  
**Owns:** `listings.status` transitions → `active` → `expired`  
**Query:**
```sql
UPDATE listings
SET status = 'expired', updated_at = NOW()
WHERE status = 'active'
  AND DATE(created_at) < CURRENT_DATE;
```
**Must not:** Delete listings. Modify vendor accounts. Touch `ContactTap` or `Report` tables.  
**On failure:** Log to `worker_errors`. Retry once after 2 min. Alert admin via push if second attempt fails.

---

## 2. Auto-Close Agent

**Trigger:** Cron — daily at 21:00 WAT  
**Owns:** Sets `shops.is_open = false` for all non-night-market shops.  
**Exception:** Shops with `night_market = true` are skipped entirely.  
**Must not:** Auto-open shops. Only vendors open their own shop manually.  
**Rationale:** Auto-open causes stale listings to appear active. The cost of a vendor manually opening is lower than the cost of buyer trust loss from seeing closed-but-shown stalls.  
**On failure:** Log + alert. Do not retry silently — a missed close is visible to buyers.

---

## 3. Moderation Agent

**Trigger:** Event-driven — fires when `reports.count >= 3` on a single listing within 24 h.  
**Owns:** Sets `listings.status = 'hidden_flagged'`. Creates admin queue entry.  
**Must not:** Suspend vendors. Send WhatsApp messages. Delete content.  
**False-reporter detection:** If the same `reporter_id` accounts for ≥2 of 3 reports, flag the report cluster for human review instead of auto-hiding.  
**On failure:** Leave listing visible. Log. Do not silently swallow — a failed hide is a moderation gap.

---

## 4. Notification Dispatcher

**Trigger:** Event queue (listing expiry warnings, account alerts, flag notifications).  
**Owns:** Push notification delivery. WhatsApp delivery for account-critical events only.  
**Rate limit:** Max 3 non-critical push notifications per vendor per day.  
**WhatsApp events (account-critical only):**
- New-device login alert
- Account suspension notice
- Appeal outcome

**Must not:** Send marketing messages. Send weekly summaries (v2). Exceed WhatsApp free tier without explicit budget approval (free tier exhausted at ~500 vendors in 2 days).  
**Batching:** If multiple flags fire simultaneously for one vendor, batch into a single notification.

---

## 5. Image Upload Worker

**Trigger:** Vendor submits listing with image.  
**Owns:** Validates file type (JPEG/PNG/WebP only), enforces 5 MB upload limit, generates Cloudinary signed URL, stores returned `public_id` on `listings.image_url`.  
**Cloudinary tier switch:** At 150 active vendors, evaluate upgrade from free tier (see architecture.md).  
**Must not:** Accept unsigned uploads. Store raw files on the application server.  
**On failure:** Return user-facing error. Do not create the listing record without a valid `image_url`.

---

## 6. Account Recovery Worker

**Trigger:** Manual — initiated by support staff after human verification.  
**Owns:** Phone number reassignment on a vendor account.  
**Process:** Support confirms identity via market association contact or in-person verification → creates recovery token → worker reassigns `users.phone` → invalidates all existing sessions.  
**Must not:** Be automated. No OTP-only recovery (SIM swap risk — partially unmitigated in v1, full mitigation is v2).  
**Audit:** Every reassignment writes an immutable log entry.

---

## 7. Data Deletion Worker

**Trigger:** Manual request from user (NDPA compliance).  
**Owns:** Anonymises PII fields on `users`, `shops`. Sets `deleted_at`.  
**Must not:** Delete `contact_taps` or transaction-adjacent records within CBN-mandated retention window.  
**Process:**
1. Set `users.phone = 'DELETED_<uuid>'`, `users.display_name = 'Deleted User'`
2. Set `shops.deleted_at = NOW()`
3. Soft-delete all associated listings
4. Retain anonymised aggregates for analytics

---

## Agent failure contract

All agents follow this contract:

| Condition | Action |
|-----------|--------|
| First failure | Log to `worker_errors`, retry once |
| Second failure | Log, push alert to admin |
| Unrecoverable | Log with full context, stop — no silent swallow |

Agents never write to tables outside their defined ownership. Cross-table side effects go through the application service layer, not directly from worker code.

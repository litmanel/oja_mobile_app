-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_inquiry_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_flags ENABLE ROW LEVEL SECURITY;

-- Default Deny (Postgres default when RLS is enabled, but good to be explicit if needed, 
-- or we just define explicit allow policies).
-- Below are the default policies:

-- Users: read own, update own
CREATE POLICY "users_read_own" ON users FOR SELECT USING (id = current_setting('request.jwt.claim.sub', true)::uuid);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Vendors: public read, vendor manage own
CREATE POLICY "vendors_public_read" ON vendors FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "vendors_manage_own" ON vendors FOR ALL USING (user_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Listings: public read active, vendor manage own
CREATE POLICY "listings_public_read" ON listings FOR SELECT USING (status = 'active' AND deleted_at IS NULL);
CREATE POLICY "listings_manage_own" ON listings FOR ALL USING (user_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Orders: buyer/vendor can read their own
CREATE POLICY "orders_read_buyer" ON orders FOR SELECT USING (buyer_id = current_setting('request.jwt.claim.sub', true)::uuid);
CREATE POLICY "orders_read_vendor" ON orders FOR SELECT USING (vendor_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Reviews: public read, buyer manage own
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_manage_own" ON reviews FOR ALL USING (reviewer_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- WhatsApp Inquiry Log: authenticated insert, no read for public
CREATE POLICY "whatsapp_inquiry_log_insert" ON whatsapp_inquiry_log FOR INSERT WITH CHECK (current_setting('request.jwt.claim.sub', true) IS NOT NULL);

-- Admin Flags: authenticated insert
CREATE POLICY "admin_flags_insert" ON admin_flags FOR INSERT WITH CHECK (reporter_id = current_setting('request.jwt.claim.sub', true)::uuid);

-- Admins can bypass RLS for reading (if they use a service role key or a specific claim)
-- This might need tuning depending on exact auth implementation, but standard RLS is set up.

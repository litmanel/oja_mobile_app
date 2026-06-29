# Oja Ogbomoso — Product Requirements Document (PRD)

> **Revision Note:** This PRD supports two viable MVP paths. MVP A validates demand through discovery and WhatsApp. MVP B validates demand and monetization simultaneously by adding Flutterwave/Paystack payments. Both paths are valid; payments are not removed from scope.

---

## MVP Path Options

### MVP A — Discovery Marketplace (Lowest Risk)
- Vendor profiles
- Product listings
- Search and browse
- WhatsApp inquiries

**Goal:** Validate demand.

### MVP B — Transaction Marketplace (Higher Ambition)
- Everything in MVP A
- Flutterwave/Paystack payments
- Simple order tracking

**Goal:** Validate demand and monetization simultaneously.

---

# 1. Product Overview

Oja Ogbomoso is a mobile-first marketplace for Ogbomoso residents and local vendors. Vendors create digital storefronts, upload product photos, display available stock, receive customer inquiries through WhatsApp, and optionally accept payments through Flutterwave or Paystack. The platform helps small businesses increase visibility beyond physical markets while allowing buyers to discover trusted local sellers and products from their phones.

---

# 2. Objectives

## Primary Objectives

1. Enable local vendors to establish an online presence in under 10 minutes.
2. Help customers discover local products available within Ogbomoso.
3. Generate qualified buyer inquiries for vendors.
4. Facilitate secure digital payments when buyers choose to transact online.

## Secondary Objectives

1. Build a trusted directory of verified local businesses.
2. Increase repeat purchases between buyers and vendors.
3. Create a foundation for future marketplace services such as delivery and promotions.

---

# 3. Target Users

## Primary Vendor Segment

### Market and Shop Owners

Characteristics:
- Operate physical businesses in Ogbomoso.
- Use Android smartphones daily.
- Depend heavily on walk-in customers and WhatsApp.
- Have little or no website presence.

Examples:
- Foodstuff sellers
- Fashion retailers
- Electronics sellers
- Cosmetics vendors

## Primary Buyer Segment

### Local Residents

Characteristics:
- Live within Ogbomoso and surrounding communities.
- Use smartphones for daily communication.
- Frequently search for nearby products.
- Prefer trusted local sellers.

## Secondary Buyer Segment

### Students

Characteristics:
- Price-sensitive.
- Mobile-first.
- Need fast access to local products and services.

---

# 4. Core Features

## 1. Vendor Storefronts

- Shop name
- Shop description
- Shop photo
- Physical location
- Business hours
- WhatsApp contact button

## 2. Product Listings

- Product image
- Product name
- Price
- Category
- Stock status (Available / Out of Stock)
- Product description

## 3. Product Discovery

- Browse by category
- Search by product name
- Search by vendor name
- View vendor profile

## 4. WhatsApp Inquiry

- One-tap WhatsApp contact
- Pre-filled inquiry message
- Direct communication between buyer and vendor

## 5. Payments

- Flutterwave integration
- Paystack integration
- Online payment checkout
- Payment confirmation
- Transaction reference generation

---

# 5. User Flow

## Vendor

1. Register with phone number.
2. Verify OTP.
3. Create storefront.
4. Upload products.
5. Publish storefront.
6. Receive inquiries.
7. Receive payments when applicable.

## Buyer

1. Open app.
2. Search or browse products.
3. View product details.
4. View vendor profile.
5. Contact vendor via WhatsApp or proceed to payment.
6. Receive confirmation.
7. Coordinate pickup or delivery directly with vendor.

---

# 6. Data Models / Schemas

## User

```json
{
  "id": "uuid",
  "role": "vendor|buyer",
  "name": "string",
  "phone": "string",
  "created_at": "datetime"
}
```

## Vendor

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "shop_name": "string",
  "description": "string",
  "address": "string",
  "whatsapp_number": "string",
  "verification_status": "pending|verified"
}
```

## Product

```json
{
  "id": "uuid",
  "vendor_id": "uuid",
  "name": "string",
  "description": "string",
  "price": "decimal",
  "category": "string",
  "image_url": "string",
  "stock_status": "available|out_of_stock"
}
```

## Payment

```json
{
  "id": "uuid",
  "buyer_id": "uuid",
  "vendor_id": "uuid",
  "amount": "decimal",
  "gateway": "flutterwave|paystack",
  "status": "pending|successful|failed",
  "reference": "string"
}
```

---

# 7. System Behavior

1. Published products become immediately searchable.
2. Out-of-stock products remain visible but are labeled.
3. Product edits appear in real time.
4. Failed payments do not generate successful transactions.
5. Duplicate phone registrations are prevented.
6. Vendor profiles remain public unless suspended by administrators.
7. Search prioritizes exact keyword matches.

---

# 8. Notifications Logic

## Vendor Notifications

Triggers:
- New buyer inquiry
- Successful payment
- Verification approval

Channels:
- Push notification
- In-app notification

## Buyer Notifications

Triggers:
- Successful payment
- Failed payment
- Payment receipt

Channels:
- Push notification
- In-app notification

---

# 9. Edge Cases

1. **Vendor deletes a product after customer discovery.**
   - Product disappears from search results immediately.

2. **Invalid WhatsApp number.**
   - Vendor profile cannot be published.

3. **Payment gateway timeout.**
   - Transaction remains pending until verification.

4. **Duplicate payment attempts.**
   - Detect through payment reference.

5. **Product image upload failure.**
   - Retry upload and preserve draft listing.

6. **Vendor account suspension.**
   - Products become unavailable.

---

# 10. Security & Compliance

1. OTP-based authentication.
2. HTTPS encryption.
3. Secure password hashing where passwords exist.
4. Payment processing through Flutterwave and Paystack.
5. Role-based permissions.
6. Webhook signature verification.
7. NDPA-compliant data handling.
8. Daily database backups.
9. Rate-limited APIs.

---

# 11. Market Intelligence

## Existing Alternatives

- Facebook Marketplace
- WhatsApp Business
- Jiji

## Market Gap

- No dedicated marketplace focused on Ogbomoso.
- Product discovery remains fragmented across WhatsApp groups and social media.
- Small vendors struggle to maintain visibility.

## Competitive Advantage

- Hyperlocal focus.
- Vendor storefronts.
- WhatsApp-native communication.
- Mobile-first experience optimized for local commerce.

---

# 12. Technical Recommendations

| Layer            | Technology                    |
|------------------|-------------------------------|
| Mobile App       | Flutter                       |
| Backend          | NestJS + REST APIs            |
| Database         | PostgreSQL                    |
| File Storage     | Cloudflare R2                 |
| Authentication   | OTP via phone number          |
| Payments         | Flutterwave + Paystack        |
| Notifications    | Firebase Cloud Messaging      |
| Hosting          | DigitalOcean                  |
| Analytics        | Firebase Analytics            |

---

# 13. Success Metrics / KPIs

## Supply Metrics

- Total registered vendors
- Active vendors
- Vendor activation rate
- Products listed per vendor

## Demand Metrics

- Monthly active buyers
- Search-to-product-view rate
- Product-view-to-WhatsApp-contact rate

## Marketplace Metrics

- Total buyer inquiries
- Vendor response rate
- Repeat buyer rate

## Transaction Metrics

- Number of successful payments
- Payment success rate
- Total transaction volume

## Platform Metrics

- App crash rate
- API uptime
- Notification delivery success rate

---

## Out of Scope (Phase 2 / Phase 3)

The following features are explicitly excluded from V1:

- Delivery management
- Inventory synchronization
- Advanced analytics
- Recommendation engines
- Ranking algorithms
- Logistics operations

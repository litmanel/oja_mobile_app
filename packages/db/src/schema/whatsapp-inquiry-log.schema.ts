import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { listings } from './listings.schema';
import { users } from './users.schema';
import { vendors } from './vendors.schema';

export const whatsappInquiryLog = pgTable('whatsapp_inquiry_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  buyerId: uuid('buyer_id').references(() => users.id),
  tappedAt: timestamp('tapped_at', { withTimezone: true }).defaultNow().notNull(),
});

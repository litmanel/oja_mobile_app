import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { listings } from './listings.schema';
import { users } from './users.schema';
import { vendors } from './vendors.schema';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  buyerId: uuid('buyer_id').notNull().references(() => users.id),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  amountKobo: integer('amount_kobo').notNull(),
  currency: text('currency').default('NGN').notNull(),
  gateway: text('gateway', { enum: ['flutterwave', 'paystack'] }),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed', 'refunded'] }).default('pending').notNull(),
  reference: text('reference'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

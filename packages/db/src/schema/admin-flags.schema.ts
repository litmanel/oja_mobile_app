import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { listings } from './listings.schema';
import { users } from './users.schema';

export const adminFlags = pgTable('admin_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  listingId: uuid('listing_id').notNull().references(() => listings.id),
  reporterId: uuid('reporter_id').notNull().references(() => users.id),
  reason: text('reason', { enum: ['wrong_price', 'inactive_vendor', 'offensive', 'spam', 'other'] }).notNull(),
  status: text('status', { enum: ['pending', 'reviewed', 'dismissed'] }).default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

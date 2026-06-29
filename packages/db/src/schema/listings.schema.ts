import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { vendors } from './vendors.schema';

export const listings = pgTable('listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  priceKobo: integer('price_kobo').notNull(),
  unitLabel: text('unit_label', { enum: ['kg', 'g', 'litre', 'piece', 'bag', 'bunch', 'custom'] }).notNull(),
  unitCustom: text('unit_custom'),
  quantity: integer('quantity').notNull(),
  category: text('category', { enum: ['food', 'clothing', 'household', 'electronics', 'other'] }).notNull(),
  imageUrl: text('image_url'),
  status: text('status', { enum: ['active', 'expired', 'hidden_flagged', 'deleted'] }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

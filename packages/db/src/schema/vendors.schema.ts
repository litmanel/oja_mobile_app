import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shopName: text('shop_name').notNull(),
  description: text('description'),
  address: text('address'),
  whatsappNumber: text('whatsapp_number'),
  verificationStatus: text('verification_status', { enum: ['pending', 'verified'] }).default('pending').notNull(),
  marketName: text('market_name', { enum: ['bodija', 'kuto', 'eke_awka', 'other'] }),
  marketNameCustom: text('market_name_custom'),
  stallNumber: text('stall_number'),
  isOpen: boolean('is_open').default(false).notNull(),
  contactEmail: text('contact_email'),
  nightMarket: boolean('night_market').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

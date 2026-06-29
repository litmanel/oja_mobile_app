import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const tokenBlacklist = pgTable('token_blacklist', {
  id: uuid('id').defaultRandom().primaryKey(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const otpAttempts = pgTable('otp_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

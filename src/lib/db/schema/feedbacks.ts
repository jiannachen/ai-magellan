import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const feedbacks = pgTable('feedbacks', {
  id: text('id').primaryKey(),
  name: text('name'),
  content: text('content').notNull(),
  source: text('source'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  status: text('status').notNull().default('new'),
});

import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const feedbacks = sqliteTable('feedbacks', {
  id: text('id').primaryKey(),
  name: text('name'),
  content: text('content').notNull(),
  source: text('source'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  status: text('status').notNull().default('new'),
});

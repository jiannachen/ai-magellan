import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const footerLinks = sqliteTable('footer_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  isExternal: integer('is_external').notNull().default(1), // SQLite: 0/1 for boolean
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  urlIdx: index('footer_links_url_idx').on(table.url),
}));

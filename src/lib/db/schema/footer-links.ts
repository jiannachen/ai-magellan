import { pgTable, serial, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const footerLinks = pgTable('footer_links', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  isExternal: boolean('is_external').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  urlIdx: index('footer_links_url_idx').on(table.url),
}));

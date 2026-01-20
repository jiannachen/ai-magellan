import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { websites } from './websites';
import { categories } from './categories';

export const websiteCategories = sqliteTable('website_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  websiteId: integer('website_id').notNull(),
  categoryId: integer('category_id').notNull(),
  isPrimary: integer('is_primary').notNull().default(0), // SQLite: 0/1 for boolean
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  websiteIdIdx: index('website_categories_website_id_idx').on(table.websiteId),
  categoryIdIdx: index('website_categories_category_id_idx').on(table.categoryId),
  isPrimaryIdx: index('website_categories_is_primary_idx').on(table.isPrimary),
  websitePrimaryIdx: index('website_categories_website_primary_idx').on(table.websiteId, table.isPrimary),
  websiteCategoryUnique: uniqueIndex('website_categories_website_id_category_id_key').on(table.websiteId, table.categoryId),
}));

// Relations
export const websiteCategoriesRelations = relations(websiteCategories, ({ one }) => ({
  website: one(websites, {
    fields: [websiteCategories.websiteId],
    references: [websites.id],
  }),
  category: one(categories, {
    fields: [websiteCategories.categoryId],
    references: [categories.id],
  }),
}));

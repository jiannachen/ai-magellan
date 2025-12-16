import { pgTable, serial, integer, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { websites } from './websites';
import { categories } from './categories';

export const websiteCategories = pgTable('website_categories', {
  id: serial('id').primaryKey(),
  websiteId: integer('website_id').notNull(),
  categoryId: integer('category_id').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  websiteIdIdx: index('website_categories_website_id_idx').on(table.websiteId),
  categoryIdIdx: index('website_categories_category_id_idx').on(table.categoryId),
  isPrimaryIdx: index('website_categories_is_primary_idx').on(table.isPrimary),
  websitePrimaryIdx: index('website_categories_website_primary_idx').on(table.websiteId, table.isPrimary),
  websiteCategoryUnique: unique('website_categories_website_id_category_id_key').on(table.websiteId, table.categoryId),
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

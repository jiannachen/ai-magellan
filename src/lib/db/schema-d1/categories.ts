import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { websiteCategories } from './website-categories';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en'),
  nameZh: text('name_zh'),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
}));

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'children',
  }),
  children: many(categories, {
    relationName: 'children',
  }),
  websiteCategories: many(websiteCategories),
}));

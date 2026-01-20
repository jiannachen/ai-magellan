import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { websiteLikes, websiteFavorites, websiteReviews } from './website-interactions';
import { websites } from './websites';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
  role: text('role').notNull().default('user'),
  locale: text('locale').notNull().default('zh-CN'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  status: text('status').notNull().default('active'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  likes: many(websiteLikes),
  favorites: many(websiteFavorites),
  reviews: many(websiteReviews),
  submittedWebsites: many(websites),
}));

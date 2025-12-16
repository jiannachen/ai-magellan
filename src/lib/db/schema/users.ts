import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { websiteLikes, websiteFavorites, websiteReviews } from './website-interactions';
import { websites } from './websites';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  image: text('image'),
  role: text('role').notNull().default('user'),
  locale: text('locale').notNull().default('zh-CN'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  status: text('status').notNull().default('active'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  likes: many(websiteLikes),
  favorites: many(websiteFavorites),
  reviews: many(websiteReviews),
  submittedWebsites: many(websites),
}));

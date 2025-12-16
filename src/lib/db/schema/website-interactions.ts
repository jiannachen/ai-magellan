import { pgTable, text, timestamp, integer, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { websites } from './websites';
import { users } from './users';

export const websiteLikes = pgTable('website_likes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  websiteId: integer('website_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('website_likes_user_id_idx').on(table.userId),
  websiteIdIdx: index('website_likes_website_id_idx').on(table.websiteId),
  userWebsiteUnique: unique('website_likes_user_id_website_id_key').on(table.userId, table.websiteId),
}));

export const websiteFavorites = pgTable('website_favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  websiteId: integer('website_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('website_favorites_user_id_idx').on(table.userId),
  websiteIdIdx: index('website_favorites_website_id_idx').on(table.websiteId),
  userWebsiteUnique: unique('website_favorites_user_id_website_id_key').on(table.userId, table.websiteId),
}));

export const websiteReviews = pgTable('website_reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  websiteId: integer('website_id').notNull(),
  rating: integer('rating').notNull().default(5),
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('website_reviews_user_id_idx').on(table.userId),
  websiteIdIdx: index('website_reviews_website_id_idx').on(table.websiteId),
  ratingIdx: index('website_reviews_rating_idx').on(table.rating),
  userCreatedIdx: index('website_reviews_user_created_idx').on(table.userId, table.createdAt),
  userWebsiteUnique: unique('website_reviews_user_id_website_id_key').on(table.userId, table.websiteId),
}));

// Relations
export const websiteLikesRelations = relations(websiteLikes, ({ one }) => ({
  user: one(users, {
    fields: [websiteLikes.userId],
    references: [users.id],
  }),
  website: one(websites, {
    fields: [websiteLikes.websiteId],
    references: [websites.id],
  }),
}));

export const websiteFavoritesRelations = relations(websiteFavorites, ({ one }) => ({
  user: one(users, {
    fields: [websiteFavorites.userId],
    references: [users.id],
  }),
  website: one(websites, {
    fields: [websiteFavorites.websiteId],
    references: [websites.id],
  }),
}));

export const websiteReviewsRelations = relations(websiteReviews, ({ one }) => ({
  user: one(users, {
    fields: [websiteReviews.userId],
    references: [users.id],
  }),
  website: one(websites, {
    fields: [websiteReviews.websiteId],
    references: [websites.id],
  }),
}));

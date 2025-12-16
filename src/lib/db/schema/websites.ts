import { pgTable, serial, text, timestamp, integer, boolean, json, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { websiteCategories } from './website-categories';
import { websiteLikes, websiteFavorites, websiteReviews } from './website-interactions';
import { users } from './users';

export const websites = pgTable('websites', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull().unique(),
  description: text('description').notNull(),
  categoryId: integer('category_id'), // 保留旧字段,系统不再使用
  thumbnail: text('thumbnail'),
  status: text('status').notNull().default('pending'),
  visits: integer('visits').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  active: integer('active').notNull().default(1),
  qualityScore: integer('quality_score').notNull().default(50),
  isTrusted: boolean('is_trusted').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  weight: integer('weight').notNull().default(1),
  tags: text('tags').array().notNull().default([]),
  email: text('email'),
  tagline: text('tagline'),
  features: json('features').default([]),
  pricingModel: text('pricing_model').notNull().default('free'),
  hasFreeVersion: boolean('has_free_version').notNull().default(false),
  basePrice: text('base_price'),
  twitterUrl: text('twitter_url'),
  domainAuthority: integer('domain_authority'),
  lastChecked: timestamp('last_checked', { withTimezone: true }),
  responseTime: integer('response_time'),
  sslEnabled: boolean('ssl_enabled').notNull().default(true),
  submittedBy: text('submitted_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  alternatives: json('alternatives').default([]),
  apiAvailable: boolean('api_available').notNull().default(false),
  changelog: text('changelog'),
  detailedDescription: text('detailed_description'),
  discordUrl: text('discord_url'),
  faq: json('faq').default([]),
  githubUrl: text('github_url'),
  integrations: json('integrations').default([]),
  languagesSupported: json('languages_supported').default([]),
  linkedinUrl: text('linkedin_url'),
  logoUrl: text('logo_url'),
  prosCons: json('pros_cons').default({}),
  screenshots: json('screenshots').default([]),
  supportedPlatforms: json('supported_platforms').default([]),
  targetAudience: json('target_audience').default([]),
  useCases: json('use_cases').default([]),
  videoUrl: text('video_url'),
  androidAppUrl: text('android_app_url'),
  desktopPlatforms: json('desktop_platforms').default([]),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  iosAppUrl: text('ios_app_url'),
  pricingPlans: json('pricing_plans').default([]),
  webAppUrl: text('web_app_url'),
  youtubeUrl: text('youtube_url'),
}, (table) => ({
  // Single-column indexes
  categoryIdIdx: index('websites_category_id_idx').on(table.categoryId),
  statusIdx: index('websites_status_idx').on(table.status),
  qualityScoreIdx: index('websites_quality_score_idx').on(table.qualityScore),
  isTrustedIdx: index('websites_is_trusted_idx').on(table.isTrusted),
  isFeaturedIdx: index('websites_is_featured_idx').on(table.isFeatured),
  submittedByIdx: index('websites_submitted_by_idx').on(table.submittedBy),
  pricingModelIdx: index('websites_pricing_model_idx').on(table.pricingModel),
  hasFreeVersionIdx: index('websites_has_free_version_idx').on(table.hasFreeVersion),
  slugIdx: index('websites_slug_idx').on(table.slug),

  // Composite indexes for common query patterns
  // Query by status + quality (for rankings)
  statusQualityIdx: index('websites_status_quality_idx').on(table.status, table.qualityScore),
  // Query by status + featured (for homepage)
  statusFeaturedIdx: index('websites_status_featured_idx').on(table.status, table.isFeatured),
  // Query by status + pricing (for free tools ranking)
  statusPricingIdx: index('websites_status_pricing_idx').on(table.status, table.pricingModel),
  // Query by status + created_at (for recent websites)
  statusCreatedIdx: index('websites_status_created_idx').on(table.status, table.createdAt),
}));

// Relations
export const websitesRelations = relations(websites, ({ one, many }) => ({
  websiteCategories: many(websiteCategories),
  likes: many(websiteLikes),
  favorites: many(websiteFavorites),
  reviews: many(websiteReviews),
  submitter: one(users, {
    fields: [websites.submittedBy],
    references: [users.id],
  }),
}));

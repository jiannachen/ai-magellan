import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { websiteCategories } from './website-categories';
import { websiteLikes, websiteFavorites, websiteReviews } from './website-interactions';
import { users } from './users';

export const websites = sqliteTable('websites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull().unique(),
  description: text('description').notNull(),
  categoryId: integer('category_id'),
  thumbnail: text('thumbnail'),
  status: text('status').notNull().default('pending'),
  visits: integer('visits').notNull().default(0),
  likes: integer('likes').notNull().default(0),
  active: integer('active').notNull().default(1),
  qualityScore: integer('quality_score').notNull().default(50),
  isTrusted: integer('is_trusted').notNull().default(0), // SQLite: 0/1 for boolean
  isFeatured: integer('is_featured').notNull().default(0),
  weight: integer('weight').notNull().default(1),
  tags: text('tags').notNull().default('[]'), // JSON string array
  email: text('email'),
  tagline: text('tagline'),
  features: text('features').default('[]'), // JSON string
  pricingModel: text('pricing_model').notNull().default('free'),
  hasFreeVersion: integer('has_free_version').notNull().default(0),
  basePrice: text('base_price'),
  twitterUrl: text('twitter_url'),
  domainAuthority: integer('domain_authority'),
  lastChecked: text('last_checked'),
  responseTime: integer('response_time'),
  sslEnabled: integer('ssl_enabled').notNull().default(1),
  submittedBy: text('submitted_by'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  alternatives: text('alternatives').default('[]'),
  apiAvailable: integer('api_available').notNull().default(0),
  changelog: text('changelog'),
  detailedDescription: text('detailed_description'),
  discordUrl: text('discord_url'),
  faq: text('faq').default('[]'),
  githubUrl: text('github_url'),
  integrations: text('integrations').default('[]'),
  languagesSupported: text('languages_supported').default('[]'),
  linkedinUrl: text('linkedin_url'),
  logoUrl: text('logo_url'),
  prosCons: text('pros_cons').default('{}'),
  screenshots: text('screenshots').default('[]'),
  supportedPlatforms: text('supported_platforms').default('[]'),
  targetAudience: text('target_audience').default('[]'),
  useCases: text('use_cases').default('[]'),
  videoUrl: text('video_url'),
  androidAppUrl: text('android_app_url'),
  desktopPlatforms: text('desktop_platforms').default('[]'),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  iosAppUrl: text('ios_app_url'),
  pricingPlans: text('pricing_plans').default('[]'),
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
  visitsIdx: index('websites_visits_idx').on(table.visits),
  likesIdx: index('websites_likes_idx').on(table.likes),
  createdAtIdx: index('websites_created_at_idx').on(table.createdAt),
  activeIdx: index('websites_active_idx').on(table.active),

  // Composite indexes for common query patterns
  statusQualityIdx: index('websites_status_quality_idx').on(table.status, table.qualityScore),
  statusFeaturedIdx: index('websites_status_featured_idx').on(table.status, table.isFeatured),
  statusPricingIdx: index('websites_status_pricing_idx').on(table.status, table.pricingModel),
  statusCreatedIdx: index('websites_status_created_idx').on(table.status, table.createdAt),
  statusActiveVisitsIdx: index('websites_status_active_visits_idx').on(table.status, table.active, table.visits),
  statusActiveLikesIdx: index('websites_status_active_likes_idx').on(table.status, table.active, table.likes),
  statusActiveQualityIdx: index('websites_status_active_quality_idx').on(table.status, table.active, table.qualityScore),
  statusActiveCreatedIdx: index('websites_status_active_created_idx').on(table.status, table.active, table.createdAt),
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

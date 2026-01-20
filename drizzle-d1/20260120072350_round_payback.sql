CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`name_en` text,
	`name_zh` text,
	`parent_id` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`content` text NOT NULL,
	`source` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `footer_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`is_external` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `footer_links_url_unique` ON `footer_links` (`url`);--> statement-breakpoint
CREATE INDEX `footer_links_url_idx` ON `footer_links` (`url`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`locale` text DEFAULT 'zh-CN' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `websites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`url` text NOT NULL,
	`description` text NOT NULL,
	`category_id` integer,
	`thumbnail` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`quality_score` integer DEFAULT 50 NOT NULL,
	`is_trusted` integer DEFAULT 0 NOT NULL,
	`is_featured` integer DEFAULT 0 NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`email` text,
	`tagline` text,
	`features` text DEFAULT '[]',
	`pricing_model` text DEFAULT 'free' NOT NULL,
	`has_free_version` integer DEFAULT 0 NOT NULL,
	`base_price` text,
	`twitter_url` text,
	`domain_authority` integer,
	`last_checked` text,
	`response_time` integer,
	`ssl_enabled` integer DEFAULT 1 NOT NULL,
	`submitted_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`alternatives` text DEFAULT '[]',
	`api_available` integer DEFAULT 0 NOT NULL,
	`changelog` text,
	`detailed_description` text,
	`discord_url` text,
	`faq` text DEFAULT '[]',
	`github_url` text,
	`integrations` text DEFAULT '[]',
	`languages_supported` text DEFAULT '[]',
	`linkedin_url` text,
	`logo_url` text,
	`pros_cons` text DEFAULT '{}',
	`screenshots` text DEFAULT '[]',
	`supported_platforms` text DEFAULT '[]',
	`target_audience` text DEFAULT '[]',
	`use_cases` text DEFAULT '[]',
	`video_url` text,
	`android_app_url` text,
	`desktop_platforms` text DEFAULT '[]',
	`facebook_url` text,
	`instagram_url` text,
	`ios_app_url` text,
	`pricing_plans` text DEFAULT '[]',
	`web_app_url` text,
	`youtube_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `websites_slug_unique` ON `websites` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `websites_url_unique` ON `websites` (`url`);--> statement-breakpoint
CREATE INDEX `websites_category_id_idx` ON `websites` (`category_id`);--> statement-breakpoint
CREATE INDEX `websites_status_idx` ON `websites` (`status`);--> statement-breakpoint
CREATE INDEX `websites_quality_score_idx` ON `websites` (`quality_score`);--> statement-breakpoint
CREATE INDEX `websites_is_trusted_idx` ON `websites` (`is_trusted`);--> statement-breakpoint
CREATE INDEX `websites_is_featured_idx` ON `websites` (`is_featured`);--> statement-breakpoint
CREATE INDEX `websites_submitted_by_idx` ON `websites` (`submitted_by`);--> statement-breakpoint
CREATE INDEX `websites_pricing_model_idx` ON `websites` (`pricing_model`);--> statement-breakpoint
CREATE INDEX `websites_has_free_version_idx` ON `websites` (`has_free_version`);--> statement-breakpoint
CREATE INDEX `websites_slug_idx` ON `websites` (`slug`);--> statement-breakpoint
CREATE INDEX `websites_visits_idx` ON `websites` (`visits`);--> statement-breakpoint
CREATE INDEX `websites_likes_idx` ON `websites` (`likes`);--> statement-breakpoint
CREATE INDEX `websites_created_at_idx` ON `websites` (`created_at`);--> statement-breakpoint
CREATE INDEX `websites_active_idx` ON `websites` (`active`);--> statement-breakpoint
CREATE INDEX `websites_status_quality_idx` ON `websites` (`status`,`quality_score`);--> statement-breakpoint
CREATE INDEX `websites_status_featured_idx` ON `websites` (`status`,`is_featured`);--> statement-breakpoint
CREATE INDEX `websites_status_pricing_idx` ON `websites` (`status`,`pricing_model`);--> statement-breakpoint
CREATE INDEX `websites_status_created_idx` ON `websites` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `websites_status_active_visits_idx` ON `websites` (`status`,`active`,`visits`);--> statement-breakpoint
CREATE INDEX `websites_status_active_likes_idx` ON `websites` (`status`,`active`,`likes`);--> statement-breakpoint
CREATE INDEX `websites_status_active_quality_idx` ON `websites` (`status`,`active`,`quality_score`);--> statement-breakpoint
CREATE INDEX `websites_status_active_created_idx` ON `websites` (`status`,`active`,`created_at`);--> statement-breakpoint
CREATE TABLE `website_favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`website_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `website_favorites_user_id_idx` ON `website_favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `website_favorites_website_id_idx` ON `website_favorites` (`website_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_favorites_user_id_website_id_key` ON `website_favorites` (`user_id`,`website_id`);--> statement-breakpoint
CREATE TABLE `website_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`website_id` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `website_likes_user_id_idx` ON `website_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `website_likes_website_id_idx` ON `website_likes` (`website_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_likes_user_id_website_id_key` ON `website_likes` (`user_id`,`website_id`);--> statement-breakpoint
CREATE TABLE `website_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`website_id` integer NOT NULL,
	`rating` integer DEFAULT 5 NOT NULL,
	`comment` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `website_reviews_user_id_idx` ON `website_reviews` (`user_id`);--> statement-breakpoint
CREATE INDEX `website_reviews_website_id_idx` ON `website_reviews` (`website_id`);--> statement-breakpoint
CREATE INDEX `website_reviews_rating_idx` ON `website_reviews` (`rating`);--> statement-breakpoint
CREATE INDEX `website_reviews_user_created_idx` ON `website_reviews` (`user_id`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_reviews_user_id_website_id_key` ON `website_reviews` (`user_id`,`website_id`);--> statement-breakpoint
CREATE TABLE `website_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`website_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	`is_primary` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `website_categories_website_id_idx` ON `website_categories` (`website_id`);--> statement-breakpoint
CREATE INDEX `website_categories_category_id_idx` ON `website_categories` (`category_id`);--> statement-breakpoint
CREATE INDEX `website_categories_is_primary_idx` ON `website_categories` (`is_primary`);--> statement-breakpoint
CREATE INDEX `website_categories_website_primary_idx` ON `website_categories` (`website_id`,`is_primary`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_categories_website_id_category_id_key` ON `website_categories` (`website_id`,`category_id`);
-- Migration: Unify all column names to snake_case (PostgreSQL standard)
-- Date: 2025-12-16
-- Description: Convert all camelCase column names to snake_case for consistency

-- ============================================================================
-- Table: users
-- ============================================================================
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;

-- ============================================================================
-- Table: website_likes
-- ============================================================================
ALTER TABLE website_likes RENAME COLUMN "userId" TO user_id;
ALTER TABLE website_likes RENAME COLUMN "websiteId" TO website_id;
ALTER TABLE website_likes RENAME COLUMN "createdAt" TO created_at;

-- ============================================================================
-- Table: website_favorites
-- ============================================================================
ALTER TABLE website_favorites RENAME COLUMN "userId" TO user_id;
ALTER TABLE website_favorites RENAME COLUMN "websiteId" TO website_id;
ALTER TABLE website_favorites RENAME COLUMN "createdAt" TO created_at;

-- ============================================================================
-- Table: website_reviews
-- ============================================================================
ALTER TABLE website_reviews RENAME COLUMN "userId" TO user_id;
ALTER TABLE website_reviews RENAME COLUMN "websiteId" TO website_id;
ALTER TABLE website_reviews RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE website_reviews RENAME COLUMN "updatedAt" TO updated_at;

-- ============================================================================
-- Table: website_categories
-- ============================================================================
ALTER TABLE website_categories RENAME COLUMN "websiteId" TO website_id;
ALTER TABLE website_categories RENAME COLUMN "categoryId" TO category_id;
ALTER TABLE website_categories RENAME COLUMN "isPrimary" TO is_primary;
ALTER TABLE website_categories RENAME COLUMN "createdAt" TO created_at;

-- ============================================================================
-- Table: websites
-- ============================================================================
ALTER TABLE websites RENAME COLUMN "submittedBy" TO submitted_by;

-- ============================================================================
-- Table: footer_links
-- ============================================================================
ALTER TABLE footer_links RENAME COLUMN "isExternal" TO is_external;

-- ============================================================================
-- Table: feedbacks
-- ============================================================================
ALTER TABLE feedbacks RENAME COLUMN "createdAt" TO created_at;

-- ============================================================================
-- Update Indexes (if needed - most will auto-update with column rename)
-- ============================================================================
-- PostgreSQL automatically updates indexes when columns are renamed
-- This section is for reference only

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Run these queries after migration to verify all columns are snake_case:
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND column_name ~ '[A-Z]'
-- ORDER BY table_name, column_name;
--
-- Expected result: No rows (all column names should be lowercase with underscores)

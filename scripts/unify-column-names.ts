#!/usr/bin/env tsx
/**
 * Migration script to unify all database column names to snake_case
 * This script renames all camelCase columns to snake_case following PostgreSQL conventions
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please check your .env file');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

async function main() {
  console.log('🚀 Starting column name unification migration...\n');

  try {
    // Start transaction
    await sql.begin(async (tx) => {
      console.log('📋 Renaming columns in table: users');
      await tx.unsafe('ALTER TABLE users RENAME COLUMN "createdAt" TO created_at');
      await tx.unsafe('ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at');
      console.log('✅ users table updated\n');

      console.log('📋 Renaming columns in table: website_likes');
      await tx.unsafe('ALTER TABLE website_likes RENAME COLUMN "userId" TO user_id');
      await tx.unsafe('ALTER TABLE website_likes RENAME COLUMN "websiteId" TO website_id');
      await tx.unsafe('ALTER TABLE website_likes RENAME COLUMN "createdAt" TO created_at');
      console.log('✅ website_likes table updated\n');

      console.log('📋 Renaming columns in table: website_favorites');
      await tx.unsafe('ALTER TABLE website_favorites RENAME COLUMN "userId" TO user_id');
      await tx.unsafe('ALTER TABLE website_favorites RENAME COLUMN "websiteId" TO website_id');
      await tx.unsafe('ALTER TABLE website_favorites RENAME COLUMN "createdAt" TO created_at');
      console.log('✅ website_favorites table updated\n');

      console.log('📋 Renaming columns in table: website_reviews');
      await tx.unsafe('ALTER TABLE website_reviews RENAME COLUMN "userId" TO user_id');
      await tx.unsafe('ALTER TABLE website_reviews RENAME COLUMN "websiteId" TO website_id');
      await tx.unsafe('ALTER TABLE website_reviews RENAME COLUMN "createdAt" TO created_at');
      await tx.unsafe('ALTER TABLE website_reviews RENAME COLUMN "updatedAt" TO updated_at');
      console.log('✅ website_reviews table updated\n');

      console.log('📋 Renaming columns in table: website_categories');
      await tx.unsafe('ALTER TABLE website_categories RENAME COLUMN "websiteId" TO website_id');
      await tx.unsafe('ALTER TABLE website_categories RENAME COLUMN "categoryId" TO category_id');
      await tx.unsafe('ALTER TABLE website_categories RENAME COLUMN "isPrimary" TO is_primary');
      await tx.unsafe('ALTER TABLE website_categories RENAME COLUMN "createdAt" TO created_at');
      console.log('✅ website_categories table updated\n');

      console.log('📋 Renaming columns in table: websites');
      await tx.unsafe('ALTER TABLE websites RENAME COLUMN "submittedBy" TO submitted_by');
      console.log('✅ websites table updated\n');

      console.log('📋 Renaming columns in table: footer_links');
      await tx.unsafe('ALTER TABLE footer_links RENAME COLUMN "isExternal" TO is_external');
      console.log('✅ footer_links table updated\n');

      console.log('📋 Renaming columns in table: feedbacks');
      await tx.unsafe('ALTER TABLE feedbacks RENAME COLUMN "createdAt" TO created_at');
      console.log('✅ feedbacks table updated\n');
    });

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Verifying column names...');

    // Verify all columns are now snake_case
    const result = await sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name ~ '[A-Z]'
      ORDER BY table_name, column_name
    `;

    if (result.length === 0) {
      console.log('✅ All column names are now in snake_case format');
    } else {
      console.log('⚠️  Found columns still in camelCase:');
      result.forEach(row => {
        console.log(`  - ${row.table_name}.${row.column_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

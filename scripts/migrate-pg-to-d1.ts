#!/usr/bin/env node
/**
 * PostgreSQL to D1 (SQLite) Data Migration Script
 *
 * This script exports data from PostgreSQL and converts it to D1-compatible SQL.
 *
 * Usage:
 * 1. Set DATABASE_URL environment variable to your PostgreSQL connection string
 * 2. Run: npx tsx scripts/migrate-pg-to-d1.ts
 * 3. The script will generate SQL files in ./drizzle-d1-migrations/
 * 4. Apply migrations to D1: wrangler d1 execute ai-magellan-db --file=./drizzle-d1-migrations/data.sql
 */

import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

const OUTPUT_DIR = './drizzle-d1-migrations';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to escape SQL strings
function escapeSQL(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Array.isArray(value)) return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

// Convert PostgreSQL boolean to SQLite integer
function boolToInt(value: boolean | null): number | null {
  if (value === null) return null;
  return value ? 1 : 0;
}

async function exportTable(tableName: string, columns: string[], transformRow?: (row: Record<string, unknown>) => Record<string, unknown>) {
  console.log(`Exporting table: ${tableName}`);

  const rows = await sql.unsafe(`SELECT * FROM ${tableName}`);

  if (rows.length === 0) {
    console.log(`  No data in ${tableName}`);
    return '';
  }

  const statements: string[] = [];

  for (const row of rows) {
    const transformedRow = transformRow ? transformRow(row as Record<string, unknown>) : row;
    const values = columns.map(col => escapeSQL((transformedRow as Record<string, unknown>)[col]));
    statements.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`);
  }

  console.log(`  Exported ${rows.length} rows from ${tableName}`);
  return statements.join('\n');
}

async function main() {
  console.log('Starting PostgreSQL to D1 migration...\n');

  const allStatements: string[] = [];

  // Add header
  allStatements.push('-- PostgreSQL to D1 Data Migration');
  allStatements.push(`-- Generated at: ${new Date().toISOString()}`);
  allStatements.push('-- Run with: wrangler d1 execute ai-magellan-db --file=./drizzle-d1-migrations/data.sql\n');

  // Export users table
  const usersSQL = await exportTable('users', [
    'id', 'name', 'email', 'image', 'role', 'locale', 'created_at', 'updated_at', 'status'
  ]);
  if (usersSQL) allStatements.push('\n-- Users\n' + usersSQL);

  // Export categories table
  const categoriesSQL = await exportTable('categories', [
    'id', 'name', 'slug', 'name_en', 'name_zh', 'parent_id', 'sort_order', 'created_at', 'updated_at'
  ]);
  if (categoriesSQL) allStatements.push('\n-- Categories\n' + categoriesSQL);

  // Export websites table with transformations
  const websitesSQL = await exportTable('websites', [
    'id', 'title', 'slug', 'url', 'description', 'category_id', 'thumbnail', 'status',
    'visits', 'likes', 'active', 'quality_score', 'is_trusted', 'is_featured', 'weight',
    'tags', 'email', 'tagline', 'features', 'pricing_model', 'has_free_version',
    'base_price', 'twitter_url', 'domain_authority', 'last_checked', 'response_time',
    'ssl_enabled', 'submitted_by', 'created_at', 'updated_at', 'alternatives',
    'api_available', 'changelog', 'detailed_description', 'discord_url', 'faq',
    'github_url', 'integrations', 'languages_supported', 'linkedin_url', 'logo_url',
    'pros_cons', 'screenshots', 'supported_platforms', 'target_audience', 'use_cases',
    'video_url', 'android_app_url', 'desktop_platforms', 'facebook_url', 'instagram_url',
    'ios_app_url', 'pricing_plans', 'web_app_url', 'youtube_url'
  ], (row) => ({
    ...row,
    // Convert booleans to integers
    is_trusted: boolToInt(row.is_trusted as boolean | null),
    is_featured: boolToInt(row.is_featured as boolean | null),
    has_free_version: boolToInt(row.has_free_version as boolean | null),
    ssl_enabled: boolToInt(row.ssl_enabled as boolean | null),
    api_available: boolToInt(row.api_available as boolean | null),
    // Convert arrays to JSON strings if they're arrays
    tags: Array.isArray(row.tags) ? JSON.stringify(row.tags) : row.tags,
  }));
  if (websitesSQL) allStatements.push('\n-- Websites\n' + websitesSQL);

  // Export website_categories table
  const websiteCategoriesSQL = await exportTable('website_categories', [
    'id', 'website_id', 'category_id', 'is_primary', 'created_at'
  ], (row) => ({
    ...row,
    is_primary: boolToInt(row.is_primary as boolean | null),
  }));
  if (websiteCategoriesSQL) allStatements.push('\n-- Website Categories\n' + websiteCategoriesSQL);

  // Export website_likes table
  const websiteLikesSQL = await exportTable('website_likes', [
    'id', 'user_id', 'website_id', 'created_at'
  ]);
  if (websiteLikesSQL) allStatements.push('\n-- Website Likes\n' + websiteLikesSQL);

  // Export website_favorites table
  const websiteFavoritesSQL = await exportTable('website_favorites', [
    'id', 'user_id', 'website_id', 'created_at'
  ]);
  if (websiteFavoritesSQL) allStatements.push('\n-- Website Favorites\n' + websiteFavoritesSQL);

  // Export website_reviews table
  const websiteReviewsSQL = await exportTable('website_reviews', [
    'id', 'user_id', 'website_id', 'rating', 'comment', 'created_at', 'updated_at'
  ]);
  if (websiteReviewsSQL) allStatements.push('\n-- Website Reviews\n' + websiteReviewsSQL);

  // Export feedbacks table
  const feedbacksSQL = await exportTable('feedbacks', [
    'id', 'name', 'content', 'source', 'created_at', 'status'
  ]);
  if (feedbacksSQL) allStatements.push('\n-- Feedbacks\n' + feedbacksSQL);

  // Export footer_links table
  const footerLinksSQL = await exportTable('footer_links', [
    'id', 'title', 'url', 'is_external', 'created_at', 'updated_at'
  ], (row) => ({
    ...row,
    is_external: boolToInt(row.is_external as boolean | null),
  }));
  if (footerLinksSQL) allStatements.push('\n-- Footer Links\n' + footerLinksSQL);

  // Write to file
  const outputPath = path.join(OUTPUT_DIR, 'data.sql');
  fs.writeFileSync(outputPath, allStatements.join('\n'));

  console.log(`\nMigration complete! SQL file written to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('1. Create D1 database: wrangler d1 create ai-magellan-db');
  console.log('2. Generate schema: npx drizzle-kit generate --config=drizzle-d1.config.ts');
  console.log('3. Apply schema: wrangler d1 execute ai-magellan-db --file=./drizzle-d1/0000_xxx.sql');
  console.log('4. Import data: wrangler d1 execute ai-magellan-db --file=./drizzle-d1-migrations/data.sql');

  await sql.end();
}

main().catch(console.error);

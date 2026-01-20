/**
 * Database Access Utilities
 *
 * This module provides helper functions for accessing the database
 * across different deployment environments (Vercel, Cloudflare, local).
 *
 * Usage:
 *
 * // In Server Components or API Routes:
 * import { getDB } from '@/lib/db';
 *
 * export default async function MyComponent() {
 *   const db = getDB();
 *   const data = await db.select().from(websites);
 *   return <div>{data.length}</div>;
 * }
 */

import { getDB as getDBFromDb, type PgDB, type D1DB, type Database } from './db';

// Runtime environment detection
function isCloudflareRuntime(): boolean {
  // Check for Cloudflare-specific globals
  if (typeof globalThis !== 'undefined') {
    // @cloudflare/next-on-pages sets this
    if ((globalThis as unknown as Record<string, unknown>).__cf_env__) {
      return true;
    }
    // Check for Cloudflare caches API
    const g = globalThis as unknown as { caches?: { default?: unknown } };
    if (g.caches?.default !== undefined) {
      return true;
    }
  }

  // Check environment variable (can be set in wrangler.toml)
  if (typeof process !== 'undefined' && process.env?.CLOUDFLARE_WORKERS === 'true') {
    return true;
  }

  return false;
}

/**
 * Get the appropriate database instance based on runtime environment
 *
 * - In Cloudflare: Returns D1 database from request context
 * - In Vercel/Local: Returns PostgreSQL database
 *
 * Note: This function should be called within request context
 */
export function getDB(): PgDB {
  return getDBFromDb();
}

/**
 * Type guard to check if database is D1
 */
export function isD1Database(db: PgDB | D1DB): db is D1DB {
  return isCloudflareRuntime();
}

/**
 * Type guard to check if database is PostgreSQL
 */
export function isPostgresDatabase(db: PgDB | D1DB): db is PgDB {
  return !isCloudflareRuntime();
}

/**
 * Helper to handle JSON fields that are stored as text in D1
 * In PostgreSQL, json/jsonb fields are automatically parsed
 * In D1/SQLite, they're stored as text and need parsing
 */
export function parseJsonField<T>(value: unknown, defaultValue: T): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Already an object (PostgreSQL json/jsonb)
  if (typeof value === 'object') {
    return value as T;
  }

  // String that needs parsing (D1/SQLite)
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Helper to serialize JSON for D1 storage
 * PostgreSQL handles this automatically, but D1 needs explicit serialization
 */
export function toJsonField<T>(value: T): string | T {
  if (isCloudflareRuntime()) {
    return JSON.stringify(value);
  }
  return value;
}

/**
 * Helper to handle boolean fields
 * PostgreSQL uses true/false, D1/SQLite uses 1/0
 */
export function parseBooleanField(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 1 || value === '1' || value === true;
}

/**
 * Helper to convert boolean to D1 format
 */
export function toBooleanField(value: boolean): number | boolean {
  if (isCloudflareRuntime()) {
    return value ? 1 : 0;
  }
  return value;
}

// Re-export database types
export type { PgDB, D1DB, Database } from './db';

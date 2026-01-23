/**
 * Unified Database Module
 *
 * This module provides a unified database access layer that supports:
 * - PostgreSQL (for Vercel/local development with DATABASE_URL)
 * - Cloudflare D1 (for Cloudflare Pages deployment)
 *
 * The correct database is automatically selected based on the environment.
 */

import * as schemaPg from './schema';

// Lazy import D1 types - only used when in Cloudflare environment
let drizzleD1: typeof import('drizzle-orm/d1').drizzle | null = null;
let schemaD1Module: typeof import('./schema-d1') | null = null;

// Type definitions
export type PgDB = import('drizzle-orm/postgres-js').PostgresJsDatabase<typeof schemaPg>;
export type D1DB = any; // Simplified type for compatibility
export type Database = PgDB | D1DB;

// Detect if running in Cloudflare/Edge environment
function isEdgeRuntime(): boolean {
  // Check for Cloudflare Workers environment
  if (typeof globalThis !== 'undefined') {
    // Check for Cloudflare-specific globals
    if ('caches' in globalThis && typeof (globalThis as any).caches !== 'undefined') {
      return true;
    }
    // Check for edge runtime flag
    if (typeof (globalThis as any).EdgeRuntime !== 'undefined') {
      return true;
    }
    // Check for Cloudflare env
    if ((globalThis as any).__cf_env__) {
      return true;
    }
  }
  // Check environment variable
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.CLOUDFLARE_WORKERS === 'true') {
      return true;
    }
    // Check Next.js edge runtime
    if (process.env.NEXT_RUNTIME === 'edge') {
      return true;
    }
  }
  return false;
}

// Global storage for development hot reload (PostgreSQL only)
declare global {
  // eslint-disable-next-line no-var
  var __db: PgDB | undefined;
  // eslint-disable-next-line no-var
  var __pgClient: any | undefined;
}

/**
 * Get the PostgreSQL database instance (synchronous)
 * Used for Vercel deployment and local development
 */
function getPostgresDB(): PgDB {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please check your .env file or environment configuration.'
    );
  }

  // Reuse existing instance in development
  if (process.env.NODE_ENV !== 'production' && globalThis.__db) {
    return globalThis.__db;
  }

  // Synchronous require for non-edge runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle: drizzlePg } = require('drizzle-orm/postgres-js');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const postgres = require('postgres');

  // Create postgres client
  const client = globalThis.__pgClient ?? postgres(process.env.DATABASE_URL, {
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__pgClient = client;
  }

  // Create drizzle instance
  const db = drizzlePg(client, { schema: schemaPg });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__db = db;
  }

  return db;
}

/**
 * Get the D1 database instance from Cloudflare context
 * Used for Cloudflare Pages deployment
 */
export function getD1DB(d1: any): D1DB {
  if (!drizzleD1) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    drizzleD1 = require('drizzle-orm/d1').drizzle;
  }
  if (!schemaD1Module) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    schemaD1Module = require('./schema-d1');
  }
  return drizzleD1!(d1, { schema: schemaD1Module as any });
}

/**
 * Get database instance for Cloudflare Pages
 * Call this from Server Components or API routes
 */
export function getCloudflareDB(): D1DB {
  try {
    // Dynamic require to avoid bundling issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();

    if (!env || !env.DB) {
      throw new Error('Cloudflare D1 binding (DB) is not available. Please check your wrangler.toml configuration.');
    }

    return getD1DB(env.DB);
  } catch (e) {
    // Not in Cloudflare environment - provide detailed error
    const error = e as Error;
    console.error('[DB] Failed to get Cloudflare database:', error.message);
    throw new Error(
      `Failed to get Cloudflare D1 database: ${error.message}. ` +
      'Make sure you are running in Cloudflare environment and DB binding is configured in wrangler.toml.'
    );
  }
}

/**
 * Get the appropriate database instance based on environment
 * This is the main function to use in API routes and components
 */
export function getDB(): PgDB {
  // For now, always return PostgreSQL for local/Vercel
  // Cloudflare deployment will be handled separately
  if (isEdgeRuntime()) {
    // In edge runtime, ONLY use Cloudflare DB
    return getCloudflareDB() as any;
  }

  // Default to PostgreSQL for Node.js runtime
  return getPostgresDB();
}

/**
 * Main database export (for backwards compatibility)
 * Note: Prefer using getDB() for new code
 */
let _db: PgDB | null = null;

export const db: PgDB = new Proxy({} as PgDB, {
  get(_target, prop) {
    if (!_db) {
      _db = getDB(); // Use getDB() which handles environment detection
    }
    return (_db as any)[prop];
  }
});

// Export schemas
export { schemaPg as schema };
export const schemaD1 = {} as typeof import('./schema-d1'); // Placeholder, actual schema loaded dynamically

// Export types
export type { PgDB as PostgresDatabase, D1DB as CloudflareDatabase };

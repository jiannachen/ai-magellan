// Main database exports
export { db, getCloudflareDB, getD1DB, schema, schemaD1 } from './db';
export type { Database, PgDB, D1DB, PostgresDatabase, CloudflareDatabase } from './db';

// Utility functions for cross-platform database access
export {
  getDB,
  isD1Database,
  isPostgresDatabase,
  parseJsonField,
  toJsonField,
  parseBooleanField,
  toBooleanField,
} from './utils';

// Re-export PostgreSQL schema for backward compatibility
export * from './schema';

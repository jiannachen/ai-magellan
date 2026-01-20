import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from './schema-d1';

// Cloudflare D1 Database type - use any to avoid requiring @cloudflare/workers-types
export type CloudflareEnv = {
  DB: any; // D1Database type from @cloudflare/workers-types
};

// Create D1 database instance
export function createD1Database(d1: any) {
  return drizzleD1(d1, { schema });
}

// Type for the D1 database
export type D1DB = ReturnType<typeof createD1Database>;

// Export schema
export { schema };

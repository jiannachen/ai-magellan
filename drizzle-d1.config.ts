import type { Config } from 'drizzle-kit';

// Drizzle Kit configuration for Cloudflare D1 (SQLite)
export default {
  schema: './src/lib/db/schema-d1/*',
  out: './drizzle-d1',
  dialect: 'sqlite',
  // For local development with wrangler d1
  // Use: wrangler d1 execute ai-magellan-db --local --file=./drizzle-d1/0000_xxx.sql
  driver: 'd1-http',
  dbCredentials: {
    // These will be populated when running migrations
    // Use wrangler d1 for actual migrations
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
  verbose: true,
  strict: true,
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config;

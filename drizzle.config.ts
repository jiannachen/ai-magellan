import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Enable verbose logging in development
  verbose: true,
  // Enable strict mode for better type safety
  strict: true,
  // Customize migration file naming
  migrations: {
    prefix: 'timestamp',
  },
} satisfies Config;

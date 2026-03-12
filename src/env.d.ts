/// <reference types="@cloudflare/workers-types" />

// Cloudflare environment bindings
interface CloudflareEnv {
  DB: D1Database;
  // Add more bindings as needed:
  // CACHE: KVNamespace;
  // ASSETS: R2Bucket;
}

// Extend the global namespace for Next.js on Cloudflare Pages
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Cloudflare D1 configuration (for drizzle-kit)
      CLOUDFLARE_ACCOUNT_ID?: string;
      CLOUDFLARE_D1_DATABASE_ID?: string;
      CLOUDFLARE_API_TOKEN?: string;

      // Local development
      LOCAL_DB_PATH?: string;

      // Cloudflare image resizing
      CLOUDFLARE_IMAGE_RESIZING?: string;

      // Existing env vars
      DATABASE_URL?: string;
      NEXT_PUBLIC_BASE_URL?: string;
      ADMIN_EMAILS?: string;

      // NextAuth
      AUTH_SECRET?: string;
      AUTH_GOOGLE_ID?: string;
      AUTH_GOOGLE_SECRET?: string;
      AUTH_GITHUB_ID?: string;
      AUTH_GITHUB_SECRET?: string;
    }
  }
}

export {};

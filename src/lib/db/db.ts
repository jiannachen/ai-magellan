import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 声明全局类型,使 db 在全局范围内可用
declare global {
  var db: PostgresJsDatabase<typeof schema> | undefined;
}

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please check your .env file or environment configuration.\n' +
    'Example: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"'
  );
}

// 创建一个类型安全的全局对象来存储 Drizzle 实例
const globalForDb = global as { db?: PostgresJsDatabase<typeof schema>; client?: postgres.Sql };

// 创建 postgres 客户端
// - 在生产环境中创建新的客户端
// - 在开发环境中复用全局客户端以防止热重载时创建多个连接
// Connection pooling best practices:
// - max: maximum connections (lower for serverless)
// - idle_timeout: close idle connections after 20 seconds
// - connect_timeout: connection timeout (10 seconds)
const client = globalForDb.client ?? postgres(process.env.DATABASE_URL, {
  max: process.env.NODE_ENV === 'production' ? 1 : 10, // Serverless-friendly: 1 connection in prod
  idle_timeout: 20,
  connect_timeout: 10,
  // Prepare statements for better performance
  prepare: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

// 导出 Drizzle 实例:
// - 如果全局已存在实例则复用
// - 否则创建新实例
export const db: PostgresJsDatabase<typeof schema> = globalForDb.db ?? drizzle(client, {
  schema,
});

// 在开发环境中将实例保存到全局对象
// 这样可以防止热重载时创建多个数据库连接
if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

// 导出类型
export type Database = typeof db;
export { schema };

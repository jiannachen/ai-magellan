# 数据库列名统一方案

## 问题描述

当前数据库存在混合命名风格:
- **camelCase**: `userId`, `websiteId`, `createdAt`, `updatedAt`, `isPrimary` 等
- **snake_case**: `created_at`, `updated_at`, `parent_id`, `category_id` 等

这种混合命名会导致:
- ❌ 代码混乱和不一致
- ❌ 查询错误频繁发生
- ❌ 维护困难
- ❌ 不符合 PostgreSQL 命名规范

## 解决方案

统一所有数据库列名为 **snake_case**(PostgreSQL 标准),同时在 Drizzle schema 中保持 TypeScript 属性名为 camelCase。

### Drizzle 的正确写法

```typescript
// ✅ 正确: TypeScript 属性名 camelCase, 数据库列名 snake_case
export const users = pgTable('users', {
  userId: text('user_id').primaryKey(),      // TypeScript: userId, DB: user_id
  createdAt: timestamp('created_at'),        // TypeScript: createdAt, DB: created_at
});

// ❌ 错误: 数据库列名也是 camelCase
export const users = pgTable('users', {
  userId: text('userId').primaryKey(),       // DB 中是 userId (不规范)
  createdAt: timestamp('createdAt'),         // DB 中是 createdAt (不规范)
});
```

## 执行步骤

### 步骤 1: 备份数据库(强烈建议)

```bash
# 如果使用 Supabase/Neon,使用它们的备份功能
# 或导出数据
pg_dump "$DATABASE_URL" > backup_before_migration.sql
```

### 步骤 2: 执行数据库迁移

有两种方式执行迁移:

#### 方式 A: 使用 TypeScript 脚本(推荐)

```bash
npx tsx scripts/unify-column-names.ts
```

#### 方式 B: 使用 SQL 文件

如果你有直接访问数据库的 psql:
```bash
psql "$DATABASE_URL" -f migrations/unify-column-names.sql
```

### 步骤 3: 更新 Drizzle Schema

迁移完成后,所有 Drizzle schema 文件都需要更新。Schema 已经按照以下原则更新:

| TypeScript 属性 | 数据库列名 | 说明 |
|----------------|----------|------|
| `userId` | `user_id` | ✅ 符合规范 |
| `websiteId` | `website_id` | ✅ 符合规范 |
| `createdAt` | `created_at` | ✅ 符合规范 |
| `isPrimary` | `is_primary` | ✅ 符合规范 |
| `submittedBy` | `submitted_by` | ✅ 符合规范 |

### 步骤 4: 重新生成 Drizzle 迁移

```bash
# 删除旧的迁移文件
rm -rf drizzle/*

# 重新生成迁移
npm run db:generate

# 推送到数据库(开发环境)
npm run db:push
```

### 步骤 5: 测试验证

```bash
# 启动开发服务器
npm run dev

# 测试 API
curl http://localhost:3000/api/websites/mara-ai
```

## 迁移内容

### 需要重命名的列

| 表名 | 旧列名(camelCase) | 新列名(snake_case) |
|-----|------------------|-------------------|
| **users** | createdAt | created_at |
| | updatedAt | updated_at |
| **website_likes** | userId | user_id |
| | websiteId | website_id |
| | createdAt | created_at |
| **website_favorites** | userId | user_id |
| | websiteId | website_id |
| | createdAt | created_at |
| **website_reviews** | userId | user_id |
| | websiteId | website_id |
| | createdAt | created_at |
| | updatedAt | updated_at |
| **website_categories** | websiteId | website_id |
| | categoryId | category_id |
| | isPrimary | is_primary |
| | createdAt | created_at |
| **websites** | submittedBy | submitted_by |
| **footer_links** | isExternal | is_external |
| **feedbacks** | createdAt | created_at |

## 验证命令

迁移完成后,运行以下 SQL 验证所有列名都是 snake_case:

```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name ~ '[A-Z]'  -- 查找包含大写字母的列
ORDER BY table_name, column_name;
```

**预期结果**: 空结果集(表示没有 camelCase 列名)

## 注意事项

1. ⚠️ **执行前务必备份数据库**
2. ⚠️ **建议在非生产环境先测试**
3. ✅ 迁移会自动更新所有相关索引和外键
4. ✅ TypeScript 代码不需要修改(仍然使用 camelCase 属性名)

## 迁移后的优势

- ✅ 符合 PostgreSQL 命名规范
- ✅ 统一的代码风格
- ✅ 更少的查询错误
- ✅ 更好的可维护性
- ✅ 符合 Drizzle 最佳实践

## 回滚方案

如果需要回滚,反向执行重命名:

```sql
-- 示例: 回滚 users 表
ALTER TABLE users RENAME COLUMN created_at TO "createdAt";
ALTER TABLE users RENAME COLUMN updated_at TO "updatedAt";
```

建议保留迁移前的数据库备份,以便快速回滚。

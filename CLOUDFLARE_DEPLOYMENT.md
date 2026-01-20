# Cloudflare Pages 部署指南

本项目已改造为支持 Cloudflare Pages + D1 数据库部署。

## 架构变更

### 数据库
- **PostgreSQL → D1 (SQLite)**
- Schema 位置: `src/lib/db/schema-d1/`
- 配置文件: `drizzle-d1.config.ts`

### 运行时
- **Node.js → Edge Runtime**
- 使用 `@cloudflare/next-on-pages` 构建

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 登录 Cloudflare
```bash
npx wrangler login
```

### 3. 创建 D1 数据库
```bash
npx wrangler d1 create ai-magellan-db
```

复制返回的 `database_id`，更新 `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "ai-magellan-db"
database_id = "你的数据库ID"
```

### 4. 生成并应用 Schema
```bash
# 生成 SQL 迁移文件
npm run d1:generate

# 应用到远程 D1
npx wrangler d1 execute ai-magellan-db --remote --file=./drizzle-d1/0000_xxx.sql
```

### 5. 迁移数据（可选）
如果需要从 PostgreSQL 迁移数据：
```bash
# 导出数据
DATABASE_URL="your-pg-url" npm run pg-to-d1

# 导入到 D1
npx wrangler d1 execute ai-magellan-db --remote --file=./drizzle-d1-migrations/data.sql
```

### 6. 配置环境变量
在 Cloudflare Dashboard 中设置：
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_BASE_URL`

或使用 wrangler：
```bash
npx wrangler secret put CLERK_SECRET_KEY
```

### 7. 构建和部署
```bash
# 构建
npm run cf:build

# 部署
npm run cf:deploy
```

## 本地开发

### 使用 Cloudflare 本地模拟
```bash
# 创建本地 D1 数据库
npx wrangler d1 execute ai-magellan-db --local --file=./drizzle-d1/0000_xxx.sql

# 启动开发服务器
npm run cf:dev
```

### 使用 PostgreSQL（传统方式）
```bash
npm run dev
```

## 代码修改指南

### API 路由更新
所有使用数据库的 API 路由需要：

1. 添加 edge runtime 声明：
```typescript
export const runtime = 'edge';
```

2. 使用 `getDB()` 而非直接导入 `db`：
```typescript
// 旧代码
import { db } from '@/lib/db/db';

// 新代码
import { getDB } from '@/lib/db';

export async function GET() {
  const db = getDB();
  // ...
}
```

### 数据类型处理

D1 (SQLite) 与 PostgreSQL 的差异：

| 类型 | PostgreSQL | D1/SQLite |
|------|------------|-----------|
| 布尔值 | `true/false` | `1/0` |
| JSON | 原生对象 | JSON 字符串 |
| 时间戳 | `Date` 对象 | ISO 字符串 |

使用工具函数处理：
```typescript
import { parseJsonField, parseBooleanField } from '@/lib/db';

// 解析 JSON 字段
const tags = parseJsonField(website.tags, []);

// 解析布尔字段
const isFeatured = parseBooleanField(website.isFeatured);
```

## 需要更新的文件

以下 API 路由需要按上述方式更新：

- [ ] `src/app/api/categories/route.ts`
- [ ] `src/app/api/categories/[id]/route.ts`
- [ ] `src/app/api/search/route.ts`
- [ ] `src/app/api/rankings/route.ts`
- [ ] `src/app/api/user/favorites/route.ts`
- [ ] `src/app/api/user/stats/route.ts`
- [ ] `src/app/api/websites/[id]/route.ts`
- [ ] `src/app/api/websites/[id]/like/route.ts`
- [ ] `src/app/api/websites/[id]/visit/route.ts`
- [ ] `src/app/api/feedback/route.ts`
- [ ] 其他使用数据库的路由...

## 常见问题

### Q: 构建时报错 "Cannot find module 'better-sqlite3'"
A: 这是正常的，`better-sqlite3` 只用于本地开发。在 Cloudflare 环境中会使用 D1。

### Q: 如何查看 D1 数据？
```bash
# 本地数据
npx wrangler d1 execute ai-magellan-db --local --command="SELECT * FROM websites LIMIT 5"

# 远程数据
npx wrangler d1 execute ai-magellan-db --remote --command="SELECT * FROM websites LIMIT 5"
```

### Q: 如何回滚到 PostgreSQL？
项目保留了 PostgreSQL 支持。只需设置 `DATABASE_URL` 环境变量，代码会自动使用 PostgreSQL。

## 免费额度

Cloudflare 免费计划包括：
- **D1**: 5GB 存储、500万行读/天、10万行写/天
- **Pages**: 无限请求、500次构建/月
- **Workers**: 10万请求/天

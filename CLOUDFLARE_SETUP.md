# Cloudflare Pages 部署配置

## 🌐 环境说明

项目使用双环境配置：

| 环境 | Git 分支 | 部署 URL | D1 数据库 |
|------|---------|---------|----------|
| **Production** | `main` | https://aimagellan.com | `ai-magellan-db-production` |
| **Dev (预演)** | `dev` | https://*.ai-magellan.pages.dev | `ai-magellan-db` |

---

## ⚙️ Cloudflare Pages Dashboard 配置

### 1. 登录 Cloudflare Pages Dashboard
访问: https://dash.cloudflare.com/

### 2. 配置生产分支
在项目设置中：
- **Production branch**: `main`
- **Production environment**: 使用默认配置（对应 wrangler.toml 顶层配置）

### 3. 配置预览分支
- **Preview branch**: `dev`
- **Preview environment**: 使用 `dev` 环境（对应 wrangler.toml 的 `[env.dev]`）

### 4. 环境变量设置

**在 Cloudflare Pages Settings → Environment variables 中配置：**

#### Production 环境 Secrets:
```bash
# 通过 Cloudflare Dashboard 或命令行设置
npx wrangler secret put CLERK_SECRET_KEY
npx wrangler secret put CLERK_WEBHOOK_SECRET
npx wrangler secret put ADMIN_EMAILS
```

#### Dev 环境 Secrets:
```bash
npx wrangler secret put CLERK_SECRET_KEY --env dev
npx wrangler secret put CLERK_WEBHOOK_SECRET --env dev
npx wrangler secret put ADMIN_EMAILS --env dev
```

---

## 🚀 部署工作流

### 本地开发（使用 PostgreSQL）
```bash
# 在 dev 分支开发
git checkout dev
npm run dev

# 访问 http://localhost:3000
# 使用 .env.local 中的 PostgreSQL 数据库
```

### 推送到预演环境 (dev)
```bash
# 推送 dev 分支到 GitHub
git push origin dev

# Cloudflare 自动部署到: https://dev.ai-magellan.pages.dev
# 使用 ai-magellan-db（dev 环境）数据库
```

### 部署到生产环境 (main)
```bash
# 合并到 main 分支
git checkout main
git merge dev
git push origin main

# Cloudflare 自动部署到: https://aimagellan.com
# 使用 ai-magellan-db-production 数据库
```

### 手动部署（可选）
```bash
# 部署到 dev 环境
npm run cf:deploy:dev

# 部署到生产环境
npm run cf:deploy:prod
```

---

## 🗄️ 数据库迁移

### 本地数据库（PostgreSQL）
```bash
npm run db:generate   # 生成迁移文件
npm run db:push       # 推送到 PostgreSQL
```

### Dev D1 数据库
```bash
npm run d1:generate           # 生成 D1 迁移文件
npm run d1:migrate:dev        # 应用到 dev 环境
```

### Production D1 数据库
```bash
npm run d1:migrate:prod       # 应用到 production 环境
```

---

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发（PostgreSQL） |
| `npm run cf:build` | 构建 Cloudflare 版本 |
| `npm run cf:preview` | 本地预览 Cloudflare 构建 |
| `npm run cf:deploy:dev` | 手动部署到 dev 环境 |
| `npm run cf:deploy:prod` | 手动部署到生产环境 |
| `npm run d1:migrate:dev` | 迁移 dev D1 数据库 |
| `npm run d1:migrate:prod` | 迁移 production D1 数据库 |

---

## ⚠️ 注意事项

1. **数据隔离**: dev 和 main 分支使用不同的 D1 数据库，数据完全隔离
2. **自动部署**: 推送到 GitHub 后，Cloudflare 会自动检测并部署
3. **Secrets 管理**: 敏感信息通过 Cloudflare Dashboard 或 `wrangler secret` 命令设置
4. **本地开发**: 始终使用 PostgreSQL，不需要本地 D1 数据库
5. **环境对应**:
   - `dev` 分支 → `--env dev` → ai-magellan-db
   - `main` 分支 → 默认环境 → ai-magellan-db-production

---

## 🔍 故障排查

### 问题：环境变量未定义
- 检查 Cloudflare Dashboard 中是否设置了 Secrets
- 确认推送的分支对应正确的环境配置

### 问题：数据库连接失败
- 检查 D1 binding 是否正确绑定
- 确认数据库迁移已应用：`npm run d1:migrate:dev` 或 `npm run d1:migrate:prod`

### 问题：部署失败 - worker.js 不存在
- 运行构建命令：`npm run cf:build`
- 确认 `.open-next/worker.js` 文件已生成

### 问题：DATABASE_URL 错误
- 这是本地开发环境变量，不影响 Cloudflare 部署
- Cloudflare 使用 D1 数据库（通过 wrangler.toml 配置）

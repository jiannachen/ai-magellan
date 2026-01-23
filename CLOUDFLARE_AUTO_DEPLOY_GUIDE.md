# Cloudflare Pages 自动部署配置指南

## 配置步骤

### 1. 连接 GitHub 仓库

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 选择现有项目 **ai-magellan**
4. 点击 **Settings** → **Builds & deployments** → **Connect to Git**

### 2. 配置 Git 集成

```
Repository: jiannachen/ai-navigation
Production branch: main
```

### 3. 配置构建设置

**Framework preset:** None（或 Next.js）

**Build configuration:**
```bash
Build command: npm run cf:build
Build output directory: .open-next
Root directory: /
```

**Environment variables (Node.js):**
```
NODE_VERSION=20
```

### 4. 配置环境变量

#### Production 环境（main 分支）

在 **Settings** → **Environment variables** → **Production** 添加：

```bash
# Clerk 认证（生产环境）
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
ADMIN_EMAILS=your-email@example.com

# 公开环境变量（已在 wrangler.toml）
NEXT_PUBLIC_BASE_URL=https://aimagellan.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

#### Preview 环境（dev 及其他分支）

在 **Settings** → **Environment variables** → **Preview** 添加：

**方案 A：共享配置（推荐）**
```bash
# 和生产环境相同的配置
CLERK_SECRET_KEY=sk_live_xxxxx  # 可以和生产一样
CLERK_WEBHOOK_SECRET=whsec_xxxxx
ADMIN_EMAILS=your-email@example.com
```

**方案 B：使用开发环境配置（可选）**
```bash
# Clerk 开发环境 keys
CLERK_SECRET_KEY=sk_test_xxxxx  # 使用 test key
CLERK_WEBHOOK_SECRET=whsec_test_xxxxx
ADMIN_EMAILS=dev@example.com
```

### 5. D1 数据库绑定

**共享数据库方案**（推荐）：
- Production 和 Preview 都使用 `wrangler.toml` 中配置的同一个数据库
- 数据库绑定：`ai-magellan-db-production`（已在 wrangler.toml）

**无需额外配置**，wrangler.toml 的配置会自动应用到所有环境。

如果需要独立的预览数据库（可选）：
```bash
# 1. 创建预览数据库
npx wrangler d1 create ai-magellan-db-preview

# 2. 在 Cloudflare Dashboard 为 Preview 环境配置：
# Settings → Environment variables → Preview → Add D1 Binding
# Variable name: DB
# D1 database: ai-magellan-db-preview
```

### 6. 配置分支预览规则（可选）

在 **Settings** → **Builds & deployments** → **Branch deployments**：

```
Production branch: main
Preview branches: All branches (recommended)

或者指定特定分支：
Preview branches: dev, staging, feature/*
```

---

## 部署流程

### 自动部署触发条件

1. **推送到 main 分支**
   ```bash
   git push origin main
   ```
   → 自动部署到生产环境 `aimagellan.com`

2. **推送到 dev 分支**
   ```bash
   git push origin dev
   ```
   → 自动创建预览环境 `dev.ai-magellan.pages.dev`

3. **创建 Pull Request**
   → 自动创建 PR 预览环境 `pr-123.ai-magellan.pages.dev`

### 查看部署状态

```bash
# 查看最近的部署
npx wrangler pages deployment list --project-name=ai-magellan

# 查看部署日志
npx wrangler pages deployment tail --project-name=ai-magellan
```

---

## 预览环境 URL 规则

- **生产环境:** `https://aimagellan.com`
- **dev 分支:** `https://dev.ai-magellan.pages.dev`
- **其他分支:** `https://[branch-name].ai-magellan.pages.dev`
- **PR 预览:** `https://[pr-number].ai-magellan.pages.dev`
- **Commit 预览:** `https://[short-commit-hash].ai-magellan.pages.dev`

---

## 环境隔离建议

### 推荐配置（共享数据库）

```
生产环境：
- 域名: aimagellan.com
- 数据库: ai-magellan-db-production
- Clerk: 生产 keys
- 用途: 真实用户访问

预览环境：
- 域名: *.ai-magellan.pages.dev
- 数据库: ai-magellan-db-production（共享）
- Clerk: 生产 keys（共享）或测试 keys
- 用途: 测试新功能、UI 预览
```

### 注意事项

使用共享数据库时：
- ✅ 可以预览真实数据的显示效果
- ✅ 配置简单，无需维护多套数据
- ⚠️ 避免在预览环境做危险操作（删除、批量修改等）
- 💡 建议：添加环境标识，预览环境显示 "Preview Mode" 提示

---

## 回滚和版本管理

### 快速回滚

在 Cloudflare Dashboard:
1. **Workers & Pages** → **ai-magellan**
2. **Deployments** 标签
3. 找到之前的成功部署
4. 点击 **Rollback to this deployment**

### 环境变量版本

Cloudflare 会保存环境变量的历史版本，可以随时恢复。

---

## 故障排查

### 构建失败

查看构建日志：
```bash
npx wrangler pages deployment tail --project-name=ai-magellan
```

常见问题：
1. **Node.js 版本不兼容** → 设置 `NODE_VERSION=20`
2. **依赖安装失败** → 检查 package.json
3. **构建超时** → 优化构建脚本

### 数据库连接失败

检查 D1 绑定：
1. Cloudflare Dashboard → ai-magellan → Settings
2. Functions → D1 database bindings
3. 确认 `DB` 绑定已配置

---

## 性能优化

### 构建缓存

Cloudflare Pages 会自动缓存：
- `node_modules/`
- `.next/cache/`
- `npm` 缓存

### 部署速度

- 平均构建时间：2-5 分钟
- 首次部署：5-10 分钟（需要安装依赖）
- 后续部署：2-3 分钟（使用缓存）

---

## 成本估算

### Cloudflare Pages 免费额度

- ✅ 无限请求数
- ✅ 500 次构建/月
- ✅ 并发构建：1 个（免费计划）
- ✅ 无限预览环境

### D1 数据库免费额度

- ✅ 5GB 存储
- ✅ 500 万行读取/天
- ✅ 10 万行写入/天

**结论：小型到中型项目完全免费！**

---

## 下一步

1. ✅ 在 Cloudflare Dashboard 连接 GitHub
2. ✅ 配置环境变量
3. ✅ 推送代码测试自动部署
4. ✅ 验证生产环境和预览环境

完成后：
- `git push origin main` → 生产部署
- `git push origin dev` → 预览部署
- 创建 PR → 自动预览

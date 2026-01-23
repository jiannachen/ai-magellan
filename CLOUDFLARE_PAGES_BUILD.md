# Cloudflare Pages 构建配置指南

## 问题说明

错误信息：`✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found.`

**原因**：`.open-next/` 目录在 .gitignore 中，不会提交到 Git。Cloudflare Pages 需要在部署时重新构建。

---

## 🔧 解决方案：配置 Cloudflare Pages 构建设置

### 方法 1：在 Cloudflare Dashboard 中配置（推荐）

1. 访问 Cloudflare Pages Dashboard
   ```
   https://dash.cloudflare.com/[YOUR_ACCOUNT_ID]/pages
   ```

2. 选择你的项目 `ai-magellan`

3. 进入 **Settings** → **Builds & deployments**

4. 配置 **Production** 环境：
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.open-next`
   - **Root directory**: `/` (保持默认)
   - **Environment variables**: 无需设置（使用 wrangler.toml）

5. 配置 **Preview** 环境（dev 分支）：
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.open-next`
   - **Root directory**: `/` (保持默认)
   - **Branch**: `dev`

6. 点击 **Save** 保存设置

---

### 方法 2：使用 wrangler.json 配置文件（可选）

如果想在代码中管理构建配置，可以创建 `wrangler.json`：

```json
{
  "pages_build_output_dir": ".open-next"
}
```

但这个方法不如在 Dashboard 中配置灵活。

---

## 📋 完整构建流程

### Production 分支 (main)
```
1. 推送代码到 main 分支
   git push origin main

2. Cloudflare Pages 自动执行：
   npm install
   npm run cf:build        # 生成 .open-next/worker.js

3. 使用 wrangler.toml 默认配置部署
   - D1: ai-magellan-db-production
   - URL: https://aimagellan.com
```

### Dev 分支 (dev)
```
1. 推送代码到 dev 分支
   git push origin dev

2. Cloudflare Pages 自动执行：
   npm install
   npm run cf:build        # 生成 .open-next/worker.js

3. 使用 wrangler.toml [env.dev] 配置部署
   - D1: ai-magellan-db
   - URL: https://*.ai-magellan.pages.dev
```

---

## ⚠️ 重要注意事项

### 1. 不要提交构建产物
`.open-next/` 应该保持在 .gitignore 中：
```gitignore
# .gitignore
.open-next/
```

### 2. 确保 package.json 中有构建命令
```json
{
  "scripts": {
    "cf:build": "npx @opennextjs/cloudflare build"
  }
}
```

### 3. Node.js 版本
Cloudflare Pages 默认使用 Node.js 18.x。如果需要特定版本，在 Dashboard 中设置：
- Environment variable: `NODE_VERSION`
- Value: `20` (或其他版本)

### 4. 环境变量 vs Secrets
- **Public 变量**（NEXT_PUBLIC_*）：在 wrangler.toml 的 `[vars]` 中配置
- **Private 变量**（API keys）：使用 `npx wrangler secret put` 命令设置

---

## 🔍 验证部署

### 检查构建日志
1. 进入 Cloudflare Pages 项目
2. 点击最新的 deployment
3. 查看 **Build logs**，确认：
   - `npm run cf:build` 成功执行
   - `.open-next/worker.js` 被生成
   - 没有错误信息

### 测试部署的应用
- Production: https://aimagellan.com
- Dev: https://dev.ai-magellan.pages.dev

---

## 🆘 故障排查

### 问题：构建超时
- 检查 `npm install` 是否太慢
- 考虑使用 `pnpm` 或 `yarn` 加速安装

### 问题：构建命令未找到
- 确认 package.json 中有 `cf:build` 脚本
- 检查 Dashboard 中的构建命令拼写是否正确

### 问题：环境变量未生效
- Public 变量：添加到 wrangler.toml 的 `[vars]` 中
- Private 变量：使用 `wrangler secret put` 命令设置

### 问题：数据库连接失败
- 确认 D1 数据库已创建
- 检查 wrangler.toml 中的 database_id 是否正确
- 运行数据库迁移：
  ```bash
  npm run d1:migrate:dev    # dev 环境
  npm run d1:migrate:prod   # production 环境
  ```

# Cloudflare Pages 部署指南

## 错误原因

您遇到的错误是因为 Cloudflare Pages 使用了错误的构建命令：
```
✘ [ERROR] The entry-point file at ".open-next/worker.js" was not found.
```

## 解决方案

### 方案 1：在 Cloudflare Pages Dashboard 中修改构建设置（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 项目 → Settings → Builds & deployments
3. 修改构建配置：

```bash
构建命令 (Build command):
npm run cf:build

构建输出目录 (Build output directory):
.open-next

Root directory:
/

环境变量 (Environment variables):
NODE_VERSION = 20
```

4. 点击 "Save" 保存设置
5. 触发新的部署：Deployments → Retry deployment

### 方案 2：使用 wrangler 直接部署（当前方法）

```bash
# 本地构建和部署
npm run cf:build    # 构建 Cloudflare 版本
npm run cf:deploy   # 使用 wrangler 部署
```

这种方法绕过了 Cloudflare Pages CI/CD，直接部署到 Workers。

## 构建命令说明

项目有两种构建方式（来自 package.json）：

```json
{
  "build": "next build",           // ❌ 标准 Next.js 构建（Vercel/其他平台）
  "cf:build": "npx @opennextjs/cloudflare build"  // ✅ Cloudflare 专用构建
}
```

## 当前部署状态

✅ 使用 wrangler 部署已成功
- URL: https://ai-magellan.icstmcf.workers.dev
- 这是 Cloudflare Workers 部署，不是 Pages

## 建议

如果您想使用 Cloudflare Pages（带 Git 自动部署）：
1. 按照方案 1 修改 Dashboard 设置
2. 推送代码会自动触发正确的构建

如果您想继续使用 Cloudflare Workers（手动部署）：
1. 保持现状，使用 `npm run cf:build && npm run cf:deploy`
2. 每次更新需手动部署

## 检查清单

- [x] 代码已提交到 main 和 dev 分支
- [x] 本地构建成功
- [x] Workers 部署成功
- [ ] Cloudflare Pages 构建配置需更新（如果使用 Pages）

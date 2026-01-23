# GitHub Actions 自动部署设置指南

## ✅ 已完成
- [x] 创建 `.github/workflows/deploy.yml` 文件
- [x] 获取 Account ID: `6ca005f28e7d2fefdde346ad90a493ad`

## 📋 接下来的步骤

### 步骤 1：创建 Cloudflare API Token

你已经登录了 wrangler，但 GitHub Actions 需要一个专门的 API Token。

#### 方法 A：通过命令行（推荐）
```bash
# 这个命令会打开浏览器，直接跳转到创建 Token 的页面
npx wrangler pages secret:bulk upload
```
然后选择 "Create a new API token"

#### 方法 B：手动创建
1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 **Create Token**
3. 找到 **Edit Cloudflare Workers** 模板，点击 **Use template**
4. 修改配置：
   - **Token name**: `GitHub Actions - ai-magellan`
   - **Permissions**:
     - Account - Cloudflare Pages - Edit
     - Account - Account Settings - Read
   - **Account Resources**:
     - Include - [你的账号]
   - **Client IP Address Filtering**: 留空
   - **TTL**: 留空（永不过期）或设置过期时间
5. 点击 **Continue to summary**
6. 点击 **Create Token**
7. **重要**：复制 Token（只显示一次！）

示例 Token 格式：`abcdef1234567890_ABCDEFGHIJKLMNOP`

---

### 步骤 2：在 GitHub 设置 Secrets

1. 访问仓库的 Secrets 设置页面：
   ```
   https://github.com/jiannachen/ai-navigation/settings/secrets/actions
   ```

2. 点击 **New repository secret** 按钮

3. 添加第一个 Secret：
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: [粘贴你刚才复制的 API Token]
   ```
   点击 **Add secret**

4. 再次点击 **New repository secret**，添加第二个 Secret：
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Value: 6ca005f28e7d2fefdde346ad90a493ad
   ```
   点击 **Add secret**

---

### 步骤 3：提交并推送 workflow 文件

回到终端，运行：

```bash
# 查看当前状态
git status

# 添加 workflow 文件
git add .github/workflows/deploy.yml

# 提交
git commit -m "feat: 添加 GitHub Actions 自动部署到 Cloudflare Pages"

# 推送到 dev 分支（触发第一次部署）
git push origin dev
```

---

### 步骤 4：验证自动部署

#### 查看 GitHub Actions 运行状态
1. 访问：https://github.com/jiannachen/ai-navigation/actions
2. 你应该看到一个新的 workflow run：**Deploy to Cloudflare Pages**
3. 点击进入查看详细日志

#### 部署流程
```
1. Checkout 代码
2. 安装 Node.js 20
3. 安装依赖 (npm ci)
4. 构建 (npm run cf:build)
   - 生成 .open-next/worker.js
5. 部署到 Cloudflare Pages
   - dev 分支 → https://dev.ai-magellan.pages.dev
   - main 分支 → https://ai-magellan.pages.dev
```

---

## 🎯 使用方式

### 部署到 dev 环境（预演）
```bash
git checkout dev
# 修改代码...
git add .
git commit -m "你的提交信息"
git push origin dev
# GitHub Actions 自动构建并部署到 dev 环境
```

### 部署到 production 环境
```bash
git checkout main
git merge dev
git push origin main
# GitHub Actions 自动构建并部署到 production 环境
```

---

## 🔍 环境对应关系

| Git 分支 | 部署 URL | D1 数据库 | wrangler.toml |
|----------|---------|----------|---------------|
| `dev` | https://dev.ai-magellan.pages.dev | ai-magellan-db | `[env.dev]` |
| `main` | https://ai-magellan.pages.dev | ai-magellan-db-production | 默认配置 |

**注意**：wrangler.toml 中的环境配置会通过 `--branch` 参数自动应用：
- `--branch=dev` → 使用 `[env.dev]` 配置
- `--branch=main` → 使用默认配置

---

## ⚠️ 常见问题

### Q: 推送后没有触发部署？
A: 检查：
1. Secrets 是否正确设置（名称拼写正确）
2. GitHub Actions 是否启用（Settings → Actions → General）
3. workflow 文件是否在正确位置（`.github/workflows/deploy.yml`）

### Q: 部署失败：Authentication error
A:
- 检查 `CLOUDFLARE_API_TOKEN` 是否有效
- 确认 Token 有 Cloudflare Pages Edit 权限

### Q: 部署失败：Project not found
A:
- 检查 `CLOUDFLARE_ACCOUNT_ID` 是否正确
- 确认项目名称是 `ai-magellan`

### Q: 如何查看部署日志？
A: 访问 https://github.com/jiannachen/ai-navigation/actions

### Q: 如何手动触发部署？
A:
- 方法 1：在 Actions 页面点击 "Re-run jobs"
- 方法 2：推送一个空 commit：`git commit --allow-empty -m "trigger deploy" && git push`

---

## 🎉 完成后

设置完成后，每次推送代码到 `dev` 或 `main` 分支，都会自动：
1. ✅ 安装依赖
2. ✅ 运行 `npm run cf:build` 构建
3. ✅ 部署到对应的 Cloudflare Pages 环境
4. ✅ 绑定正确的 D1 数据库

不再需要手动运行构建和部署命令！

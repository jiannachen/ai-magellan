# Cloudflare Pages 构建配置完整指南

## 🔍 第一步：确认项目类型

### 1. 登录 Cloudflare Dashboard
访问：https://dash.cloudflare.com/

### 2. 找到你的项目
点击左侧导航栏的 **Workers & Pages**

### 3. 确认项目类型
找到 `ai-magellan` 项目，查看标签：
- ✅ 如果显示 **Pages** 标签 → 继续下面的步骤
- ❌ 如果显示 **Worker** 标签 → 项目类型不对，需要重新创建

---

## 📋 第二步：检查项目连接方式

点击进入 `ai-magellan` 项目，查看顶部信息：

### 情况 A：Git 集成项目
如果看到：
```
Connected to: github.com/jiannachen/ai-navigation
Branch: main
```

**这是 Git 集成项目** → 跳到「方案 1：Git 集成配置」

### 情况 B：Direct Upload 项目
如果看到：
```
Deployment method: Direct Upload
或
Deploy via: wrangler CLI
```

**这是命令行部署项目** → 跳到「方案 2：Direct Upload 配置」

---

## 🎯 方案 1：Git 集成配置

### 配置路径
`ai-magellan` 项目页面 → **Settings** 标签 → **Builds & deployments** 区域

### 应该看到的选项

#### Build settings
```
Framework preset: [下拉选择框]
Build command: [输入框]
Build output directory: [输入框]
Root directory (advanced): [输入框，默认 /]
```

#### 填写内容
```
Framework preset: None（或选择 Next.js）
Build command: npm run cf:build
Build output directory: .open-next
Root directory: /
```

#### Environment variables（可选）
- 如果需要在构建时使用环境变量，在这里添加
- 例如：`NODE_VERSION` = `20`

### 如果没有这些选项

**可能原因 1：项目不是 Git 集成创建的**
- 你需要删除当前项目，重新通过 "Connect to Git" 创建

**可能原因 2：在错误的页面**
- 确保你在 **Settings** 标签，不是 **Deployments** 或其他标签
- 向下滚动，找到 **Build settings** 或 **Build configuration** 区域

**可能原因 3：权限不足**
- 确认你的 Cloudflare 账号有项目的管理权限

---

## 🎯 方案 2：Direct Upload 配置（wrangler CLI）

如果你的项目是通过 `wrangler pages deploy` 创建的，构建需要在本地完成。

### 工作流程

#### Production (main 分支)
```bash
# 1. 切换到 main 分支
git checkout main
git pull origin main

# 2. 本地构建
npm run cf:build

# 3. 部署到生产环境
npx wrangler pages deploy .open-next --project-name=ai-magellan
```

#### Dev (dev 分支)
```bash
# 1. 切换到 dev 分支
git checkout dev
git pull origin dev

# 2. 本地构建
npm run cf:build

# 3. 部署到 dev 环境
npx wrangler pages deploy .open-next --project-name=ai-magellan --branch=dev
```

### 配置 GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, dev]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run cf:build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy .open-next --project-name=ai-magellan --branch=${{ github.ref_name }}
```

然后在 GitHub 仓库设置中添加 Secret：
- Name: `CLOUDFLARE_API_TOKEN`
- Value: 你的 Cloudflare API Token（从 Cloudflare Dashboard 获取）

---

## 🔄 第三步：转换项目类型（如果需要）

### 从 Direct Upload 转换为 Git 集成

如果你当前是 Direct Upload 项目，但想要 Git 自动部署：

#### 1. 删除现有项目（可选，备份数据）
在 Cloudflare Pages → `ai-magellan` → Settings → 最底部 → Delete project

#### 2. 重新创建 Git 集成项目
1. 点击 **Create a project**
2. 选择 **Connect to Git**
3. 授权并选择 `jiannachen/ai-navigation` 仓库
4. 配置构建设置：
   ```
   Production branch: main
   Build command: npm run cf:build
   Build output directory: .open-next
   ```
5. 点击 **Save and Deploy**

#### 3. 配置环境
- Production → main 分支 → 使用默认 wrangler.toml 配置
- Preview → dev 分支 → 使用 wrangler.toml 的 [env.dev] 配置

---

## 🆘 还是找不到配置？

### 请告诉我以下信息：

1. **你在哪个页面？**
   - 截图或描述你当前看到的 Cloudflare 界面

2. **项目信息**
   ```bash
   # 在终端运行，告诉我输出结果：
   npx wrangler pages project list
   ```

3. **你看到的标签/按钮**
   - 例如：Settings, Deployments, Analytics, Custom domains 等

4. **顶部项目信息**
   - 项目名称旁边显示的是什么？（Pages 标签？Worker 标签？）

---

## 💡 临时解决方案

如果实在找不到 Git 集成的构建配置，可以先用命令行手动部署：

```bash
# 构建 + 部署 dev 环境
npm run cf:build
npx wrangler pages deploy .open-next --project-name=ai-magellan --branch=dev --env dev

# 构建 + 部署 production 环境
npm run cf:build
npx wrangler pages deploy .open-next --project-name=ai-magellan --branch=main
```

这样至少可以让项目先运行起来，再慢慢研究自动部署的配置。

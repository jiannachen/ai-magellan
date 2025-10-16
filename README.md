# AI Magellan | AI 导航

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-15.1.2-black)

一个现代化的 AI 工具导航网站，帮助用户发现、分享和管理优质的 AI 工具与资源

[在线演示](https://aimagellan.com) · [问题反馈](https://github.com/your-repo/issues)

</div>

## ✨ 特性

- 🎯 **精选内容** - 严选优质 AI 网站，分类清晰直观
- 🌍 **多语言支持** - 支持中英文界面切换
- 🔍 **智能搜索** - 快速找到需要的 AI 工具
- 🎨 **主题切换** - 支持浅色/深色主题
- 📱 **响应式设计** - 完美适配桌面、平板和移动设备
- 👮‍♂️ **后台管理** - 完善的管理员功能和审核机制
- 📊 **数据分析** - 集成 Google Analytics 和 Microsoft Clarity
- 💾 **数据备份** - 支持定时自动备份

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL 或 Neon 数据库

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-repo/ai-magellan.git
cd ai-magellan
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
# 开发环境
cp .env.example .env.development

# 生产环境
cp .env.example .env.prd
```

编辑 `.env.development` 文件，配置必要的环境变量：

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@host:port/database"

# 管理员邮箱
ADMIN_EMAILS="your-email@example.com"

# Clerk 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk 跳转配置
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# 站点配置
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# 数据分析 (可选)
GOOGLE_ANALYTICS=
CLARITY_PROJECT_ID=

# 备份配置 (可选)
BACKUP_ENABLED=true
BACKUP_INTERVAL="daily"
BACKUP_RETENTION_DAYS=30

# 健康检查 (可选)
HEALTH_CHECK_TOKEN=
```

4. **初始化数据库**

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# (可选) 初始化基础数据
npm run init-data
```

5. **启动开发服务器**

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 📦 构建与部署

### 本地构建

```bash
npm run build
npm run start
```

### Vercel 部署

1. Fork 本项目到你的 GitHub 账号
2. 在 [Vercel](https://vercel.com/) 中导入项目
3. 配置环境变量（同上）
4. 点击部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-magellan .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=your_database_url \
  --name ai-magellan \
  ai-magellan
```

## 🛠️ 技术栈

### 核心框架
- **Next.js 15** - React 框架
- **React 18** - UI 库
- **TypeScript** - 类型安全

### UI 组件
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - 组件库
- **Radix UI** - 无障碍组件
- **Framer Motion** - 动画库

### 状态管理
- **Jotai** - 原子化状态管理
- **React Query** - 服务端状态管理
- **SWR** - 数据请求

### 数据库
- **PostgreSQL / Neon** - 数据库
- **Prisma** - ORM

### 认证
- **Clerk** - 用户认证和管理

### 国际化
- **next-intl** - 多语言支持

### 其他工具
- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **Lucide React** - 图标库
- **cron** - 定时任务

## 📁 项目结构

```
ai-magellan/
├── prisma/              # 数据库 schema 和迁移
├── public/              # 静态资源
├── scripts/             # 工具脚本
├── src/
│   ├── app/            # Next.js App Router 页面
│   ├── components/     # React 组件
│   ├── lib/            # 工具函数和配置
│   ├── hooks/          # 自定义 Hooks
│   └── i18n/           # 国际化配置
├── .env.example        # 环境变量示例
└── package.json        # 项目依赖
```

## 🤝 贡献

欢迎贡献代码！请先阅读 [贡献指南](CONTRIBUTING.md)。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 🔗 相关链接

- [在线演示](https://aimagellan.com)
- [文档](https://docs.aimagellan.com)
- [问题反馈](https://github.com/your-repo/issues)

---

<div align="center">

**AI Magellan** © 2024 Made with ❤️

</div>

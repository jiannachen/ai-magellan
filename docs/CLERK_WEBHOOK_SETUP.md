# Clerk Webhook 配置指南

## 🎯 目的

自动将 Clerk 用户同步到数据库，确保用户在首次登录/注册时就被创建。

## 📋 配置步骤

### 1. 在 Clerk Dashboard 中创建 Webhook

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 选择你的应用
3. 进入 **Webhooks** 页面
4. 点击 **Add Endpoint**

### 2. 配置 Webhook 端点

**Endpoint URL**:
- 开发环境: `http://localhost:3000/api/webhooks/clerk` (使用 ngrok 或其他隧道工具)
- 生产环境: `https://yourdomain.com/api/webhooks/clerk`

**订阅事件**:
- ✅ `user.created` - 用户创建时
- ✅ `user.updated` - 用户更新时（可选）
- ✅ `user.deleted` - 用户删除时（可选）

### 3. 获取 Webhook Signing Secret

创建 Webhook 后，Clerk 会生成一个 **Signing Secret**，格式类似：
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 配置环境变量

将 Signing Secret 添加到你的环境变量文件：

**.env.development**:
```bash
CLERK_WEBHOOK_SECRET=whsec_your_development_secret_here
```

**.env.production**:
```bash
CLERK_WEBHOOK_SECRET=whsec_your_production_secret_here
```

### 5. 本地开发测试

由于 Clerk 需要访问你的 webhook 端点，本地开发时需要使用隧道工具：

#### 使用 ngrok:
```bash
ngrok http 3000
```

复制生成的 URL (如 `https://abc123.ngrok.io`)，然后在 Clerk Webhook 配置中使用：
```
https://abc123.ngrok.io/api/webhooks/clerk
```

#### 使用 Clerk CLI (推荐):
```bash
npm install -g @clerk/clerk-cli
clerk listen --forward-url http://localhost:3000/api/webhooks/clerk
```

## 🔒 安全性

- Webhook 使用 Svix 签名验证，确保请求来自 Clerk
- 未通过验证的请求会被拒绝（返回 400 错误）
- 不要将 `CLERK_WEBHOOK_SECRET` 提交到版本控制

## 🧪 测试 Webhook

### 在 Clerk Dashboard 测试

1. 进入 Webhooks 页面
2. 选择你创建的 Webhook
3. 点击 **Send test event**
4. 选择 `user.created` 事件
5. 查看响应状态

### 手动测试

创建一个新用户账号：
```bash
# 查看日志
npm run dev

# 在浏览器中注册新用户
# 检查控制台输出:
✅ Created user: user_xxxxx (user@example.com)
```

验证数据库：
```sql
SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 1;
```

## 📊 事件处理

### user.created
- 在数据库中创建新用户记录
- 如果邮箱冲突，使用 `{userId}@clerk.duplicate` 作为备用

### user.updated
- 更新现有用户信息（姓名、邮箱、头像）
- 如果用户不存在，会创建新记录（upsert）

### user.deleted
- 从数据库中删除用户记录
- 级联删除相关数据（网站、点赞、收藏、评论）

## 🔄 兜底机制

即使 Webhook 失败，系统仍有兜底机制：

所有需要用户 ID 的 API 都会调用 `ensureUserExists(userId)`:
- `/api/websites` (POST) - 提交网站
- `/api/websites/[id]/like` (POST/DELETE) - 点赞
- `/api/user/favorites` (POST) - 收藏
- `/api/websites/[id]/reviews` (POST) - 评论

## 🐛 故障排查

### Webhook 返回 400 错误
- 检查 `CLERK_WEBHOOK_SECRET` 是否正确
- 确认环境变量已重启生效

### Webhook 返回 500 错误
- 查看服务器日志
- 检查数据库连接
- 验证 Prisma schema

### 用户未创建
- 确认 Webhook 端点可访问
- 检查 Clerk Webhook 日志
- 验证事件订阅配置

### 邮箱冲突 (P2002)
- 正常：系统会使用 `{userId}@clerk.duplicate` 重试
- 查看日志确认用户已创建

## 📝 相关文件

- **Webhook 端点**: `src/app/api/webhooks/clerk/route.ts`
- **用户工具**: `src/lib/utils/user.ts`
- **环境变量**: `.env.development`, `.env.production`

## 🔗 相关链接

- [Clerk Webhooks 文档](https://clerk.com/docs/integrations/webhooks)
- [Svix 签名验证](https://docs.svix.com/receiving/verifying-payloads/how)
- [Prisma User Model](./prisma/schema.prisma)

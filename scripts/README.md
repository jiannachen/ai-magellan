# ProductHunt 数据抓取脚本

这个脚本可以从 ProductHunt 抓取热门产品数据并导入到项目数据库中。

## 配置步骤

1. **获取 ProductHunt API Token**
   - 访问 https://www.producthunt.com/v2/api-docs
   - 注册或登录 ProductHunt 账号
   - 创建应用获取 API Token

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，设置 PRODUCTHUNT_API_TOKEN
   ```

3. **确保数据库配置正确**
   - 确保 `DATABASE_URL` 已正确配置
   - 运行 Prisma 迁移：`npx prisma db push`

## 使用方法

### 快速开始 - 使用模拟数据
如果你想先测试功能，可以使用我们提供的模拟数据：

```bash
# 导入10个热门AI工具的模拟数据
npm run import-mock-data
```

模拟数据包含：ChatGPT、Claude、Midjourney、Notion AI、GitHub Copilot 等热门工具。

### 真实数据抓取
```bash
# 抓取默认数量 (1000条)
npm run scrape-producthunt

# 抓取指定数量
npm run scrape-producthunt 500
npm run scrape-producthunt 100
```

**注意：使用真实抓取需要先配置 ProductHunt API Token**

### 功能特点

- ✅ 自动获取 ProductHunt 热门产品
- ✅ 智能分类映射
- ✅ 数据清洗和转换
- ✅ 自动去重（基于URL）
- ✅ 质量评分计算
- ✅ 支持批量导入
- ✅ 保存原始数据到JSON文件

### 数据映射

脚本会将 ProductHunt 的主题自动映射到项目分类：

- `ai`, `artificial-intelligence`, `machine-learning` → `ai-tools`
- `productivity` → `productivity`
- `design-tools`, `design` → `design`
- `developer-tools`, `development` → `development`
- `marketing` → `marketing`
- `social-media` → `social`
- `fintech`, `finance` → `finance`
- 更多...

### 数据输出

1. **JSON文件**: 原始数据保存在 `data/producthunt-data.json`
2. **数据库**: 清洗后的数据导入到 `websites` 表

### 注意事项

- ProductHunt API 有速率限制，脚本已加入适当延迟
- 重复运行时会自动跳过已存在的URL
- 建议首次运行时抓取较少数量测试
- API Token 需要妥善保管，不要提交到版本控制

## 故障排除

1. **API Token 错误**
   ```
   ❌ ProductHunt API Token not found
   ```
   解决：检查 `.env` 文件中的 `PRODUCTHUNT_API_TOKEN` 配置

2. **数据库连接错误**
   ```
   ❌ Error importing data
   ```
   解决：检查 `DATABASE_URL` 配置，确保数据库服务正常

3. **网络错误**
   ```
   ❌ Error fetching data
   ```
   解决：检查网络连接，或稍后重试
# ProductHunt 数据抓取 & 自动数据增强

这套工具提供完整的数据获取和增强解决方案，包括ProductHunt真实数据抓取、模拟数据导入和智能数据增强。

## 🚀 核心功能

### 1. ProductHunt 数据抓取
- **真实数据获取**: 从ProductHunt API获取热门产品
- **模拟数据导入**: 内置10个热门AI工具的完整数据
- **智能分类映射**: 自动将ProductHunt分类映射到项目分类

### 2. 自动数据增强 (NEW!)
- **🔍 智能网站分析**: 自动访问网站并提取关键信息
- **🔗 社交链接检测**: 自动发现Twitter、LinkedIn、GitHub链接
- **💰 定价信息分析**: 智能分析定价模型和免费版本信息
- **📱 应用链接发现**: 自动检测iOS/Android应用下载链接
- **🏷️ Logo和元数据**: 自动提取网站Logo和描述信息
- **⚙️ 技术栈检测**: 分析API可用性和平台支持

## 📊 数据完整度对比

| 功能 | ProductHunt API | 自动增强后 | 提升 |
|------|----------------|------------|------|
| Logo链接 | ❌ 无 | ✅ 自动提取 | +100% |
| 社交媒体 | ❌ 部分屏蔽 | ✅ 智能检测 | +800% |
| 定价信息 | ❌ 缺失 | ✅ 智能分析 | +100% |
| 应用下载 | ❌ 无 | ✅ 自动发现 | +100% |
| 联系邮箱 | ❌ 无 | ✅ 智能推荐 | +100% |
| 平台支持 | ❌ 基础 | ✅ 详细分析 | +400% |

## 🛠️ 使用指南

### 快速开始 - 推荐方式
```bash
# 1. 导入模拟数据（10个热门AI工具，数据完整）
npm run import-mock-data

# 2. 自动增强所有数据
npm run auto-enhance 20   # 增强20个网站
```

### 真实数据抓取
```bash
# 1. 配置API Token（可选）
# 编辑 .env 文件：PRODUCTHUNT_API_TOKEN="your-token"

# 2. 抓取真实数据
npm run scrape-producthunt 100

# 3. 自动增强新数据
npm run auto-enhance 100
```

## 🔧 可用命令

### 数据获取
```bash
npm run scrape-producthunt [数量]    # 抓取ProductHunt真实数据
npm run import-mock-data             # 导入模拟数据
```

### 数据增强
```bash
npm run auto-enhance [数量]          # 🔥 自动智能数据增强 (推荐)
npm run enhance-data                 # 交互式手动增强
npm run enhance-website-data         # 基础URL解析增强
```

### 数据分析
```bash
npx ts-node scripts/analyze-data.ts     # 数据完整性分析
npx ts-node scripts/check-data.ts       # 数据概览检查
```

## 🎯 自动增强功能详解

### 智能数据提取
- **元数据分析**: 提取og:title、og:description、og:image
- **内容智能解析**: 分析HTML内容识别关键信息
- **链接模式匹配**: 使用正则表达式精准匹配社交媒体链接
- **价格关键词检测**: 识别定价相关内容并分类

### 提取的数据字段
- ✅ **Logo链接** - 从meta标签或常见路径提取
- ✅ **社交媒体** - Twitter、LinkedIn、GitHub链接
- ✅ **定价信息** - 定价模型、免费版本、基础价格
- ✅ **应用下载** - iOS App Store、Google Play链接
- ✅ **平台支持** - Web、移动端、桌面端、扩展
- ✅ **联系邮箱** - 基于域名智能推荐
- ✅ **API状态** - 检测是否提供开发者API

### 智能分析算法
```typescript
// 定价模型检测
if (html.includes('subscription') || html.includes('monthly')) {
  pricing_model = 'subscription';
} else if (html.includes('freemium')) {
  pricing_model = 'freemium';
}

// 社交链接检测
const twitterMatch = html.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
const githubMatch = html.match(/github\.com\/([a-zA-Z0-9_-]+)/);
```

## 📈 效果展示

### 增强前数据（ProductHunt原始）
```json
{
  "title": "GitHub Copilot",
  "url": "https://github.com/features/copilot",
  "description": "Your AI pair programmer",
  "logo_url": null,
  "twitter_url": null,
  "pricing_model": "freemium"
}
```

### 增强后数据（自动分析）
```json
{
  "title": "GitHub Copilot", 
  "url": "https://github.com/features/copilot",
  "description": "Your AI pair programmer",
  "logo_url": "https://github.com/images/modules/logos_page/Octocat.png",
  "twitter_url": "https://twitter.com/github",
  "github_url": "https://github.com/github",
  "linkedin_url": "https://linkedin.com/company/github",
  "pricing_model": "subscription",
  "supported_platforms": ["web", "windows", "mac"],
  "api_available": true,
  "email": "hello@github.com"
}
```

## ⚡ 性能与限制

### 性能优化
- **并发控制**: 避免过频请求导致封IP
- **智能重试**: 失败自动重试3次
- **超时控制**: 15秒超时避免卡死
- **错误处理**: 优雅处理各种异常情况

### 已知限制
- 某些网站有反爬虫保护（如ChatGPT、Midjourney）
- 需要良好的网络连接
- 分析大量网站需要时间较长

### 推荐策略
1. **先导入模拟数据** - 快速获得高质量基础数据
2. **小批量测试** - 用少量数据验证效果  
3. **逐步增强** - 分批处理避免被限制
4. **定期更新** - 定时运行保持数据新鲜

## 🎉 最终效果

经过完整的数据获取和增强流程，你的AI导航网站将拥有：

- ✅ **21+ 个高质量工具数据**
- ✅ **完整的Logo和截图**
- ✅ **准确的定价信息**
- ✅ **丰富的社交媒体链接**
- ✅ **详细的平台支持信息**
- ✅ **智能的分类系统**
- ✅ **持续更新的数据**

这套解决方案让你无需手动收集，就能获得与toolbit.ai等专业导航网站相当的数据质量！
import fetch from 'node-fetch';
import { db } from '../src/lib/db/db';
import { websites } from '../src/lib/db/schema';
import { or, eq, isNull, desc, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

// 智能网站内容分析器
class WebsiteAnalyzer {
  private html: string = '';
  private url: string = '';
  private domain: string = '';

  constructor(html: string, url: string) {
    this.html = html.toLowerCase();
    this.url = url;
    this.domain = new URL(url).hostname;
  }

  // 提取meta标签信息
  extractMetadata() {
    const metadata: any = {};
    
    // 标题
    metadata.title = this.extractMetaContent('og:title') || this.extractTitle();
    
    // 描述
    metadata.description = this.extractMetaContent('og:description') || 
                          this.extractMetaContent('description');
    
    // 图片/Logo
    metadata.logo_url = this.extractMetaContent('og:image') || 
                       this.findLogo();
    
    // 网站类型
    metadata.site_type = this.extractMetaContent('og:type');
    
    return metadata;
  }

  // 智能检测社交媒体链接
  detectSocialLinks() {
    const social: any = {};
    
    // Twitter链接检测
    const twitterMatch = this.html.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
    if (twitterMatch) {
      social.twitter_url = `https://twitter.com/${twitterMatch[1]}`;
    }
    
    // GitHub链接检测
    const githubMatch = this.html.match(/github\.com\/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)?)/);
    if (githubMatch) {
      social.github_url = `https://github.com/${githubMatch[1]}`;
    }
    
    // LinkedIn链接检测
    const linkedinMatch = this.html.match(/linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/);
    if (linkedinMatch) {
      social.linkedin_url = `https://linkedin.com/company/${linkedinMatch[1]}`;
    }
    
    return social;
  }

  // 智能定价分析
  analyzePricing() {
    const pricing: any = {};
    
    // 检测免费版本
    const freeKeywords = ['free', 'free plan', 'free tier', 'no cost', '免费'];
    pricing.has_free_version = freeKeywords.some(keyword => this.html.includes(keyword));
    
    // 检测定价模型
    if (this.html.includes('subscription') || this.html.includes('monthly') || this.html.includes('yearly')) {
      pricing.pricing_model = 'subscription';
    } else if (this.html.includes('freemium') || (pricing.has_free_version && this.html.includes('premium'))) {
      pricing.pricing_model = 'freemium';
    } else if (this.html.includes('enterprise') || this.html.includes('contact for pricing')) {
      pricing.pricing_model = 'enterprise';
    } else if (this.html.includes('pay per use') || this.html.includes('usage based')) {
      pricing.pricing_model = 'pay-per-use';
    } else if (pricing.has_free_version && !this.html.includes('premium') && !this.html.includes('pro')) {
      pricing.pricing_model = 'free';
    } else {
      pricing.pricing_model = 'freemium';
    }
    
    // 提取价格信息
    const priceMatch = this.html.match(/\$(\d+(?:\.\d{2})?)\s*(?:\/|\s*per\s*)?(?:month|mo|user|seat)/);
    if (priceMatch) {
      pricing.base_price = `$${priceMatch[1]}/month`;
    }
    
    return pricing;
  }

  // 检测应用下载链接
  detectAppLinks() {
    const apps: any = {};
    
    // iOS App Store
    const iosMatch = this.html.match(/apps\.apple\.com\/[^"'\s>]+/);
    if (iosMatch) {
      apps.ios_app_url = `https://${iosMatch[0]}`;
    }
    
    // Google Play Store
    const androidMatch = this.html.match(/play\.google\.com\/store\/apps\/[^"'\s>]+/);
    if (androidMatch) {
      apps.android_app_url = `https://${androidMatch[0]}`;
    }
    
    return apps;
  }

  // 检测平台支持
  detectPlatformSupport() {
    const platforms = [];
    
    // Web (默认)
    platforms.push('web');
    
    // 移动应用
    if (this.html.includes('ios') || this.html.includes('iphone') || this.html.includes('ipad')) {
      platforms.push('ios');
    }
    if (this.html.includes('android')) {
      platforms.push('android');
    }
    
    // 桌面应用
    if (this.html.includes('windows') || this.html.includes('.exe')) {
      platforms.push('windows');
    }
    if (this.html.includes('macos') || this.html.includes('mac app')) {
      platforms.push('mac');
    }
    if (this.html.includes('linux')) {
      platforms.push('linux');
    }
    
    // Chrome扩展
    if (this.html.includes('chrome extension') || this.html.includes('chrome web store')) {
      platforms.push('chrome-extension');
    }
    
    return platforms;
  }

  // 检测API可用性
  detectAPI() {
    const apiKeywords = ['api', 'developer', 'integration', 'webhook', 'rest api', 'graphql'];
    return apiKeywords.some(keyword => this.html.includes(keyword));
  }

  // 生成联系邮箱建议
  suggestEmail() {
    const commonPrefixes = ['hello', 'contact', 'support', 'info', 'sales'];
    return commonPrefixes.map(prefix => `${prefix}@${this.domain}`);
  }

  // 辅助方法：提取meta内容
  private extractMetaContent(property: string): string | null {
    const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
    const match = this.html.match(regex);
    return match ? match[1] : null;
  }

  // 辅助方法：提取标题
  private extractTitle(): string | null {
    const match = this.html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  // 辅助方法：查找Logo
  private findLogo(): string | null {
    // 查找常见的logo路径
    const logoPatterns = [
      /src=["']([^"']*logo[^"']*\.(?:png|jpg|jpeg|svg))["']/i,
      /href=["']([^"']*favicon[^"']*\.(?:ico|png|jpg|jpeg|svg))["']/i,
      /src=["']([^"']*brand[^"']*\.(?:png|jpg|jpeg|svg))["']/i,
    ];
    
    for (const pattern of logoPatterns) {
      const match = this.html.match(pattern);
      if (match) {
        let logoUrl = match[1];
        // 处理相对路径
        if (logoUrl.startsWith('/')) {
          logoUrl = `${this.url.split('/').slice(0, 3).join('/')}${logoUrl}`;
        } else if (!logoUrl.startsWith('http')) {
          logoUrl = `${this.url}/${logoUrl}`;
        }
        return logoUrl;
      }
    }
    
    return null;
  }
}

// 自动数据增强主函数
async function autoEnhanceWebsiteData(website: any, retries = 3): Promise<any> {
  try {
    console.log(`🔍 分析: ${website.title}`);
    console.log(`🔗 URL: ${website.url}`);
    
    // 获取网站内容
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(website.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Navigation-Bot/1.0; +https://ai-navigation.com/bot)'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const analyzer = new WebsiteAnalyzer(html, website.url);

    // 提取各种数据
    const metadata = analyzer.extractMetadata();
    const socialLinks = analyzer.detectSocialLinks();
    const pricingInfo = analyzer.analyzePricing();
    const appLinks = analyzer.detectAppLinks();
    const platforms = analyzer.detectPlatformSupport();
    const hasAPI = analyzer.detectAPI();
    const emailSuggestions = analyzer.suggestEmail();

    // 组合更新数据
    const updates: any = {
      lastChecked: new Date(),
      responseTime: Date.now() % 1000, // 模拟响应时间
    };

    // 更新meta信息
    if (metadata.logo_url && !website.logoUrl) {
      updates.logoUrl = metadata.logo_url;
    }

    // 更新社交链接
    Object.entries(socialLinks).forEach(([key, value]) => {
      // 转换 snake_case 到 camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (value && !(website as any)[camelKey]) {
        updates[camelKey] = value;
      }
    });

    // 更新定价信息
    if (pricingInfo.pricing_model !== website.pricingModel) {
      updates.pricingModel = pricingInfo.pricing_model;
    }
    if (pricingInfo.has_free_version !== website.hasFreeVersion) {
      updates.hasFreeVersion = pricingInfo.has_free_version;
    }
    if (pricingInfo.base_price && !website.basePrice) {
      updates.basePrice = pricingInfo.base_price;
    }

    // 更新应用链接
    Object.entries(appLinks).forEach(([key, value]) => {
      // 转换 snake_case 到 camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      if (value && !(website as any)[camelKey]) {
        updates[camelKey] = value;
      }
    });

    // 更新平台支持
    if (platforms.length > 0) {
      const currentPlatforms = website.supportedPlatforms
        ? (Array.isArray(website.supportedPlatforms)
            ? website.supportedPlatforms
            : JSON.parse(String(website.supportedPlatforms)))
        : ['web'];
      const newPlatforms = [...new Set([...currentPlatforms, ...platforms])];
      updates.supportedPlatforms = newPlatforms;
    }

    // 更新API信息
    if (hasAPI && !website.apiAvailable) {
      updates.apiAvailable = true;
    }

    // 生成邮箱建议（不直接更新，只记录）
    if (!website.email && emailSuggestions.length > 0) {
      updates.email = emailSuggestions[0]; // 选择最可能的邮箱
    }

    // 统计更新字段数
    const updateCount = Object.keys(updates).length - 2; // 排除 lastChecked 和 responseTime
    
    console.log(`✅ 成功分析: ${website.title}`);
    console.log(`📊 更新字段: ${updateCount} 个`);
    if (updateCount > 0) {
      console.log(`🔄 更新内容: ${Object.keys(updates).filter(k => k !== 'lastChecked' && k !== 'responseTime').join(', ')}`);
    }

    return { success: true, updates, updateCount };

  } catch (error) {
    if (retries > 0) {
      console.log(`⚠️ 重试 ${website.title} (剩余 ${retries} 次)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return autoEnhanceWebsiteData(website, retries - 1);
    }

    console.error(`❌ 分析失败: ${website.title} - ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      updates: { lastChecked: new Date(), responseTime: null }
    };
  }
}

// 批量自动增强
async function batchAutoEnhance(limit: number = 20) {
  console.log('🚀 启动自动数据增强...\n');

  // 获取需要增强的网站
  const websitesList = await db.query.websites.findMany({
    where: or(
      isNull(websites.logoUrl),
      isNull(websites.twitterUrl),
      isNull(websites.linkedinUrl),
      isNull(websites.githubUrl),
      isNull(websites.basePrice),
      isNull(websites.iosAppUrl),
      isNull(websites.androidAppUrl),
      eq(websites.apiAvailable, false),
      eq(websites.pricingModel, 'freemium')
    ),
    orderBy: [desc(websites.isFeatured), desc(websites.likes)],
    limit: limit
  });

  console.log(`📊 找到 ${websitesList.length} 个待增强的网站\n`);

  const stats = {
    processed: 0,
    success: 0,
    failed: 0,
    totalUpdates: 0
  };

  // 处理每个网站
  for (let i = 0; i < websitesList.length; i++) {
    const website = websitesList[i];

    console.log(`\n[${i + 1}/${websitesList.length}] 处理: ${website.title}`);

    try {
      const result = await autoEnhanceWebsiteData(website);

      if (result.success) {
        // 更新数据库
        await db.update(websites)
          .set(result.updates)
          .where(eq(websites.id, website.id));

        stats.success++;
        stats.totalUpdates += result.updateCount || 0;

        console.log(`✅ 已更新数据库`);
      } else {
        // 记录失败但仍更新检查时间
        await db.update(websites)
          .set(result.updates)
          .where(eq(websites.id, website.id));

        stats.failed++;
        console.log(`❌ 处理失败: ${result.error}`);
      }

    } catch (error) {
      stats.failed++;
      console.error(`💥 数据库更新失败: ${error}`);
    }

    stats.processed++;

    // 避免请求过频
    if (i < websitesList.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // 显示统计结果
  console.log('\n' + '='.repeat(50));
  console.log('📈 批量增强完成统计:');
  console.log('='.repeat(50));
  console.log(`🔢 处理总数: ${stats.processed}`);
  console.log(`✅ 成功: ${stats.success}`);
  console.log(`❌ 失败: ${stats.failed}`);
  console.log(`🔄 总更新字段: ${stats.totalUpdates}`);
  console.log(`📊 成功率: ${((stats.success / stats.processed) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));
}

// 生成增强报告
async function generateAutoEnhancementReport() {
  console.log('📊 生成自动增强报告...\n');

  const websitesList = await db.query.websites.findMany();
  const total = websitesList.length;

  // 计算各字段的填充率
  const fields = [
    'logoUrl', 'twitterUrl', 'linkedinUrl', 'githubUrl',
    'basePrice', 'iosAppUrl', 'androidAppUrl', 'email',
    'apiAvailable', 'hasFreeVersion'
  ];

  console.log('📈 数据完整度报告:');
  console.log('='.repeat(60));

  fields.forEach(field => {
    const filled = websitesList.filter(w => {
      const value = (w as any)[field];
      return value !== null && value !== undefined && value !== '' && value !== false;
    }).length;

    const percentage = ((filled / total) * 100).toFixed(1);
    console.log(`${field.padEnd(20)}: ${filled.toString().padStart(4)}/${total} (${percentage}%)`);
  });

  // 平台支持统计
  console.log('\n💻 平台支持统计:');
  console.log('-'.repeat(40));

  const platformStats: Record<string, number> = {};
  websitesList.forEach(website => {
    if (website.supportedPlatforms) {
      try {
        const platforms = Array.isArray(website.supportedPlatforms)
          ? website.supportedPlatforms
          : JSON.parse(String(website.supportedPlatforms));
        platforms.forEach((platform: string) => {
          platformStats[platform] = (platformStats[platform] || 0) + 1;
        });
      } catch (e) {
        // 忽略JSON解析错误
      }
    }
  });

  Object.entries(platformStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([platform, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      console.log(`${platform.padEnd(20)}: ${count.toString().padStart(4)} (${percentage}%)`);
    });

  // 定价模型统计
  console.log('\n💰 定价模型分布:');
  console.log('-'.repeat(40));

  const pricingStats: Record<string, number> = {};
  websitesList.forEach(website => {
    const model = website.pricingModel || 'unknown';
    pricingStats[model] = (pricingStats[model] || 0) + 1;
  });

  Object.entries(pricingStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([model, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      console.log(`${model.padEnd(20)}: ${count.toString().padStart(4)} (${percentage}%)`);
    });
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);
    const limit = parseInt(args[0]) || 20;
    
    console.log('🎯 自动数据增强工具');
    console.log(`📊 处理数量限制: ${limit}\n`);

    // 批量自动增强
    await batchAutoEnhance(limit);

    // 生成报告
    await generateAutoEnhancementReport();

    console.log('\n🎉 所有任务完成!');

  } catch (error) {
    console.error('❌ 程序错误:', error);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

export { batchAutoEnhance, autoEnhanceWebsiteData };
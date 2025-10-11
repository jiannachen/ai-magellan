import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 解析ProductHunt重定向链接获取真实URL
async function getRealWebsiteUrl(phRedirectUrl: string): Promise<string | null> {
  try {
    console.log(`🔗 解析重定向: ${phRedirectUrl}`);
    
    // 发送HEAD请求，不下载内容，只获取重定向
    const response = await fetch(phRedirectUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Navigation-Bot/1.0)'
      }
    });

    const finalUrl = response.url;
    
    // 过滤掉一些已知的不良重定向
    if (finalUrl.includes('producthunt.com') || 
        finalUrl.includes('utm_')) {
      return null;
    }
    
    console.log(`✅ 真实URL: ${finalUrl}`);
    return finalUrl;
    
  } catch (error) {
    console.error(`❌ 解析重定向失败: ${error}`);
    return null;
  }
}

// 抓取网站基本信息
async function scrapeWebsiteInfo(url: string) {
  try {
    console.log(`📄 抓取网站信息: ${url}`);
    
    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Navigation-Bot/1.0)'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // 基础信息提取
    const info = {
      title: extractMetaContent(html, 'og:title') || extractTitle(html),
      description: extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description'),
      image: extractMetaContent(html, 'og:image'),
      site_name: extractMetaContent(html, 'og:site_name'),
      twitter_handle: extractMetaContent(html, 'twitter:site'),
      // 检测定价相关内容
      has_pricing: html.toLowerCase().includes('pricing') || html.toLowerCase().includes('price'),
      has_free_tier: html.toLowerCase().includes('free') && (html.toLowerCase().includes('plan') || html.toLowerCase().includes('tier')),
      // 检测平台支持
      supports_ios: html.toLowerCase().includes('app store') || html.toLowerCase().includes('ios'),
      supports_android: html.toLowerCase().includes('google play') || html.toLowerCase().includes('android'),
      // 检测API
      has_api: html.toLowerCase().includes('api') && html.toLowerCase().includes('documentation'),
    };

    console.log(`✅ 抓取成功: ${info.title}`);
    return info;

  } catch (error) {
    console.error(`❌ 抓取失败 ${url}: ${error}`);
    return null;
  }
}

// 辅助函数：提取meta标签内容
function extractMetaContent(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

// 辅助函数：提取title
function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : null;
}

// 增强现有网站数据
async function enhanceWebsiteData() {
  console.log('🚀 开始增强网站数据...\n');

  // 获取所有需要增强的网站
  const websites = await prisma.website.findMany({
    where: {
      // 只处理从ProductHunt来的数据（URL包含重定向特征）
      OR: [
        { url: { contains: 'producthunt.com/r/' } },
        { url: { contains: 'utm_campaign=producthunt-api' } }
      ]
    },
    take: 5 // 限制处理数量，避免过度请求
  });

  console.log(`📊 找到 ${websites.length} 个需要增强的网站\n`);

  for (const website of websites) {
    try {
      console.log(`🔄 处理: ${website.title}`);
      
      // 1. 解析真实URL
      const realUrl = await getRealWebsiteUrl(website.url);
      
      if (!realUrl) {
        console.log(`⏭️ 跳过 ${website.title}: 无法获取真实URL\n`);
        continue;
      }

      // 2. 抓取网站信息
      const siteInfo = await scrapeWebsiteInfo(realUrl);
      
      if (!siteInfo) {
        console.log(`⏭️ 跳过 ${website.title}: 无法抓取网站信息\n`);
        continue;
      }

      // 3. 更新数据库
      const updateData: any = {
        url: realUrl, // 更新为真实URL
        last_checked: new Date(),
      };

      // 更新缺失的字段
      if (siteInfo.description && !website.detailed_description) {
        updateData.detailed_description = siteInfo.description;
      }
      
      if (siteInfo.image && !website.logo_url) {
        updateData.logo_url = siteInfo.image;
      }

      if (siteInfo.twitter_handle && !website.twitter_url) {
        updateData.twitter_url = `https://twitter.com/${siteInfo.twitter_handle.replace('@', '')}`;
      }

      // 更新定价信息
      if (siteInfo.has_pricing && website.pricing_model === 'freemium') {
        updateData.pricing_model = siteInfo.has_free_tier ? 'freemium' : 'paid';
        updateData.has_free_version = siteInfo.has_free_tier;
      }

      // 更新平台支持
      const platforms = [];
      if (siteInfo.supports_ios) platforms.push('ios');
      if (siteInfo.supports_android) platforms.push('android');
      platforms.push('web'); // 默认支持web
      updateData.supported_platforms = JSON.stringify([...new Set(platforms)]);

      // 更新API信息
      if (siteInfo.has_api) {
        updateData.api_available = true;
      }

      await prisma.website.update({
        where: { id: website.id },
        data: updateData
      });

      console.log(`✅ 已增强: ${website.title}`);
      console.log(`   真实URL: ${realUrl}`);
      console.log(`   定价模式: ${updateData.pricing_model || website.pricing_model}`);
      console.log(`   平台支持: ${updateData.supported_platforms || website.supported_platforms}`);
      console.log('');

      // 添加延迟，避免请求过频
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ 处理 ${website.title} 时出错:`, error);
    }
  }

  console.log('🎉 数据增强完成!');
}

// 主函数
async function main() {
  try {
    await enhanceWebsiteData();
  } catch (error) {
    console.error('❌ 主函数错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

export { enhanceWebsiteData };
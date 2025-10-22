import { PrismaClient } from '@prisma/client';
import puppeteer, { Page } from 'puppeteer';

const prisma = new PrismaClient();

async function extractImages(page: Page, url: string) {
  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    const images = await page.evaluate(() => {
      // 提取 thumbnail (OG Image)
      let thumbnail = null;
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        thumbnail = ogImage.getAttribute('content');
      }

      if (!thumbnail) {
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
          thumbnail = twitterImage.getAttribute('content');
        }
      }

      // 提取 logo
      let logoUrl = null;

      // 尝试获取 favicon/icon
      const iconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
      if (iconLink) {
        logoUrl = iconLink.getAttribute('href');
      }

      // 转换相对路径为绝对路径
      const baseUrl = window.location.origin;
      if (thumbnail && !thumbnail.startsWith('http')) {
        thumbnail = new URL(thumbnail, baseUrl).href;
      }
      if (logoUrl && !logoUrl.startsWith('http')) {
        logoUrl = new URL(logoUrl, baseUrl).href;
      }

      return { logoUrl, thumbnail };
    });

    return images;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ 提取失败: ${message}`);
    return { logoUrl: null, thumbnail: null };
  }
}

async function main() {
  console.log('开始提取网站图片...\n');

  // 获取缺少图片的网站
  const websites = await prisma.website.findMany({
    where: {
      OR: [
        { logo_url: null },
        { thumbnail: null }
      ]
    },
    select: {
      id: true,
      title: true,
      url: true,
      logo_url: true,
      thumbnail: true
    },
    orderBy: {
      id: 'desc' // 从新的开始处理
    },
    take: 100 // 限制处理数量
  });

  console.log(`找到 ${websites.length} 个需要更新图片的网站\n`);

  if (websites.length === 0) {
    console.log('所有网站都已有图片！');
    await prisma.$disconnect();
    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  let logoUpdated = 0;
  let thumbnailUpdated = 0;
  let failed = 0;

  for (let i = 0; i < websites.length; i++) {
    const website = websites[i];
    console.log(`\n[${i + 1}/${websites.length}] ${website.title}`);
    console.log(`  URL: ${website.url}`);

    try {
      const images = await extractImages(page, website.url);
      const updateData: any = {};

      if (!website.logo_url && images.logoUrl) {
        updateData.logo_url = images.logoUrl;
        console.log(`  ✓ Logo: ${images.logoUrl}`);
        logoUpdated++;
      } else if (website.logo_url) {
        console.log(`  ⊘ Logo 已存在`);
      } else {
        console.log(`  ✗ Logo 未找到`);
      }

      if (!website.thumbnail && images.thumbnail) {
        updateData.thumbnail = images.thumbnail;
        console.log(`  ✓ Thumbnail: ${images.thumbnail}`);
        thumbnailUpdated++;
      } else if (website.thumbnail) {
        console.log(`  ⊘ Thumbnail 已存在`);
      } else {
        console.log(`  ✗ Thumbnail 未找到`);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.website.update({
          where: { id: website.id },
          data: updateData
        });
        console.log(`  ✓ 已更新数据库`);
      }

    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ 处理失败: ${message}`);
    }

    // 每5个网站暂停2秒
    if ((i + 1) % 5 === 0 && i < websites.length - 1) {
      console.log(`\n已处理 ${i + 1} 个，暂停 2 秒...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  await browser.close();
  await prisma.$disconnect();

  console.log('\n=== 提取完成 ===');
  console.log(`Logo 更新: ${logoUpdated}`);
  console.log(`Thumbnail 更新: ${thumbnailUpdated}`);
  console.log(`处理失败: ${failed}`);
  console.log(`总计处理: ${websites.length}`);
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    // 检查网站数量
    const websiteCount = await prisma.website.count();
    console.log(`📊 数据库中共有 ${websiteCount} 个网站`);

    // 检查分类
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            websites: true
          }
        }
      }
    });

    console.log('\n📂 分类统计:');
    categories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug}): ${category._count.websites} 个网站`);
    });

    // 检查最新导入的网站
    const latestWebsites = await prisma.website.findMany({
      take: 5,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        category: true
      }
    });

    console.log('\n🆕 最新导入的网站:');
    latestWebsites.forEach(website => {
      console.log(`  - ${website.title} (${website.category.name}) - ${website.likes} 点赞`);
    });

    // 检查高质量网站
    const featuredWebsites = await prisma.website.findMany({
      where: {
        is_featured: true
      },
      orderBy: {
        quality_score: 'desc'
      },
      take: 5
    });

    console.log('\n⭐ 精选网站 (按质量评分):');
    featuredWebsites.forEach(website => {
      console.log(`  - ${website.title}: ${website.quality_score} 分`);
    });

  } catch (error) {
    console.error('❌ 检查数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
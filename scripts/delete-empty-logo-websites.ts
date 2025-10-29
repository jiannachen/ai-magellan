import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始检查logo_url为空的网站数据...\n');

  // 第一步：统计logo_url为空的网站数量
  const emptyLogoWebsites = await prisma.website.findMany({
    where: {
      OR: [
        { logo_url: null },
        { logo_url: '' }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      url: true,
      status: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  console.log(`找到 ${emptyLogoWebsites.length} 个logo_url为空的网站`);

  // 按状态分组统计
  const statusCounts = emptyLogoWebsites.reduce((acc, website) => {
    acc[website.status] = (acc[website.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n按状态分组统计:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // 显示前20条记录
  console.log('\n前20条记录:');
  emptyLogoWebsites.slice(0, 20).forEach((website, index) => {
    console.log(`${index + 1}. [${website.status}] ${website.title} (${website.url})`);
    console.log(`   ID: ${website.id}, Slug: ${website.slug}, 创建时间: ${website.created_at}`);
  });

  // 询问是否删除
  console.log('\n⚠️  准备删除这些数据...');
  console.log('注意: 这将级联删除相关的 likes, favorites, reviews, categories 关联数据');
  console.log('\n如果要执行删除，请取消注释下面的代码块:\n');

  // 取消下面的注释来执行删除
  /*
  const deleteResult = await prisma.website.deleteMany({
    where: {
      OR: [
        { logo_url: null },
        { logo_url: '' }
      ]
    }
  });

  console.log(`\n✅ 成功删除 ${deleteResult.count} 个网站数据`);

  // 验证删除结果
  const remainingCount = await prisma.website.count({
    where: {
      OR: [
        { logo_url: null },
        { logo_url: '' }
      ]
    }
  });

  console.log(`剩余logo_url为空的网站数量: ${remainingCount}`);
  */
}

main()
  .catch((error) => {
    console.error('❌ 执行出错:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

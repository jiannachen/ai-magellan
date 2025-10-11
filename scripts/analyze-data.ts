import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDataCompleteness() {
  try {
    console.log('🔍 分析导入数据的完整性...\n');

    // 获取一个样本网站数据
    const sampleWebsite = await prisma.website.findFirst({
      where: {
        title: 'ChatGPT'
      }
    });

    if (!sampleWebsite) {
      console.log('❌ 未找到样本数据');
      return;
    }

    console.log('📊 样本数据分析 (ChatGPT):');
    console.log('==========================================');

    // 基本信息
    console.log('\n🔤 基本信息:');
    console.log(`  ✅ title: ${sampleWebsite.title}`);
    console.log(`  ✅ url: ${sampleWebsite.url}`);
    console.log(`  ✅ description: ${sampleWebsite.description}`);
    console.log(`  ✅ thumbnail: ${sampleWebsite.thumbnail ? '有' : '❌ 无'}`);
    console.log(`  ✅ status: ${sampleWebsite.status}`);
    console.log(`  ✅ visits: ${sampleWebsite.visits}`);
    console.log(`  ✅ likes: ${sampleWebsite.likes}`);

    // 质量评估
    console.log('\n⭐ 质量评估:');
    console.log(`  ✅ quality_score: ${sampleWebsite.quality_score}`);
    console.log(`  ✅ is_trusted: ${sampleWebsite.is_trusted}`);
    console.log(`  ✅ is_featured: ${sampleWebsite.is_featured}`);
    console.log(`  ✅ weight: ${sampleWebsite.weight}`);
    console.log(`  ✅ tags: ${sampleWebsite.tags || '❌ 无'}`);

    // 增强字段
    console.log('\n📝 增强表单字段:');
    console.log(`  ${sampleWebsite.email ? '✅' : '❌'} email: ${sampleWebsite.email || '无'}`);
    console.log(`  ✅ tagline: ${sampleWebsite.tagline || '无'}`);
    console.log(`  ✅ features: ${sampleWebsite.features ? JSON.stringify(sampleWebsite.features) : '无'}`);
    console.log(`  ✅ pricing_model: ${sampleWebsite.pricing_model}`);
    console.log(`  ✅ has_free_version: ${sampleWebsite.has_free_version}`);
    console.log(`  ${sampleWebsite.base_price ? '✅' : '❌'} base_price: ${sampleWebsite.base_price || '无'}`);

    // 社交媒体
    console.log('\n📱 社交媒体链接:');
    console.log(`  ${sampleWebsite.twitter_url ? '✅' : '❌'} twitter_url: ${sampleWebsite.twitter_url || '无'}`);
    console.log(`  ${sampleWebsite.linkedin_url ? '✅' : '❌'} linkedin_url: ${sampleWebsite.linkedin_url || '无'}`);
    console.log(`  ${sampleWebsite.facebook_url ? '✅' : '❌'} facebook_url: ${sampleWebsite.facebook_url || '无'}`);
    console.log(`  ${sampleWebsite.instagram_url ? '✅' : '❌'} instagram_url: ${sampleWebsite.instagram_url || '无'}`);
    console.log(`  ${sampleWebsite.youtube_url ? '✅' : '❌'} youtube_url: ${sampleWebsite.youtube_url || '无'}`);
    console.log(`  ${sampleWebsite.discord_url ? '✅' : '❌'} discord_url: ${sampleWebsite.discord_url || '无'}`);

    // 平台支持
    console.log('\n💻 平台支持:');
    console.log(`  ${sampleWebsite.ios_app_url ? '✅' : '❌'} ios_app_url: ${sampleWebsite.ios_app_url || '无'}`);
    console.log(`  ${sampleWebsite.android_app_url ? '✅' : '❌'} android_app_url: ${sampleWebsite.android_app_url || '无'}`);
    console.log(`  ${sampleWebsite.web_app_url ? '✅' : '❌'} web_app_url: ${sampleWebsite.web_app_url || '无'}`);
    console.log(`  ✅ desktop_platforms: ${sampleWebsite.desktop_platforms ? JSON.stringify(sampleWebsite.desktop_platforms) : '[]'}`);

    // 专业AI工具字段
    console.log('\n🤖 专业AI工具字段:');
    console.log(`  ${sampleWebsite.logo_url ? '✅' : '❌'} logo_url: ${sampleWebsite.logo_url || '无'}`);
    console.log(`  ✅ screenshots: ${sampleWebsite.screenshots ? JSON.stringify(sampleWebsite.screenshots).substring(0, 100) + '...' : '[]'}`);
    console.log(`  ${sampleWebsite.video_url ? '✅' : '❌'} video_url: ${sampleWebsite.video_url || '无'}`);
    console.log(`  ${sampleWebsite.github_url ? '✅' : '❌'} github_url: ${sampleWebsite.github_url || '无'}`);

    // 技术信息
    console.log('\n🔧 技术信息:');
    console.log(`  ✅ supported_platforms: ${sampleWebsite.supported_platforms ? JSON.stringify(sampleWebsite.supported_platforms) : '[]'}`);
    console.log(`  ✅ api_available: ${sampleWebsite.api_available}`);
    console.log(`  ✅ integrations: ${sampleWebsite.integrations ? JSON.stringify(sampleWebsite.integrations) : '[]'}`);
    console.log(`  ✅ languages_supported: ${sampleWebsite.languages_supported ? JSON.stringify(sampleWebsite.languages_supported) : '[]'}`);

    // 高级功能
    console.log('\n🚀 高级功能:');
    console.log(`  ✅ use_cases: ${sampleWebsite.use_cases ? JSON.stringify(sampleWebsite.use_cases).substring(0, 100) + '...' : '[]'}`);
    console.log(`  ✅ target_audience: ${sampleWebsite.target_audience ? JSON.stringify(sampleWebsite.target_audience) : '[]'}`);
    console.log(`  ✅ pros_cons: ${sampleWebsite.pros_cons ? JSON.stringify(sampleWebsite.pros_cons).substring(0, 100) + '...' : '{}'}`);
    console.log(`  ✅ alternatives: ${sampleWebsite.alternatives ? JSON.stringify(sampleWebsite.alternatives) : '[]'}`);

    // 内容和媒体
    console.log('\n📄 内容和媒体:');
    console.log(`  ✅ detailed_description: ${sampleWebsite.detailed_description ? (sampleWebsite.detailed_description.substring(0, 50) + '...') : '无'}`);
    console.log(`  ${sampleWebsite.changelog ? '✅' : '❌'} changelog: ${sampleWebsite.changelog || '无'}`);
    console.log(`  ✅ faq: ${sampleWebsite.faq ? JSON.stringify(sampleWebsite.faq) : '[]'}`);

    // SEO相关
    console.log('\n🔍 SEO相关:');
    console.log(`  ✅ domain_authority: ${sampleWebsite.domain_authority}`);
    console.log(`  ✅ last_checked: ${sampleWebsite.last_checked}`);
    console.log(`  ✅ response_time: ${sampleWebsite.response_time}ms`);
    console.log(`  ✅ ssl_enabled: ${sampleWebsite.ssl_enabled}`);

    // 统计完整性
    console.log('\n📈 完整性统计:');
    const fields = Object.keys(sampleWebsite);
    let filledFields = 0;
    let totalFields = fields.length;

    fields.forEach(field => {
      const value = (sampleWebsite as any)[field];
      if (value !== null && value !== undefined && value !== '' && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
        filledFields++;
      }
    });

    const completeness = ((filledFields / totalFields) * 100).toFixed(1);
    console.log(`  完整度: ${completeness}% (${filledFields}/${totalFields} 个字段有值)`);

    // 分析所有网站的平均完整性
    console.log('\n🌐 所有网站数据概览:');
    const allWebsites = await prisma.website.findMany();
    
    const stats = {
      有缩略图: 0,
      有标语: 0,
      有详细描述: 0,
      有社交链接: 0,
      有截图: 0,
      精选网站: 0,
      可信网站: 0
    };

    allWebsites.forEach(website => {
      if (website.thumbnail) stats.有缩略图++;
      if (website.tagline) stats.有标语++;
      if (website.detailed_description) stats.有详细描述++;
      if (website.twitter_url || website.linkedin_url || website.facebook_url) stats.有社交链接++;
      if (website.screenshots && Array.isArray(website.screenshots) && website.screenshots.length > 0) stats.有截图++;
      if (website.is_featured) stats.精选网站++;
      if (website.is_trusted) stats.可信网站++;
    });

    Object.entries(stats).forEach(([key, value]) => {
      const percentage = ((value / allWebsites.length) * 100).toFixed(1);
      console.log(`  ${key}: ${value}/${allWebsites.length} (${percentage}%)`);
    });

  } catch (error) {
    console.error('❌ 分析数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDataCompleteness();
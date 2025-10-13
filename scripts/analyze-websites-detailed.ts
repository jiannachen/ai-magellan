import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeWebsitesDetailed() {
  try {
    console.log('🔍 开始详细分析网站数据...\n');

    // 1. 获取所有分类及其网站数量
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            websites: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📊 所有分类统计:');
    console.log('==================');
    categories.forEach(category => {
      console.log(`${category.name} (${category.slug}): ${category._count.websites} 个网站`);
    });

    // 2. 获取所有网站的详细信息
    const allWebsites = await prisma.website.findMany({
      include: {
        category: true
      },
      orderBy: {
        category_id: 'asc'
      }
    });

    console.log(`\n🌐 总共有 ${allWebsites.length} 个网站\n`);

    // 3. 按分类分组显示网站详细信息
    const websitesByCategory = allWebsites.reduce((acc, website) => {
      const categoryName = website.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(website);
      return acc;
    }, {} as Record<string, typeof allWebsites>);

    for (const [categoryName, websites] of Object.entries(websitesByCategory)) {
      console.log(`\n📂 ${categoryName} 分类 (${websites.length} 个网站)`);
      console.log('='.repeat(50));
      
      websites.forEach((website, index) => {
        console.log(`\n${index + 1}. ${website.title}`);
        console.log(`   🔗 URL: ${website.url}`);
        console.log(`   📝 描述: ${website.description}`);
        if (website.tagline) {
          console.log(`   💡 标语: ${website.tagline}`);
        }
        if (website.tags) {
          console.log(`   🏷️  标签: ${website.tags}`);
        }
        console.log(`   💰 定价模式: ${website.pricing_model}`);
        console.log(`   🆓 免费版本: ${website.has_free_version ? '是' : '否'}`);
        if (website.base_price) {
          console.log(`   💲 基础价格: ${website.base_price}`);
        }
        console.log(`   ⭐ 质量评分: ${website.quality_score}/100`);
        console.log(`   👍 点赞数: ${website.likes}`);
        console.log(`   👁️  访问量: ${website.visits}`);
        console.log(`   🔥 精选: ${website.is_featured ? '是' : '否'}`);
        console.log(`   ✅ 可信: ${website.is_trusted ? '是' : '否'}`);
        
        // 显示功能特性
        if (website.features && Array.isArray(website.features) && website.features.length > 0) {
          console.log(`   🎯 功能特性: ${(website.features as string[]).join(', ')}`);
        }
        
        // 显示用例
        if (website.use_cases && Array.isArray(website.use_cases) && website.use_cases.length > 0) {
          console.log(`   📋 用例: ${(website.use_cases as string[]).join(', ')}`);
        }
        
        // 显示目标受众
        if (website.target_audience && Array.isArray(website.target_audience) && website.target_audience.length > 0) {
          console.log(`   👥 目标受众: ${(website.target_audience as string[]).join(', ')}`);
        }
        
        // 显示支持的平台
        if (website.supported_platforms && Array.isArray(website.supported_platforms) && website.supported_platforms.length > 0) {
          console.log(`   💻 支持平台: ${(website.supported_platforms as string[]).join(', ')}`);
        }
        
        console.log(`   📅 创建时间: ${website.created_at.toLocaleDateString()}`);
      });
    }

    // 4. 特别分析AI Tools分类
    const aiToolsCategory = categories.find(cat => cat.name === 'AI Tools' || cat.slug === 'ai-tools');
    
    if (aiToolsCategory) {
      console.log(`\n\n🤖 AI Tools 分类详细分析`);
      console.log('='.repeat(60));
      
      const aiWebsites = websitesByCategory['AI Tools'] || [];
      
      console.log(`共有 ${aiWebsites.length} 个AI工具网站\n`);
      
      // 按功能特性分析
      const functionAnalysis = {} as Record<string, string[]>;
      
      aiWebsites.forEach(website => {
        const features = website.features as string[] || [];
        const useCases = website.use_cases as string[] || [];
        const description = website.description.toLowerCase();
        const title = website.title.toLowerCase();
        
        // 分析功能类型
        let functionType = '其他';
        
        if (features.some(f => f.toLowerCase().includes('chat') || f.toLowerCase().includes('conversation')) ||
            description.includes('chat') || description.includes('对话') || title.includes('chat')) {
          functionType = '对话聊天';
        } else if (features.some(f => f.toLowerCase().includes('image') || f.toLowerCase().includes('photo') || f.toLowerCase().includes('visual')) ||
                   description.includes('图片') || description.includes('图像') || description.includes('视觉') || 
                   title.includes('image') || title.includes('photo')) {
          functionType = '图像生成';
        } else if (features.some(f => f.toLowerCase().includes('text') || f.toLowerCase().includes('writing') || f.toLowerCase().includes('content')) ||
                   description.includes('文本') || description.includes('写作') || description.includes('内容') ||
                   title.includes('text') || title.includes('writing')) {
          functionType = '文本生成';
        } else if (features.some(f => f.toLowerCase().includes('audio') || f.toLowerCase().includes('voice') || f.toLowerCase().includes('music')) ||
                   description.includes('音频') || description.includes('语音') || description.includes('音乐') ||
                   title.includes('audio') || title.includes('voice') || title.includes('music')) {
          functionType = '音频处理';
        } else if (features.some(f => f.toLowerCase().includes('video')) ||
                   description.includes('视频') || title.includes('video')) {
          functionType = '视频处理';
        } else if (features.some(f => f.toLowerCase().includes('code') || f.toLowerCase().includes('programming') || f.toLowerCase().includes('development')) ||
                   description.includes('代码') || description.includes('编程') || description.includes('开发') ||
                   title.includes('code') || title.includes('dev')) {
          functionType = '代码辅助';
        } else if (features.some(f => f.toLowerCase().includes('data') || f.toLowerCase().includes('analysis') || f.toLowerCase().includes('analytics')) ||
                   description.includes('数据') || description.includes('分析') || title.includes('data')) {
          functionType = '数据分析';
        } else if (features.some(f => f.toLowerCase().includes('workflow') || f.toLowerCase().includes('automation') || f.toLowerCase().includes('productivity')) ||
                   description.includes('自动化') || description.includes('工作流') || description.includes('效率') ||
                   title.includes('workflow') || title.includes('automation')) {
          functionType = '工作流自动化';
        } else if (features.some(f => f.toLowerCase().includes('search') || f.toLowerCase().includes('knowledge')) ||
                   description.includes('搜索') || description.includes('知识') || title.includes('search')) {
          functionType = '智能搜索';
        } else if (features.some(f => f.toLowerCase().includes('design') || f.toLowerCase().includes('creative')) ||
                   description.includes('设计') || description.includes('创意') || title.includes('design')) {
          functionType = '设计创意';
        }
        
        if (!functionAnalysis[functionType]) {
          functionAnalysis[functionType] = [];
        }
        functionAnalysis[functionType].push(website.title);
      });
      
      console.log('🎯 按功能类型分类建议:');
      Object.entries(functionAnalysis).forEach(([type, websites]) => {
        console.log(`\n${type} (${websites.length} 个):`)
        websites.forEach(title => console.log(`  • ${title}`));
      });
      
      // 按定价模式分析
      const pricingAnalysis = aiWebsites.reduce((acc, website) => {
        const pricing = website.pricing_model;
        if (!acc[pricing]) {
          acc[pricing] = 0;
        }
        acc[pricing]++;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n💰 定价模式分布:');
      Object.entries(pricingAnalysis).forEach(([pricing, count]) => {
        console.log(`  ${pricing}: ${count} 个网站`);
      });
      
      // 按质量评分分析
      const qualityStats = {
        excellent: aiWebsites.filter(w => w.quality_score >= 80).length,
        good: aiWebsites.filter(w => w.quality_score >= 60 && w.quality_score < 80).length,
        average: aiWebsites.filter(w => w.quality_score >= 40 && w.quality_score < 60).length,
        poor: aiWebsites.filter(w => w.quality_score < 40).length
      };
      
      console.log('\n⭐ 质量评分分布:');
      console.log(`  优秀 (80-100分): ${qualityStats.excellent} 个`);
      console.log(`  良好 (60-79分): ${qualityStats.good} 个`);
      console.log(`  一般 (40-59分): ${qualityStats.average} 个`);
      console.log(`  较差 (0-39分): ${qualityStats.poor} 个`);
    }

    console.log('\n✅ 分析完成!');

  } catch (error) {
    console.error('❌ 分析数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行分析
analyzeWebsitesDetailed();
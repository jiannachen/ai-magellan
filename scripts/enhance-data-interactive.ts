import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 数据完善建议模板
const DATA_ENHANCEMENT_TEMPLATES = {
  // 社交媒体链接模板
  social_links: {
    twitter: (name: string) => `https://twitter.com/${name.toLowerCase().replace(/\s+/g, '')}`,
    linkedin: (name: string) => `https://linkedin.com/company/${name.toLowerCase().replace(/\s+/g, '-')}`,
    github: (name: string) => `https://github.com/${name.toLowerCase().replace(/\s+/g, '')}`,
  },
  
  // 常见定价模型
  pricing_models: [
    'free', 'freemium', 'paid', 'subscription', 'pay-per-use', 'enterprise', 'open-source'
  ],
  
  // 平台支持选项
  platforms: [
    'web', 'ios', 'android', 'mac', 'windows', 'linux', 'chrome-extension', 'api'
  ],
  
  // 使用场景模板
  use_cases: {
    'ai-tools': [
      'Content generation', 'Data analysis', 'Process automation', 'Decision making',
      'Customer support', 'Creative work', 'Research', 'Code generation'
    ],
    'productivity': [
      'Task management', 'Time tracking', 'Team collaboration', 'Document creation',
      'Note taking', 'Project planning', 'Communication', 'File organization'
    ],
    'design': [
      'UI/UX design', 'Graphic design', 'Logo creation', 'Image editing',
      'Prototyping', 'Brand design', 'Web design', 'Print design'
    ]
  },
  
  // 目标用户群体
  target_audiences: [
    'developers', 'designers', 'marketers', 'entrepreneurs', 'students',
    'writers', 'data scientists', 'product managers', 'small businesses', 'enterprises'
  ]
};

// 获取需要完善的网站
async function getIncompleteWebsites(limit: number = 10) {
  const websites = await prisma.website.findMany({
    where: {
      OR: [
        { email: null },
        { base_price: null },
        { twitter_url: null },
        { linkedin_url: null },
        { github_url: null },
        { logo_url: null },
        { video_url: null },
        { ios_app_url: null },
        { android_app_url: null },
        { changelog: null }
      ]
    },
    orderBy: {
      likes: 'desc' // 优先完善热门工具
    },
    take: limit
  });
  
  return websites;
}

// 分析数据完整度
function analyzeCompleteness(website: any) {
  const importantFields = [
    'email', 'base_price', 'twitter_url', 'linkedin_url', 'github_url',
    'logo_url', 'video_url', 'ios_app_url', 'android_app_url', 'changelog',
    'api_available', 'has_free_version'
  ];
  
  const missingFields = importantFields.filter(field => !website[field]);
  const completeness = ((importantFields.length - missingFields.length) / importantFields.length * 100).toFixed(1);
  
  return { missingFields, completeness: parseFloat(completeness) };
}

// 生成完善建议
function generateSuggestions(website: any, missingFields: string[]) {
  const suggestions: any = {};
  
  missingFields.forEach(field => {
    switch (field) {
      case 'twitter_url':
        suggestions[field] = DATA_ENHANCEMENT_TEMPLATES.social_links.twitter(website.title);
        break;
      case 'linkedin_url':
        suggestions[field] = DATA_ENHANCEMENT_TEMPLATES.social_links.linkedin(website.title);
        break;
      case 'github_url':
        suggestions[field] = DATA_ENHANCEMENT_TEMPLATES.social_links.github(website.title);
        break;
      case 'base_price':
        suggestions[field] = website.has_free_version ? 'Free tier available' : 'Contact for pricing';
        break;
      case 'email':
        const domain = new URL(website.url).hostname;
        suggestions[field] = `hello@${domain} | support@${domain} | contact@${domain}`;
        break;
      case 'logo_url':
        suggestions[field] = `${website.url}/logo.png | ${website.url}/favicon.ico`;
        break;
      case 'ios_app_url':
        suggestions[field] = 'Search "' + website.title + '" on App Store';
        break;
      case 'android_app_url':
        suggestions[field] = 'Search "' + website.title + '" on Google Play';
        break;
      case 'api_available':
        suggestions[field] = 'Check documentation at ' + website.url + '/api or /docs';
        break;
    }
  });
  
  return suggestions;
}

// 交互式数据完善
async function enhanceWebsiteInteractively(website: any) {
  console.log(`\n🔧 完善工具: ${website.title}`);
  console.log(`📊 当前完整度: ${analyzeCompleteness(website).completeness}%`);
  console.log(`🔗 网站: ${website.url}`);
  console.log(`📝 描述: ${website.description}`);
  
  const { missingFields } = analyzeCompleteness(website);
  const suggestions = generateSuggestions(website, missingFields);
  
  const updates: any = {};
  
  for (const field of missingFields.slice(0, 5)) { // 限制每次处理5个字段
    console.log(`\n❓ 缺失字段: ${field}`);
    
    if (suggestions[field]) {
      console.log(`💡 建议: ${suggestions[field]}`);
    }
    
    const answer = await askQuestion(`请输入 ${field} 的值 (回车跳过): `);
    
    if (answer) {
      // 根据字段类型处理输入
      if (field.includes('available') || field.includes('free_version')) {
        updates[field] = answer.toLowerCase().includes('yes') || answer.toLowerCase().includes('true');
      } else {
        updates[field] = answer;
      }
      
      console.log(`✅ 已设置 ${field}: ${updates[field]}`);
    }
  }
  
  return updates;
}

// 批量数据增强
async function batchEnhanceData() {
  console.log('🚀 启动批量数据增强工具\n');
  
  const websites = await getIncompleteWebsites(20);
  console.log(`📊 找到 ${websites.length} 个需要完善的网站\n`);
  
  // 显示概览
  websites.forEach((website, index) => {
    const { completeness } = analyzeCompleteness(website);
    console.log(`${index + 1}. ${website.title} - ${completeness}% 完整`);
  });
  
  console.log('\n📋 开始交互式完善...\n');
  
  for (let i = 0; i < Math.min(5, websites.length); i++) {
    const website = websites[i];
    
    try {
      const updates = await enhanceWebsiteInteractively(website);
      
      if (Object.keys(updates).length > 0) {
        // 更新数据库
        await prisma.website.update({
          where: { id: website.id },
          data: {
            ...updates,
            last_checked: new Date()
          }
        });
        
        console.log(`✅ ${website.title} 已更新 ${Object.keys(updates).length} 个字段`);
      } else {
        console.log(`⏭️ 跳过 ${website.title}`);
      }
      
    } catch (error) {
      console.error(`❌ 更新 ${website.title} 时出错:`, error);
    }
  }
  
  console.log('\n🎉 批量增强完成!');
}

// 生成数据完善报告
async function generateEnhancementReport() {
  console.log('📊 生成数据完善报告...\n');
  
  const totalWebsites = await prisma.website.count();
  const websites = await prisma.website.findMany();
  
  const stats = {
    总网站数: totalWebsites,
    有邮箱: websites.filter(w => w.email).length,
    有价格信息: websites.filter(w => w.base_price).length,
    有Twitter: websites.filter(w => w.twitter_url).length,
    有LinkedIn: websites.filter(w => w.linkedin_url).length,
    有GitHub: websites.filter(w => w.github_url).length,
    有Logo: websites.filter(w => w.logo_url).length,
    有iOS应用: websites.filter(w => w.ios_app_url).length,
    有Android应用: websites.filter(w => w.android_app_url).length,
    有更新日志: websites.filter(w => w.changelog).length,
    API可用: websites.filter(w => w.api_available).length,
    有免费版: websites.filter(w => w.has_free_version).length,
  };
  
  console.log('📈 数据完整度报告:');
  console.log('='.repeat(50));
  
  Object.entries(stats).forEach(([key, value]) => {
    const percentage = ((value / totalWebsites) * 100).toFixed(1);
    console.log(`${key.padEnd(15)}: ${value.toString().padStart(4)} (${percentage}%)`);
  });
  
  // 计算平均完整度
  let totalCompleteness = 0;
  websites.forEach(website => {
    const { completeness } = analyzeCompleteness(website);
    totalCompleteness += completeness;
  });
  
  const averageCompleteness = (totalCompleteness / websites.length).toFixed(1);
  
  console.log('='.repeat(50));
  console.log(`平均完整度: ${averageCompleteness}%`);
  
  // 推荐优先完善的工具
  const needsEnhancement = websites
    .filter(w => analyzeCompleteness(w).completeness < 70)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);
  
  if (needsEnhancement.length > 0) {
    console.log('\n🔧 建议优先完善的热门工具:');
    needsEnhancement.forEach((website, index) => {
      const { completeness } = analyzeCompleteness(website);
      console.log(`${index + 1}. ${website.title} - ${completeness}% (${website.likes} 点赞)`);
    });
  }
}

// 主菜单
async function showMainMenu() {
  console.log('\n🛠️  数据完善工具主菜单');
  console.log('================================');
  console.log('1. 批量数据增强 (交互式)');
  console.log('2. 生成完善报告');
  console.log('3. 显示数据模板');
  console.log('4. 退出');
  console.log('================================');
  
  const choice = await askQuestion('请选择功能 (1-4): ');
  
  switch (choice) {
    case '1':
      await batchEnhanceData();
      break;
    case '2':
      await generateEnhancementReport();
      break;
    case '3':
      showDataTemplates();
      break;
    case '4':
      console.log('👋 再见!');
      rl.close();
      return;
    default:
      console.log('❌ 无效选择，请重试');
  }
  
  // 继续显示菜单
  await showMainMenu();
}

// 显示数据模板
function showDataTemplates() {
  console.log('\n📋 数据完善模板:');
  console.log('================================');
  
  console.log('\n💰 定价模型选项:');
  DATA_ENHANCEMENT_TEMPLATES.pricing_models.forEach(model => {
    console.log(`  - ${model}`);
  });
  
  console.log('\n💻 平台支持选项:');
  DATA_ENHANCEMENT_TEMPLATES.platforms.forEach(platform => {
    console.log(`  - ${platform}`);
  });
  
  console.log('\n👥 目标用户群体:');
  DATA_ENHANCEMENT_TEMPLATES.target_audiences.forEach(audience => {
    console.log(`  - ${audience}`);
  });
  
  console.log('\n🎯 AI工具使用场景:');
  DATA_ENHANCEMENT_TEMPLATES.use_cases['ai-tools'].forEach(useCase => {
    console.log(`  - ${useCase}`);
  });
}

// 主函数
async function main() {
  try {
    console.log('🎯 欢迎使用数据完善工具!');
    console.log('这个工具可以帮助你补充和完善网站数据\n');
    
    await showMainMenu();
    
  } catch (error) {
    console.error('❌ 程序错误:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// 运行程序
if (require.main === module) {
  main();
}

export { batchEnhanceData, generateEnhancementReport };
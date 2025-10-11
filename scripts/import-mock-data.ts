import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 模拟ProductHunt数据 - 一些热门的AI工具 (增强版)
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "ChatGPT",
    tagline: "OpenAI's conversational AI assistant",
    description: "ChatGPT is an AI-powered chatbot that can have natural conversations, answer questions, help with writing, coding, and more.",
    slug: "chatgpt",
    url: "https://chatgpt.com",
    website: "https://chatgpt.com",
    featuredAt: "2023-01-01T00:00:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    votesCount: 5000,
    commentsCount: 1200,
    reviewsRating: 4.8,
    thumbnail: {
      url: "https://ph-files.imgix.net/chatgpt-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/chatgpt-screenshot.png", type: "image" },
      { url: "https://ph-files.imgix.net/chatgpt-demo.mp4", type: "video" }
    ],
    makers: [
      { name: "OpenAI Team", username: "openai", profileImage: "https://ph-avatars.imgix.net/openai.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Productivity", slug: "productivity" } }
      ]
    },
    // 增强字段
    logo_url: "https://cdn.openai.com/logos/chatgpt.svg",
    video_url: "https://ph-files.imgix.net/chatgpt-demo.mp4",
    twitter_url: "https://twitter.com/openai",
    linkedin_url: "https://linkedin.com/company/openai",
    github_url: "https://github.com/openai",
    email: "support@openai.com",
    base_price: "$20/month",
    ios_app_url: "https://apps.apple.com/app/chatgpt/id6448311069",
    android_app_url: "https://play.google.com/store/apps/details?id=com.openai.chatgpt",
    web_app_url: "https://chatgpt.com",
    changelog: "Latest updates include GPT-4, improved conversations, and better mobile experience."
  },
  {
    id: "2",
    name: "Claude",
    tagline: "Anthropic's helpful AI assistant",
    description: "Claude is an AI assistant created by Anthropic that can help with analysis, writing, math, coding, creative tasks, and more.",
    slug: "claude",
    url: "https://claude.ai",
    website: "https://claude.ai",
    featuredAt: "2023-03-01T00:00:00Z",
    createdAt: "2023-03-01T00:00:00Z",
    votesCount: 4200,
    commentsCount: 980,
    reviewsRating: 4.7,
    thumbnail: {
      url: "https://ph-files.imgix.net/claude-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/claude-screenshot.png", type: "image" },
      { url: "https://ph-files.imgix.net/claude-demo.mp4", type: "video" }
    ],
    makers: [
      { name: "Anthropic Team", username: "anthropic", profileImage: "https://ph-avatars.imgix.net/anthropic.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Assistant", slug: "ai-assistant" } }
      ]
    },
    // 增强字段
    logo_url: "https://claude.ai/images/claude-logo.svg",
    video_url: "https://ph-files.imgix.net/claude-demo.mp4",
    twitter_url: "https://twitter.com/anthropicai",
    linkedin_url: "https://linkedin.com/company/anthropic",
    email: "support@anthropic.com",
    base_price: "$20/month",
    ios_app_url: "https://apps.apple.com/app/claude-by-anthropic/id6473753060",
    android_app_url: "https://play.google.com/store/apps/details?id=com.anthropic.claude",
    web_app_url: "https://claude.ai",
    changelog: "Recent updates include Claude 3.5 Sonnet, improved reasoning, and enhanced safety features."
  },
  {
    id: "3",
    name: "Midjourney",
    tagline: "AI-powered image generation",
    description: "Midjourney is an AI art generator that creates stunning images from text descriptions using advanced machine learning.",
    slug: "midjourney",
    url: "https://midjourney.com",
    website: "https://midjourney.com",
    featuredAt: "2022-08-01T00:00:00Z",
    createdAt: "2022-08-01T00:00:00Z",
    votesCount: 6500,
    commentsCount: 2100,
    reviewsRating: 4.6,
    thumbnail: {
      url: "https://ph-files.imgix.net/midjourney-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/midjourney-art.png", type: "image" }
    ],
    makers: [
      { name: "David Holz", username: "david", profileImage: "https://ph-avatars.imgix.net/david.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Design", slug: "design" } },
        { node: { name: "Art", slug: "art" } }
      ]
    }
  },
  {
    id: "4",
    name: "Notion AI",
    tagline: "AI writing assistant in Notion",
    description: "Notion AI helps you write better and think bigger by providing AI-powered writing assistance directly in your Notion workspace.",
    slug: "notion-ai",
    url: "https://notion.so/ai",
    website: "https://notion.so/ai",
    featuredAt: "2023-02-01T00:00:00Z",
    createdAt: "2023-02-01T00:00:00Z",
    votesCount: 3800,
    commentsCount: 750,
    reviewsRating: 4.5,
    thumbnail: {
      url: "https://ph-files.imgix.net/notion-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/notion-ai-demo.png", type: "image" }
    ],
    makers: [
      { name: "Notion Team", username: "notion", profileImage: "https://ph-avatars.imgix.net/notion.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Productivity", slug: "productivity" } },
        { node: { name: "Writing", slug: "writing" } }
      ]
    }
  },
  {
    id: "5",
    name: "GitHub Copilot",
    tagline: "Your AI pair programmer",
    description: "GitHub Copilot is an AI coding assistant that helps developers write code faster with AI-powered code completions.",
    slug: "github-copilot",
    url: "https://github.com/features/copilot",
    website: "https://github.com/features/copilot",
    featuredAt: "2021-10-01T00:00:00Z",
    createdAt: "2021-10-01T00:00:00Z",
    votesCount: 4500,
    commentsCount: 1100,
    reviewsRating: 4.4,
    thumbnail: {
      url: "https://ph-files.imgix.net/copilot-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/copilot-coding.png", type: "image" }
    ],
    makers: [
      { name: "GitHub Team", username: "github", profileImage: "https://ph-avatars.imgix.net/github.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Developer Tools", slug: "developer-tools" } },
        { node: { name: "Coding", slug: "coding" } }
      ]
    }
  },
  {
    id: "6",
    name: "Canva AI",
    tagline: "AI-powered design made simple",
    description: "Canva's AI features help you create stunning designs with text-to-image generation, background removal, and smart design suggestions.",
    slug: "canva-ai",
    url: "https://canva.com/ai",
    website: "https://canva.com/ai",
    featuredAt: "2023-04-01T00:00:00Z",
    createdAt: "2023-04-01T00:00:00Z",
    votesCount: 3200,
    commentsCount: 680,
    reviewsRating: 4.3,
    thumbnail: {
      url: "https://ph-files.imgix.net/canva-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/canva-ai-design.png", type: "image" }
    ],
    makers: [
      { name: "Canva Team", username: "canva", profileImage: "https://ph-avatars.imgix.net/canva.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Design", slug: "design" } },
        { node: { name: "Graphics", slug: "graphics" } }
      ]
    }
  },
  {
    id: "7",
    name: "Perplexity",
    tagline: "AI-powered search engine",
    description: "Perplexity is an AI search engine that provides accurate, real-time answers with citations from reliable sources.",
    slug: "perplexity",
    url: "https://perplexity.ai",
    website: "https://perplexity.ai",
    featuredAt: "2023-05-01T00:00:00Z",
    createdAt: "2023-05-01T00:00:00Z",
    votesCount: 2800,
    commentsCount: 520,
    reviewsRating: 4.2,
    thumbnail: {
      url: "https://ph-files.imgix.net/perplexity-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/perplexity-search.png", type: "image" }
    ],
    makers: [
      { name: "Perplexity Team", username: "perplexity", profileImage: "https://ph-avatars.imgix.net/perplexity.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Search", slug: "search" } },
        { node: { name: "Research", slug: "research" } }
      ]
    }
  },
  {
    id: "8",
    name: "Loom AI",
    tagline: "AI-powered video messaging",
    description: "Loom AI helps you create better video messages with AI-generated titles, summaries, and chapters for your recordings.",
    slug: "loom-ai",
    url: "https://loom.com/ai",
    website: "https://loom.com/ai",
    featuredAt: "2023-06-01T00:00:00Z",
    createdAt: "2023-06-01T00:00:00Z",
    votesCount: 2400,
    commentsCount: 450,
    reviewsRating: 4.1,
    thumbnail: {
      url: "https://ph-files.imgix.net/loom-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/loom-video.png", type: "image" }
    ],
    makers: [
      { name: "Loom Team", username: "loom", profileImage: "https://ph-avatars.imgix.net/loom.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Video", slug: "video" } },
        { node: { name: "Communication", slug: "communication" } }
      ]
    }
  },
  {
    id: "9",
    name: "Jasper AI",
    tagline: "AI content creation platform",
    description: "Jasper AI helps marketing teams create high-quality content faster with AI-powered writing tools and templates.",
    slug: "jasper-ai",
    url: "https://jasper.ai",
    website: "https://jasper.ai",
    featuredAt: "2022-12-01T00:00:00Z",
    createdAt: "2022-12-01T00:00:00Z",
    votesCount: 3600,
    commentsCount: 820,
    reviewsRating: 4.0,
    thumbnail: {
      url: "https://ph-files.imgix.net/jasper-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/jasper-writing.png", type: "image" }
    ],
    makers: [
      { name: "Jasper Team", username: "jasper", profileImage: "https://ph-avatars.imgix.net/jasper.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Marketing", slug: "marketing" } },
        { node: { name: "Content", slug: "content" } }
      ]
    }
  },
  {
    id: "10",
    name: "Runway ML",
    tagline: "AI video creation and editing",
    description: "Runway ML provides AI-powered video editing tools including text-to-video generation, background removal, and creative effects.",
    slug: "runway-ml",
    url: "https://runwayml.com",
    website: "https://runwayml.com",
    featuredAt: "2023-07-01T00:00:00Z",
    createdAt: "2023-07-01T00:00:00Z",
    votesCount: 2200,
    commentsCount: 380,
    reviewsRating: 4.2,
    thumbnail: {
      url: "https://ph-files.imgix.net/runway-logo.png"
    },
    media: [
      { url: "https://ph-files.imgix.net/runway-video.png", type: "image" }
    ],
    makers: [
      { name: "Runway Team", username: "runway", profileImage: "https://ph-avatars.imgix.net/runway.jpg" }
    ],
    topics: {
      edges: [
        { node: { name: "AI", slug: "ai" } },
        { node: { name: "Video", slug: "video" } },
        { node: { name: "Creative", slug: "creative" } }
      ]
    }
  }
];

// 分类映射
const CATEGORY_MAPPING: Record<string, string> = {
  'ai': 'ai-tools',
  'artificial-intelligence': 'ai-tools',
  'machine-learning': 'ai-tools',
  'ai-assistant': 'ai-tools',
  'productivity': 'productivity',
  'design-tools': 'design',
  'design': 'design',
  'graphics': 'design',
  'art': 'design',
  'creative': 'design',
  'developer-tools': 'development',
  'development': 'development',
  'coding': 'development',
  'marketing': 'marketing',
  'content': 'marketing',
  'social-media': 'social',
  'communication': 'social',
  'fintech': 'finance',
  'finance': 'finance',
  'education': 'education',
  'health-fitness': 'health',
  'health': 'health',
  'e-commerce': 'ecommerce',
  'games': 'entertainment',
  'entertainment': 'entertainment',
  'video': 'multimedia',
  'search': 'search',
  'research': 'research',
  'writing': 'productivity',
  'travel': 'travel',
  'food-drink': 'lifestyle',
  'lifestyle': 'lifestyle'
};

// 获取或创建分类
async function getOrCreateCategory(topics: string[]): Promise<number> {
  let categorySlug = 'ai-tools'; // 默认为AI工具分类
  
  // 根据主题确定最合适的分类
  for (const topic of topics) {
    const mappedCategory = CATEGORY_MAPPING[topic.toLowerCase()];
    if (mappedCategory) {
      categorySlug = mappedCategory;
      break;
    }
  }

  // 查找或创建分类
  let category = await prisma.category.findUnique({
    where: { slug: categorySlug }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        slug: categorySlug,
        name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' '),
        name_en: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' '),
        name_zh: getCategoryNameZh(categorySlug),
      }
    });
  }

  return category.id;
}

// 获取中文分类名
function getCategoryNameZh(slug: string): string {
  const nameMap: Record<string, string> = {
    'ai-tools': 'AI工具',
    'productivity': '效率工具',
    'design': '设计工具',
    'development': '开发工具',
    'marketing': '营销工具',
    'social': '社交媒体',
    'finance': '金融科技',
    'education': '教育学习',
    'health': '健康医疗',
    'ecommerce': '电商工具',
    'entertainment': '娱乐游戏',
    'multimedia': '多媒体',
    'search': '搜索工具',
    'research': '研究分析',
    'travel': '旅行出行',
    'lifestyle': '生活方式'
  };
  return nameMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');
}

// 转换数据格式
function transformMockData(post: any) {
  const topics = post.topics.edges.map((edge: any) => edge.node.slug);
  
  return {
    title: post.name,
    url: post.website || post.url,
    description: post.tagline || post.description || '',
    thumbnail: post.thumbnail?.url || '',
    tagline: post.tagline,
    detailed_description: post.description,
    tags: topics.join(','),
    quality_score: Math.min(100, Math.max(50, post.votesCount / 20)), // 基于投票数计算质量分
    is_featured: true,
    is_trusted: post.votesCount > 100,
    weight: post.votesCount > 2000 ? 10 : post.votesCount > 1000 ? 8 : 5,
    visits: Math.floor(post.votesCount * 2.5),
    likes: post.votesCount,
    status: 'approved',
    // 其他字段
    features: JSON.stringify([post.tagline]),
    pricing_model: 'freemium',
    has_free_version: true,
    screenshots: JSON.stringify(post.media.filter((m: any) => m.type === 'image').map((m: any) => m.url)),
    use_cases: JSON.stringify([post.description].filter(Boolean)),
    target_audience: JSON.stringify(['general', 'professionals']),
    supported_platforms: JSON.stringify(['web']),
    api_available: false,
    integrations: JSON.stringify([]),
    languages_supported: JSON.stringify(['en', 'zh']),
    pros_cons: JSON.stringify({
      pros: [post.tagline, "User-friendly interface", "Reliable performance"],
      cons: ["Learning curve for advanced features"]
    }),
    alternatives: JSON.stringify([]),
    ssl_enabled: true,
    domain_authority: post.votesCount > 3000 ? 85 : post.votesCount > 1000 ? 75 : 65,
    last_checked: new Date(),
    response_time: Math.floor(Math.random() * 500) + 200, // 200-700ms
  };
}

// 保存模拟数据到JSON文件
async function saveMockDataToJson() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filepath = path.join(dataDir, 'mock-producthunt-data.json');
  fs.writeFileSync(filepath, JSON.stringify(MOCK_PRODUCTS, null, 2), 'utf8');
  console.log(`💾 模拟数据已保存到: ${filepath}`);
}

// 导入模拟数据
async function importMockData() {
  console.log(`📤 开始导入 ${MOCK_PRODUCTS.length} 条模拟数据到数据库`);
  
  let imported = 0;
  let skipped = 0;

  for (const post of MOCK_PRODUCTS) {
    try {
      // 检查是否已存在
      const existing = await prisma.website.findUnique({
        where: { url: post.website || post.url }
      });

      if (existing) {
        console.log(`⏭️ 跳过已存在: ${post.name}`);
        skipped++;
        continue;
      }

      // 获取分类ID
      const topics = post.topics.edges.map((edge: any) => edge.node.slug);
      const categoryId = await getOrCreateCategory(topics);

      // 转换数据
      const websiteData = transformMockData(post);

      // 插入数据库
      await prisma.website.create({
        data: {
          ...websiteData,
          category_id: categoryId,
        }
      });

      console.log(`✅ 已导入: ${post.name}`);
      imported++;

    } catch (error) {
      console.error(`❌ 导入失败 ${post.name}:`, error);
      skipped++;
    }
  }

  console.log(`🎉 导入完成! 成功导入: ${imported}, 跳过: ${skipped}`);
}

// 主函数
async function main() {
  try {
    console.log('🎯 开始导入模拟ProductHunt数据');

    // 保存模拟数据到JSON
    await saveMockDataToJson();

    // 导入到数据库
    await importMockData();

    console.log('🎉 所有操作完成!');

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

export { importMockData };
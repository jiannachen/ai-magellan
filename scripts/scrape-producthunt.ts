import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ProductHunt GraphQL API配置
const PRODUCTHUNT_API = 'https://api.producthunt.com/v2/api/graphql';
const API_TOKEN = process.env.PRODUCTHUNT_API_TOKEN; // 需要在.env中配置

// GraphQL查询 - 获取热门产品
const GET_TOP_PRODUCTS_QUERY = `
  query GetTopProducts($first: Int, $order: PostsOrder) {
    posts(first: $first, order: $order, featured: true) {
      edges {
        node {
          id
          name
          tagline
          description
          slug
          url
          website
          featuredAt
          createdAt
          votesCount
          commentsCount
          reviewsRating
          thumbnail {
            url
          }
          media {
            url
            type
          }
          makers {
            name
            username
            profileImage
          }
          topics {
            edges {
              node {
                name
                slug
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

interface ProductHuntPost {
  id: string;
  name: string;
  tagline: string;
  description: string;
  slug: string;
  url: string;
  website: string;
  featuredAt: string;
  createdAt: string;
  votesCount: number;
  commentsCount: number;
  reviewsRating: number;
  thumbnail?: {
    url: string;
  };
  media: Array<{
    url: string;
    type: string;
  }>;
  makers: Array<{
    name: string;
    username: string;
    profileImage: string;
  }>;
  topics: {
    edges: Array<{
      node: {
        name: string;
        slug: string;
      };
    }>;
  };
}

interface ProductHuntResponse {
  data: {
    posts: {
      edges: Array<{
        node: ProductHuntPost;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      totalCount: number;
    };
  };
}

// 分类映射 - ProductHunt主题到我们的分类
const CATEGORY_MAPPING: Record<string, string> = {
  'ai': 'ai-tools',
  'artificial-intelligence': 'ai-tools',
  'machine-learning': 'ai-tools',
  'productivity': 'productivity',
  'design-tools': 'design',
  'design': 'design',
  'developer-tools': 'development',
  'development': 'development',
  'marketing': 'marketing',
  'social-media': 'social',
  'fintech': 'finance',
  'finance': 'finance',
  'education': 'education',
  'health-fitness': 'health',
  'health': 'health',
  'e-commerce': 'ecommerce',
  'games': 'entertainment',
  'entertainment': 'entertainment',
  'travel': 'travel',
  'food-drink': 'lifestyle',
  'lifestyle': 'lifestyle'
};

// 获取或创建分类
async function getOrCreateCategory(topics: string[]): Promise<number> {
  // 默认分类
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
        name_zh: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' '),
      }
    });
  }

  return category.id;
}

// 转换ProductHunt数据为我们的数据格式
function transformProductHuntData(post: ProductHuntPost) {
  const topics = post.topics.edges.map(edge => edge.node.slug);
  const makers = post.makers.map(maker => maker.name).join(', ');
  
  return {
    title: post.name,
    url: post.website || post.url,
    description: post.tagline || post.description || '',
    thumbnail: post.thumbnail?.url || '',
    tagline: post.tagline,
    detailed_description: post.description,
    tags: topics.join(','),
    quality_score: Math.min(100, Math.max(50, post.votesCount * 2)), // 基于投票数计算质量分
    is_featured: true,
    is_trusted: post.votesCount > 100,
    weight: post.votesCount > 500 ? 10 : post.votesCount > 100 ? 8 : 5,
    visits: post.votesCount,
    likes: post.votesCount,
    status: 'approved',
    // 其他字段
    features: JSON.stringify([post.tagline]),
    pricing_model: 'unknown',
    has_free_version: false,
    screenshots: JSON.stringify(post.media.filter(m => m.type === 'image').map(m => m.url)),
    use_cases: JSON.stringify([post.description].filter(Boolean)),
    target_audience: JSON.stringify(['general']),
    supported_platforms: JSON.stringify(['web']),
    api_available: false,
    integrations: JSON.stringify([]),
    languages_supported: JSON.stringify(['en']),
    pros_cons: JSON.stringify({
      pros: [post.tagline],
      cons: []
    }),
    alternatives: JSON.stringify([]),
    ssl_enabled: true,
    domain_authority: post.votesCount > 1000 ? 80 : post.votesCount > 500 ? 70 : 60,
    last_checked: new Date(),
    response_time: 1000,
  };
}

// 抓取ProductHunt数据
async function scrapeProductHuntData(limit: number = 1000): Promise<ProductHuntPost[]> {
  if (!API_TOKEN) {
    console.error('❌ ProductHunt API Token not found. Please set PRODUCTHUNT_API_TOKEN in .env file');
    return [];
  }

  const allPosts: ProductHuntPost[] = [];
  let hasNextPage = true;
  let endCursor: string | null = null;
  let fetched = 0;

  console.log(`🚀 开始抓取ProductHunt数据 (目标: ${limit}条)`);

  while (hasNextPage && fetched < limit) {
    const remainingCount = Math.min(50, limit - fetched); // GraphQL一次最多50条
    
    try {
      const variables = {
        first: remainingCount,
        order: 'RANKING',
        after: endCursor
      };

      const response = await fetch(PRODUCTHUNT_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TOP_PRODUCTS_QUERY,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as ProductHuntResponse;

      if (data.data?.posts?.edges) {
        const posts = data.data.posts.edges.map(edge => edge.node);
        allPosts.push(...posts);
        fetched += posts.length;
        
        console.log(`📦 已抓取 ${fetched}/${limit} 条数据`);
        
        // 更新分页信息
        hasNextPage = data.data.posts.pageInfo.hasNextPage && fetched < limit;
        endCursor = data.data.posts.pageInfo.endCursor;
        
        // 添加延迟避免频率限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error('❌ Unexpected response format:', data);
        break;
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      break;
    }
  }

  console.log(`✅ 抓取完成，共获取 ${allPosts.length} 条数据`);
  return allPosts;
}

// 保存数据到JSON文件
async function saveToJsonFile(data: ProductHuntPost[], filename: string = 'producthunt-data.json') {
  const filepath = path.join(__dirname, '..', 'data', filename);
  
  // 确保data目录存在
  const dataDir = path.dirname(filepath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 数据已保存到: ${filepath}`);
}

// 导入数据到数据库
async function importToDatabase(posts: ProductHuntPost[]) {
  console.log(`📤 开始导入 ${posts.length} 条数据到数据库`);
  
  let imported = 0;
  let skipped = 0;

  for (const post of posts) {
    try {
      // 检查是否已存在
      const existing = await prisma.website.findUnique({
        where: { url: post.website || post.url }
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 获取分类ID
      const topics = post.topics.edges.map(edge => edge.node.slug);
      const categoryId = await getOrCreateCategory(topics);

      // 转换数据
      const websiteData = transformProductHuntData(post);

      // 插入数据库
      await prisma.website.create({
        data: {
          ...websiteData,
          category_id: categoryId,
        }
      });

      imported++;
      
      if (imported % 10 === 0) {
        console.log(`📊 已导入: ${imported}, 跳过: ${skipped}`);
      }

    } catch (error) {
      console.error(`❌ Error importing ${post.name}:`, error);
      skipped++;
    }
  }

  console.log(`✅ 导入完成! 成功导入: ${imported}, 跳过: ${skipped}`);
}

// 主函数
async function main() {
  try {
    const limit = parseInt(process.argv[2]) || 1000;
    console.log(`🎯 目标抓取 ${limit} 条ProductHunt数据`);

    // 抓取数据
    const posts = await scrapeProductHuntData(limit);
    
    if (posts.length === 0) {
      console.log('❌ 没有抓取到任何数据');
      return;
    }

    // 保存到JSON文件
    await saveToJsonFile(posts);

    // 导入到数据库
    await importToDatabase(posts);

    console.log('🎉 所有操作完成!');

  } catch (error) {
    console.error('❌ Main function error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

export { scrapeProductHuntData, importToDatabase };
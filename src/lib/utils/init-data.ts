import { db } from '../db/db';
import { categories, websites, footerLinks, websiteCategories } from '../db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import { generateSlug } from './utils';




const defaultCategories = [
  // 一级分类
  { name: 'AI对话', slug: 'ai-chat', sortOrder: 1 },
  { name: 'AI写作', slug: 'ai-writing', sortOrder: 2 },
  { name: 'AI绘画', slug: 'ai-image', sortOrder: 3 },
  { name: 'AI视频', slug: 'ai-video', sortOrder: 4 },
  { name: 'AI音频', slug: 'ai-audio', sortOrder: 5 },
  { name: 'AI编程', slug: 'ai-code', sortOrder: 6 },
  { name: 'AI搜索', slug: 'ai-search', sortOrder: 7 },
  { name: 'AI翻译', slug: 'ai-translate', sortOrder: 8 },
  { name: 'AI设计', slug: 'ai-design', sortOrder: 9 },
  { name: 'AI效率', slug: 'ai-productivity', sortOrder: 10 },
];

const subcategories = [
  // AI对话 子分类
  { name: '聊天助手', slug: 'chat-assistant', parentSlug: 'ai-chat', sortOrder: 1 },
  { name: '角色扮演', slug: 'role-play', parentSlug: 'ai-chat', sortOrder: 2 },
  { name: '客服机器人', slug: 'customer-service', parentSlug: 'ai-chat', sortOrder: 3 },

  // AI写作 子分类
  { name: '文案生成', slug: 'copywriting', parentSlug: 'ai-writing', sortOrder: 1 },
  { name: '长文创作', slug: 'long-form', parentSlug: 'ai-writing', sortOrder: 2 },
  { name: '改写润色', slug: 'rewriting', parentSlug: 'ai-writing', sortOrder: 3 },

  // AI绘画 子分类
  { name: '文生图', slug: 'text-to-image', parentSlug: 'ai-image', sortOrder: 1 },
  { name: '图生图', slug: 'image-to-image', parentSlug: 'ai-image', sortOrder: 2 },
  { name: 'AI修图', slug: 'image-editing', parentSlug: 'ai-image', sortOrder: 3 },

  // AI视频 子分类
  { name: '视频生成', slug: 'video-generation', parentSlug: 'ai-video', sortOrder: 1 },
  { name: '视频剪辑', slug: 'video-editing', parentSlug: 'ai-video', sortOrder: 2 },
  { name: '动画制作', slug: 'animation', parentSlug: 'ai-video', sortOrder: 3 },

  // AI音频 子分类
  { name: '语音合成', slug: 'text-to-speech', parentSlug: 'ai-audio', sortOrder: 1 },
  { name: '音乐生成', slug: 'music-generation', parentSlug: 'ai-audio', sortOrder: 2 },
  { name: '音频处理', slug: 'audio-processing', parentSlug: 'ai-audio', sortOrder: 3 },

  // AI编程 子分类
  { name: '代码生成', slug: 'code-generation', parentSlug: 'ai-code', sortOrder: 1 },
  { name: '代码审查', slug: 'code-review', parentSlug: 'ai-code', sortOrder: 2 },
  { name: '调试助手', slug: 'debugging', parentSlug: 'ai-code', sortOrder: 3 },

  // AI搜索 子分类
  { name: '智能搜索', slug: 'intelligent-search', parentSlug: 'ai-search', sortOrder: 1 },
  { name: '知识问答', slug: 'qa-systems', parentSlug: 'ai-search', sortOrder: 2 },
  { name: '文档检索', slug: 'document-search', parentSlug: 'ai-search', sortOrder: 3 },

  // AI翻译 子分类
  { name: '文本翻译', slug: 'text-translation', parentSlug: 'ai-translate', sortOrder: 1 },
  { name: '实时翻译', slug: 'real-time-translation', parentSlug: 'ai-translate', sortOrder: 2 },
  { name: '语音翻译', slug: 'voice-translation', parentSlug: 'ai-translate', sortOrder: 3 },

  // AI设计 子分类
  { name: 'UI设计', slug: 'ui-design', parentSlug: 'ai-design', sortOrder: 1 },
  { name: 'Logo设计', slug: 'logo-design', parentSlug: 'ai-design', sortOrder: 2 },
  { name: '平面设计', slug: 'graphic-design', parentSlug: 'ai-design', sortOrder: 3 },

  // AI效率 子分类
  { name: '任务管理', slug: 'task-management', parentSlug: 'ai-productivity', sortOrder: 1 },
  { name: '数据分析', slug: 'data-analysis', parentSlug: 'ai-productivity', sortOrder: 2 },
  { name: '工作流自动化', slug: 'workflow-automation', parentSlug: 'ai-productivity', sortOrder: 3 },
];

interface WebsiteInput {
  title: string;
  url: string;
  description: string;
  categorySlug: string;
  thumbnail: string;
  status: 'pending' | 'approved' | 'rejected';
}

const defaultWebsites = [
  {
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    description: 'OpenAI 开发的 AI 聊天助手，能够进行自然对话并协助完成各种任务。',
    categorySlug: 'ai-chat',
    thumbnail: 'https://chat.openai.com/favicon.ico',
    status: 'approved',
  },
  {
    title: 'Claude',
    url: 'https://claude.ai',
    description: 'Anthropic 开发的 AI 助手，擅长写作、分析和编程等任务。',
    categorySlug: 'ai-chat',
    thumbnail: 'https://claude.ai/favicon.ico',
    status: 'approved',
  },
  {
    title: 'Midjourney',
    url: 'https://www.midjourney.com',
    description: '强大的 AI 绘画工具，可以通过文字描述生成高质量图片。',
    categorySlug: 'ai-art',
    thumbnail: 'https://www.midjourney.com/favicon.ico',
    status: 'approved',
  },
  {
    title: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    description: 'GitHub 和 OpenAI 合作开发的 AI 编程助手，提供智能代码补全。',
    categorySlug: 'ai-coding',
    thumbnail: 'https://github.com/favicon.ico',
    status: 'approved',
  },
] as WebsiteInput[];



interface FooterLinkInput {
  title: string;
  url: string;
}

const defaultFooterLinks: FooterLinkInput[] = [
  { title: 'GitHub', url: 'https://github.com' }
];
export async function initializeData() {
  try {
    // 初始化一级分类
    for (const category of defaultCategories) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, category.slug)
      });

      if (existing) {
        await db.update(categories)
          .set(category)
          .where(eq(categories.slug, category.slug));
      } else {
        await db.insert(categories).values(category);
      }
    }

    // 获取所有一级分类的映射
    const parentCategories = await db.query.categories.findMany({
      where: isNull(categories.parentId)
    });
    const categoryMap = new Map(
      parentCategories.map(c => [c.slug, c.id])
    );

    // 初始化二级分类
    for (const subcategory of subcategories) {
      const { parentSlug, ...subCategoryData } = subcategory;
      const parentId = categoryMap.get(parentSlug);

      if (parentId) {
        const existing = await db.query.categories.findFirst({
          where: eq(categories.slug, subcategory.slug)
        });

        if (existing) {
          await db.update(categories)
            .set({ ...subCategoryData, parentId })
            .where(eq(categories.slug, subcategory.slug));
        } else {
          await db.insert(categories).values({ ...subCategoryData, parentId });
        }
      }
    }

    // 获取所有分类的映射（包含子分类）
    const allCategoriesList = await db.query.categories.findMany();
    const allCategoryMap = new Map(
      allCategoriesList.map(c => [c.slug, c.id])
    );

    // 初始化网站
    for (const website of defaultWebsites) {
      const { categorySlug, ...websiteData } = website;
      const categoryId = allCategoryMap.get(categorySlug);

      if (categoryId) {
        // Generate slug from title
        let slug = generateSlug(website.title);
        let slugCounter = 1;

        // Check if slug already exists and make it unique
        let existingWebsiteWithSlug = await db.query.websites.findFirst({
          where: eq(websites.slug, slug)
        });

        while (existingWebsiteWithSlug && existingWebsiteWithSlug.url !== website.url) {
          slug = `${generateSlug(website.title)}-${slugCounter}`;
          slugCounter++;
          existingWebsiteWithSlug = await db.query.websites.findFirst({
            where: eq(websites.slug, slug)
          });
        }

        const existingWebsite = await db.query.websites.findFirst({
          where: eq(websites.url, website.url)
        });

        if (existingWebsite) {
          await db.update(websites)
            .set({ ...websiteData, slug })
            .where(eq(websites.id, existingWebsite.id));

          // Update category relationship
          const existingCategory = await db.query.websiteCategories.findFirst({
            where: and(
              eq(websiteCategories.websiteId, existingWebsite.id),
              eq(websiteCategories.categoryId, categoryId)
            )
          });

          if (!existingCategory) {
            await db.insert(websiteCategories).values({
              websiteId: existingWebsite.id,
              categoryId: categoryId
            });
          }
        } else {
          const [newWebsite] = await db.insert(websites)
            .values({ ...websiteData, slug })
            .returning();

          // Create category relationship
          await db.insert(websiteCategories).values({
            websiteId: newWebsite.id,
            categoryId: categoryId
          });
        }
      }
    }

    // 初始化页脚链接
    for (const link of defaultFooterLinks) {
      const existingLink = await db.query.footerLinks.findFirst({
        where: eq(footerLinks.url, link.url)
      });

      if (existingLink) {
        await db.update(footerLinks)
          .set(link)
          .where(eq(footerLinks.id, existingLink.id));
      } else {
        await db.insert(footerLinks).values(link);
      }
    }

    console.log('数据初始化完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
    throw error;
  }
}

module.exports = {
  initializeData
}; 

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  (async () => {
    try {
      await initializeData();
      console.log('数据初始化完成！');
      process.exit(0);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  })();
} 
import { prisma } from '../db/db';
import type { Prisma, PrismaClient, Category } from '@prisma/client';
import { generateSlug } from './utils';




const defaultCategories = [
  // 一级分类
  { name: 'AI对话', slug: 'ai-chat', sort_order: 1 },
  { name: 'AI写作', slug: 'ai-writing', sort_order: 2 },
  { name: 'AI绘画', slug: 'ai-image', sort_order: 3 },
  { name: 'AI视频', slug: 'ai-video', sort_order: 4 },
  { name: 'AI音频', slug: 'ai-audio', sort_order: 5 },
  { name: 'AI编程', slug: 'ai-code', sort_order: 6 },
  { name: 'AI搜索', slug: 'ai-search', sort_order: 7 },
  { name: 'AI翻译', slug: 'ai-translate', sort_order: 8 },
  { name: 'AI设计', slug: 'ai-design', sort_order: 9 },
  { name: 'AI效率', slug: 'ai-productivity', sort_order: 10 },
];

const subcategories = [
  // AI对话 子分类
  { name: '聊天助手', slug: 'chat-assistant', parent_slug: 'ai-chat', sort_order: 1 },
  { name: '角色扮演', slug: 'role-play', parent_slug: 'ai-chat', sort_order: 2 },
  { name: '客服机器人', slug: 'customer-service', parent_slug: 'ai-chat', sort_order: 3 },

  // AI写作 子分类
  { name: '文案生成', slug: 'copywriting', parent_slug: 'ai-writing', sort_order: 1 },
  { name: '长文创作', slug: 'long-form', parent_slug: 'ai-writing', sort_order: 2 },
  { name: '改写润色', slug: 'rewriting', parent_slug: 'ai-writing', sort_order: 3 },

  // AI绘画 子分类
  { name: '文生图', slug: 'text-to-image', parent_slug: 'ai-image', sort_order: 1 },
  { name: '图生图', slug: 'image-to-image', parent_slug: 'ai-image', sort_order: 2 },
  { name: 'AI修图', slug: 'image-editing', parent_slug: 'ai-image', sort_order: 3 },

  // AI视频 子分类
  { name: '视频生成', slug: 'video-generation', parent_slug: 'ai-video', sort_order: 1 },
  { name: '视频剪辑', slug: 'video-editing', parent_slug: 'ai-video', sort_order: 2 },
  { name: '动画制作', slug: 'animation', parent_slug: 'ai-video', sort_order: 3 },

  // AI音频 子分类
  { name: '语音合成', slug: 'text-to-speech', parent_slug: 'ai-audio', sort_order: 1 },
  { name: '音乐生成', slug: 'music-generation', parent_slug: 'ai-audio', sort_order: 2 },
  { name: '音频处理', slug: 'audio-processing', parent_slug: 'ai-audio', sort_order: 3 },

  // AI编程 子分类
  { name: '代码生成', slug: 'code-generation', parent_slug: 'ai-code', sort_order: 1 },
  { name: '代码审查', slug: 'code-review', parent_slug: 'ai-code', sort_order: 2 },
  { name: '调试助手', slug: 'debugging', parent_slug: 'ai-code', sort_order: 3 },

  // AI搜索 子分类
  { name: '智能搜索', slug: 'intelligent-search', parent_slug: 'ai-search', sort_order: 1 },
  { name: '知识问答', slug: 'qa-systems', parent_slug: 'ai-search', sort_order: 2 },
  { name: '文档检索', slug: 'document-search', parent_slug: 'ai-search', sort_order: 3 },

  // AI翻译 子分类
  { name: '文本翻译', slug: 'text-translation', parent_slug: 'ai-translate', sort_order: 1 },
  { name: '实时翻译', slug: 'real-time-translation', parent_slug: 'ai-translate', sort_order: 2 },
  { name: '语音翻译', slug: 'voice-translation', parent_slug: 'ai-translate', sort_order: 3 },

  // AI设计 子分类
  { name: 'UI设计', slug: 'ui-design', parent_slug: 'ai-design', sort_order: 1 },
  { name: 'Logo设计', slug: 'logo-design', parent_slug: 'ai-design', sort_order: 2 },
  { name: '平面设计', slug: 'graphic-design', parent_slug: 'ai-design', sort_order: 3 },

  // AI效率 子分类
  { name: '任务管理', slug: 'task-management', parent_slug: 'ai-productivity', sort_order: 1 },
  { name: '数据分析', slug: 'data-analysis', parent_slug: 'ai-productivity', sort_order: 2 },
  { name: '工作流自动化', slug: 'workflow-automation', parent_slug: 'ai-productivity', sort_order: 3 },
];

interface WebsiteInput {
  title: string;
  url: string;
  description: string;
  category_slug: string;
  thumbnail: string;
  status: 'pending' | 'approved' | 'rejected';
}

const defaultWebsites = [
  {
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    description: 'OpenAI 开发的 AI 聊天助手，能够进行自然对话并协助完成各种任务。',
    category_slug: 'ai-chat',
    thumbnail: 'https://chat.openai.com/favicon.ico',
    status: 'approved',
  },
  {
    title: 'Claude',
    url: 'https://claude.ai',
    description: 'Anthropic 开发的 AI 助手，擅长写作、分析和编程等任务。',
    category_slug: 'ai-chat',
    thumbnail: 'https://claude.ai/favicon.ico',
    status: 'approved',
  },
  {
    title: 'Midjourney',
    url: 'https://www.midjourney.com',
    description: '强大的 AI 绘画工具，可以通过文字描述生成高质量图片。',
    category_slug: 'ai-art',
    thumbnail: 'https://www.midjourney.com/favicon.ico',
    status: 'approved',
  },
  {
    title: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    description: 'GitHub 和 OpenAI 合作开发的 AI 编程助手，提供智能代码补全。',
    category_slug: 'ai-coding',
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
    await Promise.all(
      defaultCategories.map(category =>
        prisma.category.upsert({
          where: { slug: category.slug },
          update: category,
          create: category,
        })
      )
    );

    // 获取所有一级分类的映射
    const categories = await prisma.category.findMany({
      where: { parent_id: null }
    });
    const categoryMap = new Map(
      categories.map((c: Category) => [c.slug, c.id])
    );

    // 初始化二级分类
    await Promise.all(
      subcategories.map(async subcategory => {
        const { parent_slug, ...subCategoryData } = subcategory;
        const parent_id = categoryMap.get(parent_slug);
        
        if (parent_id) {
          await prisma.category.upsert({
            where: { slug: subcategory.slug },
            update: { ...subCategoryData, parent_id },
            create: { ...subCategoryData, parent_id },
          });
        }
      })
    );

    // 获取所有分类的映射（包含子分类）
    const allCategories = await prisma.category.findMany();
    const allCategoryMap = new Map(
      allCategories.map((c: Category) => [c.slug, c.id])
    );

    // 初始化网站
    await Promise.all(
      defaultWebsites.map(async website => {
        const { category_slug, ...websiteData } = website;
        const category_id = allCategoryMap.get(category_slug);

        if (category_id) {
          // Generate slug from title
          let slug = generateSlug(website.title);
          let slugCounter = 1;

          // Check if slug already exists and make it unique
          const existingWebsiteWithSlug = await prisma.website.findUnique({
            where: { slug }
          });

          while (existingWebsiteWithSlug && existingWebsiteWithSlug.url !== website.url) {
            slug = `${generateSlug(website.title)}-${slugCounter}`;
            slugCounter++;
          }

          const createData: Prisma.WebsiteCreateInput = {
            ...websiteData,
            slug,
            category: {
              connect: { id: Number(category_id) }
            }
          };

          const updateData: Prisma.WebsiteUpdateInput = {
            ...websiteData,
            slug,
            category: {
              connect: { id: Number(category_id) }
            }
          };

          const existingWebsite = await prisma.website.findUnique({
            where: { url: website.url }
          });

          if (existingWebsite) {
            return prisma.website.update({
              where: { id: existingWebsite.id },
              data: updateData
            });
          } else {
            return prisma.website.create({
              data: createData
            });
          }
        }
      })
    );

    // 初始化页脚链接
    await Promise.all(
      defaultFooterLinks.map(async link => {
        const existingLink = await prisma.footerLink.findUnique({
          where: { url: link.url }
        });

        if (existingLink) {
          return prisma.footerLink.update({
            where: { id: existingLink.id },
            data: link
          });
        } else {
          return prisma.footerLink.create({
            data: link
          });
        }
      })
    );

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
import { prisma } from '../db/db';
import type { Prisma, PrismaClient, Category } from '@prisma/client';
import { WebsiteSettings } from '../constraint';




const defaultCategories = [
  { name: 'AI Chat', slug: 'ai-chat' },
  { name: 'AI Art', slug: 'ai-art' },
  { name: 'AI Writing', slug: 'ai-writing' },
  { name: 'AI Coding', slug: 'ai-coding' },
  { name: 'AI Tools', slug: 'ai-tools' },
  { name: 'LLM', slug: 'llm' },
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
    // 初始化分类
    await Promise.all(
      defaultCategories.map(category =>
        prisma.category.upsert({
          where: { slug: category.slug },
          update: category,
          create: category,
        })
      )
    );

    // 获取所有分类的映射
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((c: Category) => [c.slug, c.id])
    );

    // 初始化网站
    await Promise.all(
      defaultWebsites.map(async website => {
        const { category_slug, ...websiteData } = website;
        const category_id = categoryMap.get(category_slug);
        
        if (category_id) {
          const createData: Prisma.WebsiteCreateInput = {
            ...websiteData,
            category: { 
              connect: { id: Number(category_id) } 
            }
          };

          const updateData: Prisma.WebsiteUpdateInput = {
            ...websiteData,
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

export async function initializeSettings() {
  const requiredSettings = [
    { key: WebsiteSettings.title, value: 'AI导航' },
    { key: WebsiteSettings.description, value: '发现、分享和收藏优质AI工具与资源' },
    { key: WebsiteSettings.keywords, value: 'AI导航,AI工具,人工智能,AI资源' },
    { key: WebsiteSettings.logo, value: '/static/logo.png' },
    { key: WebsiteSettings.siteIcp, value: '' },
    { key: WebsiteSettings.siteFooter, value: '© 2024 AI导航. All rights reserved.' },
    { key: WebsiteSettings.allowSubmissions, value: 'true' },
    { key: WebsiteSettings.requireApproval, value: 'true' },
    { key: WebsiteSettings.itemsPerPage, value: '12' },
    { key: WebsiteSettings.adminPassword, value: process.env.ADMIN_PASSWORD || 'admin' },
    { key: WebsiteSettings.siteUrl, value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' },
    { key: WebsiteSettings.siteEmail, value: process.env.SITE_EMAIL || 'admin@example.com' },
    { key: WebsiteSettings.siteCopyright, value: '© 2024 AI导航. All rights reserved.' },
    { key: WebsiteSettings.googleAnalytics, value: process.env.GOOGLE_ANALYTICS || '' },
    { key: WebsiteSettings.baiduAnalytics, value: process.env.BAIDU_ANALYTICS || '' },
  ];
  
  await Promise.all(
    requiredSettings.map(setting =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    )
  );
}

module.exports = {
  initializeData,
  initializeSettings
}; 

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  (async () => {
    try {
      await initializeData();
      await initializeSettings();
      console.log('所有数据初始化完成！');
      process.exit(0);
    } catch (error) {
      console.error('初始化失败:', error);
      process.exit(1);
    }
  })();
} 
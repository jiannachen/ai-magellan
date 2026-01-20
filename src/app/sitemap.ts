import { MetadataRoute } from 'next'
import { getDB } from '@/lib/db'
import { websites, categories } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aimagellan.com'

  try {
    const db = getDB();
    // 渐进式SEO策略：先放出高质量的工具，逐步扩大
    // 阶段1: 100个 -> 阶段2: 300个 -> 阶段3: 1000个 -> 最终: 全部
    const SITEMAP_TOOL_LIMIT = 100

    // 获取高质量的已批准网站，按优先级排序
    const websitesList = await db.query.websites.findMany({
      where: eq(websites.status, 'approved'),
      columns: {
        slug: true,
        updatedAt: true,
        isFeatured: true,
        qualityScore: true,
        visits: true,
        likes: true,
      },
      orderBy: (websites, { desc }) => [
        desc(websites.isFeatured),
        desc(websites.qualityScore),
        desc(websites.visits),
        desc(websites.likes),
      ],
      limit: SITEMAP_TOOL_LIMIT,
    })

    // 获取所有分类
    const categoriesList = await db.query.categories.findMany({
      columns: {
        slug: true,
        updatedAt: true,
      },
    })

    // 静态页面
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/submit`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/rankings`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/rankings/top-rated`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/rankings/popular`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/rankings/free`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/rankings/recent`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
    ]

    // 多语言版本的静态页面（只包含非默认语言）
    const nonDefaultLocales = ['tw'] // 默认语言是en，不需要/en/前缀
    const localizedPages = staticPages.flatMap(page =>
      nonDefaultLocales.map(locale => ({
        ...page,
        url: page.url === baseUrl ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${page.url.replace(baseUrl, '')}`,
        priority: page.priority * 0.9, // 稍微降低非主语言优先级
      }))
    )

    // 工具详情页面
    const toolPages = websitesList.map(website => ({
      url: `${baseUrl}/tools/${website.slug}`,
      lastModified: website.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // 多语言工具页面（只包含非默认语言）
    const localizedToolPages = toolPages.flatMap(page =>
      nonDefaultLocales.map(locale => ({
        ...page,
        url: `${baseUrl}/${locale}/tools/${page.url.split('/').pop()}`,
        priority: 0.5,
      }))
    )

    // 分类页面
    const categoryPages = categoriesList.map(category => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // 多语言分类页面（只包含非默认语言）
    const localizedCategoryPages = categoryPages.flatMap(page =>
      nonDefaultLocales.map(locale => ({
        ...page,
        url: `${baseUrl}/${locale}/categories/${page.url.split('/').pop()}`,
        priority: 0.6,
      }))
    )

    return [
      ...staticPages,
      ...localizedPages,
      ...toolPages,
      ...localizedToolPages,
      ...categoryPages,
      ...localizedCategoryPages,
    ]
  } catch (error) {
    // 返回基本的sitemap
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}

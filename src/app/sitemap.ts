import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aimagellan.com'
  
  try {
    // 获取所有已批准的网站
    const websites = await prisma.website.findMany({
      where: { status: 'approved' },
      select: {
        id: true,
        updated_at: true,
      },
    })

    // 获取所有分类
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updated_at: true,
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

    // 多语言版本的静态页面
    const locales = ['en', 'tw']
    const localizedPages = staticPages.flatMap(page => 
      locales.map(locale => ({
        ...page,
        url: page.url === baseUrl ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${page.url.replace(baseUrl, '')}`,
        priority: page.priority * 0.9, // 稍微降低非主语言优先级
      }))
    )

    // 工具详情页面
    const toolPages = websites.map(website => ({
      url: `${baseUrl}/tools/${website.id}`,
      lastModified: website.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // 多语言工具页面
    const localizedToolPages = toolPages.flatMap(page => 
      locales.map(locale => ({
        ...page,
        url: `${baseUrl}/${locale}/tools/${page.url.split('/').pop()}`,
        priority: 0.5,
      }))
    )

    // 分类页面
    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updated_at || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // 多语言分类页面
    const localizedCategoryPages = categoryPages.flatMap(page => 
      locales.map(locale => ({
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
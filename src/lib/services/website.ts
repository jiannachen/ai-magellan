import { unstable_cache } from 'next/cache'
import { getDB, parseJsonField, parseBooleanField } from '@/lib/db'
import { websites, websiteLikes, websiteFavorites, websiteCategories, websiteReviews } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'

export interface WebsiteDetail {
  id: number
  title: string
  slug: string
  url: string
  description: string
  category: {
    id: number
    name: string
    slug: string
    parent_id?: number
    parent?: {
      id: number
      name: string
      slug: string
    }
  } | null
  websiteCategories?: Array<{
    isPrimary: boolean
    category: {
      id: number
      name: string
      slug: string
      name_en?: string
      name_zh?: string
      parent_id?: number
      parent?: {
        id: number
        name: string
        slug: string
      }
    }
  }>
  thumbnail: string | null
  logo_url: string | null
  status: string
  visits: number
  likes: number
  qualityScore: number
  is_trusted: boolean
  is_featured: boolean
  tags: string[] | null
  tagline: string | null
  email: string | null
  features: any
  pricing_model: string
  has_free_version: boolean
  pricing_plans: Array<{name: string, billing_cycle: string, price: string, features: string[]}> | null
  base_price: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  discord_url: string | null
  domain_authority: number | null
  response_time: number | null
  ssl_enabled: boolean
  api_available: boolean
  use_cases: string[] | null
  target_audience: string[] | null
  faq: Array<{question: string, answer: string}> | null
  integrations: string[] | null
  ios_app_url: string | null
  android_app_url: string | null
  web_app_url: string | null
  desktop_platforms: string[] | null
  created_at: string
  updated_at: string
  _count: {
    websiteLikes: number
    websiteFavorites: number
  }
}

export interface ReviewStats {
  avgRating: number
  totalReviews: number
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

// 转换数据库字段名为前端使用的格式
function transformWebsite(website: any): WebsiteDetail | null {
  if (!website) return null

  // Handle timestamp conversion (D1 stores as string, PostgreSQL as Date)
  const createdAt = website.createdAt instanceof Date
    ? website.createdAt.toISOString()
    : (website.createdAt || '')
  const updatedAt = website.updatedAt instanceof Date
    ? website.updatedAt.toISOString()
    : (website.updatedAt || '')

  return {
    id: website.id,
    title: website.title,
    slug: website.slug,
    url: website.url,
    description: website.description,
    category: null,
    websiteCategories: website.websiteCategories?.map((wc: any) => ({
      isPrimary: parseBooleanField(wc.isPrimary),
      category: {
        id: wc.category.id,
        name: wc.category.name,
        slug: wc.category.slug,
        name_en: wc.category.nameEn,
        name_zh: wc.category.nameZh,
        parent_id: wc.category.parentId,
        parent: wc.category.parent ? {
          id: wc.category.parent.id,
          name: wc.category.parent.name,
          slug: wc.category.parent.slug
        } : undefined
      }
    })),
    thumbnail: website.thumbnail,
    logo_url: website.logoUrl,
    status: website.status,
    visits: website.visits,
    likes: website.likes,
    qualityScore: website.qualityScore,
    is_trusted: parseBooleanField(website.isTrusted),
    is_featured: parseBooleanField(website.isFeatured),
    tags: parseJsonField(website.tags, []),
    tagline: website.tagline,
    email: website.email,
    features: parseJsonField(website.features, []),
    pricing_model: website.pricingModel,
    has_free_version: parseBooleanField(website.hasFreeVersion),
    pricing_plans: parseJsonField(website.pricingPlans, null),
    base_price: website.basePrice,
    twitter_url: website.twitterUrl,
    linkedin_url: website.linkedinUrl,
    facebook_url: website.facebookUrl,
    instagram_url: website.instagramUrl,
    youtube_url: website.youtubeUrl,
    discord_url: website.discordUrl,
    domain_authority: website.domainAuthority,
    response_time: website.responseTime,
    ssl_enabled: parseBooleanField(website.sslEnabled),
    api_available: parseBooleanField(website.apiAvailable),
    use_cases: parseJsonField(website.useCases, null),
    target_audience: parseJsonField(website.targetAudience, null),
    faq: parseJsonField(website.faq, null),
    integrations: parseJsonField(website.integrations, null),
    ios_app_url: website.iosAppUrl,
    android_app_url: website.androidAppUrl,
    web_app_url: website.webAppUrl,
    desktop_platforms: parseJsonField(website.desktopPlatforms, null),
    created_at: createdAt,
    updated_at: updatedAt,
    _count: {
      websiteLikes: 0,
      websiteFavorites: 0
    }
  }
}

// 获取网站详情 (带缓存)
async function fetchWebsiteBySlug(slug: string) {
  const db = getDB()
  const isNumericId = !isNaN(Number(slug))

  // 并行执行所有查询
  const websitePromise = db.query.websites.findFirst({
    where: isNumericId ? eq(websites.id, parseInt(slug)) : eq(websites.slug, slug),
    with: {
      websiteCategories: {
        with: {
          category: {
            columns: {
              id: true,
              name: true,
              slug: true,
              nameEn: true,
              nameZh: true,
              parentId: true,
            },
            with: {
              parent: {
                columns: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: desc(websiteCategories.isPrimary)
      }
    },
  })

  const website = await websitePromise

  if (!website) return null

  // 并行获取计数
  const [likesResult, favoritesResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` })
      .from(websiteLikes)
      .where(eq(websiteLikes.websiteId, website.id)),
    db.select({ count: sql<number>`count(*)` })
      .from(websiteFavorites)
      .where(eq(websiteFavorites.websiteId, website.id))
  ])

  const transformed = transformWebsite(website)
  if (transformed) {
    transformed._count = {
      websiteLikes: Number(likesResult[0]?.count) || 0,
      websiteFavorites: Number(favoritesResult[0]?.count) || 0
    }
  }

  return transformed
}

// 使用 Next.js 缓存包装
export const getWebsiteBySlug = unstable_cache(
  fetchWebsiteBySlug,
  ['website-detail'],
  {
    revalidate: 3600, // 1小时缓存
    tags: ['website']
  }
)

// 获取评论 (带缓存)
async function fetchWebsiteReviews(websiteId: number) {
  const db = getDB()
  const reviews = await db.query.websiteReviews.findMany({
    where: eq(websiteReviews.websiteId, websiteId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: desc(websiteReviews.createdAt),
    limit: 10
  })

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return {
    reviews: reviews.map(r => {
      // Handle timestamp conversion (D1 stores as string, PostgreSQL as Date)
      const createdAt = r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : (r.createdAt || '')

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          image: r.user.image
        }
      }
    }),
    stats: {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length
    }
  }
}

export const getWebsiteReviews = unstable_cache(
  fetchWebsiteReviews,
  ['website-reviews'],
  {
    revalidate: 300, // 5分钟缓存
    tags: ['reviews']
  }
)

// 获取所有已批准的网站 slug (用于静态生成)
export async function getAllApprovedWebsiteSlugs() {
  const db = getDB()
  const result = await db
    .select({ slug: websites.slug })
    .from(websites)
    .where(eq(websites.status, 'approved'))

  return result.map(r => r.slug)
}

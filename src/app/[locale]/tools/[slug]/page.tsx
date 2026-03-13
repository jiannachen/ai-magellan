import { notFound } from 'next/navigation'
import { db } from '@/lib/db/db'
import { websites, websiteLikes, websiteFavorites, websiteCategories } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import { cachedQuery } from '@/lib/db/cache'
import ToolDetailContent from './tool-detail-content'

async function getWebsiteBySlug(slug: string) {
  return cachedQuery(
    `website-detail-${slug}`,
    async () => {
      const isNumericId = !isNaN(Number(slug))

      const website = await db.query.websites.findFirst({
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

      if (!website) return null

      const [likesCount, favoritesCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
          .from(websiteLikes)
          .where(eq(websiteLikes.websiteId, website.id)),
        db.select({ count: sql<number>`count(*)` })
          .from(websiteFavorites)
          .where(eq(websiteFavorites.websiteId, website.id)),
      ])

      return {
        ...website,
        _count: {
          websiteLikes: likesCount[0].count,
          websiteFavorites: favoritesCount[0].count
        }
      }
    },
    { ttl: 60, tags: [`website-detail-${slug}`] }
  )
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params

  const website = await getWebsiteBySlug(slug)

  if (!website) {
    notFound()
  }

  return <ToolDetailContent initialWebsite={JSON.parse(JSON.stringify(website))} />
}

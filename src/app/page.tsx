import { getDB } from "@/lib/db";
import { websites, categories } from "@/lib/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { cachedPrismaQuery } from "@/lib/db/cache";
import { StructuredData } from "@/components/seo/structured-data";
import { HeroSection } from "@/components/home/hero-section";
import { RankingSection } from "@/components/home/ranking-section";
import { ValuePropsSection } from "@/components/home/value-props-section";
import { FAQSection } from "@/components/home/faq-section";
import { CTASection } from "@/components/home/cta-section";
import HomeClientWrapper from "@/components/home/home-client-wrapper";
import { getTranslations, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { loadMessages } from '@/lib/i18n/load-messages';

// 使用 ISR (Incremental Static Regeneration) 代替 force-dynamic
// 每60秒重新验证一次,提供静态页面的性能优势,同时保持数据新鲜度
export const revalidate = 60;

export default async function Home() {
  // 在服务端获取初始数据，使用缓存，只选择需要的字段
  const [websitesData, categoriesData] = await Promise.all([
    cachedPrismaQuery(
      "approved-websites",
      async () => {
        const db = getDB();
        const result = await db.query.websites.findMany({
          where: eq(websites.status, 'approved'),
          columns: {
            id: true,
            title: true,
            slug: true,
            url: true,
            description: true,
            categoryId: true,
            thumbnail: true,
            logoUrl: true,
            status: true,
            visits: true,
            likes: true,
            active: true,
            qualityScore: true,
            isFeatured: true,
            isTrusted: true,
            createdAt: true,
            pricingModel: true,
            hasFreeVersion: true,
          },
        });
        return result;
      },
      { ttl: 86400 } // 1天缓存
    ),
    cachedPrismaQuery(
      "all-categories",
      async () => {
        const db = getDB();
        const result = await db.query.categories.findMany({
          where: isNull(categories.parentId),
          columns: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            sortOrder: true,
          },
          with: {
            children: {
              columns: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                sortOrder: true,
              },
              orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
            },
          },
          orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
        });
        return result;
      },
      { ttl: 604800 } // 1周缓存
    ),
  ]);

  // 预处理数据，减少客户端计算
  const preFilteredWebsites = websitesData.map((website) => ({
    ...website,
    logoUrl: website.logoUrl ?? undefined,
    thumbnail: website.thumbnail ?? undefined,
    status: website.status as "approved" | "pending" | "rejected",
    searchText: `${website.title.toLowerCase()} ${website.description.toLowerCase()}`,
  }));

  // Transform categories to match expected format
  const transformedCategories = categoriesData.map(cat => ({
    ...cat,
    parent_id: cat.parentId,
    sort_order: cat.sortOrder,
    children: cat.children.map(child => ({
      ...child,
      parent_id: child.parentId,
      sort_order: child.sortOrder,
    })),
  }));

  // 在服务端计算排行榜数据
  const topRatedWebsites = [...preFilteredWebsites]
    .sort((a, b) => (b.qualityScore ?? 50) - (a.qualityScore ?? 50))
    .slice(0, 12);

  const mostPopularWebsites = [...preFilteredWebsites]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 12);

  const recentWebsites = [...preFilteredWebsites]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 12);

  const topFreeWebsites = preFilteredWebsites
    .filter(w => w.pricingModel === 'free' || w.hasFreeVersion)
    .sort((a, b) => (b.qualityScore ?? 50) - (a.qualityScore ?? 50))
    .slice(0, 12);

  // FAQ数据 - 用于结构化数据 (英文版本，SEO友好)
  const faqData = [
    {
      question: "What makes AI Magellan different from other AI tool directories?",
      answer: "AI Magellan focuses on professional-grade exploration experience. Like Magellan's global voyage spirit, we carefully curate each AI tool, providing in-depth reviews and practical guides for professionals."
    },
    {
      question: "How do you ensure tool quality?",
      answer: "We have a professional review team that tests each tool for functionality, security, and user experience. We only recommend truly valuable AI products that meet our high standards."
    },
    {
      question: "Are there free tools on the platform?",
      answer: "Yes, we've curated a large collection of high-quality free AI tools. We clearly mark each tool's pricing model to help users find solutions that fit their budget."
    },
    {
      question: "How can I submit an AI tool?",
      answer: "Click the 'Submit Tool' button and fill in the detailed information. Our team will review submissions within 48 hours, and approved tools will be featured on the platform."
    },
    {
      question: "How often is tool information updated?",
      answer: "We update tool information daily, including price changes and new feature releases. Popular tools receive even more frequent updates to ensure accuracy."
    },
    {
      question: "Do I need to register an account to use the platform?",
      answer: "Browsing tools requires no registration, but creating an account allows you to bookmark tools, submit tools, participate in ratings, and get a complete user experience."
    }
  ];

  // Load landing translations on-demand for this page
  const landingMessages = await loadMessages('landing');
  const coreMessages = await getMessages();
  const messages = {
    ...coreMessages,
    landing: landingMessages,
  };

  const tLanding = await getTranslations('landing');

  return (
    <NextIntlClientProvider messages={messages}>
      {/* JSON-LD结构化数据 */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="itemList" websites={preFilteredWebsites.slice(0, 20)} />
      <StructuredData type="faq" faqs={faqData} />

      {/* 客户端包装器 - 仅负责初始化全局状态 */}
      <HomeClientWrapper
        initialWebsites={preFilteredWebsites}
        initialCategories={transformedCategories}
      >
        <div className="min-h-screen bg-background mobile-safe-bottom">
          {/* Hero Section - 服务端组件 */}
          <HeroSection
            websiteCount={preFilteredWebsites.length}
            categoryCount={transformedCategories.length}
          />

          {/* Rankings Sections - 服务端组件 */}
          <RankingSection
            title={tLanding('sections.ranking_sections.premier_discoveries.title')}
            description={tLanding('sections.ranking_sections.premier_discoveries.description')}
            websites={topRatedWebsites}
            iconName="crown"
            viewAllLink="/rankings/top-rated"
          />

          <RankingSection
            title={tLanding('sections.ranking_sections.trending_expeditions.title')}
            description={tLanding('sections.ranking_sections.trending_expeditions.description')}
            websites={mostPopularWebsites}
            iconName="trendingUp"
            viewAllLink="/rankings/popular"
            variant="muted"
          />

          <RankingSection
            title={tLanding('sections.ranking_sections.free_territory.title')}
            description={tLanding('sections.ranking_sections.free_territory.description')}
            websites={topFreeWebsites}
            iconName="checkCircle"
            viewAllLink="/rankings/free"
          />

          <RankingSection
            title={tLanding('sections.ranking_sections.new_horizons.title')}
            description={tLanding('sections.ranking_sections.new_horizons.description')}
            websites={recentWebsites}
            iconName="clock"
            viewAllLink="/rankings/recent"
            variant="muted"
          />

          {/* Value Props Section - 服务端组件 */}
          <ValuePropsSection />

          {/* FAQ Section - 服务端组件 */}
          <FAQSection />

          {/* CTA Section - 服务端组件 */}
          <CTASection />
        </div>
      </HomeClientWrapper>
    </NextIntlClientProvider>
  );
}

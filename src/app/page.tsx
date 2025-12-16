import { db } from "@/lib/db/db";
import { websites, categories } from "@/lib/db/schema";
import { eq, isNull, asc } from "drizzle-orm";
import SimplifiedHomePage from "@/app/simplified-home-page";
import { cachedPrismaQuery } from "@/lib/db/cache";
import { StructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 在服务端获取初始数据，使用缓存，只选择需要的字段
  const [websitesData, categoriesData] = await Promise.all([
    cachedPrismaQuery(
      "approved-websites",
      async () => {
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
      { ttl: 1 } // 1天缓存
    ),
    cachedPrismaQuery(
      "all-categories",
      async () => {
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
      { ttl: 1 } // 1周缓存
    ),
  ]);

  // 预处理数据，减少客户端计算
  const preFilteredWebsites = websitesData.map((website) => ({
    ...website,
    category_id: website.categoryId,
    logo_url: website.logoUrl ?? undefined,
    thumbnail: website.thumbnail ?? undefined,
    status: website.status as "approved" | "pending" | "rejected",
    quality_score: website.qualityScore,
    is_featured: website.isFeatured,
    is_trusted: website.isTrusted,
    created_at: website.createdAt,
    pricing_model: website.pricingModel,
    has_free_version: website.hasFreeVersion,
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

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="itemList" websites={preFilteredWebsites.slice(0, 20)} />
      <StructuredData type="faq" faqs={faqData} />

      <SimplifiedHomePage
        initialWebsites={preFilteredWebsites}
        initialCategories={transformedCategories}
      />
    </>
  );
}

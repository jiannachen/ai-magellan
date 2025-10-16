import { prisma } from "@/lib/db/db";
import SimplifiedHomePage from "@/app/simplified-home-page";
import { cachedPrismaQuery } from "@/lib/db/cache";
import { StructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  // 在服务端获取初始数据，使用缓存，只选择需要的字段
  const [websitesData, categoriesData] = await Promise.all([
    cachedPrismaQuery(
      "approved-websites",
      () =>
        prisma.website.findMany({
          where: { status: "approved" },
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            category_id: true,
            thumbnail: true,
            logo_url: true,
            status: true,
            visits: true,
            likes: true,
            active: true, // 添加missing的字段
            quality_score: true,
            is_featured: true,
            is_trusted: true,
            created_at: true,
            pricing_model: true,
            has_free_version: true,
          },
        }),
      { ttl: 1 } // 1天缓存
    ),
    cachedPrismaQuery(
      "all-categories",
      () =>
        prisma.category.findMany({
          where: {
            parent_id: null // 只获取一级分类
          },
          select: {
            id: true,
            name: true,
            slug: true,
            parent_id: true,
            sort_order: true,
            children: {
              select: {
                id: true,
                name: true,
                slug: true,
                parent_id: true,
                sort_order: true,
              },
              orderBy: {
                sort_order: 'asc'
              }
            }
          },
          orderBy: {
            sort_order: 'asc'
          }
        }),
      { ttl: 1 } // 1周缓存
    ),
  ]);

  // 预处理数据，减少客户端计算
  const preFilteredWebsites = websitesData.map((website) => ({
    ...website,
    thumbnail: website.thumbnail ?? undefined,
    logo_url: website.logo_url ?? undefined,
    status: website.status as "approved" | "pending" | "rejected",
    searchText: `${website.title.toLowerCase()} ${website.description.toLowerCase()}`,
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
        initialCategories={categoriesData}
      />
    </>
  );
}

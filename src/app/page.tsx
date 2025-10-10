import { prisma } from "@/lib/db/db";
import SimplifiedHomePage from "@/app/simplified-home-page";
import { cachedPrismaQuery } from "@/lib/db/cache";
import { StructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const startTime = Date.now();

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
          select: {
            id: true,
            name: true,
            slug: true,
          },
        }),
      { ttl: 1 } // 1周缓存
    ),
  ]);

  const endTime = Date.now();
  console.log(`数据加载耗时: ${endTime - startTime}ms`);

  // 预处理数据，减少客户端计算
  const preFilteredWebsites = websitesData.map((website) => ({
    ...website,
    searchText: `${website.title.toLowerCase()} ${website.description.toLowerCase()}`,
  }));

  return (
    <>
      {/* JSON-LD结构化数据 */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData type="itemList" websites={preFilteredWebsites.slice(0, 20)} />
      
      <SimplifiedHomePage
        initialWebsites={preFilteredWebsites}
        initialCategories={categoriesData}
      />
    </>
  );
}

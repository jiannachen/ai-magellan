import { prisma } from "@/lib/db/db";

export async function getWebsites() {
  try {
    const websites = await prisma.website.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return websites;
  } catch (error) {
    console.error("Error fetching websites:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: "asc",
      },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

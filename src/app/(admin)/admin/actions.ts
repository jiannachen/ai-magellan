import { db } from "@/lib/db/db";
import { websites, categories } from "@/lib/db/schema";
import { desc, asc } from "drizzle-orm";

export async function getWebsites() {
  try {
    const websitesList = await db.query.websites.findMany({
      orderBy: (websites, { desc }) => [desc(websites.createdAt)],
    });
    return websitesList;
  } catch (error) {
    console.error("Error fetching websites:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const categoriesList = await db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.id)],
    });
    return categoriesList;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

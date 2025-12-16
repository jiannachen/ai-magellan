import { db } from '@/lib/db/db';
import {
  users, websites, categories, websiteCategories,
  websiteLikes, websiteFavorites, websiteReviews,
  feedbacks, footerLinks
} from '@/lib/db/schema';
import { eq, and, or, sql, isNull, desc, asc, inArray, ne, gte, lte } from 'drizzle-orm';

/**
 * Migration helper to convert Prisma queries to Drizzle
 * This file provides reference examples for common patterns
 */

// Example 1: findMany with where and orderBy
async function example1() {
  // Prisma: prisma.website.findMany({ where: { status: 'approved' }, orderBy: { createdAt: 'desc' } })
  const result = await db.query.websites.findMany({
    where: eq(websites.status, 'approved'),
    orderBy: desc(websites.createdAt),
  });
  return result;
}

// Example 2: findFirst
async function example2() {
  // Prisma: prisma.user.findFirst({ where: { email: 'test@example.com' } })
  const result = await db.query.users.findFirst({
    where: eq(users.email, 'test@example.com'),
  });
  return result;
}

// Example 3: create
async function example3() {
  // Prisma: prisma.website.create({ data: { title: 'Test', slug: 'test' } })
  const [result] = await db.insert(websites).values({
    title: 'Test',
    slug: 'test',
    url: 'https://test.com',
    description: 'Test description',
  }).returning();
  return result;
}

// Example 4: update
async function example4() {
  // Prisma: prisma.website.update({ where: { id: 1 }, data: { title: 'New' } })
  const [result] = await db.update(websites)
    .set({ title: 'New' })
    .where(eq(websites.id, 1))
    .returning();
  return result;
}

// Example 5: delete
async function example5() {
  // Prisma: prisma.website.delete({ where: { id: 1 } })
  await db.delete(websites).where(eq(websites.id, 1));
}

// Example 6: count
async function example6() {
  // Prisma: prisma.website.count({ where: { status: 'approved' } })
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(websites)
    .where(eq(websites.status, 'approved'));
  return Number(count);
}

// Example 7: complex where with AND
async function example7() {
  // Prisma: prisma.website.findMany({ where: { AND: [{ status: 'approved' }, { isFeatured: true }] } })
  const result = await db.query.websites.findMany({
    where: and(
      eq(websites.status, 'approved'),
      eq(websites.isFeatured, true)
    ),
  });
  return result;
}

// Example 8: increment
async function example8() {
  // Prisma: prisma.website.update({ where: { id: 1 }, data: { visits: { increment: 1 } } })
  const [result] = await db.update(websites)
    .set({ visits: sql`${websites.visits} + 1` })
    .where(eq(websites.id, 1))
    .returning();
  return result;
}

// Example 9: transaction
async function example9() {
  // Prisma: prisma.$transaction([...])
  await db.transaction(async (tx) => {
    await tx.insert(websites).values({
      title: 'Example',
      slug: 'example',
      url: 'https://example.com',
      description: 'Example description',
    });
    await tx.insert(websiteCategories).values({
      websiteId: 1,
      categoryId: 1,
    });
  });
}

// Example 10: join query
async function example10() {
  // Complex join
  const result = await db
    .select()
    .from(websites)
    .innerJoin(websiteCategories, eq(websites.id, websiteCategories.websiteId))
    .innerJoin(categories, eq(websiteCategories.categoryId, categories.id))
    .where(eq(websites.status, 'approved'));
  return result;
}

export const migrationExamples = {
  example1, example2, example3, example4, example5,
  example6, example7, example8, example9, example10,
};

# Prisma to Drizzle Migration Guide

This guide helps you migrate from Prisma to Drizzle ORM in your project.

## What's Changed

### 1. Database Client

**Before (Prisma):**
```typescript
import { prisma } from "@/lib/db/db";
```

**After (Drizzle):**
```typescript
import { db } from "@/lib/db/db";
import { users, websites, categories } from "@/lib/db/schema";
import { eq, and, or, sql, isNull } from "drizzle-orm";
```

### 2. Common Query Patterns

#### Find Many

**Prisma:**
```typescript
const categories = await prisma.category.findMany({
  where: { parent_id: null },
  orderBy: { sort_order: 'asc' }
});
```

**Drizzle:**
```typescript
const categoriesList = await db.query.categories.findMany({
  where: isNull(categories.parentId),
  orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
});

// Or using select:
const categoriesList = await db
  .select()
  .from(categories)
  .where(isNull(categories.parentId))
  .orderBy(asc(categories.sortOrder));
```

#### Find First / Find Unique

**Prisma:**
```typescript
const category = await prisma.category.findUnique({
  where: { slug: 'ai-tools' }
});

const user = await prisma.user.findFirst({
  where: { email: 'test@example.com' }
});
```

**Drizzle:**
```typescript
const category = await db.query.categories.findFirst({
  where: eq(categories.slug, 'ai-tools'),
});

const user = await db.query.users.findFirst({
  where: eq(users.email, 'test@example.com'),
});
```

#### Create

**Prisma:**
```typescript
const category = await prisma.category.create({
  data: {
    name: 'AI Tools',
    slug: 'ai-tools',
    parent_id: 1
  }
});
```

**Drizzle:**
```typescript
const [category] = await db.insert(categories).values({
  name: 'AI Tools',
  slug: 'ai-tools',
  parentId: 1,
}).returning();
```

#### Update

**Prisma:**
```typescript
const updated = await prisma.category.update({
  where: { id: 1 },
  data: { name: 'New Name' }
});
```

**Drizzle:**
```typescript
const [updated] = await db
  .update(categories)
  .set({ name: 'New Name' })
  .where(eq(categories.id, 1))
  .returning();
```

#### Delete

**Prisma:**
```typescript
await prisma.category.delete({
  where: { id: 1 }
});
```

**Drizzle:**
```typescript
await db.delete(categories).where(eq(categories.id, 1));
```

#### Count

**Prisma:**
```typescript
const count = await prisma.website.count({
  where: { status: 'approved' }
});
```

**Drizzle:**
```typescript
const [{ count }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(websites)
  .where(eq(websites.status, 'approved'));
```

### 3. Relations and Joins

#### With Relations (Include)

**Prisma:**
```typescript
const categories = await prisma.category.findMany({
  include: {
    children: true,
    websites: true
  }
});
```

**Drizzle:**
```typescript
const categoriesList = await db.query.categories.findMany({
  with: {
    children: true,
    websites: true,
  },
});
```

#### Joins

**Prisma:**
```typescript
const websites = await prisma.website.findMany({
  where: {
    websiteCategories: {
      some: {
        categoryId: 1
      }
    }
  },
  include: {
    websiteCategories: {
      include: {
        category: true
      }
    }
  }
});
```

**Drizzle:**
```typescript
const websitesList = await db.query.websites.findMany({
  where: (websites, { exists, eq, and }) => exists(
    db.select()
      .from(websiteCategories)
      .where(
        and(
          eq(websiteCategories.websiteId, websites.id),
          eq(websiteCategories.categoryId, 1)
        )
      )
  ),
  with: {
    websiteCategories: {
      with: {
        category: true,
      },
    },
  },
});
```

### 4. Transactions

**Prisma:**
```typescript
await prisma.$transaction([
  prisma.website.create({ data: {...} }),
  prisma.websiteCategory.create({ data: {...} })
]);
```

**Drizzle:**
```typescript
await db.transaction(async (tx) => {
  await tx.insert(websites).values({...});
  await tx.insert(websiteCategories).values({...});
});
```

### 5. Complex Queries

#### Aggregations and Group By

**Prisma:**
```typescript
const result = await prisma.website.groupBy({
  by: ['status'],
  _count: { id: true }
});
```

**Drizzle:**
```typescript
const result = await db
  .select({
    status: websites.status,
    count: sql<number>`count(${websites.id})`,
  })
  .from(websites)
  .groupBy(websites.status);
```

### 6. Filtering

**Multiple Conditions:**

**Prisma:**
```typescript
const websites = await prisma.website.findMany({
  where: {
    AND: [
      { status: 'approved' },
      { isFeatured: true }
    ]
  }
});
```

**Drizzle:**
```typescript
const websitesList = await db.query.websites.findMany({
  where: and(
    eq(websites.status, 'approved'),
    eq(websites.isFeatured, true)
  ),
});
```

**OR Conditions:**

**Prisma:**
```typescript
const websites = await prisma.website.findMany({
  where: {
    OR: [
      { status: 'approved' },
      { status: 'featured' }
    ]
  }
});
```

**Drizzle:**
```typescript
const websitesList = await db.query.websites.findMany({
  where: or(
    eq(websites.status, 'approved'),
    eq(websites.status, 'featured')
  ),
});
```

## Migration Steps

1. **Update imports**: Replace `prisma` with `db` and import necessary tables and operators
2. **Update queries**: Convert Prisma query syntax to Drizzle syntax
3. **Update field names**: Convert snake_case field names to camelCase (e.g., `parent_id` → `parentId`)
4. **Handle returns**: Drizzle insert/update operations return arrays, so destructure with `[result]` or use `result[0]`
5. **Update error handling**: Drizzle errors may have different structures

## NPM Scripts

- `npm run db:generate` - Generate migrations from schema
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to database (for development)
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Important Notes

- The existing database structure remains unchanged
- No data migration is needed
- Drizzle works with your existing PostgreSQL database
- Update queries gradually - both Prisma and Drizzle can coexist temporarily via the compatibility layer

## Field Name Mapping

| Prisma (snake_case) | Drizzle (camelCase) |
|---------------------|---------------------|
| parent_id           | parentId            |
| sort_order          | sortOrder           |
| category_id         | categoryId          |
| created_at          | createdAt           |
| updated_at          | updatedAt           |
| name_en             | nameEn              |
| name_zh             | nameZh              |
| quality_score       | qualityScore        |
| is_trusted          | isTrusted           |
| is_featured         | isFeatured          |
| pricing_model       | pricingModel        |
| has_free_version    | hasFreeVersion      |
| base_price          | basePrice           |
| twitter_url         | twitterUrl          |
| domain_authority    | domainAuthority     |
| last_checked        | lastChecked         |
| response_time       | responseTime        |
| ssl_enabled         | sslEnabled          |
| submitted_by        | submittedBy         |

## Example: Complete API Route Migration

**Before:**
```typescript
import { prisma } from "@/lib/db/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parent_id: null },
    include: { children: true },
    orderBy: { sort_order: 'asc' }
  });
  return Response.json(categories);
}
```

**After:**
```typescript
import { db } from "@/lib/db/db";
import { categories } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export async function GET() {
  const categoriesList = await db.query.categories.findMany({
    where: isNull(categories.parentId),
    with: { children: true },
    orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
  });
  return Response.json(categoriesList);
}
```

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Queries](https://orm.drizzle.team/docs/rqb)
- [Drizzle vs Prisma](https://orm.drizzle.team/docs/prisma)

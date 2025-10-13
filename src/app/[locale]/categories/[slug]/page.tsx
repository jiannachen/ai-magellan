import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/db';
import CategoryPage from '@/components/category/category-page';

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true }
  });

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, slug: true }
  });

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} AI Territory - Explore ${category.name} Tools | AI Magellan`,
    description: `Navigate the ${category.name} AI territory. Discover and chart the best ${category.name} tools verified by our exploration team.`,
    openGraph: {
      title: `${category.name} AI Territory - AI Magellan`,
      description: `Best ${category.name} AI tools charted and verified by expert navigators`,
    },
  };
}

export default async function CategoryPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // 获取分类信息
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { 
      id: true, 
      name: true, 
      slug: true,
      parent_id: true
    }
  });

  if (!category) {
    // 如果是子分类页面不存在，重定向到主分类页面
    redirect(`/categories#${slug}`);
  }

  // 获取该分类下的网站
  const websites = await prisma.website.findMany({
    where: {
      category_id: category.id,
      status: 'approved'
    },
    orderBy: [
      { is_featured: 'desc' },
      { quality_score: 'desc' }
    ]
  });

  // 获取所有分类（用于导航）
  const allCategories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      parent_id: true,
      _count: {
        select: {
          websites: {
            where: {
              status: 'approved'
            }
          }
        }
      }
    },
    orderBy: {
      sort_order: 'asc'
    }
  });

  // 如果是子分类，获取父分类信息
  let parentCategory = null;
  if (category.parent_id) {
    parentCategory = await prisma.category.findUnique({
      where: { id: category.parent_id },
      select: {
        id: true,
        name: true,
        slug: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                websites: {
                  where: {
                    status: 'approved'
                  }
                }
              }
            }
          },
          orderBy: {
            sort_order: 'asc'
          }
        }
      }
    });
  }

  return (
    <CategoryPage 
      category={category}
      websites={websites}
      allCategories={allCategories}
      parentCategory={parentCategory}
    />
  );
}
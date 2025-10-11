import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
  
  // Get category data
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true }
  });

  if (!category) {
    notFound();
  }

  // Get websites in this category
  const websites = await prisma.website.findMany({
    where: { 
      category_id: category.id,
      status: 'approved'
    },
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
      quality_score: true,
      is_featured: true,
      is_trusted: true,
      pricing_model: true,
      has_free_version: true,
      tagline: true,
      features: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: [
      { is_featured: 'desc' },
      { quality_score: 'desc' },
      { visits: 'desc' }
    ]
  });

  // Get all categories for navigation
  const allCategories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true }
  });

  return (
    <CategoryPage
      category={category}
      websites={websites}
      allCategories={allCategories}
    />
  );
}
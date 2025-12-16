import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/db';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} AI Tools - AI Magellan`,
    description: `Discover the best ${category.name} AI tools. Curated and ranked to help you find exactly what you need.`,
    openGraph: {
      title: `${category.name} AI Tools - AI Magellan`,
      description: `Explore ${category.name} AI tools`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  // Redirect to the main categories page with anchor
  redirect(`/categories#${slug}`);
}

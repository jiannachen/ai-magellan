import { Metadata } from 'next';
import { prisma } from '@/lib/db/db';
import { notFound, redirect } from 'next/navigation';

interface CategoryPageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug }
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
  // Redirect to the main categories page with anchor
  redirect(`/categories#${params.slug}`);
}
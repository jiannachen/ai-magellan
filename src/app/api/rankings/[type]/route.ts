import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Valid ranking types
const RANKING_TYPES = {
  'popular': {
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'top-rated': {
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  },
  'trending': {
    sortField: 'likes',
    sortOrder: 'desc' as const
  },
  'free': {
    sortField: 'quality_score',
    sortOrder: 'desc' as const,
    filter: 'free' as const
  },
  'new': {
    sortField: 'created_at',
    sortOrder: 'desc' as const
  },
  'monthly-hot': {
    sortField: 'visits',
    sortOrder: 'desc' as const
  },
  'category-leaders': {
    sortField: 'quality_score',
    sortOrder: 'desc' as const
  }
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    
    const rankingType = RANKING_TYPES[type as keyof typeof RANKING_TYPES];
    
    if (!rankingType) {
      return NextResponse.json(
        { error: 'Invalid ranking type' },
        { status: 404 }
      );
    }

    // Build where condition
    let whereCondition: any = {
      status: 'approved'
    };

    // Add category filter if specified
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
      });
      if (category) {
        whereCondition.category_id = category.id;
      }
    }

    // Add pricing filter for free tools
    if (rankingType.filter === 'free') {
      whereCondition.OR = [
        { pricing_model: 'free' },
        { has_free_version: true }
      ];
    }

    // Get websites with sorting
    const websites = await prisma.website.findMany({
      where: whereCondition,
      include: {
        category: true,
        submitter: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        [rankingType.sortField]: rankingType.sortOrder
      },
      take: 100 // Limit to top 100
    });

    return NextResponse.json({
      websites,
      type,
      rankingType
    });
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranking data' },
      { status: 500 }
    );
  }
}
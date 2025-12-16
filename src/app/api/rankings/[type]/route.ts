import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { websites, categories, users } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

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
  { params }: { params: Promise<{ type: string }> }
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
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, categorySlug),
      });
      if (category) {
        whereCondition.categoryId = category.id;
      }
    }

    // Add pricing filter for free tools
    if ('filter' in rankingType && rankingType.filter === 'free') {
      whereCondition.OR = [
        { pricingModel: 'free' },
        { hasFreeVersion: true }
      ];
    }

    // Build where conditions array
    const conditions = [eq(websites.status, 'approved')];
    if (whereCondition.categoryId) {
      conditions.push(eq(websites.categoryId, whereCondition.categoryId));
    }
    if (whereCondition.OR) {
      conditions.push(
        or(
          eq(websites.pricingModel, 'free'),
          eq(websites.hasFreeVersion, true)
        )!
      );
    }

    // Get websites with sorting
    const websitesList = await db.query.websites.findMany({
      where: and(...conditions),
      with: {
        websiteCategories: {
          with: {
            category: true,
          },
        },
        submitter: {
          columns: {
            id: true,
            name: true,
          }
        }
      },
      limit: 100,
    });

    return NextResponse.json({
      websites: websitesList || [],
      type,
      rankingType,
      total: websitesList.length
    });
  } catch (error) {
    console.error('Error fetching ranking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ranking data' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { searchWebsites } from '@/lib/search/search-service';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 解析查询参数
  const params = {
    q: searchParams.get('q') || undefined,
    category: searchParams.get('category') || undefined,
    pricingModel: searchParams.getAll('pricingModel'),
    minQualityScore: searchParams.get('minQualityScore') 
      ? parseInt(searchParams.get('minQualityScore')!) 
      : undefined,
    isTrusted: searchParams.get('isTrusted') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    hasFreePlan: searchParams.get('hasFreePlan') === 'true',
    sortBy: searchParams.get('sortBy') || 'qualityScore',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20')
  };

  const result = await searchWebsites(params);
  
  if (result.success) {
    return NextResponse.json(result);
  } else {
    return NextResponse.json(result, { status: 500 });
  }
}
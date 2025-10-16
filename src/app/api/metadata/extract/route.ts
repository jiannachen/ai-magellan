import { NextRequest, NextResponse } from 'next/server';
import { AjaxResponse } from '@/lib/utils';

// 网站元数据提取器
class WebsiteMetadataExtractor {
  private html: string = '';
  private url: string = '';
  private baseUrl: string = '';

  constructor(html: string, url: string) {
    this.html = html.toLowerCase();
    this.url = url;
    try {
      const urlObj = new URL(url);
      this.baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      this.baseUrl = url;
    }
  }

  // 提取所有元数据
  extractAll() {
    return {
      title: this.extractTitle(),
      description: this.extractDescription(),
      logo: this.extractLogo(),
      thumbnail: this.extractThumbnail(),
      tagline: this.extractTagline(),
    };
  }

  // 提取标题
  private extractTitle(): string {
    // 优先级：og:title > twitter:title > title标签
    return (
      this.extractMetaContent('og:title') ||
      this.extractMetaContent('twitter:title') ||
      this.extractTitleTag() ||
      ''
    );
  }

  // 提取描述
  private extractDescription(): string {
    return (
      this.extractMetaContent('og:description') ||
      this.extractMetaContent('twitter:description') ||
      this.extractMetaContent('description') ||
      ''
    );
  }

  // 提取tagline（简短描述）
  private extractTagline(): string {
    // tagline通常比description短，优先使用twitter:description
    const twitterDesc = this.extractMetaContent('twitter:description');
    const ogDesc = this.extractMetaContent('og:description');
    const metaDesc = this.extractMetaContent('description');

    // 选择最短的描述作为tagline（通常更精炼）
    const descriptions = [twitterDesc, ogDesc, metaDesc].filter((d): d is string => Boolean(d));
    if (descriptions.length === 0) return '';

    return descriptions.reduce((shortest, current) =>
      current.length < shortest.length ? current : shortest
    );
  }

  // 提取Logo
  private extractLogo(): string | null {
    // 优先级：
    // 1. apple-touch-icon (通常质量最好)
    // 2. 包含"logo"的图片
    // 3. favicon

    // Apple touch icon
    const appleTouchIcon = this.extractLinkHref('apple-touch-icon');
    if (appleTouchIcon) {
      return this.normalizeUrl(appleTouchIcon);
    }

    // Logo图片
    const logoPatterns = [
      /src=["']([^"']*logo[^"']*\.(?:png|jpg|jpeg|svg|webp))["']/i,
      /src=["']([^"']*brand[^"']*\.(?:png|jpg|jpeg|svg|webp))["']/i,
    ];

    for (const pattern of logoPatterns) {
      const match = this.html.match(pattern);
      if (match) {
        return this.normalizeUrl(match[1]);
      }
    }

    // Favicon降级
    const favicon = this.extractFavicon();
    return favicon ? this.normalizeUrl(favicon) : null;
  }

  // 提取缩略图/预览图
  private extractThumbnail(): string | null {
    // 优先级：og:image > twitter:image
    const ogImage = this.extractMetaContent('og:image');
    if (ogImage) {
      return this.normalizeUrl(ogImage);
    }

    const twitterImage = this.extractMetaContent('twitter:image');
    if (twitterImage) {
      return this.normalizeUrl(twitterImage);
    }

    return null;
  }

  // 提取Favicon
  private extractFavicon(): string | null {
    const faviconPatterns = [
      /href=["']([^"']*favicon[^"']*\.(?:ico|png|jpg|jpeg|svg))["']/i,
      /rel=["']icon["'][^>]*href=["']([^"']*)["']/i,
      /rel=["']shortcut icon["'][^>]*href=["']([^"']*)["']/i,
    ];

    for (const pattern of faviconPatterns) {
      const match = this.html.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // 默认favicon路径
    return '/favicon.ico';
  }

  // 提取meta标签内容
  private extractMetaContent(property: string): string | null {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = this.html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // 提取link标签的href
  private extractLinkHref(rel: string): string | null {
    const patterns = [
      new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']*)["']`, 'i'),
      new RegExp(`<link[^>]*href=["']([^"']*)["'][^>]*rel=["']${rel}["']`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = this.html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  // 提取title标签
  private extractTitleTag(): string | null {
    const match = this.html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  // 标准化URL（相对路径转绝对路径）
  private normalizeUrl(url: string): string {
    if (!url) return '';

    // 已经是完整URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // 协议相对URL
    if (url.startsWith('//')) {
      return `https:${url}`;
    }

    // 绝对路径
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }

    // 相对路径
    return `${this.baseUrl}/${url}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        AjaxResponse.fail('URL is required'),
        { status: 400 }
      );
    }

    // 验证URL格式
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        AjaxResponse.fail('Invalid URL format'),
        { status: 400 }
      );
    }

    console.log(`🔍 Extracting metadata from: ${url}`);

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    try {
      // 获取网站HTML
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Magellan-Bot/1.0; +https://ai-magellan.com/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const extractor = new WebsiteMetadataExtractor(html, url);
      const metadata = extractor.extractAll();

      console.log(`✅ Metadata extracted successfully`);
      console.log(`  Title: ${metadata.title}`);
      console.log(`  Logo: ${metadata.logo ? '✓' : '✗'}`);
      console.log(`  Thumbnail: ${metadata.thumbnail ? '✓' : '✗'}`);

      return NextResponse.json(AjaxResponse.ok(metadata));

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            AjaxResponse.fail('Request timeout - website took too long to respond'),
            { status: 408 }
          );
        }

        console.error(`❌ Fetch error: ${fetchError.message}`);
        return NextResponse.json(
          AjaxResponse.fail(`Failed to fetch website: ${fetchError.message}`),
          { status: 500 }
        );
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Metadata extraction error:', error);
    return NextResponse.json(
      AjaxResponse.fail(error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}

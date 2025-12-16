import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export class AjaxResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code: number = 200;

  constructor(
    success: boolean,
    data: T | null,
    message: string = "",
    code: number = 200
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.code = code;
  }

  static ok<T>(data: T): AjaxResponse<T> {
    return new AjaxResponse<T>(true, data, "", 200);
  }

  static fail<T>(message: string, data: T | null = null, code: number = 500): AjaxResponse<T> {
    return new AjaxResponse<T>(false, data, message, code);
  }
}

export async function fetchMetadata(url: string) {
  try {
    // 调用我们的元数据提取API
    const response = await fetch('/api/metadata/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '无法获取网站信息');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '无法获取网站信息');
    }

    // 返回提取的元数据
    return {
      title: result.data.title || '',
      description: result.data.description || '',
      tagline: result.data.tagline || '',
      logo: result.data.logo || '',
      thumbnail: result.data.thumbnail || '',
    };
  } catch (error) {
    // This is an expected error for websites that don't support metadata extraction
    // Don't log to console as it's a normal use case
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch website metadata');
  }
}

// 辅助函数：解码HTML实体
function decodeHTMLEntities(text: string): string {
  const entities = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };
  return text.replace(
    /&[^;]+;/g,
    (entity) => entities[entity as keyof typeof entities] || entity
  );
}

/**
 * 生成SEO友好的slug
 * @param title - 标题
 * @returns slug字符串
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // 移除特殊字符，只保留字母、数字、中文、连字符和空格
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
    // 将空格替换为连字符
    .replace(/\s+/g, '-')
    // 移除多余的连字符
    .replace(/-+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
    // 限制长度
    .substring(0, 100);
}

/**
 * 为外部链接添加ref参数
 * 按照导航站最佳实践,添加来源追踪参数
 * @param url - 原始URL
 * @param ref - 引用来源 (default: 'aimagellan.com')
 * @returns 添加了ref参数的URL
 */
export function addRefParam(url: string, ref: string = 'aimagellan.com'): string {
  try {
    const urlObj = new URL(url);
    // 如果已经有ref参数,不重复添加
    if (!urlObj.searchParams.has('ref')) {
      urlObj.searchParams.append('ref', ref);
    }
    return urlObj.toString();
  } catch (error) {
    // 如果URL格式不正确,返回原始URL
    return url;
  }
}


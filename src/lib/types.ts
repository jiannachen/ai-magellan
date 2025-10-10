export interface Website {
  id: number;
  title: string;
  url: string;
  description: string;
  category_id: number;
  thumbnail: string | null;
  active: number;
  status: string;
  visits: number;
  likes: number;
  // 新增质量评估字段
  quality_score?: number;
  is_trusted?: boolean;
  is_featured?: boolean;
  weight?: number;
  tags?: string;
  domain_authority?: number;
  last_checked?: string;
  response_time?: number;
  ssl_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface FormInputs {
  title: string;
  url: string;
  description: string;
  category_id: string;
  thumbnail?: string;
}

// 设置
export interface Setting {
  id: number;
  key: string;
  value: string;
}

export interface FooterLink {
  title: string;
  url: string;
}

// 页脚设置
export interface FooterSettings {
  links: FooterLink[];
  copyright: string;
  icpBeian: string;
  customHtml: string;
}

export interface Website {
  id: number;
  title: string;
  url: string;
  description: string;
  category_id: number;
  thumbnail?: string;
  active: number;
  status: "pending" | "approved" | "rejected"; // 修复为联合类型，移除"all"
  visits: number;
  likes: number;
  // 新增质量评估字段
  quality_score: number; // 设为必需字段，默认50
  is_trusted?: boolean;
  is_featured?: boolean;
  weight?: number;
  tags?: string[];
  domain_authority?: number;
  last_checked?: Date | string;
  response_time?: number;
  ssl_enabled?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // 增强表单字段
  email?: string;
  tagline?: string;
  features?: string[] | Array<{name: string; description: string}>;
  pricing_model?: "free" | "paid" | "freemium" | "subscription" | string;
  has_free_version?: boolean;
  base_price?: string;
  
  // 社交媒体链接
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  discord_url?: string;
  
  // 定价计划
  pricing_plans?: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
  
  // 平台支持
  ios_app_url?: string;
  android_app_url?: string;
  web_app_url?: string;
  desktop_platforms?: ("mac" | "windows" | "linux")[];
  
  // 专业AI工具详情字段
  logo_url?: string;
  screenshots?: string[];
  video_url?: string;
  github_url?: string;
  
  // 技术信息
  supported_platforms?: ("web" | "ios" | "android" | "mac" | "windows" | "linux")[];
  api_available?: boolean;
  integrations?: string[];
  languages_supported?: string[];
  
  // 高级功能
  use_cases?: string[];
  target_audience?: string[];
  pros_cons?: {
    pros: string[];
    cons: string[];
  };
  alternatives?: string[];
  
  // 内容和媒体
  detailed_description?: string;
  changelog?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  
  // 用户关联
  submittedBy?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  name_en?: string;
  name_zh?: string;
  parent_id?: number | null;
  sort_order?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
  websites?: Website[];
  parent?: Category | null;
  children?: Category[];
}

export interface FormInputs {
  title: string;
  url: string;
  description: string;
  category_id: string;
  thumbnail?: string;
  // 增强表单字段
  email?: string;
  tagline?: string;
  features?: Array<{name: string; description: string}>;
  use_cases?: string[];
  target_audience?: string[];
  faq?: Array<{question: string; answer: string}>;
  pricing_model?: "free" | "freemium" | "subscription" | "tiered" | "custom" | "one_time" | "tiered_subscription" | "usage_based" | "pay_as_you_go" | "open_source";
  has_free_version?: boolean;
  api_available?: boolean;
  pricing_plans?: Array<{
    name: string;
    billing_cycle: string;
    price: string;
    features: string[];
  }>;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  discord_url?: string;
  integrations?: string[];
  ios_app_url?: string;
  android_app_url?: string;
  web_app_url?: string;
  desktop_platforms?: string[];
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

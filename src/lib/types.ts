export interface Website {
  id: number;
  title: string;
  slug: string;
  url: string;
  description: string;
  categoryId: number | null;  // camelCase
  thumbnail?: string;
  active: number;
  status: "pending" | "approved" | "rejected";
  visits: number;
  likes: number;
  // 质量评估字段
  qualityScore: number;  // camelCase
  isTrusted?: boolean;  // camelCase
  isFeatured?: boolean;  // camelCase
  weight?: number;
  tags?: string[];
  domainAuthority?: number;  // camelCase
  lastChecked?: Date | string;  // camelCase
  responseTime?: number;  // camelCase
  sslEnabled?: boolean;  // camelCase
  createdAt?: Date | string;  // camelCase
  updatedAt?: Date | string;  // camelCase

  // 增强表单字段
  email?: string;
  tagline?: string;
  features?: string[] | Array<{name: string; description: string}>;
  pricingModel?: "free" | "paid" | "freemium" | "subscription" | string;  // camelCase
  hasFreeVersion?: boolean;  // camelCase
  basePrice?: string;  // camelCase

  // 社交媒体链接
  twitterUrl?: string;  // camelCase
  linkedinUrl?: string;  // camelCase
  facebookUrl?: string;  // camelCase
  instagramUrl?: string;  // camelCase
  youtubeUrl?: string;  // camelCase
  discordUrl?: string;  // camelCase

  // 定价计划
  pricingPlans?: Array<{  // camelCase
    name: string;
    price: string;
    features: string[];
  }>;

  // 平台支持
  iosAppUrl?: string;  // camelCase
  androidAppUrl?: string;  // camelCase
  webAppUrl?: string;  // camelCase
  desktopPlatforms?: ("mac" | "windows" | "linux")[];  // camelCase

  // 专业AI工具详情字段
  logoUrl?: string;  // camelCase
  screenshots?: string[];
  videoUrl?: string;  // camelCase
  githubUrl?: string;  // camelCase

  // 技术信息
  supportedPlatforms?: ("web" | "ios" | "android" | "mac" | "windows" | "linux")[];  // camelCase
  apiAvailable?: boolean;  // camelCase
  integrations?: string[];
  languagesSupported?: string[];  // camelCase

  // 高级功能
  useCases?: string[];  // camelCase
  targetAudience?: string[];  // camelCase
  prosCons?: {  // camelCase
    pros: string[];
    cons: string[];
  };
  alternatives?: string[];

  // 内容和媒体
  detailedDescription?: string;  // camelCase
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
  nameEn?: string;
  nameZh?: string;
  parentId?: number | null;
  sortOrder?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  websites?: Website[];
  parent?: Category | null;
  children?: Category[];
}

export interface FormInputs {
  title: string;
  url: string;
  description: string;
  categoryId: string;
  thumbnail?: string;
  // 增强表单字段
  email?: string;
  tagline?: string;
  features?: Array<{name: string; description: string}>;
  useCases?: string[];
  targetAudience?: string[];
  faq?: Array<{question: string; answer: string}>;
  pricingModel?: "free" | "freemium" | "subscription" | "tiered" | "custom" | "one_time" | "tiered_subscription" | "usage_based" | "pay_as_you_go" | "open_source";
  hasFreeVersion?: boolean;
  apiAvailable?: boolean;
  pricingPlans?: Array<{
    name: string;
    billingCycle: string;
    price: string;
    features: string[];
  }>;
  twitterUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  discordUrl?: string;
  integrations?: string[];
  iosAppUrl?: string;
  androidAppUrl?: string;
  webAppUrl?: string;
  desktopPlatforms?: string[];
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

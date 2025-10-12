import { z } from 'zod'

// 网站提交表单验证 schema
export const websiteSubmitSchema = z.object({
  // 基本必填信息
  url: z.string()
    .min(1, 'Tool URL is required')
    .url('Please enter a valid URL'),
  
  email: z.string()
    .min(1, 'Business email is required')
    .email('Please enter a valid business email address'),
  
  title: z.string()
    .min(3, 'Tool name must be at least 3 characters')
    .max(100, 'Tool name cannot exceed 100 characters'),
  
  category_id: z.string()
    .min(1, 'Please select a category'),
  
  tagline: z.string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(200, 'Tagline cannot exceed 200 characters'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),

  // 可选基本字段
  tags: z.string().optional(),

  // 功能特性（至少要有一个特性）
  features: z.array(z.object({
    name: z.string().min(1, 'Feature name cannot be empty'),
    description: z.string().min(1, 'Feature description cannot be empty')
  })).min(1, 'At least one feature is required'),
  
  // 使用场景（可选）
  use_cases: z.array(z.string().min(1, 'Use case cannot be empty')).default([]).transform(arr => arr.filter(item => item.trim() !== '')),
  
  // 目标受众（可选）
  target_audience: z.array(z.string().min(1, 'Target audience cannot be empty')).default([]).transform(arr => arr.filter(item => item.trim() !== '')),
  
  // FAQ（可选，但如果有则必须完整）
  faq: z.array(z.object({
    question: z.string().min(1, 'Question cannot be empty'),
    answer: z.string().min(1, 'Answer cannot be empty')
  })).default([]).transform(arr => arr.filter(item => item.question.trim() !== '' && item.answer.trim() !== '')),
  
  // 定价信息
  pricing_model: z.string()
    .min(1, 'Please select a pricing model')
    .refine((val) => [
      'free', 
      'freemium', 
      'subscription', 
      'tiered', 
      'custom', 
      'one_time', 
      'tiered_subscription', 
      'usage_based', 
      'pay_as_you_go', 
      'open_source'
    ].includes(val), {
      message: 'Please select a valid pricing model'
    }),
  
  has_free_version: z.boolean().default(false),
  api_available: z.boolean().default(false),
  
  // 定价方案（可选，但如果有则必须完整）
  pricing_plans: z.array(z.object({
    name: z.string().min(1, 'Plan name cannot be empty'),
    billing_cycle: z.string().min(1, 'Billing cycle cannot be empty'),
    price: z.string().min(1, 'Price cannot be empty'),
    features: z.array(z.string()).max(5, 'Maximum 5 features per plan').transform(arr => arr.filter(item => item.trim() !== ''))
  })).max(6, 'Maximum 6 pricing plans').default([]).transform(arr => arr.filter(plan => plan.name.trim() !== '' && plan.billing_cycle.trim() !== '' && plan.price.trim() !== '')),
  
  // 社交媒体（可选）
  twitter_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  linkedin_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  facebook_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  instagram_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  youtube_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  discord_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  
  // 集成（可选）
  integrations: z.array(z.string()).default([]).transform(arr => arr.filter(item => item.trim() !== '')),
  
  // 平台支持（可选）
  ios_app_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  android_app_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  web_app_url: z.string().optional().transform(val => val?.trim() || '').refine(val => val === '' || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL'
  }),
  desktop_platforms: z.array(z.enum(['mac', 'windows', 'linux'])).default([])
})

// 网站编辑表单验证 schema（与提交schema相同的验证要求）
export const websiteEditSchema = websiteSubmitSchema

export type WebsiteSubmitData = z.infer<typeof websiteSubmitSchema>
export type WebsiteEditData = z.infer<typeof websiteEditSchema>

// 验证函数
export function validateWebsiteSubmit(data: unknown) {
  return websiteSubmitSchema.safeParse(data)
}

export function validateWebsiteEdit(data: unknown) {
  return websiteEditSchema.safeParse(data)
}
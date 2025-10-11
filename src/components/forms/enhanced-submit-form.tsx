'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAtom } from 'jotai'
import { useUser, RedirectToSignIn } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { categoriesAtom } from '@/lib/atoms'
import { fetchMetadata } from '@/lib/utils'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { cn } from '@/lib/utils/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { Badge } from '@/ui/common/badge'
import { toast } from 'sonner'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { 
  Globe, 
  Plus, 
  X,
  Send,
  Image,
  Video,
  Github,
  Twitter,
  Linkedin,
  MessageSquare,
  Code,
  Users,
  Target,
  Lightbulb,
  FileText,
  HelpCircle,
  Monitor,
  Smartphone,
  Laptop,
  TabletSmartphone,
  Upload,
  Link as LinkIcon
} from 'lucide-react'

// 重新组织的表单验证Schema
const enhancedSubmitFormSchema = z.object({
  // 1. 基本信息
  url: z.string().url('Please enter a valid URL'),
  email: z.string().email('Please enter a valid business email address'),
  title: z.string().min(3, 'Tool name must be at least 3 characters').max(100, 'Tool name cannot exceed 100 characters'),
  
  // 2. 类别和标签
  category_id: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
  
  // 3. 描述
  tagline: z.string().min(10, 'Tagline must be at least 10 characters').max(200, 'Tagline cannot exceed 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description cannot exceed 1000 characters'),
  
  // 4. 主要特点
  features: z.array(z.object({
    name: z.string().min(1, 'Feature name cannot be empty'),
    description: z.string().min(1, 'Brief description cannot be empty')
  })).default([]),
  
  // 5. 用例
  use_cases: z.array(z.string()).default([]),
  
  // 6. 目标受众
  target_audience: z.array(z.string()).default([]),
  
  // 7. 常见问题
  faq: z.array(z.object({
    question: z.string().min(1, 'Question cannot be empty'),
    answer: z.string().min(1, 'Answer cannot be empty')
  })).default([]),
  
  // 8. 定价
  pricing_model: z.enum(['free', 'freemium', 'subscription', 'tiered', 'custom', 'one_time', 'tiered_subscription', 'usage_based', 'pay_as_you_go', 'open_source']),
  has_free_version: z.boolean().default(false),
  api_available: z.boolean().default(false),
  pricing_plans: z.array(z.object({
    name: z.string().min(1, 'Plan name cannot be empty'),
    billing_cycle: z.string().min(1, 'Billing cycle cannot be empty'),
    price: z.string().min(1, 'Price cannot be empty'),
    features: z.array(z.string()).max(5, 'Maximum 5 features')
  })).max(6, 'Maximum 6 pricing plans').default([]),
  
  // 9. 社交媒体
  twitter_url: z.string().url().optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  facebook_url: z.string().url().optional().or(z.literal('')),
  instagram_url: z.string().url().optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
  discord_url: z.string().url().optional().or(z.literal('')),
  
  // 10. 集成
  integrations: z.array(z.string()).default([]),
  
  // 11. 平台
  ios_app_url: z.string().url().optional().or(z.literal('')),
  android_app_url: z.string().url().optional().or(z.literal('')),
  web_app_url: z.string().url().optional().or(z.literal('')),
  desktop_platforms: z.array(z.enum(['mac', 'windows', 'linux'])).default([]),
})

type EnhancedSubmitFormData = z.infer<typeof enhancedSubmitFormSchema>

// These will be translated in the component using translation hooks
const PRICING_MODEL_VALUES = [
  'free', 'freemium', 'subscription', 'tiered', 'custom', 
  'one_time', 'tiered_subscription', 'usage_based', 'pay_as_you_go', 'open_source'
]

const DESKTOP_PLATFORMS = [
  { value: 'mac', key: 'macos', icon: Laptop },
  { value: 'windows', key: 'windows', icon: Monitor },
  { value: 'linux', key: 'linux', icon: Monitor }
]

const SOCIAL_PLATFORMS = [
  { key: 'twitter_url', labelKey: 'twitter', icon: Twitter, placeholderKey: 'twitter_placeholder' },
  { key: 'linkedin_url', labelKey: 'linkedin', icon: Linkedin, placeholderKey: 'linkedin_placeholder' },
  { key: 'facebook_url', labelKey: 'facebook', icon: Globe, placeholderKey: 'facebook_placeholder' },
  { key: 'instagram_url', labelKey: 'instagram', icon: Globe, placeholderKey: 'instagram_placeholder' },
  { key: 'youtube_url', labelKey: 'youtube', icon: Video, placeholderKey: 'youtube_placeholder' },
  { key: 'discord_url', labelKey: 'discord', icon: MessageSquare, placeholderKey: 'discord_placeholder' }
]

const COMMON_INTEGRATIONS = [
  'Slack', 'Discord', 'Telegram', 'Zapier', 'API', 'Webhook',
  'Google Sheets', 'Notion', 'Trello', 'Asana', 'GitHub',
  'OpenAI', 'Anthropic', 'HuggingFace', 'AWS', 'Azure', 'Stripe',
  'PayPal', 'Shopify', 'WordPress', 'Salesforce'
]

export default function EnhancedSubmitToolPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [categories, setCategories] = useAtom(categoriesAtom)
  const router = useRouter()
  
  // Translation hooks
  const t = useTranslations()
  const tForm = useTranslations('form')
  const tSubmit = useTranslations('submit_form')
  const tPricing = useTranslations('pricing_models')
  const tValidation = useTranslations('submit_form.validation')
  const tMessages = useTranslations('submit_form.messages')

  const form = useForm<EnhancedSubmitFormData>({
    resolver: zodResolver(enhancedSubmitFormSchema),
    defaultValues: {
      // 1. 基本信息
      url: '',
      email: '',
      title: '',
      
      // 2. 类别和标签
      category_id: '',
      tags: '',
      
      // 3. 描述
      tagline: '',
      description: '',
      
      // 4. 主要特点
      features: [],
      
      // 5. 用例
      use_cases: [],
      
      // 6. 目标受众
      target_audience: [],
      
      // 7. 常见问题
      faq: [],
      
      // 8. 定价
      pricing_model: 'free',
      has_free_version: false,
      api_available: false,
      pricing_plans: [],
      
      // 9. 社交媒体
      twitter_url: '',
      linkedin_url: '',
      facebook_url: '',
      instagram_url: '',
      youtube_url: '',
      discord_url: '',
      
      // 10. 集成
      integrations: [],
      
      // 11. 平台
      ios_app_url: '',
      android_app_url: '',
      web_app_url: '',
      desktop_platforms: []
    }
  })

  const { watch, setValue, getValues, control } = form

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature
  } = useFieldArray({
    control,
    name: "features"
  })

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq
  } = useFieldArray({
    control,
    name: "faq"
  })

  const {
    fields: pricingPlanFields,
    append: appendPricingPlan,
    remove: removePricingPlan
  } = useFieldArray({
    control,
    name: "pricing_plans"
  })

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to load categories')
        const data = await response.json()
        setCategories(data.data)
      } catch (error) {
        toast.error(tMessages('load_categories_error'))
      }
    }

    if (categories.length === 0) {
      loadCategories()
    }
  }, [categories.length, setCategories])

  // Early returns after all hooks are called
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // 自动获取网站信息
  const fetchWebsiteInfo = async () => {
    const url = getValues('url')
    if (!url || !url.startsWith('http')) return

    setIsFetching(true)
    try {
      const metadata = await fetchMetadata(url)
      if (metadata.title) setValue('title', metadata.title)
      if (metadata.description) setValue('description', metadata.description)
      if (metadata.image) setValue('thumbnail', metadata.image)

      toast.success(tMessages('auto_fill_success'))
    } catch (error) {
      toast.error(tMessages('auto_fill_error'))
    } finally {
      setIsFetching(false)
    }
  }

  // 添加标签的辅助函数
  const addToArray = (fieldName: keyof EnhancedSubmitFormData, value: string) => {
    const current = getValues(fieldName) as string[]
    if (!current.includes(value)) {
      setValue(fieldName, [...current, value] as any)
    }
  }

  const removeFromArray = (fieldName: keyof EnhancedSubmitFormData, value: string) => {
    const current = getValues(fieldName) as string[]
    setValue(fieldName, current.filter(item => item !== value) as any)
  }

  // 表单提交
  const onSubmit = async (data: EnhancedSubmitFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || '提交失败')
      }

      toast.success(tMessages('submit_success'))
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tMessages('submit_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProfileLayout>
      <div className="p-6 space-y-6">
        {/* 页面头部 - Atlassian风格 */}
        <div>
          <h1 className="text-[32px] font-medium leading-[40px] tracking-[-0.01em] mb-2">{tSubmit('title')}</h1>
          <p className="text-[16px] leading-[24px] text-muted-foreground">{tSubmit('description')}</p>
        </div>

        {/* 表单 - Atlassian风格 */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-[24px]">
          {/* 1. 基本信息 - Atlassian风格 */}
          <Card className={cn(
            "bg-background border border-border/80 rounded-[8px] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]",
            "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            "hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
          )}>
            <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
              <CardTitle className="flex items-center gap-2 text-[20px] font-medium leading-[28px] tracking-[-0.01em]">
                <Globe className="h-5 w-5" />
                {tSubmit('enhanced_form.basic_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-[16px] px-[24px] pb-[24px]">
              <div className="space-y-[16px]">
                {/* 工具网址 */}
                <div className="space-y-[8px]">
                  <Label htmlFor="url" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">
                    {tSubmit('simple_form.tool_url_required')}
                  </Label>
                  <div className="flex gap-[8px]">
                    <Input
                      id="url"
                      placeholder={tSubmit('simple_form.tool_url_placeholder')}
                      {...form.register('url')}
                      className={cn(
                        "flex-1 h-[40px] px-3 py-2",
                        "border-2 border-border rounded-[4px]",
                        "bg-background text-[14px] leading-[20px]",
                        "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                        "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                        "hover:border-border/80"
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchWebsiteInfo}
                      disabled={isFetching}
                      className={cn(
                        "h-[40px] px-4 py-2 rounded-[4px]",
                        "border-2 border-border bg-card text-card-foreground",
                        "text-[14px] font-medium leading-[20px]",
                        "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                        "hover:bg-muted hover:border-border",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isFetching ? t('common.loading') : tSubmit('simple_form.auto_fill')}
                    </Button>
                  </div>
                  {form.formState.errors.url && (
                    <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                      <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>

                {/* 商业电子邮件 */}
                <div>
                  <Label htmlFor="email" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">
                    {tSubmit('simple_form.business_email_required')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={tSubmit('simple_form.business_email_placeholder')}
                    {...form.register('email')}
                    className={cn(
                      "h-[40px] px-3 py-2 rounded-[4px]",
                      "border-2 border-border bg-background",
                      "text-[14px] leading-[20px]",
                      "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                      "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                      "hover:border-border/80"
                    )}
                  />
                  {form.formState.errors.email && (
                    <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                      <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* 工具名称 */}
                <div>
                  <Label htmlFor="title" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">
                    {tSubmit('simple_form.tool_name_required')}
                  </Label>
                  <Input
                    id="title"
                    placeholder={tSubmit('simple_form.tool_name_placeholder')}
                    {...form.register('title')}
                    className={cn(
                      "h-[40px] px-3 py-2 rounded-[4px]",
                      "border-2 border-border bg-background",
                      "text-[14px] leading-[20px]",
                      "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                      "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                      "hover:border-border/80"
                    )}
                  />
                  {form.formState.errors.title && (
                    <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                      <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 类别和标签 - Atlassian风格 */}
          <Card className={cn(
            "bg-background border border-border/80 rounded-[8px] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]",
            "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            "hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
          )}>
            <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
              <CardTitle className="text-[20px] font-medium leading-[28px] tracking-[-0.01em]">{t('categories.all')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[16px] px-[24px] pb-[24px]">
              {/* 类别选择 */}
              <div className="space-y-[8px]">
                <Label className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">{tSubmit('simple_form.category_required')}</Label>
                <Select onValueChange={(value) => setValue('category_id', value)}>
                  <SelectTrigger className={cn(
                    "h-[40px] px-3 py-2 rounded-[4px]",
                    "border-2 border-border bg-background",
                    "text-[14px] leading-[20px]",
                    "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                    "focus:outline-none focus:border-primary"
                  )}>
                    <SelectValue placeholder={tSubmit('simple_form.category_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: { id: number; name: string }) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category_id && (
                  <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              {/* 标签 */}
              <div className="space-y-[8px]">
                <Label htmlFor="tags" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">{tForm('tags')}</Label>
                <Input
                  id="tags"
                  placeholder={tForm('tags_placeholder')}
                  {...form.register('tags')}
                  className={cn(
                    "h-[40px] px-3 py-2 rounded-[4px]",
                    "border-2 border-border bg-background",
                    "text-[14px] leading-[20px]",
                    "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                    "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                    "hover:border-border/80"
                  )}
                />
                <p className="text-[12px] leading-[16px] text-muted-foreground mt-1">
                  {tForm('tags_placeholder')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. 描述 - Atlassian风格 */}
          <Card className={cn(
            "bg-background border border-border/80 rounded-[8px] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]",
            "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            "hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
          )}>
            <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
              <CardTitle className="text-[20px] font-medium leading-[28px] tracking-[-0.01em]">{tSubmit('simple_form.description')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[16px] px-[24px] pb-[24px]">
              {/* 标语 */}
              <div className="space-y-[8px]">
                <Label htmlFor="tagline" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">{tSubmit('simple_form.tagline_required')}</Label>
                <Input
                  id="tagline"
                  placeholder={tSubmit('simple_form.tagline_placeholder')}
                  {...form.register('tagline')}
                  className={cn(
                    "h-[40px] px-3 py-2 rounded-[4px]",
                    "border-2 border-border bg-background",
                    "text-[14px] leading-[20px]",
                    "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                    "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                    "hover:border-border/80"
                  )}
                />
                {form.formState.errors.tagline && (
                  <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                    {form.formState.errors.tagline.message}
                  </p>
                )}
              </div>

              {/* 描述 */}
              <div className="space-y-[8px]">
                <Label htmlFor="description" className="text-[14px] font-semibold leading-[20px] text-[var(--ds-text)]">{tSubmit('simple_form.description_required')}</Label>
                <Textarea
                  id="description"
                  placeholder={tSubmit('simple_form.description_placeholder')}
                  rows={4}
                  {...form.register('description')}
                  className={cn(
                    "min-h-[96px] px-3 py-2 rounded-[4px]",
                    "border-2 border-border bg-background",
                    "text-[14px] leading-[20px]",
                    "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                    "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary",
                    "hover:border-border/80 resize-none"
                  )}
                />
                {form.formState.errors.description && (
                  <p className="text-[12px] leading-[16px] text-destructive mt-1 flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded-full bg-destructive/20 text-destructive text-xs flex items-center justify-center">!</span>
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. 主要特点 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {tForm('main_features')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">{tForm('feature_number', { number: index + 1 })}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{tForm('feature_name')}</Label>
                        <Input
                          placeholder={tForm('feature_name_placeholder')}
                          {...form.register(`features.${index}.name`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{tForm('feature_description')}</Label>
                        <Input
                          placeholder={tForm('feature_description_placeholder')}
                          {...form.register(`features.${index}.description`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendFeature({ name: '', description: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tForm('add_feature')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 5. 用例和目标受众 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {tForm('use_cases_and_audience')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 用例 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    <h4 className="font-medium">{tForm('use_cases')}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{t('common.loading')}</p>
                  <div className="space-y-2">
                    {watch('use_cases').map((useCase, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={useCase}
                          onChange={(e) => {
                            const useCases = [...watch('use_cases')]
                            useCases[index] = e.target.value
                            setValue('use_cases', useCases)
                          }}
                          placeholder={tForm('use_case_placeholder')}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const useCases = watch('use_cases').filter((_, i) => i !== index)
                            setValue('use_cases', useCases)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('use_cases', [...watch('use_cases'), ''])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {tForm('add_use_case')}
                    </Button>
                  </div>
                </div>

                {/* 目标受众 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    <h4 className="font-medium">{tForm('target_audience')}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{t('common.loading')}</p>
                  <div className="space-y-2">
                    {watch('target_audience').map((audience, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={audience}
                          onChange={(e) => {
                            const audiences = [...watch('target_audience')]
                            audiences[index] = e.target.value
                            setValue('target_audience', audiences)
                          }}
                          placeholder={tForm('target_audience_placeholder')}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const audiences = watch('target_audience').filter((_, i) => i !== index)
                            setValue('target_audience', audiences)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValue('target_audience', [...watch('target_audience'), ''])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {tForm('add_target_audience')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. 常见问题 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {tForm('faq')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{tForm('faq_description')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {faqFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">{tForm('faq_number', { number: index + 1 })}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaq(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">{tForm('question')}</Label>
                        <Input
                          placeholder={tForm('question_placeholder')}
                          {...form.register(`faq.${index}.question`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{tForm('answer')}</Label>
                        <Textarea
                          placeholder={tForm('answer_placeholder')}
                          rows={2}
                          {...form.register(`faq.${index}.answer`)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendFaq({ question: '', answer: '' })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tForm('add_faq')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 7. 定价 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('pricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 定价模型 */}
              <div>
                <Label>{tForm('pricing_model_placeholder')}</Label>
                <Select onValueChange={(value) => setValue('pricing_model', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={tForm('pricing_model_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODEL_VALUES.map((model) => (
                      <SelectItem key={model} value={model}>
                        {tPricing(model)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 复选框选项 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_free_version"
                    checked={watch('has_free_version')}
                    onCheckedChange={(checked) => setValue('has_free_version', !!checked)}
                  />
                  <Label htmlFor="has_free_version">{tForm('has_free_version')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="api_available"
                    checked={watch('api_available')}
                    onCheckedChange={(checked) => setValue('api_available', !!checked)}
                  />
                  <Label htmlFor="api_available">{tForm('api_available')}</Label>
                </div>
              </div>

              {/* Skip detailed pricing plans for now due to complexity */}
              
            </CardContent>
          </Card>

          {/* 8. 社交媒体 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('social_media')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key}>
                    <Label htmlFor={platform.key} className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4" />
                      {tForm(platform.labelKey)}
                    </Label>
                    <Input
                      id={platform.key}
                      placeholder={tForm(platform.placeholderKey)}
                      {...form.register(platform.key as any)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 9. 集成 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('integrations')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {COMMON_INTEGRATIONS.map((integration) => (
                    <Button
                      key={integration}
                      type="button"
                      variant={watch('integrations').includes(integration) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (watch('integrations').includes(integration)) {
                          removeFromArray('integrations', integration)
                        } else {
                          addToArray('integrations', integration)
                        }
                      }}
                    >
                      {integration}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {watch('integrations').map((integration, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={integration}
                        onChange={(e) => {
                          const integrations = [...watch('integrations')]
                          integrations[index] = e.target.value
                          setValue('integrations', integrations)
                        }}
                        placeholder={tForm('integration_name_placeholder')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const integrations = watch('integrations').filter((_, i) => i !== index)
                          setValue('integrations', integrations)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue('integrations', [...watch('integrations'), ''])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tForm('add_integration')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. 平台 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('platforms')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 移动应用程序 */}
              <div>
                <h4 className="font-medium mb-3">{tForm('mobile_apps')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ios_app_url">{tForm('ios_app_url')}</Label>
                    <Input
                      id="ios_app_url"
                      placeholder={tForm('ios_placeholder')}
                      {...form.register('ios_app_url')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="android_app_url">{tForm('android_app_url')}</Label>
                    <Input
                      id="android_app_url"
                      placeholder={tForm('android_placeholder')}
                      {...form.register('android_app_url')}
                    />
                  </div>
                </div>
              </div>

              {/* Web 应用程序 */}
              <div>
                <h4 className="font-medium mb-3">{tForm('web_app')}</h4>
                <div>
                  <Label htmlFor="web_app_url">{tForm('web_app_url')}</Label>
                  <Input
                    id="web_app_url"
                    placeholder={tForm('web_app_placeholder')}
                    {...form.register('web_app_url')}
                  />
                </div>
              </div>

              {/* 桌面应用程序 */}
              <div>
                <h4 className="font-medium mb-3">{tForm('desktop_apps')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {DESKTOP_PLATFORMS.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.value}
                        checked={watch('desktop_platforms').includes(platform.value as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addToArray('desktop_platforms', platform.value)
                          } else {
                            removeFromArray('desktop_platforms', platform.value)
                          }
                        }}
                      />
                      <Label htmlFor={platform.value} className="flex items-center gap-2">
                        <platform.icon className="h-4 w-4" />
                        {tForm(platform.key)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 - Atlassian风格 */}
          <Card className={cn(
            "bg-background border border-border/80 rounded-[8px] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]",
            "transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            "hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
          )}>
            <CardContent className="p-[20px]"> {/* 减少内边距 */}
              <div className="flex items-center justify-between">
                <div className="text-[12px] leading-[16px] text-muted-foreground">
                  <p>• {t('common.loading')}</p>
                  <p>• {t('common.loading')}</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  size="lg"
                  variant="default"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? t('common.loading') : tSubmit('simple_form.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProfileLayout>
  )
}
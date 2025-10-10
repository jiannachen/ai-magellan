'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAtom } from 'jotai'
import { useUser, RedirectToSignIn } from '@clerk/nextjs'
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
  url: z.string().url('请输入有效的网址'),
  email: z.string().email('请输入有效的商业邮箱地址'),
  title: z.string().min(3, '工具名称至少3个字符').max(100, '工具名称不能超过100个字符'),
  
  // 2. 类别和标签
  category_id: z.string().min(1, '请选择分类'),
  tags: z.string().optional(),
  
  // 3. 描述
  tagline: z.string().min(10, '标语至少10个字符').max(200, '标语不能超过200个字符'),
  description: z.string().min(50, '描述至少50个字符').max(1000, '描述不能超过1000个字符'),
  
  // 4. 主要特点
  features: z.array(z.object({
    name: z.string().min(1, '特征名称不能为空'),
    description: z.string().min(1, '简要描述不能为空')
  })).default([]),
  
  // 5. 用例
  use_cases: z.array(z.string()).default([]),
  
  // 6. 目标受众
  target_audience: z.array(z.string()).default([]),
  
  // 7. 常见问题
  faq: z.array(z.object({
    question: z.string().min(1, '问题不能为空'),
    answer: z.string().min(1, '回答不能为空')
  })).default([]),
  
  // 8. 定价
  pricing_model: z.enum(['free', 'freemium', 'subscription', 'tiered', 'custom', 'one_time', 'tiered_subscription', 'usage_based', 'pay_as_you_go', 'open_source']),
  has_free_version: z.boolean().default(false),
  api_available: z.boolean().default(false),
  pricing_plans: z.array(z.object({
    name: z.string().min(1, '计划名称不能为空'),
    billing_cycle: z.string().min(1, '计费周期不能为空'),
    price: z.string().min(1, '价格不能为空'),
    features: z.array(z.string()).max(5, '最多5个功能')
  })).max(6, '最多6个定价计划').default([]),
  
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

const PRICING_MODELS = [
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'subscription', label: '订阅' },
  { value: 'tiered', label: '分级' },
  { value: 'custom', label: '自定义' },
  { value: 'one_time', label: '一次性付欧' },
  { value: 'tiered_subscription', label: '分级订阅' },
  { value: 'usage_based', label: '基于使用情况' },
  { value: 'pay_as_you_go', label: '按需付费' },
  { value: 'open_source', label: '开源' }
]

const DESKTOP_PLATFORMS = [
  { value: 'mac', label: 'macOS', icon: Laptop },
  { value: 'windows', label: 'Windows', icon: Monitor },
  { value: 'linux', label: 'Linux', icon: Monitor }
]

const SOCIAL_PLATFORMS = [
  { key: 'twitter_url', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/yourtool' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/yourtool' },
  { key: 'facebook_url', label: 'Facebook', icon: Globe, placeholder: 'https://facebook.com/yourtool' },
  { key: 'instagram_url', label: 'Instagram', icon: Globe, placeholder: 'https://instagram.com/yourtool' },
  { key: 'youtube_url', label: 'YouTube', icon: Video, placeholder: 'https://youtube.com/@yourtool' },
  { key: 'discord_url', label: 'Discord', icon: MessageSquare, placeholder: 'https://discord.gg/yourtool' }
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
        toast.error('加载分类失败，请刷新页面重试')
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

      toast.success('信息获取成功，网站信息已自动填充')
    } catch (error) {
      toast.error('获取失败，请手动填写网站信息')
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

      toast.success('提交成功！您的AI工具已提交审核，我们将在24-48小时内处理。')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProfileLayout>
      <div className="p-6 space-y-6">
        {/* 页面头部 - Atlassian风格 */}
        <div>
          <h1 className="text-atlassian-h1 font-medium mb-2">提交AI工具</h1> {/* 使用Atlassian字体层级 */}
          <p className="text-atlassian-body-large text-muted-foreground">分享您的AI工具，与社区一起发现优质应用</p>
        </div>

        {/* 表单 - Atlassian风格 */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5"> {/* 减少间距 */}
          {/* 1. 基本信息 - Atlassian风格 */}
          <Card className={cn(
            "card-atlassian",
            "border-border/60"
          )}>
            <CardHeader className="pb-4"> {/* 减少底部padding */}
              <CardTitle className="flex items-center gap-2 text-atlassian-h4 font-medium"> {/* 使用Atlassian字体 */}
                <Globe className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* 工具网址 */}
                <div>
                  <Label htmlFor="url" className="text-atlassian-body font-medium">工具网址 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      {...form.register('url')}
                      className={cn(
                        "flex-1",
                        "rounded-md border-2 border-border", // Atlassian样式
                        "focus-visible:border-primary transition-atlassian-standard",
                        "text-atlassian-body"
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchWebsiteInfo}
                      disabled={isFetching}
                      className={cn(
                        "btn-atlassian-secondary",
                        "rounded-md px-4 py-2",
                        "text-atlassian-body"
                      )}
                    >
                      {isFetching ? '获取中...' : '自动填充'}
                    </Button>
                  </div>
                  {form.formState.errors.url && (
                    <p className="text-atlassian-body-small text-destructive mt-1">
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>

                {/* 商业电子邮件 */}
                <div>
                  <Label htmlFor="email" className="text-atlassian-body font-medium">商业电子邮件 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    {...form.register('email')}
                    className={cn(
                      "rounded-md border-2 border-border",
                      "focus-visible:border-primary transition-atlassian-standard",
                      "text-atlassian-body"
                    )}
                  />
                  {form.formState.errors.email && (
                    <p className="text-atlassian-body-small text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* 工具名称 */}
                <div>
                  <Label htmlFor="title" className="text-atlassian-body font-medium">工具名称 *</Label>
                  <Input
                    id="title"
                    placeholder="输入您的工具名称"
                    {...form.register('title')}
                    className={cn(
                      "rounded-md border-2 border-border",
                      "focus-visible:border-primary transition-atlassian-standard",
                      "text-atlassian-body"
                    )}
                  />
                  {form.formState.errors.title && (
                    <p className="text-atlassian-body-small text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 类别和标签 - Atlassian风格 */}
          <Card className={cn(
            "card-atlassian",
            "border-border/60"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="text-atlassian-h4 font-medium">类别和标签</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 类别选择 */}
              <div>
                <Label className="text-atlassian-body font-medium">类别 *</Label>
                <Select onValueChange={(value) => setValue('category_id', value)}>
                  <SelectTrigger className={cn(
                    "rounded-md border-2 border-border",
                    "focus:border-primary transition-atlassian-standard",
                    "text-atlassian-body"
                  )}>
                    <SelectValue placeholder="搜索类别..." />
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
                  <p className="text-atlassian-body-small text-destructive mt-1">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              {/* 标签 */}
              <div>
                <Label htmlFor="tags" className="text-atlassian-body font-medium">标签</Label>
                <Input
                  id="tags"
                  placeholder="输入或搜索主题标签..."
                  {...form.register('tags')}
                  className={cn(
                    "rounded-md border-2 border-border",
                    "focus-visible:border-primary transition-atlassian-standard",
                    "text-atlassian-body"
                  )}
                />
                <p className="text-atlassian-body-small text-muted-foreground mt-1">
                  用逗号分隔多个标签
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. 描述 - Atlassian风格 */}
          <Card className={cn(
            "card-atlassian",
            "border-border/60"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="text-atlassian-h4 font-medium">描述</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 标语 */}
              <div>
                <Label htmlFor="tagline" className="text-atlassian-body font-medium">标语 *</Label>
                <Input
                  id="tagline"
                  placeholder="简短、引人注目的标语"
                  {...form.register('tagline')}
                  className={cn(
                    "rounded-md border-2 border-border",
                    "focus-visible:border-primary transition-atlassian-standard",
                    "text-atlassian-body"
                  )}
                />
                {form.formState.errors.tagline && (
                  <p className="text-atlassian-body-small text-destructive mt-1">
                    {form.formState.errors.tagline.message}
                  </p>
                )}
              </div>

              {/* 描述 */}
              <div>
                <Label htmlFor="description" className="text-atlassian-body font-medium">描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="描述你的工具的功能以及它如何帮助用户"
                  rows={4}
                  {...form.register('description')}
                  className={cn(
                    "rounded-md border-2 border-border",
                    "focus-visible:border-primary transition-atlassian-standard",
                    "text-atlassian-body resize-none"
                  )}
                />
                {form.formState.errors.description && (
                  <p className="text-atlassian-body-small text-destructive mt-1">
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
                主要特点
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {featureFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">功能 {index + 1}</h4>
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
                        <Label className="text-xs">特征名称</Label>
                        <Input
                          placeholder="例如，智能分析"
                          {...form.register(`features.${index}.name`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">简要描述</Label>
                        <Input
                          placeholder="描述这个特点的作用"
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
                  添加功能
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 5. 用例和目标受众 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                用例和目标受众
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 用例 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    <h4 className="font-medium">用例</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">人们如何使用你的工具</p>
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
                          placeholder="用例描述"
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
                      添加
                    </Button>
                  </div>
                </div>

                {/* 目标受众 */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    <h4 className="font-medium">目标受众</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">谁使用你的工具</p>
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
                          placeholder="目标受众"
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
                      添加
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
                常问问题
              </CardTitle>
              <p className="text-sm text-muted-foreground">解答常见问题</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {faqFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-sm">常见问题 {index + 1}</h4>
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
                        <Label className="text-xs">问题</Label>
                        <Input
                          placeholder="输入常见问题"
                          {...form.register(`faq.${index}.question`)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">回答</Label>
                        <Textarea
                          placeholder="输入问题的回答"
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
                  添加常见问题解答
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 7. 定价 */}
          <Card>
            <CardHeader>
              <CardTitle>定价</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 定价模型 */}
              <div>
                <Label>定价模型 *</Label>
                <Select onValueChange={(value) => setValue('pricing_model', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择定价模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
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
                  <Label htmlFor="has_free_version">有免费版本</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="api_available"
                    checked={watch('api_available')}
                    onCheckedChange={(checked) => setValue('api_available', !!checked)}
                  />
                  <Label htmlFor="api_available">具有 API 访问权限</Label>
                </div>
              </div>

              {/* 定价计划 */}
              <div>
                <Label className="text-base font-medium mb-3 block">定价计划（可选，最多 6 个）</Label>
                <div className="space-y-3">
                  {pricingPlanFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-sm">计划 {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePricingPlan(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <Label className="text-xs">计划名称</Label>
                          <Input
                            placeholder="例如，基本"
                            {...form.register(`pricing_plans.${index}.name`)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">计费周期</Label>
                          <Input
                            placeholder="例如每月"
                            {...form.register(`pricing_plans.${index}.billing_cycle`)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">价格</Label>
                          <Input
                            placeholder="例如，9.99美元"
                            {...form.register(`pricing_plans.${index}.price`)}
                          />
                        </div>
                      </div>
                      
                      {/* 功能列表 */}
                      <div>
                        <Label className="text-xs">功能（最多 5 个）</Label>
                        <div className="space-y-2 mt-2">
                          {(watch(`pricing_plans.${index}.features`) || []).map((feature: string, featureIndex: number) => (
                            <div key={featureIndex} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => {
                                  const plans = [...watch('pricing_plans')]
                                  if (!plans[index].features) plans[index].features = []
                                  plans[index].features[featureIndex] = e.target.value
                                  setValue('pricing_plans', plans)
                                }}
                                placeholder="例如，无限项目"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const plans = [...watch('pricing_plans')]
                                  plans[index].features = plans[index].features.filter((_: any, i: number) => i !== featureIndex)
                                  setValue('pricing_plans', plans)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!watch(`pricing_plans.${index}.features`) || watch(`pricing_plans.${index}.features`).length < 5) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const plans = [...watch('pricing_plans')]
                                if (!plans[index].features) plans[index].features = []
                                plans[index].features.push('')
                                setValue('pricing_plans', plans)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              添加功能
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {pricingPlanFields.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendPricingPlan({ name: '', billing_cycle: '', price: '', features: [] })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加定价计划
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. 社交媒体 */}
          <Card>
            <CardHeader>
              <CardTitle>社交媒体</CardTitle>
              <p className="text-sm text-muted-foreground">连接您的社交资料</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div key={platform.key}>
                    <Label htmlFor={platform.key} className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4" />
                      {platform.label}
                    </Label>
                    <Input
                      id={platform.key}
                      placeholder={platform.placeholder}
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
              <CardTitle>集成</CardTitle>
              <p className="text-sm text-muted-foreground">您的 AI 与哪些工具集成？</p>
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
                        placeholder="集成名称"
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
                    添加集成名称
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10. 平台 */}
          <Card>
            <CardHeader>
              <CardTitle>平台</CardTitle>
              <p className="text-sm text-muted-foreground">您的工具在哪里可用？</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 移动应用程序 */}
              <div>
                <h4 className="font-medium mb-3">移动应用程序</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ios_app_url">iOS 应用 URL</Label>
                    <Input
                      id="ios_app_url"
                      placeholder="https://apps.apple.com/..."
                      {...form.register('ios_app_url')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="android_app_url">Android 应用程序 URL</Label>
                    <Input
                      id="android_app_url"
                      placeholder="https://play.google.com/..."
                      {...form.register('android_app_url')}
                    />
                  </div>
                </div>
              </div>

              {/* Web 应用程序 */}
              <div>
                <h4 className="font-medium mb-3">Web 应用程序</h4>
                <div>
                  <Label htmlFor="web_app_url">Web 应用程序 URL</Label>
                  <Input
                    id="web_app_url"
                    placeholder="https://example.com"
                    {...form.register('web_app_url')}
                  />
                </div>
              </div>

              {/* 桌面应用程序 */}
              <div>
                <h4 className="font-medium mb-3">桌面应用程序</h4>
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
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 - Atlassian风格 */}
          <Card className={cn(
            "card-atlassian",
            "border-border/60"
          )}>
            <CardContent className="p-5"> {/* 减少内边距 */}
              <div className="flex items-center justify-between">
                <div className="text-atlassian-body-small text-muted-foreground">
                  <p>• 审核时间：24-48小时</p>
                  <p>• 审核结果将发送到您的邮箱</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  size="lg"
                  className={cn(
                    "btn-atlassian-primary",
                    "rounded-md px-6 py-3",
                    "text-atlassian-body font-medium"
                  )}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? '提交中...' : '提交工具'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProfileLayout>
  )
}
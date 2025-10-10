'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { toast } from 'sonner'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { 
  Globe, 
  Plus, 
  X,
  Send
} from 'lucide-react'

// 简化的表单验证Schema
const submitFormSchema = z.object({
  url: z.string().url('请输入有效的网址'),
  title: z.string().min(3, '工具名称至少3个字符').max(100, '工具名称不能超过100个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  tagline: z.string().min(10, '标语至少10个字符').max(200, '标语不能超过200个字符'),
  description: z.string().min(50, '描述至少50个字符').max(1000, '描述不能超过1000个字符'),
  category_id: z.string().min(1, '请选择分类'),
  features: z.array(z.object({
    name: z.string().min(1, '特点名称不能为空'),
    description: z.string().min(1, '特点描述不能为空')
  })).max(3, '最多添加3个主要特点'),
  pricing_model: z.enum(['free', 'freemium', 'subscription', 'one_time', 'custom']),
  has_free_version: z.boolean(),
  base_price: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal('')),
  twitter_url: z.string().url().optional().or(z.literal(''))
})

type SubmitFormData = z.infer<typeof submitFormSchema>

const PRICING_MODELS = [
  { value: 'free', label: '完全免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'subscription', label: '订阅制' },
  { value: 'one_time', label: '一次性付费' },
  { value: 'custom', label: '自定义定价' }
]

export default function SubmitToolPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [categories, setCategories] = useAtom(categoriesAtom)
  const router = useRouter()

  // 如果用户状态还在加载中，显示加载状态
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

  // 如果用户未登录，重定向到登录页面
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      url: '',
      title: '',
      email: '',
      tagline: '',
      description: '',
      category_id: '',
      features: [],
      pricing_model: 'free',
      has_free_version: false,
      base_price: '',
      thumbnail: '',
      twitter_url: ''
    }
  })

  const { watch, setValue, getValues } = form

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

  // 添加特点
  const addFeature = () => {
    const features = getValues('features')
    if (features.length < 3) {
      setValue('features', [...features, { name: '', description: '' }])
    }
  }

  // 删除特点
  const removeFeature = (index: number) => {
    const features = getValues('features')
    setValue('features', features.filter((_, i) => i !== index))
  }

  // 表单提交
  const onSubmit = async (data: SubmitFormData) => {
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
        {/* 页面头部 */}
        <div>
          <h1 className="text-2xl font-bold mb-2">提交AI工具</h1>
          <p className="text-muted-foreground">分享您的AI工具，与社区一起发现优质应用</p>
        </div>

        {/* 表单 */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="url">工具网址 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      {...form.register('url')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={fetchWebsiteInfo}
                      disabled={isFetching}
                    >
                      {isFetching ? '获取中...' : '自动填充'}
                    </Button>
                  </div>
                  {form.formState.errors.url && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">工具名称 *</Label>
                  <Input
                    id="title"
                    placeholder="输入您的工具名称"
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">商业邮箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@example.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tagline">标语 *</Label>
                  <Input
                    id="tagline"
                    placeholder="简短、引人注目的标语"
                    {...form.register('tagline')}
                  />
                  {form.formState.errors.tagline && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.tagline.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">描述 *</Label>
                  <Textarea
                    id="description"
                    placeholder="描述你的工具的功能以及它如何帮助用户"
                    rows={4}
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分类和特点 */}
          <Card>
            <CardHeader>
              <CardTitle>分类和特点</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>类别 *</Label>
                <Select onValueChange={(value) => setValue('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别..." />
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
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>主要特点 (最多3个，可选)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    disabled={watch('features').length >= 3}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加特点
                  </Button>
                </div>
                
                {watch('features').length > 0 && (
                  <div className="space-y-3">
                    {watch('features').map((feature, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-sm">特点 {index + 1}</h4>
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
                              placeholder="例如：智能分析"
                              value={feature.name}
                              onChange={(e) => {
                                const features = [...watch('features')]
                                features[index].name = e.target.value
                                setValue('features', features)
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">简要描述</Label>
                            <Input
                              placeholder="描述这个特点的作用"
                              value={feature.description}
                              onChange={(e) => {
                                const features = [...watch('features')]
                                features[index].description = e.target.value
                                setValue('features', features)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 定价信息 */}
          <Card>
            <CardHeader>
              <CardTitle>定价信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {watch('pricing_model') !== 'free' && (
                  <div>
                    <Label htmlFor="base_price">基础价格（可选）</Label>
                    <Input
                      id="base_price"
                      placeholder="例如，9.99美元"
                      {...form.register('base_price')}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_free_version"
                  checked={watch('has_free_version')}
                  onCheckedChange={(checked) => setValue('has_free_version', !!checked)}
                />
                <Label htmlFor="has_free_version">有免费版本</Label>
              </div>
            </CardContent>
          </Card>

          {/* 补充信息 */}
          <Card>
            <CardHeader>
              <CardTitle>补充信息（可选）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="thumbnail">缩略图URL</Label>
                  <Input
                    id="thumbnail"
                    placeholder="https://example.com/thumbnail.jpg"
                    {...form.register('thumbnail')}
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_url">Twitter/X 网址</Label>
                  <Input
                    id="twitter_url"
                    placeholder="https://twitter.com/yourtool"
                    {...form.register('twitter_url')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>• 审核时间：24-48小时</p>
                  <p>• 审核结果将发送到您的邮箱</p>
                </div>
                <Button type="submit" disabled={isSubmitting} size="lg">
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
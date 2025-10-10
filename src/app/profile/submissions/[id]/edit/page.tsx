'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2, Plus, X, Globe, Lightbulb, Target, Users, HelpCircle } from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { toast } from 'sonner'

const PRICING_MODELS = [
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'subscription', label: '订阅' },
  { value: 'tiered', label: '分级' },
  { value: 'custom', label: '自定义' },
  { value: 'one_time', label: '一次性付费' },
  { value: 'tiered_subscription', label: '分级订阅' },
  { value: 'usage_based', label: '基于使用情况' },
  { value: 'pay_as_you_go', label: '按需付费' },
  { value: 'open_source', label: '开源' }
]

const DESKTOP_PLATFORMS = [
  { value: 'mac', label: 'macOS' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' }
]

const COMMON_INTEGRATIONS = [
  'Slack', 'Discord', 'Telegram', 'Zapier', 'API', 'Webhook',
  'Google Sheets', 'Notion', 'Trello', 'Asana', 'GitHub',
  'OpenAI', 'Anthropic', 'HuggingFace', 'AWS', 'Azure', 'Stripe'
]

interface Website {
  id: number
  title: string
  url: string
  description: string
  category_id: number
  thumbnail: string | null
  status: string
  submittedBy: string
  tagline: string | null
  features: any
  use_cases: string[] | null
  target_audience: string[] | null
  faq: Array<{question: string, answer: string}> | null
  pricing_model: string
  has_free_version: boolean
  api_available: boolean
  tags: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  discord_url: string | null
  integrations: string[] | null
  ios_app_url: string | null
  android_app_url: string | null
  web_app_url: string | null
  desktop_platforms: string[] | null
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function EditWebsitePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const params = useParams()
  const websiteId = params?.id as string

  const [website, setWebsite] = useState<Website | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category_id: 0,
    thumbnail: '',
    tagline: '',
    features: [] as Array<{name: string, description: string}>,
    use_cases: [] as string[],
    target_audience: [] as string[],
    faq: [] as Array<{question: string, answer: string}>,
    pricing_model: 'free',
    has_free_version: false,
    api_available: false,
    tags: '',
    twitter_url: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    discord_url: '',
    integrations: [] as string[],
    ios_app_url: '',
    android_app_url: '',
    web_app_url: '',
    desktop_platforms: [] as string[]
  })

  useEffect(() => {
    if (isLoaded && isSignedIn && websiteId) {
      fetchWebsite()
      fetchCategories()
    }
  }, [isLoaded, isSignedIn, websiteId])

  const fetchWebsite = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('网站不存在')
          return
        }
        if (response.status === 403) {
          setError('您没有权限编辑此网站')
          return
        }
        throw new Error('获取网站信息失败')
      }

      const data = await response.json()
      const websiteData = data.data || data

      // 检查是否是当前用户提交的网站
      if (websiteData.submittedBy !== user?.id) {
        setError('您只能编辑自己提交的网站')
        return
      }

      setWebsite(websiteData)
      
      // 处理 features 数据
      const processFeatures = (features: any) => {
        if (!features) return []
        try {
          const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features
          if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
            if (typeof parsedFeatures[0] === 'object' && parsedFeatures[0].name) {
              return parsedFeatures
            }
            return parsedFeatures.map((f: string) => ({ name: f, description: '' }))
          }
          return []
        } catch {
          return []
        }
      }
      
      setFormData({
        title: websiteData.title,
        url: websiteData.url,
        description: websiteData.description,
        category_id: websiteData.category_id,
        thumbnail: websiteData.thumbnail || '',
        tagline: websiteData.tagline || '',
        features: processFeatures(websiteData.features),
        use_cases: websiteData.use_cases || [],
        target_audience: websiteData.target_audience || [],
        faq: websiteData.faq || [],
        pricing_model: websiteData.pricing_model || 'free',
        has_free_version: websiteData.has_free_version || false,
        api_available: websiteData.api_available || false,
        tags: websiteData.tags || '',
        twitter_url: websiteData.twitter_url || '',
        linkedin_url: websiteData.linkedin_url || '',
        facebook_url: websiteData.facebook_url || '',
        instagram_url: websiteData.instagram_url || '',
        youtube_url: websiteData.youtube_url || '',
        discord_url: websiteData.discord_url || '',
        integrations: websiteData.integrations || [],
        ios_app_url: websiteData.ios_app_url || '',
        android_app_url: websiteData.android_app_url || '',
        web_app_url: websiteData.web_app_url || '',
        desktop_platforms: websiteData.desktop_platforms || []
      })
    } catch (error) {
      console.error('Error fetching website:', error)
      setError('获取网站信息失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.url || !formData.category_id) {
      toast.error('请填写所有必填字段')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新失败')
      }

      toast.success('网站信息已更新')
      router.push('/profile/submissions')
    } catch (error) {
      console.error('Error updating website:', error)
      toast.error(error instanceof Error ? error.message : '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addToArray = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName as keyof typeof prev] as string[]), value]
    }))
  }

  const removeFromArray = (fieldName: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (fieldName: string, index: number, value: string) => {
    setFormData(prev => {
      const array = [...(prev[fieldName as keyof typeof prev] as string[])]
      array[index] = value
      return { ...prev, [fieldName]: array }
    })
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }]
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => {
      const features = [...prev.features]
      features[index] = { ...features[index], [field]: value }
      return { ...prev, features }
    })
  }

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }))
  }

  const removeFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index)
    }))
  }

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => {
      const faq = [...prev.faq]
      faq[index] = { ...faq[index], [field]: value }
      return { ...prev, faq }
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              请先登录以编辑网站信息。
            </p>
            <Link href="/auth/signin">
              <Button>立即登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-4">
              <Link href="/profile/submissions">
                <Button variant="outline">返回我的提交</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile/submissions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回我的提交
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">编辑网站</h1>
      </div>

      {/* 编辑表单 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">网站名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入网站名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">网站链接 *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">标语</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="简短、引人注目的标语"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">网站描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="请简要描述这个网站的功能和特点"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">标签</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="用逗号分隔多个标签"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">缩略图链接</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={formData.thumbnail} 
                      alt="缩略图预览" 
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. 主要特点 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                主要特点
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4">
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
                        value={feature.name}
                        onChange={(e) => updateFeature(index, 'name', e.target.value)}
                        placeholder="例如，智能分析"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">简要描述</Label>
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="描述这个特点的作用"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加功能
              </Button>
            </CardContent>
          </Card>

          {/* 3. 用例和目标受众 */}
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
                  <div className="space-y-2">
                    {formData.use_cases.map((useCase, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={useCase}
                          onChange={(e) => updateArrayItem('use_cases', index, e.target.value)}
                          placeholder="用例描述"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromArray('use_cases', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray('use_cases', '')}
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
                  <div className="space-y-2">
                    {formData.target_audience.map((audience, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={audience}
                          onChange={(e) => updateArrayItem('target_audience', index, e.target.value)}
                          placeholder="目标受众"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromArray('target_audience', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addToArray('target_audience', '')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. 常见问题 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                常见问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.faq.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
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
                        value={item.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder="输入常见问题"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">回答</Label>
                      <Textarea
                        value={item.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        placeholder="输入问题的回答"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFaq}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加常见问题解答
              </Button>
            </CardContent>
          </Card>

          {/* 5. 定价 */}
          <Card>
            <CardHeader>
              <CardTitle>定价</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>定价模型</Label>
                <Select
                  value={formData.pricing_model}
                  onValueChange={(value) => handleInputChange('pricing_model', value)}
                >
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_free_version"
                    checked={formData.has_free_version}
                    onCheckedChange={(checked) => handleInputChange('has_free_version', !!checked)}
                  />
                  <Label htmlFor="has_free_version">有免费版本</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="api_available"
                    checked={formData.api_available}
                    onCheckedChange={(checked) => handleInputChange('api_available', !!checked)}
                  />
                  <Label htmlFor="api_available">具有 API 访问权限</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. 社交媒体 */}
          <Card>
            <CardHeader>
              <CardTitle>社交媒体</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter_url">Twitter/X</Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/yourtool"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/yourtool"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/yourtool"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/yourtool"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@yourtool"
                  />
                </div>
                <div>
                  <Label htmlFor="discord_url">Discord</Label>
                  <Input
                    id="discord_url"
                    value={formData.discord_url}
                    onChange={(e) => handleInputChange('discord_url', e.target.value)}
                    placeholder="https://discord.gg/yourtool"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. 集成 */}
          <Card>
            <CardHeader>
              <CardTitle>集成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_INTEGRATIONS.map((integration) => (
                  <Button
                    key={integration}
                    type="button"
                    variant={formData.integrations.includes(integration) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (formData.integrations.includes(integration)) {
                        setFormData(prev => ({
                          ...prev,
                          integrations: prev.integrations.filter(i => i !== integration)
                        }))
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          integrations: [...prev.integrations, integration]
                        }))
                      }
                    }}
                  >
                    {integration}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                {formData.integrations.map((integration, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={integration}
                      onChange={(e) => updateArrayItem('integrations', index, e.target.value)}
                      placeholder="集成名称"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('integrations', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addToArray('integrations', '')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加集成
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 8. 平台 */}
          <Card>
            <CardHeader>
              <CardTitle>平台</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">移动应用程序</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ios_app_url">iOS 应用 URL</Label>
                    <Input
                      id="ios_app_url"
                      value={formData.ios_app_url}
                      onChange={(e) => handleInputChange('ios_app_url', e.target.value)}
                      placeholder="https://apps.apple.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="android_app_url">Android 应用程序 URL</Label>
                    <Input
                      id="android_app_url"
                      value={formData.android_app_url}
                      onChange={(e) => handleInputChange('android_app_url', e.target.value)}
                      placeholder="https://play.google.com/..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Web 应用程序</h4>
                <div>
                  <Label htmlFor="web_app_url">Web 应用程序 URL</Label>
                  <Input
                    id="web_app_url"
                    value={formData.web_app_url}
                    onChange={(e) => handleInputChange('web_app_url', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">桌面应用程序</h4>
                <div className="grid grid-cols-3 gap-3">
                  {DESKTOP_PLATFORMS.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.value}
                        checked={formData.desktop_platforms.includes(platform.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              desktop_platforms: [...prev.desktop_platforms, platform.value]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              desktop_platforms: prev.desktop_platforms.filter(p => p !== platform.value)
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={platform.value}>
                        {platform.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存更改
                    </>
                  )}
                </Button>
                <Link href="/profile/submissions">
                  <Button type="button" variant="outline">
                    取消
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  )
}
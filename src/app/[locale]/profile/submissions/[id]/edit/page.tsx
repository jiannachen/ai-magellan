'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
import { ProfileLayout } from '@/components/profile/profile-layout'

const PRICING_MODELS = [
  { value: 'free', label: 'free' },
  { value: 'freemium', label: 'freemium' },
  { value: 'subscription', label: 'subscription' },
  { value: 'tiered', label: 'tiered' },
  { value: 'custom', label: 'custom' },
  { value: 'one_time', label: 'one_time' },
  { value: 'tiered_subscription', label: 'tiered_subscription' },
  { value: 'usage_based', label: 'usage_based' },
  { value: 'pay_as_you_go', label: 'pay_as_you_go' },
  { value: 'open_source', label: 'open_source' }
]

const DESKTOP_PLATFORMS = [
  { value: 'mac', label: 'macos' },
  { value: 'windows', label: 'windows' },
  { value: 'linux', label: 'linux' }
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
  const t = useTranslations('edit')
  const tForm = useTranslations('form')
  const tCommon = useTranslations('common')
  const tPricing = useTranslations('pricing_models')

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
    pricing_plans: [] as Array<{name: string, billing_cycle: string, price: string, features: string[]}>,
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
          setError(t('errors.website_not_found'))
          return
        }
        if (response.status === 403) {
          setError(t('errors.permission_denied'))
          return
        }
        throw new Error(t('errors.fetch_failed'))
      }

      const data = await response.json()
      const websiteData = data.data || data

      // 检查是否是当前用户提交的网站
      if (websiteData.submittedBy !== user?.id) {
        setError(t('errors.only_own_websites'))
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
        pricing_plans: websiteData.pricing_plans || [],
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
      setError(t('errors.fetch_failed'))
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
      toast.error(t('errors.required_fields'))
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
        throw new Error(errorData.message || t('errors.update_failed'))
      }

      toast.success(t('success.updated'))
      router.push('/profile/submissions')
    } catch (error) {
      console.error('Error updating website:', error)
      toast.error(error instanceof Error ? error.message : t('errors.update_failed'))
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

  const addPricingPlan = () => {
    if (formData.pricing_plans.length < 6) {
      setFormData(prev => ({
        ...prev,
        pricing_plans: [...prev.pricing_plans, { name: '', billing_cycle: '', price: '', features: [] }]
      }))
    }
  }

  const removePricingPlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pricing_plans: prev.pricing_plans.filter((_, i) => i !== index)
    }))
  }

  const updatePricingPlan = (index: number, field: 'name' | 'billing_cycle' | 'price', value: string) => {
    setFormData(prev => {
      const plans = [...prev.pricing_plans]
      plans[index] = { ...plans[index], [field]: value }
      return { ...prev, pricing_plans: plans }
    })
  }

  const addPricingPlanFeature = (planIndex: number) => {
    if (formData.pricing_plans[planIndex].features.length < 5) {
      setFormData(prev => {
        const plans = [...prev.pricing_plans]
        plans[planIndex].features.push('')
        return { ...prev, pricing_plans: plans }
      })
    }
  }

  const removePricingPlanFeature = (planIndex: number, featureIndex: number) => {
    setFormData(prev => {
      const plans = [...prev.pricing_plans]
      plans[planIndex].features = plans[planIndex].features.filter((_, i) => i !== featureIndex)
      return { ...prev, pricing_plans: plans }
    })
  }

  const updatePricingPlanFeature = (planIndex: number, featureIndex: number, value: string) => {
    setFormData(prev => {
      const plans = [...prev.pricing_plans]
      plans[planIndex].features[featureIndex] = value
      return { ...prev, pricing_plans: plans }
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('login_required')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('login_description')}
            </p>
            <Link href="/auth/signin">
              <Button>{t('login_now')}</Button>
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
            <CardTitle>{t('error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-4">
              <Link href="/profile/submissions">
                <Button variant="outline">{t('back_to_submissions')}</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProfileLayout>
      <div className="max-w-4xl">
        {/* 页面头部 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile/submissions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back_to_submissions')}
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
        </div>

        {/* 编辑表单 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {tForm('basic_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{tForm('website_name_required')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={tForm('website_name_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">{tForm('website_url_required')}</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder={tForm('website_url_placeholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">{tForm('tagline')}</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder={tForm('tagline_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{tForm('website_description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={tForm('description_placeholder')}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{tForm('category_required')}</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tForm('category_placeholder')} />
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
                <Label htmlFor="tags">{tForm('tags')}</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder={tForm('tags_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">{tForm('thumbnail_url')}</Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  placeholder={tForm('thumbnail_placeholder')}
                />
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={formData.thumbnail} 
                      alt={tForm('thumbnail_preview')} 
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
                {tForm('main_features')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">{tForm('feature_number', {number: index + 1})}</h4>
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
                        value={feature.name}
                        onChange={(e) => updateFeature(index, 'name', e.target.value)}
                        placeholder={tForm('feature_name_placeholder')}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{tForm('feature_description')}</Label>
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder={tForm('feature_description_placeholder')}
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
                {tForm('add_feature')}
              </Button>
            </CardContent>
          </Card>

          {/* 3. 用例和目标受众 */}
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
                  <div className="space-y-2">
                    {formData.use_cases.map((useCase, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={useCase}
                          onChange={(e) => updateArrayItem('use_cases', index, e.target.value)}
                          placeholder={tForm('use_case_placeholder')}
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
                  <div className="space-y-2">
                    {formData.target_audience.map((audience, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={audience}
                          onChange={(e) => updateArrayItem('target_audience', index, e.target.value)}
                          placeholder={tForm('target_audience_placeholder')}
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
                      {tForm('add_target_audience')}
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
                {tForm('faq')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.faq.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">{tForm('faq_number', {number: index + 1})}</h4>
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
                        value={item.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder={tForm('question_placeholder')}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{tForm('answer')}</Label>
                      <Textarea
                        value={item.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        placeholder={tForm('answer_placeholder')}
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
                {tForm('add_faq')}
              </Button>
            </CardContent>
          </Card>

          {/* 5. 定价 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('pricing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{tForm('pricing_model')}</Label>
                <Select
                  value={formData.pricing_model}
                  onValueChange={(value) => handleInputChange('pricing_model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tForm('pricing_model_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICING_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {tPricing(model.label)}
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
                  <Label htmlFor="has_free_version">{tForm('has_free_version')}</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="api_available"
                    checked={formData.api_available}
                    onCheckedChange={(checked) => handleInputChange('api_available', !!checked)}
                  />
                  <Label htmlFor="api_available">{tForm('api_available')}</Label>
                </div>
              </div>

              {/* 定价计划 */}
              <div>
                <Label className="text-base font-medium mb-3 block">{tForm('pricing_plans')}</Label>
                <div className="space-y-3">
                  {formData.pricing_plans.map((plan, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-sm">{tForm('plan_number', {number: index + 1})}</h4>
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
                          <Label className="text-xs">{tForm('plan_name')}</Label>
                          <Input
                            value={plan.name}
                            onChange={(e) => updatePricingPlan(index, 'name', e.target.value)}
                            placeholder={tForm('plan_name_placeholder')}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{tForm('billing_cycle')}</Label>
                          <Input
                            value={plan.billing_cycle}
                            onChange={(e) => updatePricingPlan(index, 'billing_cycle', e.target.value)}
                            placeholder={tForm('billing_cycle_placeholder')}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{tForm('price')}</Label>
                          <Input
                            value={plan.price}
                            onChange={(e) => updatePricingPlan(index, 'price', e.target.value)}
                            placeholder={tForm('price_placeholder')}
                          />
                        </div>
                      </div>
                      
                      {/* 功能列表 */}
                      <div>
                        <Label className="text-xs">{tForm('features_max_5')}</Label>
                        <div className="space-y-2 mt-2">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex gap-2">
                              <Input
                                value={feature}
                                onChange={(e) => updatePricingPlanFeature(index, featureIndex, e.target.value)}
                                placeholder={tForm('feature_placeholder')}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePricingPlanFeature(index, featureIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {plan.features.length < 5 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPricingPlanFeature(index)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {tForm('add_feature_to_plan')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.pricing_plans.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPricingPlan}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {tForm('add_pricing_plan')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. 社交媒体 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('social_media')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter_url">{tForm('twitter')}</Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder={tForm('twitter_placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">{tForm('linkedin')}</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder={tForm('linkedin_placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="facebook_url">{tForm('facebook')}</Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder={tForm('facebook_placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url">{tForm('instagram')}</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder={tForm('instagram_placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="youtube_url">{tForm('youtube')}</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder={tForm('youtube_placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="discord_url">{tForm('discord')}</Label>
                  <Input
                    id="discord_url"
                    value={formData.discord_url}
                    onChange={(e) => handleInputChange('discord_url', e.target.value)}
                    placeholder={tForm('discord_placeholder')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. 集成 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('integrations')}</CardTitle>
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
                      placeholder={tForm('integration_name_placeholder')}
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
                  {tForm('add_integration')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 8. 平台 */}
          <Card>
            <CardHeader>
              <CardTitle>{tForm('platforms')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">{tForm('mobile_apps')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ios_app_url">{tForm('ios_app_url')}</Label>
                    <Input
                      id="ios_app_url"
                      value={formData.ios_app_url}
                      onChange={(e) => handleInputChange('ios_app_url', e.target.value)}
                      placeholder={tForm('ios_placeholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="android_app_url">{tForm('android_app_url')}</Label>
                    <Input
                      id="android_app_url"
                      value={formData.android_app_url}
                      onChange={(e) => handleInputChange('android_app_url', e.target.value)}
                      placeholder={tForm('android_placeholder')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{tForm('web_app')}</h4>
                <div>
                  <Label htmlFor="web_app_url">{tForm('web_app_url')}</Label>
                  <Input
                    id="web_app_url"
                    value={formData.web_app_url}
                    onChange={(e) => handleInputChange('web_app_url', e.target.value)}
                    placeholder={tForm('web_app_placeholder')}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{tForm('desktop_apps')}</h4>
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
                        {tForm(platform.label)}
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
                      {t('saving')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('save_changes')}
                    </>
                  )}
                </Button>
                <Link href="/profile/submissions">
                  <Button type="button" variant="outline">
                    {tCommon('cancel')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
      </div>
    </ProfileLayout>
  )
}
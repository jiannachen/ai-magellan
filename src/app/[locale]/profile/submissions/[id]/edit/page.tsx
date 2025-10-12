'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { websiteEditSchema, type WebsiteEditData } from '@/lib/validations/website'
import { 
  Save, 
  Loader2, 
  Plus, 
  X, 
  Map, 
  Compass, 
  Anchor, 
  Ship, 
  Telescope, 
  Flag, 
  Star, 
  Zap, 
  Users, 
  Target, 
  Lightbulb, 
  HelpCircle, 
  Coins, 
  Waves, 
  Globe,
  MessageSquare,
  Code,
  Monitor,
  Smartphone,
  Laptop
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { ActionCard } from '@/components/ui/action-card'
import { cn } from '@/lib/utils/utils'

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
  const t = useTranslations('profile.edit')
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Compass className="h-12 w-12 text-primary mx-auto animate-spin" />
            <div className="absolute inset-0 animate-pulse">
              <Waves className="h-12 w-12 text-magellan-teal mx-auto opacity-50" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">⚙️ Loading Tool Information</h3>
            <p className="text-sm text-muted-foreground">Preparing your discovery for editing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <ActionCard
            title="🔐 Sign In Required"
            description="You need to sign in to edit your tool submissions"
            icon={Anchor}
            className="p-8 text-center"
          >
            <div className="mt-6">
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90">
                  <Compass className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            </div>
          </ActionCard>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gradient-to-r from-primary/20 to-magellan-teal/20 rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
            
            {/* Form sections skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gradient-to-br from-card to-card/95 border border-primary/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-primary/30 rounded"></div>
                  <div className="h-6 bg-primary/30 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <ActionCard
            title="⚠️ Navigation Error"
            description={error}
            icon={Compass}
            variant="default"
            className="p-8 text-center border-destructive/20"
          >
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/profile/submissions" className="flex-1">
                <Button variant="outline" className="w-full subtle-hover">
                  <Anchor className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 text-white"
              >
                <Compass className="h-4 w-4 mr-2" />
                Retry Navigation
              </Button>
            </div>
          </ActionCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PageHeader
          title="Update Tool Submission"
          description="🌊 Enhance your AI tool submission with new information and improvements"
          icon={<Map className="h-8 w-8 text-primary" />}
          backHref="/profile/submissions"
          backLabel="🧭 Back to My Submissions"
          badge={
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-magellan-teal/10 border border-primary/20">
              <Anchor className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">🔧 Tool Enhancement</span>
            </div>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Island Coordinates & Basic Info */}
            <ActionCard
              title="📝 Basic Information"
              description="Update the essential details of your AI tool"
              icon={Map}
              className="p-6"
            >
              <div className="space-y-6">
                {/* Island Name */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    Tool Name *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter your AI tool's name"
                    required
                    className="subtle-hover"
                  />
                </div>

                {/* Island URL */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-primary" />
                    Website URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://your-ai-tool.com"
                    required
                    className="subtle-hover"
                  />
                </div>

                {/* Island Motto */}
                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Tagline
                  </Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="A compelling one-line description"
                    className="subtle-hover"
                  />
                </div>

                {/* Island Chronicle */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                    <Telescope className="h-4 w-4 text-primary" />
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell the full story of your AI tool - what it does, how it helps, and why users should try it"
                    rows={4}
                    className="subtle-hover resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Territory Classification */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Compass className="h-4 w-4 text-primary" />
                      Territory Classification *
                    </Label>
                    <Select
                      value={formData.category_id.toString()}
                      onValueChange={(value) => handleInputChange('category_id', parseInt(value))}
                    >
                      <SelectTrigger className="subtle-hover">
                        <SelectValue placeholder="Select the category this tool belongs to" />
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

                  {/* Navigation Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Navigation Tags
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="AI, automation, productivity (comma separated)"
                      className="subtle-hover"
                    />
                  </div>
                </div>

                {/* Island Visual Map */}
                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-sm font-medium flex items-center gap-2">
                    <Map className="h-4 w-4 text-primary" />
                    Thumbnail URL
                  </Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                    placeholder="https://example.com/your-tool-screenshot.png"
                    className="subtle-hover"
                  />
                  {formData.thumbnail && (
                    <div className="mt-3 p-3 bg-gradient-to-br from-primary/5 to-magellan-teal/5 border border-primary/10 rounded-lg">
                      <img 
                        src={formData.thumbnail} 
                        alt="Tool preview" 
                        className="w-20 h-20 object-cover rounded border border-primary/20"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">🖼️ Tool Preview Image</p>
                    </div>
                  )}
                </div>
              </div>
            </ActionCard>

            {/* 2. Special Powers (Features) */}
            <ActionCard
              title="⚡ Key Features"
              description="Update the main features and capabilities"
              icon={Zap}
              className="p-6"
            >
              <div className="space-y-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="border-2 border-dashed border-border/60 rounded-lg p-4 subtle-hover">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Power #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Power Name</Label>
                        <Input
                          value={feature.name}
                          onChange={(e) => updateFeature(index, 'name', e.target.value)}
                          placeholder="e.g., Smart Automation"
                          className="subtle-hover"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Power Description</Label>
                        <Input
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          placeholder="Brief explanation of this feature"
                          className="subtle-hover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <ActionCard
                  title="Add New Power"
                  description="Reveal another magical ability"
                  icon={Plus}
                  onClick={addFeature}
                  variant="dashed"
                  className="cursor-pointer"
                />
              </div>
            </ActionCard>

            {/* 3. Explorer Adventures & Types */}
            <ActionCard
              title="🎯 Use Cases & Target Audience"
              description="Update use cases and target audience for your tool"
              icon={Users}
              className="p-6"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Adventure Types */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Adventure Types</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">What can users do with this tool?</p>
                    <div className="space-y-3">
                      {formData.use_cases.map((useCase, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={useCase}
                            onChange={(e) => updateArrayItem('use_cases', index, e.target.value)}
                            placeholder="e.g., Content creation, Data analysis"
                            className="subtle-hover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromArray('use_cases', index)}
                            className="text-destructive hover:text-destructive"
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
                        className="w-full subtle-hover"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Adventure Type
                      </Button>
                    </div>
                  </div>

                  {/* Explorer Profiles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Target Audience</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Who is this tool designed for?</p>
                    <div className="space-y-3">
                      {formData.target_audience.map((audience, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={audience}
                            onChange={(e) => updateArrayItem('target_audience', index, e.target.value)}
                            placeholder="e.g., Developers, Marketers, Students"
                            className="subtle-hover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromArray('target_audience', index)}
                            className="text-destructive hover:text-destructive"
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
                        className="w-full subtle-hover"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Target User
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ActionCard>

            {/* 4. Explorer Questions (FAQ) */}
            <ActionCard
              title="❓ FAQ"
              description="Answer common questions users might have about your tool"
              icon={HelpCircle}
              className="p-6"
            >
              <div className="space-y-4">
                {formData.faq.map((item, index) => (
                  <div key={index} className="border-2 border-dashed border-border/60 rounded-lg p-4 subtle-hover">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-primary flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Q&A #{index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaq(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Question</Label>
                        <Input
                          value={item.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="What question do users often ask?"
                          className="subtle-hover"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Answer</Label>
                        <Textarea
                          value={item.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Provide a helpful answer for users"
                          rows={2}
                          className="subtle-hover resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <ActionCard
                  title="Add FAQ Question"
                  description="Answer another common question"
                  icon={Plus}
                  onClick={addFaq}
                  variant="dashed"
                  className="cursor-pointer"
                />
              </div>
            </ActionCard>

            {/* 5. Treasure Costs (Pricing) */}
            <ActionCard
              title="💰 Pricing"
              description="Update how users access your tool"
              icon={Coins}
              className="p-6"
            >
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" />
                      Pricing Model
                    </Label>
                    <Select
                      value={formData.pricing_model}
                      onValueChange={(value) => handleInputChange('pricing_model', value)}
                    >
                      <SelectTrigger className="subtle-hover">
                        <SelectValue placeholder="Select how users pay for your tool" />
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
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="has_free_version"
                        checked={formData.has_free_version}
                        onCheckedChange={(checked) => handleInputChange('has_free_version', !!checked)}
                      />
                      <Label htmlFor="has_free_version" className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Free Version Available
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="api_available"
                        checked={formData.api_available}
                        onCheckedChange={(checked) => handleInputChange('api_available', !!checked)}
                      />
                      <Label htmlFor="api_available" className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" />
                        Developer Bridge (API) Available
                      </Label>
                    </div>
                  </div>

                  {/* Detailed Pricing Plans */}
                  {formData.pricing_plans.length > 0 && (
                    <div className="pt-6 border-t border-border">
                      <Label className="text-base font-medium mb-4 block flex items-center gap-2">
                        💵 Pricing Plans (Optional)
                      </Label>
                      <div className="space-y-4">
                        {formData.pricing_plans.map((plan, index) => (
                          <div key={index} className="border-2 border-dashed border-border/60 rounded-lg p-4 subtle-hover">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-primary">Plan #{index + 1}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePricingPlan(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Plan Name</Label>
                                <Input
                                  value={plan.name}
                                  onChange={(e) => updatePricingPlan(index, 'name', e.target.value)}
                                  placeholder="e.g., Basic Plan"
                                  className="subtle-hover"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Billing Cycle</Label>
                                <Input
                                  value={plan.billing_cycle}
                                  onChange={(e) => updatePricingPlan(index, 'billing_cycle', e.target.value)}
                                  placeholder="e.g., monthly, yearly"
                                  className="subtle-hover"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Price</Label>
                                <Input
                                  value={plan.price}
                                  onChange={(e) => updatePricingPlan(index, 'price', e.target.value)}
                                  placeholder="e.g., $9.99"
                                  className="subtle-hover"
                                />
                              </div>
                            </div>
                            
                            {/* Plan Features */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Plan Features (Max 5)</Label>
                              <div className="space-y-2">
                                {plan.features.map((feature, featureIndex) => (
                                  <div key={featureIndex} className="flex gap-2">
                                    <Input
                                      value={feature}
                                      onChange={(e) => updatePricingPlanFeature(index, featureIndex, e.target.value)}
                                      placeholder="Feature description"
                                      className="subtle-hover"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removePricingPlanFeature(index, featureIndex)}
                                      className="text-destructive hover:text-destructive"
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
                                    className="subtle-hover"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Feature
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.pricing_plans.length < 6 && (
                    <ActionCard
                      title="Add Pricing Plan"
                      description="Create another pricing option"
                      icon={Plus}
                      onClick={addPricingPlan}
                      variant="dashed"
                      className="cursor-pointer"
                    />
                  )}
                </div>
              </div>
            </ActionCard>

            {/* 6. Social Waters */}
            <ActionCard
              title="🌊 Social Waters"
              description="Update your tool's social media and integrations"
              icon={Waves}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_url" className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Social Media
                  </Label>
                  <Input
                    id="twitter_url"
                    value={formData.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/yourprofile"
                    className="subtle-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    LinkedIn Professional Port
                  </Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="subtle-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Facebook Social Bay
                  </Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="subtle-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Instagram Visual Cove
                  </Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="subtle-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="text-sm font-medium flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    YouTube Channel
                  </Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="subtle-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discord_url" className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Discord Community
                  </Label>
                  <Input
                    id="discord_url"
                    value={formData.discord_url}
                    onChange={(e) => handleInputChange('discord_url', e.target.value)}
                    placeholder="https://discord.gg/yourcommunity"
                    className="subtle-hover"
                  />
                </div>
              </div>
            </ActionCard>

            {/* 7. Island Connections */}
            <ActionCard
              title="⚓ Integrations"
              description="Update what other tools and services your tool connects with"
              icon={Anchor}
              className="p-6"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Waves className="h-4 w-4 text-primary" />
                    Popular Trade Routes
                  </h4>
                  <div className="flex flex-wrap gap-2">
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
                        className="subtle-hover"
                      >
                        {integration}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Custom Connections
                  </h4>
                  {formData.integrations.filter(integration => !COMMON_INTEGRATIONS.includes(integration)).map((integration, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={integration}
                        onChange={(e) => {
                          const integrations = [...formData.integrations]
                          const actualIndex = integrations.indexOf(integration)
                          if (actualIndex !== -1) {
                            integrations[actualIndex] = e.target.value
                            setFormData(prev => ({ ...prev, integrations }))
                          }
                        }}
                        placeholder="Custom integration name"
                        className="subtle-hover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            integrations: prev.integrations.filter(i => i !== integration)
                          }))
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        integrations: [...prev.integrations, '']
                      }))
                    }}
                    className="subtle-hover"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Connection
                  </Button>
                </div>
              </div>
            </ActionCard>

            {/* 8. Platform Ports */}
            <ActionCard
              title="🌍 Platform Ports"
              description="Update where users can access your tool"
              icon={Globe}
              className="p-6"
            >
              <div className="space-y-6">
                {/* Mobile Harbors */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Mobile Apps</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ios_app_url" className="text-sm font-medium">iOS App Store</Label>
                      <Input
                        id="ios_app_url"
                        value={formData.ios_app_url}
                        onChange={(e) => handleInputChange('ios_app_url', e.target.value)}
                        placeholder="https://apps.apple.com/app/your-app"
                        className="subtle-hover"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="android_app_url" className="text-sm font-medium">Google Play Store</Label>
                      <Input
                        id="android_app_url"
                        value={formData.android_app_url}
                        onChange={(e) => handleInputChange('android_app_url', e.target.value)}
                        placeholder="https://play.google.com/store/apps/details?id=your.app"
                        className="subtle-hover"
                      />
                    </div>
                  </div>
                </div>

                {/* Web Port */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Web Port</h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="web_app_url" className="text-sm font-medium">Web Application URL</Label>
                    <Input
                      id="web_app_url"
                      value={formData.web_app_url}
                      onChange={(e) => handleInputChange('web_app_url', e.target.value)}
                      placeholder="https://app.your-tool.com"
                      className="subtle-hover"
                    />
                  </div>
                </div>

                {/* Desktop Docks */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Desktop Docks</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {DESKTOP_PLATFORMS.map((platform) => {
                      const PlatformIcon = platform.value === 'mac' ? Laptop : Monitor
                      return (
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
                          <Label htmlFor={platform.value} className="flex items-center gap-2 text-sm">
                            <PlatformIcon className="h-4 w-4" />
                            {platform.label}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ActionCard>

            {/* Final Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 text-white shadow-lg subtle-hover"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Tool Information...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    💾 Save Tool Updates
                  </>
                )}
              </Button>
              <Link href="/profile/submissions">
                <Button type="button" variant="outline" className="w-full sm:w-auto subtle-hover">
                  <Compass className="h-4 w-4 mr-2" />
                  Cancel & Return to Dashboard
                </Button>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
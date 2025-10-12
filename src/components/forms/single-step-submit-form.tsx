'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { useUser, RedirectToSignIn } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/utils'
import { categoriesAtom } from '@/lib/atoms'
import { fetchMetadata } from '@/lib/utils'
import { websiteSubmitSchema, type WebsiteSubmitData } from '@/lib/validations/website'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { RequiredLabel, FormFieldWrapper } from '@/ui/common/required-label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { toast } from 'sonner'
import GlobalLoading from '@/components/loading/global-loading'
import { 
  Map,
  Compass,
  Anchor,
  Ship,
  Globe, 
  Plus, 
  X,
  Send,
  MessageSquare,
  Code,
  Users,
  Target,
  FileText,
  HelpCircle,
  Monitor,
  Smartphone,
  Laptop,
  MapPin,
  Telescope,
  Flag,
  Coins,
  Waves,
  Star,
  Zap,
  Video,
  ArrowRight,
  Lightbulb
} from 'lucide-react'

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
  { key: 'twitter_url', labelKey: 'twitter', icon: MessageSquare, placeholderKey: 'twitter_placeholder' },
  { key: 'linkedin_url', labelKey: 'linkedin', icon: MessageSquare, placeholderKey: 'linkedin_placeholder' },
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

export default function SingleStepSubmitForm() {
  const { isSignedIn, isLoaded } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [categories, setCategories] = useAtom(categoriesAtom)
  const router = useRouter()
  
  // Translation hooks
  const t = useTranslations()
  const tForm = useTranslations('form')
  const tSubmit = useTranslations('profile.submit')
  const tPricing = useTranslations('pricing_models')
  const tMessages = useTranslations('profile.submit.messages')

  // Form navigation sections
  const formSections = [
    { id: 'basic', title: tSubmit('basic_info'), icon: Map, description: tSubmit('basic_info_desc') },
    { id: 'features', title: tSubmit('key_features'), icon: Zap, description: tSubmit('features_desc') },
    { id: 'audience', title: tSubmit('use_cases_audience'), icon: Users, description: tSubmit('audience_desc') },
    { id: 'pricing', title: tSubmit('pricing_info'), icon: Coins, description: tSubmit('pricing_desc') },
    { id: 'social', title: tSubmit('social_integrations'), icon: Waves, description: tSubmit('social_desc') },
    { id: 'platforms', title: tSubmit('platform_support'), icon: Anchor, description: tSubmit('platforms_desc') }
  ]

  const form = useForm<WebsiteSubmitData>({
    resolver: zodResolver(websiteSubmitSchema),
    defaultValues: {
      url: '',
      email: '',
      title: '',
      category_id: '',
      tags: '',
      tagline: '',
      description: '',
      features: [{ name: '', description: '' }], // 默认添加一个空的 feature
      use_cases: [],
      target_audience: [],
      faq: [],
      pricing_model: '',
      has_free_version: false,
      api_available: false,
      pricing_plans: [],
      twitter_url: '',
      linkedin_url: '',
      facebook_url: '',
      instagram_url: '',
      youtube_url: '',
      discord_url: '',
      integrations: [],
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
    fields: pricingPlansFields,
    append: appendPricingPlan,
    remove: removePricingPlan
  } = useFieldArray({
    control,
    name: "pricing_plans"
  })


  // Load categories
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
    return <GlobalLoading variant="fullscreen" />
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  // Auto fetch website info
  const fetchWebsiteInfo = async () => {
    const url = getValues('url')
    if (!url || !url.startsWith('http')) return

    setIsFetching(true)
    try {
      const metadata = await fetchMetadata(url)
      if (metadata.title) setValue('title', metadata.title)
      if (metadata.description) setValue('description', metadata.description)

      toast.success(tMessages('auto_fill_success'))
    } catch (error) {
      toast.error(tMessages('auto_fill_error'))
    } finally {
      setIsFetching(false)
    }
  }

  // Array manipulation helpers
  const addToArray = (fieldName: keyof WebsiteSubmitData, value: string) => {
    const current = getValues(fieldName) as string[]
    if (!current.includes(value)) {
      setValue(fieldName, [...current, value] as any)
    }
  }

  const removeFromArray = (fieldName: keyof WebsiteSubmitData, value: string) => {
    const current = getValues(fieldName) as string[]
    setValue(fieldName, current.filter(item => item !== value) as any)
  }

  // Form submission
  const onSubmit = async (data: WebsiteSubmitData) => {
    setIsSubmitting(true)
    
    // Clear previous errors
    form.clearErrors()
    
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // 如果是验证错误，显示具体的错误信息并滚动到第一个错误
        if (errorData.data?.errors) {
          const firstErrorField = errorData.data.errors[0]?.field
          
          errorData.data.errors.forEach((error: { field: string, message: string }) => {
            form.setError(error.field as any, { message: error.message })
          })
          
          // 滚动到第一个错误字段
          if (firstErrorField) {
            scrollToFirstError(firstErrorField)
          }
          
          toast.error(tMessages('fix_form_errors'))
        } else {
          throw new Error(errorData.message || 'Submission failed')
        }
        return
      }

      toast.success(tMessages('submit_success'))
      router.push('/profile/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tMessages('submit_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Scroll to first error field
  const scrollToFirstError = (fieldName: string) => {
    // Map field names to section IDs for better scrolling
    const fieldToSectionMap: Record<string, string> = {
      url: 'basic',
      email: 'basic',
      title: 'basic',
      category_id: 'basic',
      tagline: 'basic',
      description: 'basic',
      features: 'features',
      pricing_model: 'pricing'
    }

    const sectionId = fieldToSectionMap[fieldName] || 'basic'
    const element = document.getElementById(sectionId)
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }

  // Handle form errors from react-hook-form
  const onInvalid = async (errors: any) => {
    // 强制触发所有字段的验证显示
    await form.trigger()
    
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      scrollToFirstError(firstErrorField)
      toast.error(tMessages('fill_required_fields'))
    }
  }

  // 改进的提交处理 - 确保显示所有验证错误
  const handleFormSubmit = async () => {
    // 清除之前的错误
    form.clearErrors()
    
    // 触发表单验证
    const isValid = await form.trigger()
    
    if (!isValid) {
      // 如果验证失败，显示错误并滚动到第一个错误
      const errors = form.formState.errors
      const firstErrorField = Object.keys(errors)[0]
      
      console.log('Form validation errors:', errors) // 调试用
      
      if (firstErrorField) {
        scrollToFirstError(firstErrorField)
      }
      
      // 检查关键必填字段的验证问题（按重要性排序）
      if (errors.url) {
        toast.error(tMessages('enter_valid_url'))
      } else if (errors.email) {
        toast.error(tMessages('enter_valid_email'))
      } else if (errors.title) {
        toast.error(tMessages('enter_valid_name'))
      } else if (errors.category_id) {
        toast.error(tMessages('select_category'))
      } else if (errors.tagline) {
        toast.error(tMessages('enter_valid_tagline'))
      } else if (errors.description) {
        toast.error(tMessages('enter_valid_description'))
      } else if (errors.features) {
        toast.error(tMessages('add_feature_required'))
      } else if (errors.pricing_model) {
        toast.error(tMessages('select_pricing_model'))
      } else {
        // 其他验证错误显示通用提示
        toast.error(tMessages('fill_required_fields'))
      }
      return
    }
    
    // 如果验证通过，提交表单
    const data = form.getValues()
    
    // 验证 features 不为空且填写完整
    if (!data.features || data.features.length === 0) {
      toast.error(tMessages('add_feature_required'))
      scrollToFirstError('features')
      return
    }
    
    // 检查 features 是否填写完整
    const incompleteFeature = data.features.find(feature => !feature.name.trim() || !feature.description.trim())
    if (incompleteFeature) {
      toast.error(tMessages('complete_all_features'))
      scrollToFirstError('features')
      return
    }
    
    await onSubmit(data)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tSubmit('title')}</h1>
              <p className="text-muted-foreground">{tSubmit('description')}</p>
            </div>
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/profile/dashboard">
              <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/10">
                <ArrowRight className="h-4 w-4 rotate-180" />
                {t('common.back')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1 min-h-screen">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <Card className="p-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    {tSubmit('title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tSubmit('description')}</p>
                </div>
                
                <nav className="space-y-2">
                  {formSections.map((section) => {
                    const SectionIcon = section.icon
                    
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          const element = document.getElementById(section.id)
                          element?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="w-full text-left p-3 rounded-lg transition-all duration-200 border hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
                      >
                        <div className="flex items-center gap-3">
                          <SectionIcon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {section.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>
          </div>

          {/* Right Form Content - All sections displayed */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Basic Information */}
              <Card id="basic" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    {tSubmit('basic_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                    {/* Tool URL */}
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.tool_url_required')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          id="url"
                          placeholder={tSubmit('simple_form.tool_url_placeholder')}
                          {...form.register('url')}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={fetchWebsiteInfo}
                          disabled={isFetching}
                        >
                          <Telescope className="h-4 w-4 mr-2" />
                          {isFetching ? (
                            <GlobalLoading variant="inline" size="sm" />
                          ) : (
                            tSubmit('simple_form.auto_fill')
                          )}
                        </Button>
                      </div>
                      {form.formState.errors.url && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.url.message}
                        </p>
                      )}
                    </div>

                    {/* Business Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                        <Ship className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.business_email_required')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={tSubmit('simple_form.business_email_placeholder')}
                        {...form.register('email')}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Tool Name */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.tool_name_required')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder={tSubmit('simple_form.tool_name_placeholder')}
                        {...form.register('title')}
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Compass className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.category_required')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Select 
                        onValueChange={(value) => {
                          setValue('category_id', value)
                          form.clearErrors('category_id')
                        }}
                        value={watch('category_id') || ''}
                      >
                        <SelectTrigger>
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
                        <p className="text-sm text-destructive">
                          {form.formState.errors.category_id.message}
                        </p>
                      )}
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                      <Label htmlFor="tagline" className="text-sm font-medium flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.tagline')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="tagline"
                        placeholder={tSubmit('simple_form.tagline_placeholder')}
                        {...form.register('tagline')}
                      />
                      {form.formState.errors.tagline && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.tagline.message}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.description_required')}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder={tSubmit('simple_form.description_placeholder')}
                        rows={5}
                        {...form.register('description')}
                        className="resize-none"
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        {tSubmit('simple_form.tags')}
                      </Label>
                      <Input
                        id="tags"
                        placeholder={tForm('tags_placeholder')}
                        {...form.register('tags')}
                      />
                      <p className="text-xs text-muted-foreground">{tSubmit('simple_form.tags_help')}</p>
                    </div>
                  </CardContent>
                </Card>

              {/* Features Section */}
              <Card id="features" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {tSubmit('key_features')}
                    <span className="text-destructive ml-2">*</span>
                  </CardTitle>
                </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    {form.formState.errors.features && (
                      <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
                        {form.formState.errors.features.message}
                      </p>
                    )}
                    <div className="space-y-4">
                      {featureFields.map((field, index) => (
                        <div key={field.id} className="border-2 border-dashed border-border/60 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              {tForm('feature_number', { number: index + 1 })}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeature(index)}
                              disabled={featureFields.length === 1}
                              className="text-destructive hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {tForm('feature_name')}
                                <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input
                                placeholder={tForm('feature_name_placeholder')}
                                {...form.register(`features.${index}.name`)}
                              />
                              {form.formState.errors.features?.[index]?.name && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.features[index]?.name?.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                {tForm('feature_description')}
                                <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input
                                placeholder={tForm('feature_description_placeholder')}
                                {...form.register(`features.${index}.description`)}
                              />
                              {form.formState.errors.features?.[index]?.description && (
                                <p className="text-sm text-destructive">
                                  {form.formState.errors.features[index]?.description?.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendFeature({ name: '', description: '' })}
                        className="w-full border-dashed"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {tForm('add_feature')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              {/* Audience & Use Cases */}
              <Card id="audience" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {tSubmit('use_cases_audience')}
                  </CardTitle>
                </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Use Cases */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{tForm('use_cases')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tSubmit('use_cases_help')}</p>
                        <div className="space-y-3">
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
                            onClick={() => setValue('use_cases', [...watch('use_cases'), ''])}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {tForm('add_use_case')}
                          </Button>
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{tForm('target_audience')}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tSubmit('target_audience_help')}</p>
                        <div className="space-y-3">
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
                            onClick={() => setValue('target_audience', [...watch('target_audience'), ''])}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {tForm('add_target_audience')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{tForm('faq')}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{tForm('faq_description')}</p>
                      <div className="space-y-4">
                        {faqFields.map((field, index) => (
                          <div key={field.id} className="border-2 border-dashed border-border/60 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-semibold text-primary flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {tForm('faq_number', { number: index + 1 })}
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
                                <Label className="text-sm font-medium">{tForm('question')}</Label>
                                <Input
                                  placeholder={tForm('question_placeholder')}
                                  {...form.register(`faq.${index}.question`)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">{tForm('answer')}</Label>
                                <Textarea
                                  placeholder={tForm('answer_placeholder')}
                                  rows={2}
                                  {...form.register(`faq.${index}.answer`)}
                                  className="resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendFaq({ question: '', answer: '' })}
                          className="w-full border-dashed"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {tForm('add_faq')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* Pricing Information */}
              <Card id="pricing" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    {tSubmit('pricing_info')}
                    <span className="text-destructive ml-2">*</span>
                  </CardTitle>
                </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    {/* Pricing Attributes - All in One Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Pricing Model */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          {tForm('pricing_model')}
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select 
                          onValueChange={(value) => {
                            setValue('pricing_model', value as any)
                            form.clearErrors('pricing_model')
                          }}
                          value={watch('pricing_model') || ''}
                        >
                          <SelectTrigger className="w-full h-[60px]">
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
                        {form.formState.errors.pricing_model && (
                          <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
                            {form.formState.errors.pricing_model.message}
                          </p>
                        )}
                      </div>

                      {/* Free Version - Atlassian风格优化 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium opacity-0 pointer-events-none">Placeholder</Label>
                        <div className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-magellan-primary/30 hover:bg-magellan-primary/5 transition-all duration-ds-medium group h-[60px]">
                          <Checkbox
                            id="has_free_version"
                            checked={watch('has_free_version')}
                            onCheckedChange={(checked) => setValue('has_free_version', !!checked)}
                            className="w-5 h-5 border-2 border-border group-hover:border-magellan-primary/50 data-[state=checked]:bg-magellan-primary data-[state=checked]:border-magellan-primary data-[state=checked]:text-white"
                          />
                          <Label htmlFor="has_free_version" className="text-sm font-medium cursor-pointer flex items-center gap-3 flex-1 group-hover:text-magellan-primary transition-colors">
                            <Star className="h-4 w-4 text-magellan-primary" />
                            <span className="font-medium">{tForm('has_free_version')}</span>
                          </Label>
                        </div>
                      </div>

                      {/* API Available - Atlassian风格优化 */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium opacity-0 pointer-events-none">Placeholder</Label>
                        <div className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-ds-medium group h-[60px]">
                          <Checkbox
                            id="api_available"
                            checked={watch('api_available')}
                            onCheckedChange={(checked) => setValue('api_available', !!checked)}
                            className="w-5 h-5 border-2 border-border group-hover:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                          />
                          <Label htmlFor="api_available" className="text-sm font-medium cursor-pointer flex items-center gap-3 flex-1 group-hover:text-primary transition-colors">
                            <Code className="h-4 w-4 text-primary" />
                            <span className="font-medium">{tForm('api_available')}</span>
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Plans Section */}
                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{tForm('pricing_plans')}</h3>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendPricingPlan({ 
                            name: '', 
                            billing_cycle: '', 
                            price: '', 
                            features: ['']
                          })}
                          disabled={pricingPlansFields.length >= 6}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {tForm('add_pricing_plan')}
                        </Button>
                      </div>

                      {pricingPlansFields.length > 0 && (
                        <div className="space-y-4">
                          {pricingPlansFields.map((field, index) => (
                            <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                  {tForm('pricing_plan')} {index + 1}
                                </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePricingPlan(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    {tForm('plan_name')}
                                  </Label>
                                  <Input
                                    placeholder={tForm('plan_name_placeholder')}
                                    {...form.register(`pricing_plans.${index}.name` as const)}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    {tForm('billing_cycle')}
                                  </Label>
                                  <Select 
                                    onValueChange={(value) => setValue(`pricing_plans.${index}.billing_cycle`, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={tForm('billing_cycle_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="monthly">{tForm('monthly')}</SelectItem>
                                      <SelectItem value="yearly">{tForm('yearly')}</SelectItem>
                                      <SelectItem value="one_time">{tForm('one_time')}</SelectItem>
                                      <SelectItem value="usage_based">{tForm('usage_based')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">
                                    {tForm('price')}
                                  </Label>
                                  <Input
                                    placeholder={tForm('price_placeholder')}
                                    {...form.register(`pricing_plans.${index}.price` as const)}
                                  />
                                </div>
                              </div>

                              {/* Plan Features */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  {tForm('plan_features')}
                                </Label>
                                <div className="space-y-2">
                                  {(watch(`pricing_plans.${index}.features`) || ['']).map((_, featureIndex) => (
                                    <div key={featureIndex} className="flex gap-2">
                                      <Input
                                        placeholder={tForm('plan_feature_placeholder')}
                                        {...form.register(`pricing_plans.${index}.features.${featureIndex}` as const)}
                                      />
                                      {featureIndex > 0 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const currentFeatures = watch(`pricing_plans.${index}.features`) || []
                                            const newFeatures = currentFeatures.filter((_, i) => i !== featureIndex)
                                            setValue(`pricing_plans.${index}.features`, newFeatures)
                                          }}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  {(watch(`pricing_plans.${index}.features`) || []).length < 5 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentFeatures = watch(`pricing_plans.${index}.features`) || ['']
                                        setValue(`pricing_plans.${index}.features`, [...currentFeatures, ''])
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      {tForm('add_feature')}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mt-2">
                        {tSubmit('pricing_plans_help')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

              {/* Social Media */}
              <Card id="social" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-primary" />
                    {tSubmit('social_integrations')}
                  </CardTitle>
                </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SOCIAL_PLATFORMS.map((platform) => {
                        const IconComponent = platform.icon
                        return (
                          <div key={platform.key} className="space-y-2">
                            <Label htmlFor={platform.key} className="text-sm font-medium flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-primary" />
                              {tForm(platform.labelKey)}
                            </Label>
                            <Input
                              id={platform.key}
                              placeholder={tForm(platform.placeholderKey)}
                              {...form.register(platform.key as any)}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <Anchor className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{tForm('integrations')}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{tSubmit('integrations_help')}</p>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
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
                          {watch('integrations').filter(integration => !COMMON_INTEGRATIONS.includes(integration)).map((integration, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={integration}
                                onChange={(e) => {
                                  const integrations = [...watch('integrations')]
                                  const actualIndex = integrations.indexOf(integration)
                                  if (actualIndex !== -1) {
                                    integrations[actualIndex] = e.target.value
                                    setValue('integrations', integrations)
                                  }
                                }}
                                placeholder={tForm('integration_name_placeholder')}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromArray('integrations', integration)}
                                className="text-destructive hover:text-destructive"
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
                    </div>
                  </CardContent>
                </Card>

              {/* Platform Support */}
              <Card id="platforms" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-primary" />
                    {tSubmit('platform_support')}
                  </CardTitle>
                </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    {/* Mobile Apps */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{tForm('mobile_apps')}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ios_app_url" className="text-sm font-medium">{tForm('ios_app_url')}</Label>
                          <Input
                            id="ios_app_url"
                            placeholder={tForm('ios_placeholder')}
                            {...form.register('ios_app_url')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="android_app_url" className="text-sm font-medium">{tForm('android_app_url')}</Label>
                          <Input
                            id="android_app_url"
                            placeholder={tForm('android_placeholder')}
                            {...form.register('android_app_url')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Web App */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{tForm('web_app')}</h3>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="web_app_url" className="text-sm font-medium">{tForm('web_app_url')}</Label>
                        <Input
                          id="web_app_url"
                          placeholder={tForm('web_app_placeholder')}
                          {...form.register('web_app_url')}
                        />
                      </div>
                    </div>

                    {/* Desktop Platforms */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Monitor className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{tForm('desktop_apps')}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {DESKTOP_PLATFORMS.map((platform) => {
                          const PlatformIcon = platform.icon
                          return (
                            <div key={platform.value} className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-ds-medium group">
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
                                className="w-5 h-5 border-2 border-border group-hover:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                              />
                              <Label htmlFor={platform.value} className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1 group-hover:text-primary transition-colors">
                                <PlatformIcon className="h-4 w-4 text-primary" />
                                <span className="font-medium">{tForm(platform.key)}</span>
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Submit Button - Moved to bottom of form */}
                <div className="mt-8">
                  <Button 
                    type="button"
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white"
                    size="lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? (
                      <GlobalLoading variant="inline" size="sm" />
                    ) : (
                      tSubmit('simple_form.submit')
                    )}
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  Bookmark, 
  Share2, 
  Star,
  Clock,
  Shield,
  DollarSign,
  Users,
  Zap,
  CheckCircle,
  Globe,
  Twitter,
  Calendar,
  TrendingUp,
  Target,
  Award,
  Smartphone,
  Monitor,
  HelpCircle,
  X
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { Separator } from '@/ui/common/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Reviews } from '@/components/reviews/reviews'
import { cn } from '@/lib/utils/utils'
import { useTranslations } from 'next-intl'

interface Website {
  id: number
  title: string
  url: string
  description: string
  category: {
    id: number
    name: string
    slug: string
  }
  thumbnail: string | null
  status: string
  visits: number
  likes: number
  quality_score: number
  is_trusted: boolean
  is_featured: boolean
  tags: string | null
  tagline: string | null
  email: string | null
  features: any
  pricing_model: string
  has_free_version: boolean
  pricing_plans: Array<{name: string, billing_cycle: string, price: string, features: string[]}> | null
  base_price: string | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  discord_url: string | null
  domain_authority: number | null
  response_time: number | null
  ssl_enabled: boolean
  api_available: boolean
  use_cases: string[] | null
  target_audience: string[] | null
  faq: Array<{question: string, answer: string}> | null
  integrations: string[] | null
  ios_app_url: string | null
  android_app_url: string | null
  web_app_url: string | null
  desktop_platforms: string[] | null
  created_at: string
  updated_at: string
  _count: {
    websiteLikes: number
    websiteFavorites: number
  }
}

interface RelatedTool {
  id: number
  title: string
  description: string
  thumbnail: string | null
  category: {
    name: string
  }
  quality_score: number
  is_featured: boolean
}

export default function ToolDetailPage() {
  const params = useParams()
  const { isSignedIn, user } = useUser()
  const t = useTranslations()
  const [website, setWebsite] = useState<Website | null>(null)
  const [relatedTools, setRelatedTools] = useState<RelatedTool[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchToolDetails()
    }
  }, [params.id])

  useEffect(() => {
    if (website && isSignedIn) {
      checkUserInteractions()
    }
  }, [website, isSignedIn])

  const fetchToolDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/websites/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch tool details')
      }

      const data = await response.json()
      const website = data.data || data  // 处理 AjaxResponse 格式
      setWebsite(website)
      setLikesCount(website._count?.websiteLikes || 0)

      // 获取相关工具
      if (website.category?.id) {
        fetchRelatedTools(website.category.id, website.id)
      }

      // 记录访问
      await fetch(`/api/websites/${params.id}/visit`, { method: 'POST' })
    } catch (error) {
      console.error('Error fetching tool details:', error)
      toast.error(t('tools.detail.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedTools = async (categoryId: number, currentToolId: number) => {
    try {
      const response = await fetch(`/api/websites?category=${categoryId}&limit=4&exclude=${currentToolId}`)
      if (response.ok) {
        const data = await response.json()
        setRelatedTools(data.websites || [])
      }
    } catch (error) {
      console.error('Error fetching related tools:', error)
    }
  }

  const checkUserInteractions = async () => {
    if (!website || !isSignedIn) return

    try {
      // 检查点赞状态
      const likeResponse = await fetch(`/api/user/likes/check?websiteId=${website.id}`)
      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setIsLiked(likeData.isLiked)
      }

      // 检查收藏状态
      const favoriteResponse = await fetch(`/api/user/favorites/check?websiteId=${website.id}`)
      if (favoriteResponse.ok) {
        const favoriteData = await favoriteResponse.json()
        setIsFavorited(favoriteData.isFavorited)
      }
    } catch (error) {
      console.error('Error checking user interactions:', error)
    }
  }

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error(t('tools.detail.login_required'))
      return
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/websites/${website?.id}/like`, { method })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
        toast.success(isLiked ? t('tools.detail.unlike_success') : t('tools.detail.like_success'))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(t('tools.detail.operation_failed'))
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn) {
      toast.error(t('tools.detail.login_required'))
      return
    }

    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const url = isFavorited 
        ? `/api/user/favorites?websiteId=${website?.id}`
        : '/api/user/favorites'
      
      const body = isFavorited ? undefined : JSON.stringify({ websiteId: website?.id })
      
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body,
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? t('tools.detail.unfavorite_success') : t('tools.detail.favorite_success'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(t('tools.detail.operation_failed'))
    }
  }

  const handleShare = async () => {
    if (navigator.share && website) {
      try {
        await navigator.share({
          title: website.title,
          text: website.description,
          url: window.location.href,
        })
      } catch (error) {
        // 如果分享失败，复制链接
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t('tools.detail.link_copied'))
  }

  const getPricingDisplay = (pricingModel: string, hasFreePlan: boolean, basePrice: string | null) => {
    if (pricingModel === 'free') return t('tools.detail.sections.pricing.free')
    if (hasFreePlan && basePrice) return t('tools.detail.sections.pricing.free_trial', { price: basePrice })
    if (basePrice) return basePrice
    return pricingModel === 'paid' ? t('tools.detail.sections.pricing.paid') : t('tools.detail.sections.pricing.contact_sales')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 加载骨架屏 */}
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-muted rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!website) {
    return notFound()
  }

  // 处理 features 数据 - 兼容新旧格式
  const processFeatures = (features: any) => {
    if (!features) return []
    
    try {
      // 如果是字符串，尝试解析
      const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features
      
      // 如果是对象数组格式 [{name, description}]，转换为字符串数组
      if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
        if (typeof parsedFeatures[0] === 'object' && parsedFeatures[0].name) {
          return parsedFeatures.map((feature: any) => 
            feature.description ? `${feature.name}: ${feature.description}` : feature.name
          )
        }
        // 如果已经是字符串数组，直接返回
        return parsedFeatures
      }
      
      return []
    } catch (error) {
      console.error('Error processing features:', error)
      return []
    }
  }

  const features = processFeatures(website?.features)
  const tags = website.tags ? website.tags.split(',').filter(Boolean) : []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 头部整块介绍区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.1,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <Card className="p-8 mb-8">
              <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：工具信息 */}
              <div className="flex flex-col justify-between">
                <div className="flex items-start gap-6 mb-6">
                  {/* 工具图标 */}
                  <div className="relative flex-shrink-0">
                    {website.thumbnail ? (
                      <img 
                        src={website.thumbnail}
                        alt={website.title}
                        className="w-20 h-20 rounded-xl object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center shadow-md">
                        <Globe className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    {website.is_featured && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-blue-500 text-white border-0 rounded-full px-2 py-1 text-xs">
                          {t('tools.detail.featured')}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* 工具基本信息 */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-semibold text-foreground mb-2">{website.title}</h1>
                    {website.tagline && (
                      <p className="text-xl text-muted-foreground mb-4">{website.tagline}</p>
                    )}
                    
                    {/* 分类和标签 */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="secondary">
                        {website.category.name}
                      </Badge>
                      {tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 统计信息 */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>{likesCount} {t('tools.detail.likes')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-blue-500" />
                    <span>{website._count?.websiteFavorites || 0} {t('tools.detail.favorites')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{website.visits} {t('tools.detail.visits')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{website.quality_score}/100</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Button 
                    size="lg" 
                    asChild
                    className="bg-primary hover:bg-primary/90"
                  >
                    <a 
                      href={website.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t('tools.detail.visit_tool')}
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLike}
                    className={cn(
                      "gap-2",
                      isLiked && "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    {isLiked ? t('tools.detail.liked') : t('tools.detail.like')}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleFavorite}
                    className={cn(
                      "gap-2",
                      isFavorited && "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", isFavorited && "fill-current")} />
                    {isFavorited ? t('tools.detail.favorited') : t('tools.detail.favorite')}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    {t('tools.detail.share')}
                  </Button>
                </div>
              </div>

              {/* 右侧：缩略图/预览 */}
              <div className="flex items-center justify-center">
                <div className="bg-muted rounded-lg p-6 w-full h-full min-h-[380px] flex items-center justify-center">
                  {website.thumbnail ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <img 
                        src={website.thumbnail}
                        alt={`${website.title} 预览`}
                        className="w-full h-auto rounded-lg object-cover max-h-[320px] shadow-md"
                      />
                      <p className="text-sm text-muted-foreground mt-3 text-center">{t('tools.detail.tool_preview')}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Monitor className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('tools.detail.no_preview')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧固定导航栏 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* 导航菜单 */}
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      <a 
                        href="#overview" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        {t('tools.detail.navigation.overview')}
                      </a>
                      {features && features.length > 0 && (
                        <a 
                          href="#features" 
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Zap className="h-4 w-4" />
                          {t('tools.detail.navigation.features')}
                        </a>
                      )}
                      {website.use_cases && website.use_cases.length > 0 && (
                        <a 
                          href="#use-cases" 
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Target className="h-4 w-4" />
                          {t('tools.detail.navigation.use_cases')}
                        </a>
                      )}
                      {website.target_audience && Array.isArray(website.target_audience) && website.target_audience.length > 0 && (
                        <a 
                          href="#target-audience" 
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          {t('tools.detail.navigation.target_audience')}
                        </a>
                      )}
                      {website.faq && website.faq.length > 0 && (
                        <a 
                          href="#faq" 
                          className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        >
                          <HelpCircle className="h-4 w-4" />
                          {t('tools.detail.navigation.faq')}
                        </a>
                      )}
                      <a 
                        href="#pricing" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <DollarSign className="h-4 w-4" />
                        {t('tools.detail.navigation.pricing')}
                      </a>
                      <a 
                        href="#more-info" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        {t('tools.detail.navigation.more_info')}
                      </a>
                      <a 
                        href="#analytics" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" />
                        {t('tools.detail.navigation.analytics')}
                      </a>
                      <a 
                        href="#reviews" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Star className="h-4 w-4" />
                        {t('tools.detail.navigation.reviews')}
                      </a>
                      <a 
                        href="#alternatives" 
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-normal text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <Target className="h-4 w-4" />
                        {t('tools.detail.navigation.alternatives')}
                      </a>
                    </nav>
                  </CardContent>
                </Card>

                {/* Featured 相关产品推荐 */}
                {relatedTools.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        {t('tools.detail.featured')}
                      </h3>
                      <div className="space-y-3">
                        {relatedTools.slice(0, 3).map((tool) => (
                          <Link key={tool.id} href={`/tools/${tool.id}`}>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                              {tool.thumbnail ? (
                                <img 
                                  src={tool.thumbnail}
                                  alt={tool.title}
                                  className="w-8 h-8 rounded-md object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{tool.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{tool.category.name}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* 右侧主要内容区域 */}
            <div className="lg:col-span-3 space-y-8">
              {/* Overview 模块 */}
              <motion.section
                id="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.2,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="scroll-mt-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      {t('tools.detail.navigation.overview')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {website.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Features 模块 */}
              {features && features.length > 0 && (
                <motion.section
                  id="features"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="scroll-mt-24"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-primary" />
                        {t('tools.detail.navigation.features')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {features.map((feature: any, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {typeof feature === 'object' && feature.name ? (
                                <>
                                  <h4 className="font-medium text-foreground mb-1">{feature.name}</h4>
                                  <p className="text-muted-foreground">{feature.description}</p>
                                </>
                              ) : (
                                <span className="text-foreground">{feature}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Use Cases 模块 */}
              {website.use_cases && Array.isArray(website.use_cases) && website.use_cases.length > 0 && (
                <motion.section
                  id="use-cases"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.35,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="scroll-mt-24"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-primary" />
                        {t('tools.detail.navigation.use_cases')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {website.use_cases.map((useCase: string, index: number) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <p className="text-muted-foreground">{useCase}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Target Audience 模块 */}
              {website.target_audience && Array.isArray(website.target_audience) && website.target_audience.length > 0 && (
                <motion.section
                  id="target-audience"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.4,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="scroll-mt-24"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        {t('tools.detail.navigation.target_audience')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {website.target_audience.map((audience: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-4 py-2">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* FAQ 模块 */}
              {website.faq && Array.isArray(website.faq) && website.faq.length > 0 && (
                <motion.section
                  id="faq"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.45,
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="scroll-mt-24"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        {t('tools.detail.navigation.faq')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {website.faq.map((item: any, index: number) => (
                          <div key={index} className="border-b border-border last:border-0 pb-6 last:pb-0">
                            <h4 className="font-medium text-foreground mb-3">{item.question}</h4>
                            <p className="text-muted-foreground">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Pricing Plans 模块 */}
              <motion.section
                id="pricing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="scroll-mt-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      {t('tools.detail.navigation.pricing')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 基本定价信息 */}
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('tools.detail.sections.pricing.model')}:</span>
                          <Badge variant="outline" className="capitalize">
                            {getPricingDisplay(website.pricing_model, website.has_free_version, website.base_price)}
                          </Badge>
                        </div>
                        {website.has_free_version && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">{t('tools.detail.sections.pricing.has_free_version')}</span>
                          </div>
                        )}
                        {website.api_available && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600">{t('tools.detail.sections.pricing.api_available')}</span>
                          </div>
                        )}
                      </div>

                      {/* 详细定价计划 */}
                      {website.pricing_plans && Array.isArray(website.pricing_plans) && website.pricing_plans.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium">{t('tools.detail.sections.pricing.plan_details')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {website.pricing_plans.map((plan: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="mb-3">
                                  <h5 className="font-medium text-lg">{plan.name}</h5>
                                  <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-2xl font-bold text-primary">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">/{plan.billing_cycle}</span>
                                  </div>
                                </div>
                                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">{t('tools.detail.sections.pricing.included_features')}</p>
                                    <ul className="space-y-1">
                                      {plan.features.map((feature: string, featureIndex: number) => (
                                        <li key={featureIndex} className="flex items-start gap-2 text-sm">
                                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* More Info 模块 */}
              <motion.section
                id="more-info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="scroll-mt-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {t('tools.detail.navigation.more_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 基本信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium">{t('tools.detail.sections.more_info.basic_info')}</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('tools.detail.sections.more_info.category')}</span>
                            <Badge variant="secondary">{website.category.name}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('tools.detail.sections.more_info.quality_score')}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{website.quality_score}/100</span>
                            </div>
                          </div>
                          {website.ssl_enabled && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('tools.detail.sections.more_info.security')}</span>
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4 text-green-500" />
                                <span>{t('tools.detail.sections.more_info.ssl_secure')}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('tools.detail.sections.more_info.added_time')}</span>
                            <span>{new Date(website.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                          {website.email && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('tools.detail.sections.more_info.contact_email')}</span>
                              <a href={`mailto:${website.email}`} className="text-blue-600 hover:text-blue-800 text-sm">
                                {website.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 平台支持 */}
                      {((website.ios_app_url || website.android_app_url || website.web_app_url) || 
                        (website.desktop_platforms && Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0)) && (
                        <div className="space-y-4">
                          <h4 className="font-medium">{t('tools.detail.sections.more_info.platform_support')}</h4>
                          <div className="space-y-3">
                            {website.ios_app_url && (
                              <a href={website.ios_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">{t('tools.detail.sections.more_info.ios_app')}</span>
                              </a>
                            )}
                            {website.android_app_url && (
                              <a href={website.android_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">{t('tools.detail.sections.more_info.android_app')}</span>
                              </a>
                            )}
                            {website.web_app_url && (
                              <a href={website.web_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">{t('tools.detail.sections.more_info.web_app')}</span>
                              </a>
                            )}
                            {website.desktop_platforms && Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0 && (
                              <div className="flex items-center gap-3">
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {website.desktop_platforms.map((platform: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {platform === 'mac' ? 'macOS' : platform === 'windows' ? 'Windows' : 'Linux'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 集成 */}
                      {website.integrations && Array.isArray(website.integrations) && website.integrations.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium">{t('tools.detail.sections.more_info.integration_platforms')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {website.integrations.map((integration: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {integration}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 社交媒体 */}
                      {(website.twitter_url || website.linkedin_url || website.facebook_url || website.instagram_url || website.youtube_url || website.discord_url) && (
                        <div className="space-y-4">
                          <h4 className="font-medium">{t('tools.detail.sections.more_info.social_media')}</h4>
                          <div className="space-y-3">
                            {website.twitter_url && (
                              <a href={website.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Twitter className="h-4 w-4" />
                                <span className="text-sm">Twitter</span>
                              </a>
                            )}
                            {website.linkedin_url && (
                              <a href={website.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">LinkedIn</span>
                              </a>
                            )}
                            {website.youtube_url && (
                              <a href={website.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">YouTube</span>
                              </a>
                            )}
                            {website.discord_url && (
                              <a href={website.discord_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">Discord</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Analytics 模块 */}
              <motion.section
                id="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
                className="scroll-mt-24"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {t('tools.detail.navigation.analytics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{website.visits}</div>
                        <div className="text-sm text-muted-foreground">{t('tools.detail.sections.analytics.total_visits')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{likesCount}</div>
                        <div className="text-sm text-muted-foreground">{t('tools.detail.sections.analytics.likes_count')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{website._count?.websiteFavorites || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('tools.detail.sections.analytics.favorites_count')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">{website.quality_score}</div>
                        <div className="text-sm text-muted-foreground">{t('tools.detail.sections.analytics.quality_score')}</div>
                      </div>
                    </div>
                    
                    {(website.response_time || website.domain_authority) && (
                      <>
                        <Separator className="my-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {website.response_time && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('tools.detail.sections.analytics.response_time')}</span>
                              </div>
                              <div className={cn(
                                "text-lg font-semibold",
                                website.response_time < 1000 ? "text-green-500" :
                                website.response_time < 2000 ? "text-yellow-500" : "text-red-500"
                              )}>
                                {website.response_time}ms
                              </div>
                            </div>
                          )}
                          {website.domain_authority && (
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{t('tools.detail.sections.analytics.domain_authority')}</span>
                              </div>
                              <div className="text-lg font-semibold text-blue-500">
                                {website.domain_authority}/100
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <Separator className="my-6" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t('tools.detail.sections.analytics.added_date')}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(website.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>

              {/* Reviews 模块 */}
              <motion.section
                id="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="scroll-mt-24"
              >
                <Reviews websiteId={website.id} websiteTitle={website.title} />
              </motion.section>

              {/* Alternatives 模块 */}
              {relatedTools.length > 0 && (
                <motion.section
                  id="alternatives"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="scroll-mt-24"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {t('tools.detail.navigation.alternatives')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedTools.map((tool) => (
                          <Link key={tool.id} href={`/tools/${tool.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {tool.thumbnail ? (
                                    <img 
                                      src={tool.thumbnail}
                                      alt={tool.title}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                      <Globe className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium truncate">{tool.title}</h4>
                                      {tool.is_featured && (
                                        <Badge variant="outline" className="text-xs">{t('tools.detail.sections.alternatives.featured')}</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                      {tool.description}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {tool.category.name}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
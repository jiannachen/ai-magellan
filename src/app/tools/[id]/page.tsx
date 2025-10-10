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
      toast.error('加载工具详情失败')
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
      toast.error('请先登录')
      return
    }

    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/websites/${website?.id}/like`, { method })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
        toast.success(isLiked ? '已取消点赞' : '点赞成功')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('操作失败')
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn) {
      toast.error('请先登录')
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
        toast.success(isFavorited ? '已取消收藏' : '已添加收藏')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败')
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
    toast.success('链接已复制到剪贴板')
  }

  const getPricingDisplay = (pricingModel: string, hasFreePlan: boolean, basePrice: string | null) => {
    if (pricingModel === 'free') return '免费'
    if (hasFreePlan && basePrice) return `免费试用 • ${basePrice}`
    if (basePrice) return basePrice
    return pricingModel === 'paid' ? '付费' : '联系销售'
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
          {/* 头部整块介绍区域 - Apple风格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.1,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="bg-background-secondary rounded-2xl p-8 mb-8 shadow-2"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：工具信息 */}
              <div className="flex flex-col justify-between">
                <div className="flex items-start gap-6 mb-6">
                  {/* 工具图标 - Apple风格 */}
                  <div className="relative flex-shrink-0">
                    {website.thumbnail ? (
                      <img 
                        src={website.thumbnail}
                        alt={website.title}
                        className="w-20 h-20 rounded-2xl object-cover shadow-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-fill-quaternary flex items-center justify-center shadow-3">
                        <Globe className="h-10 w-10 text-label-tertiary" />
                      </div>
                    )}
                    {website.is_featured && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-color-blue text-white border-0 rounded-full px-2 py-1 text-caption2">
                          精选
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* 工具基本信息 - Apple字体系统 */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-largeTitle font-normal text-label-primary mb-2 leading-[41px] tracking-[0.37px]">{website.title}</h1>
                    {website.tagline && (
                      <p className="text-title3 text-label-secondary mb-4 leading-[25px] tracking-[0.38px]">{website.tagline}</p>
                    )}
                    
                    {/* 分类和标签 - Apple风格标签 */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-fill-quaternary text-label-primary border-0 rounded-full text-caption1">
                        {website.category.name}
                      </Badge>
                      {tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} className="bg-fill-tertiary text-label-secondary border-0 rounded-full text-caption1">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 统计信息 - Apple风格数据 */}
                <div className="flex items-center gap-6 text-subhead text-label-tertiary mb-6 leading-[20px] tracking-[-0.24px]">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-color-red" />
                    <span>{likesCount} 点赞</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-color-blue" />
                    <span>{website._count?.websiteFavorites || 0} 收藏</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-color-green" />
                    <span>{website.visits} 访问</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-color-yellow" />
                    <span>{website.quality_score}/100</span>
                  </div>
                </div>

                {/* 操作按钮 - Apple风格按钮 */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Button 
                    size="lg" 
                    asChild
                    className="bg-color-blue hover:bg-color-blue/80 rounded-xl px-6 h-11 text-body font-semibold transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80 hover:-translate-y-px active:opacity-60 active:translate-y-0"
                  >
                    <a 
                      href={website.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      访问工具
                    </a>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLike}
                    className={cn(
                      "gap-2 rounded-xl px-4 h-11 text-body transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80 hover:-translate-y-px active:opacity-60 active:translate-y-0",
                      isLiked && "border-color-red/30 bg-color-red/5 text-color-red"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                    {isLiked ? '已点赞' : '点赞'}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleFavorite}
                    className={cn(
                      "gap-2 rounded-xl px-4 h-11 text-body transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80 hover:-translate-y-px active:opacity-60 active:translate-y-0",
                      isFavorited && "border-color-blue/30 bg-color-blue/5 text-color-blue"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", isFavorited && "fill-current")} />
                    {isFavorited ? '已收藏' : '收藏'}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="gap-2 rounded-xl px-4 h-11 text-body transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:opacity-80 hover:-translate-y-px active:opacity-60 active:translate-y-0"
                  >
                    <Share2 className="h-4 w-4" />
                    分享
                  </Button>
                </div>
              </div>

              {/* 右侧：动态缓存缩略图/预览 - Apple风格卡片 */}
              <div className="flex items-center justify-center">
                <div className="bg-fill-quaternary rounded-2xl p-6 w-full h-full min-h-[380px] flex items-center justify-center shadow-1">
                  {website.thumbnail ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <img 
                        src={website.thumbnail}
                        alt={`${website.title} 预览`}
                        className="w-full h-auto rounded-xl object-cover max-h-[320px] shadow-2"
                      />
                      <p className="text-caption1 text-label-tertiary mt-3 text-center leading-[16px]">工具预览图</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Monitor className="h-20 w-20 text-label-tertiary mx-auto mb-4" />
                      <p className="text-subhead text-label-tertiary leading-[20px] tracking-[-0.24px]">暂无预览图</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧固定导航栏 - Apple风格 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* 导航菜单 */}
                <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                  <div className="p-4">
                    <nav className="space-y-1">
                      <a 
                        href="#overview" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-medium text-label-primary bg-fill-quaternary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <Globe className="h-4 w-4" />
                        Overview
                      </a>
                      {features && features.length > 0 && (
                        <a 
                          href="#features" 
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        >
                          <Zap className="h-4 w-4" />
                          Features
                        </a>
                      )}
                      {website.use_cases && website.use_cases.length > 0 && (
                        <a 
                          href="#use-cases" 
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        >
                          <Target className="h-4 w-4" />
                          Use Cases
                        </a>
                      )}
                      {website.target_audience && Array.isArray(website.target_audience) && website.target_audience.length > 0 && (
                        <a 
                          href="#target-audience" 
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        >
                          <Users className="h-4 w-4" />
                          Target Audience
                        </a>
                      )}
                      <a 
                        href="#pros-cons" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Pros & Cons
                      </a>
                      {website.faq && website.faq.length > 0 && (
                        <a 
                          href="#faq" 
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        >
                          <HelpCircle className="h-4 w-4" />
                          FAQ
                        </a>
                      )}
                      <a 
                        href="#pricing" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <DollarSign className="h-4 w-4" />
                        Pricing Plans
                      </a>
                      <a 
                        href="#more-info" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <Globe className="h-4 w-4" />
                        More Info
                      </a>
                      <a 
                        href="#analytics" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Analytics
                      </a>
                      <a 
                        href="#reviews" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <Star className="h-4 w-4" />
                        Reviews
                      </a>
                      <a 
                        href="#alternatives" 
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-body font-normal text-label-secondary hover:bg-fill-quaternary hover:text-label-primary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                      >
                        <Target className="h-4 w-4" />
                        Alternatives
                      </a>
                    </nav>
                  </div>
                </div>

                {/* Featured 相关产品推荐 - Apple风格 */}
                {relatedTools.length > 0 && (
                  <div className="bg-background-secondary rounded-2xl shadow-2">
                    <div className="p-4">
                      <h3 className="text-headline font-semibold text-label-primary mb-4 flex items-center gap-2 leading-[22px] tracking-[-0.43px]">
                        <Award className="h-4 w-4" />
                        Featured
                      </h3>
                      <div className="space-y-3">
                        {relatedTools.slice(0, 3).map((tool) => (
                          <Link key={tool.id} href={`/tools/${tool.id}`}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-fill-quaternary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer">
                              {tool.thumbnail ? (
                                <img 
                                  src={tool.thumbnail}
                                  alt={tool.title}
                                  className="w-8 h-8 rounded-lg object-cover shadow-1"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-fill-quaternary flex items-center justify-center">
                                  <Globe className="h-4 w-4 text-label-tertiary" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-footnote font-medium text-label-primary truncate leading-[18px] tracking-[-0.08px]">{tool.title}</p>
                                <p className="text-caption1 text-label-tertiary truncate leading-[16px]">{tool.category.name}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧主要内容区域 */}
            <div className="lg:col-span-3 space-y-8">
              {/* Overview 模块 - Apple风格 */}
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
                <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                  <div className="p-6">
                    <h3 className="text-title3 font-normal text-label-primary mb-4 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                      <Globe className="h-5 w-5 text-color-blue" />
                      Overview
                    </h3>
                    <p className="text-body text-label-secondary leading-[22px] tracking-[-0.43px] leading-relaxed">
                      {website.description}
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Features 模块 - Apple风格 */}
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
                  <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                    <div className="p-6">
                      <h3 className="text-title3 font-normal text-label-primary mb-6 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                        <Zap className="h-5 w-5 text-color-blue" />
                        Features
                      </h3>
                      <div className="space-y-4">
                        {features.map((feature: any, index: number) => (
                          <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-fill-quaternary hover:bg-fill-tertiary transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                            <CheckCircle className="h-5 w-5 text-color-green mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              {typeof feature === 'object' && feature.name ? (
                                <>
                                  <h4 className="text-callout font-medium text-label-primary mb-1 leading-[21px] tracking-[-0.32px]">{feature.name}</h4>
                                  <p className="text-subhead text-label-secondary leading-[20px] tracking-[-0.24px]">{feature.description}</p>
                                </>
                              ) : (
                                <span className="text-callout text-label-primary leading-[21px] tracking-[-0.32px]">{feature}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Use Cases 模块 - Apple风格 */}
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
                  <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                    <div className="p-6">
                      <h3 className="text-title3 font-normal text-label-primary mb-6 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                        <Target className="h-5 w-5 text-color-blue" />
                        Use Cases
                      </h3>
                      <div className="space-y-4">
                        {website.use_cases.map((useCase: string, index: number) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="w-2 h-2 rounded-full bg-color-blue mt-2 flex-shrink-0 shadow-1"></div>
                            <p className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">{useCase}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Target Audience 模块 - Apple风格 */}
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
                  <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                    <div className="p-6">
                      <h3 className="text-title3 font-normal text-label-primary mb-6 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                        <Users className="h-5 w-5 text-color-blue" />
                        Target Audience
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {website.target_audience.map((audience: string, index: number) => (
                          <div key={index} className="bg-fill-quaternary text-label-primary rounded-full px-4 py-2 text-subhead font-medium leading-[20px] tracking-[-0.24px] shadow-1">
                            {audience}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Pros & Cons 模块 - Apple风格 */}
              <motion.section
                id="pros-cons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.42,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="scroll-mt-24"
              >
                <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                  <div className="p-6">
                    <h3 className="text-title3 font-normal text-label-primary mb-6 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                      <CheckCircle className="h-5 w-5 text-color-blue" />
                      Pros & Cons
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Pros */}
                      <div className="space-y-4">
                        <h4 className="text-headline font-semibold text-color-green flex items-center gap-2 leading-[22px] tracking-[-0.43px]">
                          <CheckCircle className="h-4 w-4" />
                          优点
                        </h4>
                        <div className="space-y-3">
                          {/* 基于现有数据生成的优点 */}
                          {website.has_free_version && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">提供免费版本</span>
                            </div>
                          )}
                          {website.api_available && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">提供API接口</span>
                            </div>
                          )}
                          {website.ssl_enabled && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">安全可靠（SSL加密）</span>
                            </div>
                          )}
                          {website.integrations && Array.isArray(website.integrations) && website.integrations.length > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">支持多种集成平台</span>
                            </div>
                          )}
                          {website.quality_score && website.quality_score >= 80 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">高质量评分 ({website.quality_score}/100)</span>
                            </div>
                          )}
                          {((website.ios_app_url || website.android_app_url) || 
                            (website.desktop_platforms && Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0)) && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-green mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">支持多平台使用</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cons */}
                      <div className="space-y-4">
                        <h4 className="text-headline font-semibold text-color-red flex items-center gap-2 leading-[22px] tracking-[-0.43px]">
                          <X className="h-4 w-4" />
                          缺点
                        </h4>
                        <div className="space-y-3">
                          {/* 基于现有数据生成的缺点 */}
                          {!website.has_free_version && website.pricing_model !== 'free' && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-red mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">无免费版本</span>
                            </div>
                          )}
                          {!website.api_available && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-red mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">不提供API接口</span>
                            </div>
                          )}
                          {website.quality_score && website.quality_score < 60 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-red mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">质量评分较低 ({website.quality_score}/100)</span>
                            </div>
                          )}
                          {website.response_time && website.response_time > 2000 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-red mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">响应速度较慢 ({website.response_time}ms)</span>
                            </div>
                          )}
                          {(!website.integrations || !Array.isArray(website.integrations) || website.integrations.length === 0) && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-red mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-secondary leading-[21px] tracking-[-0.32px]">集成支持有限</span>
                            </div>
                          )}
                          {/* 如果没有明显缺点，显示中性评价 */}
                          {website.has_free_version && website.api_available && website.quality_score >= 60 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-color-yellow mt-2 flex-shrink-0 shadow-1"></div>
                              <span className="text-callout text-label-tertiary leading-[21px] tracking-[-0.32px]">需要更多用户反馈评价</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* FAQ 模块 - Apple风格 */}
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
                  <div className="bg-background-secondary rounded-2xl overflow-hidden shadow-2">
                    <div className="p-6">
                      <h3 className="text-title3 font-normal text-label-primary mb-6 flex items-center gap-3 leading-[25px] tracking-[0.38px]">
                        <HelpCircle className="h-5 w-5 text-color-blue" />
                        FAQ
                      </h3>
                      <div className="space-y-6">
                        {website.faq.map((item: any, index: number) => (
                          <div key={index} className="border-b border-fill-quaternary last:border-0 pb-6 last:pb-0">
                            <h4 className="text-callout font-medium text-label-primary mb-3 leading-[21px] tracking-[-0.32px]">{item.question}</h4>
                            <p className="text-subhead text-label-secondary leading-[20px] tracking-[-0.24px]">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                      Pricing Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 基本定价信息 */}
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">模型:</span>
                          <Badge variant="outline" className="capitalize">
                            {getPricingDisplay(website.pricing_model, website.has_free_version, website.base_price)}
                          </Badge>
                        </div>
                        {website.has_free_version && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">有免费版本</span>
                          </div>
                        )}
                        {website.api_available && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-600">API 可用</span>
                          </div>
                        )}
                      </div>

                      {/* 详细定价计划 */}
                      {website.pricing_plans && Array.isArray(website.pricing_plans) && website.pricing_plans.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-medium">定价计划详情</h4>
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
                                    <p className="text-sm font-medium text-muted-foreground">包含功能:</p>
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
                      More Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 基本信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium">基本信息</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">分类</span>
                            <Badge variant="secondary">{website.category.name}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">质量评分</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{website.quality_score}/100</span>
                            </div>
                          </div>
                          {website.ssl_enabled && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">安全性</span>
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4 text-green-500" />
                                <span>SSL安全</span>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">添加时间</span>
                            <span>{new Date(website.created_at).toLocaleDateString('zh-CN')}</span>
                          </div>
                          {website.email && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">联系邮箱</span>
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
                          <h4 className="font-medium">平台支持</h4>
                          <div className="space-y-3">
                            {website.ios_app_url && (
                              <a href={website.ios_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">iOS 应用</span>
                              </a>
                            )}
                            {website.android_app_url && (
                              <a href={website.android_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Smartphone className="h-4 w-4" />
                                <span className="text-sm">Android 应用</span>
                              </a>
                            )}
                            {website.web_app_url && (
                              <a href={website.web_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors">
                                <Globe className="h-4 w-4" />
                                <span className="text-sm">Web 应用</span>
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
                          <h4 className="font-medium">集成平台</h4>
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
                          <h4 className="font-medium">社交媒体</h4>
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
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{website.visits}</div>
                        <div className="text-sm text-muted-foreground">总访问量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{likesCount}</div>
                        <div className="text-sm text-muted-foreground">点赞数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{website._count?.websiteFavorites || 0}</div>
                        <div className="text-sm text-muted-foreground">收藏数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-500">{website.quality_score}</div>
                        <div className="text-sm text-muted-foreground">质量评分</div>
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
                                <span className="text-sm font-medium">响应时间</span>
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
                                <span className="text-sm font-medium">域名权威度</span>
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
                        <span className="text-sm font-medium">收录时间</span>
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
                        Alternatives
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
                                        <Badge variant="outline" className="text-xs">精选</Badge>
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
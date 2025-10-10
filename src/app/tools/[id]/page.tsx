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
  Monitor
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
  features: any
  pricing_model: string
  has_free_version: boolean
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
        <div className="max-w-6xl mx-auto">
          {/* 返回导航 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回工具库
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-8">
              {/* Apple风格工具头部 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* 工具图标 - Apple简洁风格 */}
                    <div className="relative">
                      {website.thumbnail ? (
                        <img 
                          src={website.thumbnail}
                          alt={website.title}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-fill-quaternary flex items-center justify-center">
                          <Globe className="h-10 w-10 text-label-tertiary" />
                        </div>
                      )}
                      {website.is_featured && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-primary text-primary-foreground border-0 rounded-full px-2 py-1 text-caption2">
                            精选
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* 工具信息 - Apple排版 */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-largeTitle font-semibold text-label-primary mb-2">{website.title}</h1>
                      {website.tagline && (
                        <p className="text-title3 text-label-secondary mb-4">{website.tagline}</p>
                      )}
                      
                      {/* Apple风格统计信息 */}
                      <div className="flex items-center gap-6 text-subhead text-label-tertiary mb-6">
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
                      </div>

                      {/* Apple风格操作按钮 */}
                      <div className="flex items-center gap-3">
                        <Button 
                          size="lg" 
                          asChild
                          className="bg-primary hover:bg-primary/90 rounded-xl px-6 h-11"
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
                            "gap-2 rounded-xl px-4 h-11",
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
                            "gap-2 rounded-xl px-4 h-11",
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
                          className="gap-2 rounded-xl px-4 h-11"
                        >
                          <Share2 className="h-4 w-4" />
                          分享
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Apple风格工具描述 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl p-6">
                  <h2 className="text-title2 font-semibold text-label-primary mb-4">关于 {website.title}</h2>
                  <p className="text-body text-label-secondary leading-relaxed">
                    {website.description}
                  </p>
                </div>
              </motion.div>

              {/* Apple风格主要特点 */}
              {features && features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h2 className="text-title2 font-semibold text-label-primary mb-6 flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary" />
                      主要特点
                    </h2>
                    <ul className="space-y-4">
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-color-green mt-0.5 flex-shrink-0" />
                          <span className="text-body text-label-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* 使用场景 */}
              {website.use_cases && Array.isArray(website.use_cases) && website.use_cases.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h2 className="text-title2 font-semibold text-label-primary mb-6 flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      使用场景
                    </h2>
                    <ul className="space-y-3">
                      {website.use_cases.map((useCase: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span className="text-body text-label-secondary">{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* 目标受众 */}
              {website.target_audience && Array.isArray(website.target_audience) && website.target_audience.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h2 className="text-title2 font-semibold text-label-primary mb-6 flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      目标受众
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {website.target_audience.map((audience: string, index: number) => (
                        <Badge key={index} className="bg-fill-quaternary text-label-primary border-0 rounded-full">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 常见问题 */}
              {website.faq && Array.isArray(website.faq) && website.faq.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h2 className="text-title2 font-semibold text-label-primary mb-6">常见问题</h2>
                    <div className="space-y-4">
                      {website.faq.map((item: any, index: number) => (
                        <div key={index} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                          <h4 className="font-medium text-label-primary mb-2">{item.question}</h4>
                          <p className="text-body text-label-secondary">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 相关工具 */}
              {relatedTools.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        相关工具
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
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {tool.description}
                                    </p>
                                    <Badge variant="outline" className="mt-2 text-xs">
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
                </motion.div>
              )}

              {/* 评论系统 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Reviews websiteId={website.id} websiteTitle={website.title} />
              </motion.div>
            </div>

            {/* Apple风格侧边栏 */}
            <div className="space-y-6">
              {/* 工具信息卡片 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-card rounded-2xl p-6">
                  <h3 className="text-headline font-semibold text-label-primary mb-4">工具信息</h3>
                  <div className="space-y-4">
                    {/* 分类 */}
                    <div className="flex items-center justify-between">
                      <span className="text-subhead text-label-secondary">分类</span>
                      <Badge className="bg-fill-quaternary text-label-primary border-0 rounded-full">
                        {website.category.name}
                      </Badge>
                    </div>

                    {/* 定价 */}
                    <div className="flex items-center justify-between">
                      <span className="text-subhead text-label-secondary">定价</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-color-green" />
                        <span className="text-subhead font-medium text-label-primary">
                          {getPricingDisplay(website.pricing_model, website.has_free_version, website.base_price)}
                        </span>
                      </div>
                    </div>

                    {/* 质量评分 */}
                    <div className="flex items-center justify-between">
                      <span className="text-subhead text-label-secondary">质量评分</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-color-yellow" />
                        <span className="text-subhead font-medium text-label-primary">{website.quality_score}/100</span>
                      </div>
                    </div>

                    {/* SSL状态 */}
                    {website.ssl_enabled && (
                      <div className="flex items-center justify-between">
                        <span className="text-subhead text-label-secondary">安全性</span>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-color-green" />
                          <span className="text-subhead font-medium text-label-primary">SSL安全</span>
                        </div>
                      </div>
                    )}

                    {/* 响应时间 */}
                    {website.response_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-subhead text-label-secondary">响应时间</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-color-blue" />
                          <span className="text-subhead font-medium text-label-primary">{website.response_time}ms</span>
                        </div>
                      </div>
                    )}

                    {/* 添加时间 */}
                    <div className="flex items-center justify-between">
                      <span className="text-subhead text-label-secondary">添加时间</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-label-tertiary" />
                        <span className="text-subhead font-medium text-label-primary">
                          {new Date(website.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>

                    {/* API 可用性 */}
                    {website.api_available && (
                      <div className="flex items-center justify-between">
                        <span className="text-subhead text-label-secondary">API</span>
                        <Badge className="bg-color-blue/10 text-color-blue border-0 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          可用
                        </Badge>
                      </div>
                    )}

                    {/* 免费版本 */}
                    {website.has_free_version && (
                      <div className="flex items-center justify-between">
                        <span className="text-subhead text-label-secondary">免费版本</span>
                        <Badge className="bg-color-green/10 text-color-green border-0 rounded-full">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          有
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Apple风格标签 */}
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h3 className="text-headline font-semibold text-label-primary mb-4">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge key={index} className="bg-fill-quaternary text-label-primary border-0 rounded-full text-caption1">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Apple风格集成 */}
              {website.integrations && Array.isArray(website.integrations) && website.integrations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h3 className="text-headline font-semibold text-label-primary mb-4">集成平台</h3>
                    <div className="flex flex-wrap gap-2">
                      {website.integrations.map((integration: string, index: number) => (
                        <Badge key={index} className="bg-fill-quaternary text-label-primary border-0 rounded-full text-caption1">
                          {integration}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Apple风格平台支持 */}
              {((website.ios_app_url || website.android_app_url || website.web_app_url) || 
                (website.desktop_platforms && Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0)) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h3 className="text-headline font-semibold text-label-primary mb-4">平台支持</h3>
                    <div className="space-y-3">
                      {website.ios_app_url && (
                        <a href={website.ios_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple">
                          <Smartphone className="h-4 w-4" />
                          <span className="text-subhead">iOS 应用</span>
                        </a>
                      )}
                      {website.android_app_url && (
                        <a href={website.android_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple">
                          <Smartphone className="h-4 w-4" />
                          <span className="text-subhead">Android 应用</span>
                        </a>
                      )}
                      {website.web_app_url && (
                        <a href={website.web_app_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple">
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">Web 应用</span>
                        </a>
                      )}
                      {website.desktop_platforms && Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0 && (
                        <div className="flex items-center gap-3">
                          <Monitor className="h-4 w-4 text-label-tertiary" />
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
                </motion.div>
              )}

              {/* Apple风格社交链接 */}
              {(website.twitter_url || website.linkedin_url || website.facebook_url || website.instagram_url || website.youtube_url || website.discord_url) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-card rounded-2xl p-6">
                    <h3 className="text-headline font-semibold text-label-primary mb-4">社交媒体</h3>
                    <div className="space-y-3">
                      {website.twitter_url && (
                        <a 
                          href={website.twitter_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Twitter className="h-4 w-4" />
                          <span className="text-subhead">Twitter</span>
                        </a>
                      )}
                      {website.linkedin_url && (
                        <a 
                          href={website.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">LinkedIn</span>
                        </a>
                      )}
                      {website.facebook_url && (
                        <a 
                          href={website.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">Facebook</span>
                        </a>
                      )}
                      {website.instagram_url && (
                        <a 
                          href={website.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">Instagram</span>
                        </a>
                      )}
                      {website.youtube_url && (
                        <a 
                          href={website.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">YouTube</span>
                        </a>
                      )}
                      {website.discord_url && (
                        <a 
                          href={website.discord_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-color-blue hover:text-color-blue/80 transition-apple"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-subhead">Discord</span>
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { 
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
  X,
  Map,
  Compass,
  Anchor,
  Route,
  Crown,
  Eye,
  Lightbulb,
  Plus,
  Home,
  ArrowRight,
  MapPin,
  Flag,
  FileText,
  Coins,
  Code,
  MessageSquare,
  Waves,
  Laptop,
  Ship
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { toast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { Reviews } from '@/components/reviews/reviews'
import { useTranslations } from 'next-intl'
import { StatCard } from '@/components/ui/stat-card'

interface Website {
  id: number
  title: string
  url: string
  description: string
  category: {
    id: number
    name: string
    slug: string
    parent_id?: number
    parent?: {
      id: number
      name: string
      slug: string
    }
  }
  thumbnail: string | null
  logo_url: string | null
  status: string
  visits: number
  likes: number
  quality_score: number
  is_trusted: boolean
  is_featured: boolean
  tags: string[] | null
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


export default function ToolDetailPage() {
  const params = useParams()
  const { isSignedIn, user } = useUser()
  const t = useTranslations()
  const [website, setWebsite] = useState<Website | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  // Navigation sections for the detail page
  const detailSections = [
    { id: 'overview', title: t('profile.tools.detail.sections.overview'), icon: Map, description: t('profile.tools.detail.navigation.overview_desc') },
    { id: 'features', title: t('profile.tools.detail.sections.features'), icon: Zap, description: t('profile.tools.detail.navigation.features_desc') },
    { id: 'audience', title: t('profile.tools.detail.sections.use_cases'), icon: Users, description: t('profile.tools.detail.navigation.use_cases_desc') },
    { id: 'pricing', title: t('profile.tools.detail.sections.pricing_section'), icon: Coins, description: t('profile.tools.detail.navigation.pricing_desc') },
    { id: 'social', title: t('profile.tools.detail.sections.social_integrations'), icon: Waves, description: t('profile.tools.detail.navigation.social_desc') },
    { id: 'platforms', title: t('profile.tools.detail.sections.platform_support'), icon: Anchor, description: t('profile.tools.detail.navigation.platforms_desc') },
    { id: 'reviews', title: t('profile.tools.detail.sections.reviews'), icon: Star, description: t('profile.tools.detail.navigation.reviews_desc') }
  ]

  useEffect(() => {
    if (params.slug) {
      fetchToolDetails()
    }
  }, [params.slug])

  useEffect(() => {
    if (website && isSignedIn) {
      checkUserInteractions()
    }
  }, [website, isSignedIn])

  const fetchToolDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/websites/${params.slug}`)

      if (!response.ok) {
        if (response.status === 404) {
          notFound()
        }
        throw new Error('Failed to fetch tool details')
      }

      const data = await response.json()
      const website = data.data || data
      setWebsite(website)
      setLikesCount(website._count?.websiteLikes || 0)

      recordVisit(website.id)
    } catch (error) {
      console.error('Error fetching tool details:', error)
      toast.error('Failed to load tool details')
    } finally {
      setLoading(false)
    }
  }


  const recordVisit = async (websiteId: number) => {
    try {
      await fetch(`/api/websites/${websiteId}/visit`, { method: 'POST' })
    } catch (error) {
      console.error('Error recording visit:', error)
    }
  }

  const checkUserInteractions = async () => {
    if (!website) return
    
    try {
      const [likesResponse, favoritesResponse] = await Promise.all([
        fetch(`/api/user/likes/check?websiteId=${website.id}`),
        fetch(`/api/user/favorites/check?websiteId=${website.id}`)
      ])

      if (likesResponse.ok) {
        const likesData = await likesResponse.json()
        setIsLiked(likesData.isLiked || false)
      }

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json()
        setIsFavorited(favoritesData.isFavorited || false)
      }
    } catch (error) {
      console.error('Error checking user interactions:', error)
    }
  }

  const handleLike = async () => {
    if (!isSignedIn || !website) {
      toast.error(t('profile.tools.detail.messages.sign_in_to_like'))
      return
    }

    try {
      // 点赞只能增加，不能取消；已点赞则不再重复请求
      if (isLiked) {
        return
      }

      const response = await fetch(`/api/websites/${website.id}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        toast.success(t('profile.tools.detail.messages.added_to_likes'))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(t('profile.tools.detail.messages.failed_to_update_like'))
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn || !website) {
      toast.error(t('profile.tools.detail.messages.sign_in_to_bookmark'))
      return
    }

    try {
      const response = await fetch(`/api/user/favorites${isFavorited ? `?websiteId=${website.id}` : ''}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isFavorited ? undefined : JSON.stringify({ websiteId: website.id })
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? t('profile.tools.detail.messages.removed_from_bookmarks') : t('profile.tools.detail.messages.added_to_bookmarks'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(t('profile.tools.detail.messages.failed_to_update_bookmark'))
    }
  }

  const copyToClipboard = async (text: string) => {
    console.log('Attempting to copy:', text)
    
    // 方法1：尝试现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        console.log('Clipboard API success')
        return true
      } catch (error) {
        console.warn('Clipboard API failed:', error)
      }
    }
    
    // 方法2：降级到传统方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      console.log('execCommand result:', success)
      if (success) {
        return true
      }
    } catch (error) {
      console.warn('execCommand failed:', error)
    }
    
    // 方法3：最简单的降级方案 - 选择地址栏
    try {
      const selection = window.getSelection()
      const range = document.createRange()
      const span = document.createElement('span')
      span.textContent = text
      span.style.position = 'fixed'
      span.style.left = '-9999px'
      document.body.appendChild(span)
      
      range.selectNodeContents(span)
      selection?.removeAllRanges()
      selection?.addRange(range)
      
      const success = document.execCommand('copy')
      document.body.removeChild(span)
      selection?.removeAllRanges()
      
      console.log('Selection method result:', success)
      if (success) {
        return true
      }
    } catch (error) {
      console.warn('Selection method failed:', error)
    }
    
    return false
  }

  const handleShare = async () => {
    if (!website) return
    
    const shareUrl = window.location.href
    console.log('Share URL:', shareUrl)
    
    // 直接尝试复制，不依赖原生分享
    try {
      // 最简单直接的方法
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('common.copy_success'))
      return
    } catch (error) {
      console.warn('Modern clipboard failed:', error)
    }

    // 降级方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      textArea.setSelectionRange(0, 99999)
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (success) {
        toast.success(t('common.copy_success'))
      } else {
        toast.error(t('common.copy_failed') || `复制失败，请手动复制: ${shareUrl}`)
      }
    } catch (error) {
      console.error('All copy methods failed:', error)
      toast.error(t('common.copy_failed') || `复制失败，请手动复制: ${shareUrl}`)
    }
  }

  const handleVisit = () => {
    if (website) {
      window.open(website.url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-64 bg-muted rounded-2xl"></div>
                <div className="h-32 bg-muted rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded-2xl"></div>
                <div className="h-32 bg-muted rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24 md:pb-8">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-foreground">{t('profile.tools.detail.tool_not_found')}</h1>
          <p className="text-muted-foreground">{t('profile.tools.detail.tool_not_found_desc')}</p>
          <Link href="/">
            <Button>
              <Compass className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8"> {/* 移动端底部留空间 */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header Section - Tool Info and Image in Left-Right Layout */}
        <Card className="relative overflow-hidden mb-8 bg-gradient-to-br from-card to-magellan-depth-50 border-magellan-primary/10">
          {/* 微妙的海洋装饰元素 */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] pointer-events-none">
            <div className="w-full h-full bg-gradient-to-bl from-magellan-primary/20 to-transparent"></div>
          </div>
          
          <div className="relative p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Tool Info and Actions */}
              <div className="space-y-6">
                {/* Tool Header */}
                <div className="space-y-5">
                  {/* Logo and Title */}
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    {website.logo_url && (
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white border border-magellan-primary/10 p-2 shadow-sm">
                        <img
                          src={website.logo_url}
                          alt={`${website.title} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Title and Badges */}
                    <div className="flex-1 space-y-3">
                      <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                        {website.title}
                      </h1>

                      {/* Status Badges - 使用 AM.md 中定义的海洋色彩 */}
                      <div className="flex flex-wrap gap-2">
                        {website.is_featured && (
                          <Badge className="bg-magellan-gold/10 text-magellan-gold border-magellan-gold/20 hover:bg-magellan-gold/15">
                            <Crown className="h-3 w-3 mr-1" />
                            {t('profile.tools.detail.badges.featured')}
                          </Badge>
                        )}
                        {website.is_trusted && (
                          <Badge className="bg-magellan-mint/10 text-magellan-mint border-magellan-mint/20 hover:bg-magellan-mint/15">
                            <Shield className="h-3 w-3 mr-1" />
                            {t('profile.tools.detail.badges.verified')}
                          </Badge>
                        )}
                        {website.pricing_model === 'free' && (
                          <Badge className="bg-magellan-mint/10 text-magellan-mint border-magellan-mint/20 hover:bg-magellan-mint/15">
                            {t('profile.tools.detail.badges.free')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tagline优先，如果没有则显示Description */}
                  {(website.tagline || website.description) && (
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                      {website.tagline || website.description}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons - 主按钮使用深海蓝，符合AM.md设计 */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleVisit}
                    className="w-full bg-magellan-primary hover:bg-magellan-primary-hover text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                    size="lg"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    {t('profile.tools.detail.actions.visit_tool')}
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleLike}
                      disabled={isLiked}
                      className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
                    >
                      <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-magellan-coral text-magellan-coral")} />
                      {likesCount}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleFavorite}
                      className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
                    >
                      <Bookmark className={cn("h-4 w-4 mr-2", isFavorited && "fill-magellan-gold text-magellan-gold")} />
                      {t('profile.tools.detail.actions.bookmark')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleShare}
                      className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t('profile.tools.detail.actions.share')}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Tool Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-magellan-primary/5 to-magellan-teal/8 border border-magellan-primary/10 shadow-sm">
                {website.thumbnail ? (
                  <img 
                    src={website.thumbnail} 
                    alt={website.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Map className="h-16 w-16 text-magellan-primary mx-auto opacity-60" />
                      <div>
                        <p className="text-lg font-medium text-magellan-primary">{t('profile.tools.detail.placeholders.no_preview')}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t('profile.tools.detail.placeholders.no_description')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-[80px] sm:top-[85px]">
              <Card className="p-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    {t('profile.tools.detail.navigation.tool_guide')}
                  </h3>
                  <p className="text-sm text-muted-foreground">{t('profile.tools.detail.navigation.explore_sections')}</p>
                </div>
                
                <nav className="space-y-2">
                  {detailSections.map((section) => {
                    const SectionIcon = section.icon
                    
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => {
                          const element = document.getElementById(section.id)
                          if (element) {
                            const headerHeight = window.innerWidth >= 640 ? 85 : 80
                            const yOffset = -headerHeight
                            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
                            window.scrollTo({ top: y, behavior: 'smooth' })
                          }
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

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <StatCard
                    label={t('profile.tools.detail.stats.visits')}
                    value={website.visits.toLocaleString()}
                    icon={Eye}
                    variant="highlight"
                  />
                  <StatCard
                    label={t('profile.tools.detail.stats.likes')}
                    value={likesCount}
                    icon={Heart}
                    variant="success"
                  />
                  <StatCard
                    label={t('profile.tools.detail.stats.quality_score')}
                    value={`${website.quality_score}/100`}
                    icon={Award}
                    variant={website.quality_score >= 80 ? "success" : website.quality_score >= 60 ? "warning" : "default"}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Description and Details Section */}
              <Card id="overview" className="p-6">
                <CardContent className="px-0 space-y-6">
                  {/* Detailed Description - always show */}
                  {website.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        {t('profile.tools.detail.sections.description')}
                      </h3>
                      <div className="p-4 rounded-lg bg-muted/50 border border-magellan-primary/10">
                        <p className="text-muted-foreground leading-relaxed">
                          {website.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {website.email && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Ship className="h-5 w-5 text-primary" />
                        {t('profile.tools.detail.sections.contact')}
                      </h3>
                      <div className="p-3 rounded-lg bg-muted/50 border border-magellan-primary/10">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{t('profile.submit.simple_form.business_email_required').replace(' *', '')}:</span>
                          <a 
                            href={`mailto:${website.email}`}
                            className="text-magellan-primary hover:text-magellan-primary-hover transition-colors"
                          >
                            {website.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Tags */}
                  {website.tags && Array.isArray(website.tags) && website.tags.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        {t('profile.tools.detail.sections.tags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {website.tags && Array.isArray(website.tags) && website.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-magellan-primary/10 text-magellan-primary border-magellan-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Info */}
                  <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Map className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{t('profile.tools.detail.sections.category')}</h4>
                          <div className="text-sm text-muted-foreground">
                            {website.category?.parent ? (
                              <div className="flex items-center gap-1">
                                <span>{website.category.parent.name}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span className="font-medium">{website.category.name}</span>
                              </div>
                            ) : (
                              <span>{website.category?.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link href={`/categories/${website.category?.slug || ''}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Route className="h-4 w-4 mr-2" />
                            {t('profile.tools.detail.actions.explore_category')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Section */}
              {website.features && Array.isArray(website.features) && website.features.length > 0 && (
                <Card id="features" className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      {t('profile.tools.detail.sections.features')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {website.features.map((feature: {name: string, description: string}, index: number) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 border border-magellan-primary/10">
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-lg bg-magellan-primary/10 mt-0.5">
                              <Lightbulb className="h-4 w-4 text-magellan-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-1">{feature.name}</h4>
                              {feature.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Use Cases & Target Audience */}
              {((Array.isArray(website.use_cases) && website.use_cases.length > 0) || (Array.isArray(website.target_audience) && website.target_audience.length > 0)) && (
                <Card id="audience" className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {t('profile.tools.detail.sections.use_cases')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Use Cases */}
                      {Array.isArray(website.use_cases) && website.use_cases.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{t('form.use_cases')}</h3>
                          </div>
                          <div className="space-y-2">
                            {website.use_cases.map((useCase, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm">{useCase}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Target Audience */}
                      {Array.isArray(website.target_audience) && website.target_audience.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{t('form.target_audience')}</h3>
                          </div>
                          <div className="space-y-2">
                            {website.target_audience.map((audience, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm">{audience}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pricing Information */}
              <Card id="pricing" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    {t('profile.tools.detail.sections.pricing_section')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{t('form.pricing_model')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{website.pricing_model.replace('_', ' ')}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{t('form.has_free_version')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {website.has_free_version ? t('profile.tools.detail.status.yes') : t('profile.tools.detail.status.no')}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border border-primary/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{t('form.api_available')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {website.api_available ? t('profile.tools.detail.status.available') : t('profile.tools.detail.status.not_available')}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Plans */}
                  {website.pricing_plans && Array.isArray(website.pricing_plans) && website.pricing_plans.length > 0 && (
                    <div className="pt-6 border-t border-border">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        {t('form.pricing_plans')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {website.pricing_plans.map((plan: any, index: number) => (
                          <div key={index} className="p-4 rounded-lg border border-primary/20 bg-card">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-lg">{plan.name}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="font-medium text-primary text-lg">{plan.price}</span>
                                  <span>/ {plan.billing_cycle}</span>
                                </div>
                              </div>
                              
                              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="font-medium text-sm">{t('form.plan_features')}</h5>
                                  <ul className="space-y-1">
                                    {plan.features.filter((feature: string) => feature.trim()).map((feature: string, featureIndex: number) => (
                                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-3 w-3 text-primary" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media & Integrations */}
              <Card id="social" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Waves className="h-5 w-5 text-primary" />
                    {t('profile.tools.detail.sections.social_integrations')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {/* Social Links */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">{t('profile.tools.detail.sections.social_media')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {website.twitter_url && (
                        <Link href={website.twitter_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </Button>
                        </Link>
                      )}
                      {website.linkedin_url && (
                        <Link href={website.linkedin_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 mr-2" />
                            LinkedIn
                          </Button>
                        </Link>
                      )}
                      {website.facebook_url && (
                        <Link href={website.facebook_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 mr-2" />
                            Facebook
                          </Button>
                        </Link>
                      )}
                      {website.youtube_url && (
                        <Link href={website.youtube_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4 mr-2" />
                            YouTube
                          </Button>
                        </Link>
                      )}
                      {website.discord_url && (
                        <Link href={website.discord_url} target="_blank">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Discord
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Integrations */}
                  {Array.isArray(website.integrations) && website.integrations.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">{t('profile.tools.detail.sections.integrations')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {website.integrations.map((integration, index) => (
                          <Badge key={index} variant="secondary">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Support */}
              <Card id="platforms" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5 text-primary" />
                    {t('profile.tools.detail.sections.platform_support')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  {/* App Downloads Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mobile Apps */}
                    {(website.ios_app_url || website.android_app_url) && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-magellan-primary/8 border border-magellan-primary/15">
                            <Smartphone className="h-5 w-5 text-magellan-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground">{t('form.mobile_apps')}</h3>
                        </div>
                        <div className="space-y-4">
                          {website.ios_app_url && (
                            <Link href={website.ios_app_url} target="_blank">
                              <div className="group p-4 rounded-lg bg-muted/50 border border-magellan-primary/10 hover:border-magellan-primary/20 hover:bg-muted/70 transition-all duration-200 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-magellan-primary/10">
                                    <Smartphone className="h-4 w-4 text-magellan-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-foreground group-hover:text-magellan-primary transition-colors">
                                      {t('form.ios_app_url')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">iOS Application</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </Link>
                          )}
                          {website.android_app_url && (
                            <Link href={website.android_app_url} target="_blank">
                              <div className="group p-4 rounded-lg bg-muted/50 border border-magellan-primary/10 hover:border-magellan-primary/20 hover:bg-muted/70 transition-all duration-200 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-magellan-teal/10">
                                    <Smartphone className="h-4 w-4 text-magellan-teal" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-foreground group-hover:text-magellan-primary transition-colors">
                                      {t('form.android_app_url')}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Android Application</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Web App */}
                    {website.web_app_url && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-magellan-teal/8 border border-magellan-teal/15">
                            <Globe className="h-5 w-5 text-magellan-teal" />
                          </div>
                          <h3 className="font-semibold text-foreground">{t('form.web_app')}</h3>
                        </div>
                        <Link href={website.web_app_url} target="_blank">
                          <div className="group p-4 rounded-lg bg-muted/50 border border-magellan-primary/10 hover:border-magellan-primary/20 hover:bg-muted/70 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-magellan-teal/10">
                                <Globe className="h-4 w-4 text-magellan-teal" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground group-hover:text-magellan-primary transition-colors">
                                  {t('profile.tools.detail.sections.platforms.web_application')}
                                </h4>
                                <p className="text-xs text-muted-foreground">Web Browser Access</p>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}

                    {/* Desktop Apps */}
                    {Array.isArray(website.desktop_platforms) && website.desktop_platforms.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-magellan-coral/8 border border-magellan-coral/15">
                            <Monitor className="h-5 w-5 text-magellan-coral" />
                          </div>
                          <h3 className="font-semibold text-foreground">{t('form.desktop_apps')}</h3>
                        </div>
                        <div className="space-y-4">
                          {website.desktop_platforms.map((platform, index) => (
                            <div key={index} className="p-3 rounded-lg bg-muted/50 border border-magellan-primary/10">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-magellan-coral/10">
                                  {platform === 'mac' && <Laptop className="h-4 w-4 text-magellan-coral" />}
                                  {platform === 'windows' && <Monitor className="h-4 w-4 text-magellan-coral" />}
                                  {platform === 'linux' && <Monitor className="h-4 w-4 text-magellan-coral" />}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-foreground capitalize">{platform}</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    <CheckCircle className="h-3 w-3 text-magellan-mint" />
                                    <span className="text-xs text-muted-foreground">Available</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Info */}
                  <div className="pt-4 border-t border-border">
                    <h3 className="font-semibold mb-3">{t('profile.tools.detail.sections.technical_info')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">{t('profile.tools.detail.sections.technical.ssl_secure')}</span>
                        <Badge variant={website.ssl_enabled ? "default" : "destructive"}>
                          {website.ssl_enabled ? t('profile.tools.detail.status.yes') : t('profile.tools.detail.status.no')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">{t('profile.tools.detail.sections.technical.api_access')}</span>
                        <Badge variant={website.api_available ? "default" : "secondary"}>
                          {website.api_available ? t('profile.tools.detail.status.available') : t('profile.tools.detail.status.not_available')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="text-muted-foreground">{t('profile.tools.detail.sections.technical.discovered')}</span>
                        <span className="text-sm">
                          {new Date(website.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              {Array.isArray(website.faq) && website.faq.length > 0 && (
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {t('form.faq')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    <div className="space-y-4">
                      {website.faq.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-2">{item.question}</h4>
                          <p className="text-muted-foreground text-sm">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card id="reviews" className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    {t('profile.tools.detail.sections.reviews')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  <Reviews websiteId={website.id} websiteTitle={website.title} />
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

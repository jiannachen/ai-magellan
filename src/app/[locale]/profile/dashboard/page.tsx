'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Upload, 
  Heart, 
  TrendingUp, 
  Plus,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Target,
  Trash2
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { toast } from 'sonner'

interface Website {
  id: number
  title: string
  url: string
  description: string
  thumbnail: string | null
  category: {
    name: string
  }
  _count: {
    websiteLikes: number
    websiteFavorites: number
  }
}

interface DashboardStats {
  totalFavorites: number
  totalSubmissions: number
  totalLikes: number
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [favorites, setFavorites] = useState<Website[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalFavorites: 0,
    totalSubmissions: 0,
    totalLikes: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Translation hooks
  const t = useTranslations('common')
  const tProfile = useTranslations('profile.dashboard')
  const tNav = useTranslations('profile.navigation')

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFavorites()
    }
  }, [isLoaded, isSignedIn])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      
      // 获取收藏的工具（前6个）
      const favoritesResponse = await fetch('/api/user/favorites?limit=6')
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json()
        setFavorites(favoritesData.websites)
        setStats(prev => ({ ...prev, totalFavorites: favoritesData.pagination.total }))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (websiteId: number) => {
    try {
      const response = await fetch(`/api/user/favorites?websiteId=${websiteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(website => website.id !== websiteId))
        setStats(prev => ({ ...prev, totalFavorites: prev.totalFavorites - 1 }))
        toast.success(tProfile('unfavorite_success'))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error(tProfile('unfavorite_error'))
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="space-y-8">
        {/* 欢迎区域 - Atlassian简洁风格 */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-[32px] font-medium leading-[40px] tracking-[-0.01em] text-[var(--ds-text)]">
                {tProfile('welcome', { name: user?.firstName || tNav('user') })}
              </h1>
              <p className="text-[16px] leading-[24px] text-muted-foreground">
                {tProfile('welcome_back')}
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 - Atlassian简洁风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-primary mb-2">{tProfile('favorites_tools')}</p>
                    <p className="text-[32px] font-medium leading-[40px] text-[var(--ds-text)]">{stats.totalFavorites}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{tProfile('saved_tools')}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-[8px] flex items-center justify-center">
                    <Bookmark className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-muted-foreground mb-2">{tProfile('my_submissions')}</p>
                    <p className="text-[32px] font-medium leading-[40px] text-[var(--ds-text)]">{stats.totalSubmissions}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{tProfile('submitted_tools')}</p>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-[8px] flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 快速操作 - Atlassian简洁风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
            <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
              <CardTitle className="flex items-center gap-3 text-[20px] font-medium leading-[28px] tracking-[-0.01em]">
                <Target className="h-5 w-5 text-primary" />
                {tProfile('quick_actions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-[24px] pb-[24px]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/submit">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="h-20 border-2 border-dashed border-border/60 hover:border-primary hover:bg-primary/5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <Plus className="h-5 w-5 text-primary transition-all duration-200 group-hover:scale-110" />
                        <span className="text-[14px] font-medium text-[var(--ds-text)]">{tProfile('submit_new_tool')}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
                
                <Link href="/profile/submissions">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <Upload className="h-5 w-5 text-primary transition-all duration-200 group-hover:scale-110" />
                        <span className="text-[14px] font-medium text-[var(--ds-text)]">{tProfile('manage_submissions')}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
                
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary transition-all duration-200 group-hover:scale-110" />
                        <span className="text-[14px] font-medium text-[var(--ds-text)]">{tProfile('discover_tools')}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 最近收藏 - Atlassian简洁风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
            <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-[20px] font-medium leading-[28px] tracking-[-0.01em]">
                  <Bookmark className="h-5 w-5 text-primary" />
                  {tProfile('recent_favorites')}
                </CardTitle>
                {favorites.length > 0 && (
                  <Link href="/profile/favorites">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/5 text-[14px]">
                      {tProfile('view_all')}
                      <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-[24px] pb-[24px]">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="h-12 w-12 bg-fill-quaternary rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-fill-quaternary rounded w-3/4" />
                            <div className="h-3 bg-fill-quaternary rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Bookmark className="h-16 w-16 text-label-quaternary mx-auto mb-4" />
                  <h3 className="text-title3 font-semibold mb-2 text-label-primary">{tProfile('no_favorites')}</h3>
                  <p className="text-subhead text-label-secondary mb-6 max-w-md mx-auto">
                    {tProfile('no_favorites_desc')}
                  </p>
                  <Link href="/">
                    <Button className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {tProfile('go_discover')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((website) => (
                    <motion.div
                      key={website.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group"
                    >
                      <Card className="transition-apple hover:scale-[1.02]">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {website.thumbnail && (
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                <img 
                                  src={website.thumbnail} 
                                  alt={website.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-headline font-semibold truncate text-label-primary group-hover:text-primary transition-apple">
                                {website.title}
                              </h4>
                              <p className="text-subhead text-label-secondary line-clamp-2 mt-1">
                                {website.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-caption1 text-label-tertiary">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {website._count.websiteLikes}
                              </span>
                              <Badge variant="secondary" className="text-caption2 px-2 py-1 bg-fill-quaternary text-label-secondary border-0">
                                {website.category.name}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" asChild className="h-8 px-3">
                                <a 
                                  href={website.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon-sm"
                                onClick={() => removeFavorite(website.id)}
                                className="text-label-tertiary hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfileLayout>
  )
}

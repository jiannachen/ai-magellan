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
  const { isLoaded, isSignedIn } = useUser()
  const [favorites, setFavorites] = useState<Website[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalFavorites: 0,
    totalSubmissions: 0,
    totalLikes: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Translation hooks
  const t = useTranslations('common')
  const tDashboard = useTranslations('dashboard')

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
        toast.success(tDashboard('unfavorite_success'))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error(tDashboard('unfavorite_error'))
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
      <div className="space-y-[24px]">
        {/* 页面标题 - Atlassian风格 */}
        <div>
          <h1 className="text-[32px] font-medium leading-[40px] tracking-[-0.01em] mb-2">
            {tDashboard('title')}
          </h1>
          <p className="text-[16px] leading-[24px] text-muted-foreground">
            {tDashboard('description')}
          </p>
        </div>

        {/* 统计卡片 - Atlassian风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-primary mb-2">{tDashboard('favorite_tools')}</p>
                  <p className="text-[32px] font-medium leading-[40px] text-[var(--ds-text)]">{stats.totalFavorites}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">{tDashboard('saved_tools')}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-[8px] flex items-center justify-center">
                  <Bookmark className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-muted-foreground mb-2">{tDashboard('my_submissions')}</p>
                  <p className="text-[32px] font-medium leading-[40px] text-[var(--ds-text)]">{stats.totalSubmissions}</p>
                  <p className="text-[12px] text-muted-foreground mt-1">{tDashboard('submitted_tools')}</p>
                </div>
                <div className="w-12 h-12 bg-muted rounded-[8px] flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 - Atlassian风格 */}
        <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
          <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
            <CardTitle className="flex items-center gap-2 text-[20px] font-medium leading-[28px] tracking-[-0.01em]">
              <TrendingUp className="h-5 w-5 text-primary" />
              {tDashboard('quick_actions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-[24px] pb-[24px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/submit">
                <Card className="h-20 border-2 border-[#0052CC] bg-white hover:bg-[#E9F2FF] hover:border-[#0747A6] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                  <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                    <Plus className="h-5 w-5 text-[#0052CC]" />
                    <span className="text-[14px] font-medium text-[#172B4D]">{tDashboard('submit_new_tool')}</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/profile/submissions">
                <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                  <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <span className="text-[14px] font-medium text-[var(--ds-text)]">{tDashboard('manage_submissions')}</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/">
                <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer">
                  <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-[14px] font-medium text-[var(--ds-text)]">{tDashboard('discover_tools')}</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 已保存的工具 - Atlassian风格 */}
        <Card className="transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
          <CardHeader className="pb-[16px] px-[24px] pt-[24px]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[20px] font-medium leading-[28px] tracking-[-0.01em]">
                <Bookmark className="h-5 w-5 text-primary" />
                {tDashboard('recent_favorites')}
              </CardTitle>
              {favorites.length > 0 && (
                <Link href="/profile/favorites">
                  <Button variant="ghost" size="sm" className="text-[14px] text-primary hover:bg-primary/5">
                    {tDashboard('view_all')}
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
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-[20px] font-medium leading-[28px] mb-2 text-[var(--ds-text)]">{tDashboard('no_favorites')}</h3>
                <p className="text-[14px] leading-[20px] text-muted-foreground mb-6">
                  {tDashboard('no_favorites_desc')}
                </p>
                <Link href="/">
                  <Button className="h-[40px] px-4 py-2 rounded-[4px] text-[14px] font-medium">
                    {tDashboard('go_discover')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((website) => (
                  <motion.div
                    key={website.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-3 flex-1 min-w-0">
                            {website.thumbnail && (
                              <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={website.thumbnail} 
                                  alt={website.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                                {website.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {website.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {website._count.websiteLikes}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {website.category.name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={website.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {t('visit')}
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFavorite(website.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
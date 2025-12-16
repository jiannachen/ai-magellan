'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Heart,
  ArrowUpRight,
  Sparkles,
  Map,
  Compass,
  Star,
  Route,
  Ship,
  Telescope,
  Flag,
  Waves
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { toast } from '@/hooks/use-toast'
import { StatCard } from '@/components/ui/stat-card'
import { ActionCard } from '@/components/ui/action-card'
import { FavoriteCard } from '@/components/favorites/favorite-card'

interface Website {
  id: number
  title: string
  slug: string
  url: string
  description: string
  thumbnail?: string
  status: "pending" | "approved" | "rejected"
  active: number
  likes: number
  visits: number
  qualityScore: number
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
  const t = useTranslations('common')
  const tProfile = useTranslations('profile')

  const fetchFavorites = useCallback(async () => {
    const response = await fetch('/api/user/favorites?limit=6')
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.status}`)
    }
    const data = await response.json()
    setFavorites(data.websites || [])
  }, [])

  const fetchStats = useCallback(async () => {
    const response = await fetch('/api/user/stats')
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`)
    }
    const data = await response.json()
    setStats(data.data || {
      totalFavorites: 0,
      totalSubmissions: 0,
      totalLikes: 0
    })
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const results = await Promise.allSettled([
        fetchFavorites(),
        fetchStats()
      ])

      // 检查是否有失败的请求
      const failedRequests = results.filter(result => result.status === 'rejected')
      if (failedRequests.length > 0) {
        failedRequests.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Request ${index} failed:`, result.reason)
          }
        })
        toast.error('Some data failed to load')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [fetchFavorites, fetchStats])

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData()
    }
  }, [isSignedIn, fetchDashboardData])

  const removeFavorite = async (websiteId: number) => {
    try {
      const response = await fetch(`/api/user/favorites?websiteId=${websiteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavorites(prev => prev.filter(website => website.id !== websiteId))
        setStats(prev => ({ ...prev, totalFavorites: prev.totalFavorites - 1 }))
        toast.success(tProfile('dashboard.unfavorite_success'))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error(tProfile('dashboard.unfavorite_error'))
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

  if (loading) {
    return (
      <ProfileLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8 animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-24 bg-muted rounded-xl"></div>
              <div className="h-24 bg-muted rounded-xl"></div>
              <div className="h-24 bg-muted rounded-xl"></div>
            </div>
            <div className="h-64 bg-muted rounded-xl"></div>
          </div>
        </div>
      </ProfileLayout>
    )
  }


  return (
    <ProfileLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header - 移动端优化 */}
        <div>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
              <Ship className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                {tProfile('dashboard.welcome', { name: user?.firstName || 'User' })}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">{tProfile('dashboard.welcome_back')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Stats Overview - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <StatCard
                label={tProfile('dashboard.stats.bookmarked_tools')}
                value={stats.totalFavorites}
                description={tProfile('dashboard.stats.collected_favorites')}
                icon={Bookmark}
                variant="highlight"
              />
              <StatCard
                label={tProfile('dashboard.stats.submitted_tools')}
                value={stats.totalSubmissions}
                description={tProfile('dashboard.stats.discoveries_shared')}
                icon={Map}
                variant="highlight"
              />
              <StatCard
                label={tProfile('dashboard.stats.endorsed_tools')}
                value={stats.totalLikes}
                description={tProfile('dashboard.stats.users_helped')}
                icon={Heart}
                variant="highlight"
              />
            </div>
          </motion.div>

          {/* Quick Actions - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {tProfile('dashboard.quick_actions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <ActionCard
                    title={tProfile('dashboard.actions.submit_new_tool')}
                    description={tProfile('dashboard.actions.share_tool')}
                    icon={Telescope}
                    variant="dashed"
                    onClick={() => window.location.href = '/submit'}
                  />
                  <ActionCard
                    title={tProfile('dashboard.actions.review_submissions')}
                    description={tProfile('dashboard.actions.manage_tools')}
                    icon={Flag}
                    onClick={() => window.location.href = '/profile/submissions'}
                  />
                  <ActionCard
                    title={tProfile('dashboard.actions.browse_tools')}
                    description={tProfile('dashboard.actions.discover_tools')}
                    icon={Route}
                    onClick={() => window.location.href = '/'}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Bookmarks - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {tProfile('dashboard.recent_favorites')}
                </CardTitle>
                <Link href="/profile/favorites" className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Waves className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{tProfile('dashboard.actions.view_all_favorites')}</span>
                    <span className="sm:hidden">{tProfile('dashboard.actions.view_all')}</span>
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="space-y-4">
                      <div className="relative">
                        <Bookmark className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary absolute -top-1 -right-1" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-foreground">
                        {tProfile('dashboard.no_favorites')}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                        {tProfile('dashboard.no_favorites_desc')}
                      </p>
                      <div className="pt-4">
                        <Link href="/">
                          <Button className="w-full sm:w-auto">
                            <Compass className="h-4 w-4 mr-2" />
                            {tProfile('dashboard.actions.get_started')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                    {favorites.map((website, index) => (
                      <motion.div
                        key={website.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <FavoriteCard
                          website={website}
                          onRemove={removeFavorite}
                          visitLabel={tProfile('dashboard.actions.browse')}
                          removeLabel={tProfile('favorites.actions.remove')}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </ProfileLayout>
  )
}
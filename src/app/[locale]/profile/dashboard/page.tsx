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
  Trash2,
  Map,
  Compass,
  Star,
  Eye,
  Route,
  Users,
  Ship,
  Telescope,
  Flag,
  Waves,
  Home,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { toast } from '@/hooks/use-toast'
import { StatCard } from '@/components/ui/stat-card'
import { ActionCard } from '@/components/ui/action-card'

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
  const t = useTranslations('common')
  const tProfile = useTranslations('profile')

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardData()
    }
  }, [isSignedIn])

  const fetchDashboardData = async () => {
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
  }

  const fetchFavorites = async () => {
    const response = await fetch('/api/user/favorites')
    if (!response.ok) {
      throw new Error(`Failed to fetch favorites: ${response.status}`)
    }
    const data = await response.json()
    setFavorites(data.data?.slice(0, 6) || [])
  }

  const fetchStats = async () => {
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Ship className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {tProfile('dashboard.welcome', { name: user?.firstName || 'User' })}
              </h1>
              <p className="text-muted-foreground">{tProfile('dashboard.welcome_back')}</p>
            </div>
          </div>

        </div>

        <div className="space-y-8">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {tProfile('dashboard.quick_actions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* Recent Bookmarks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  {tProfile('dashboard.recent_favorites')}
                </CardTitle>
                <Link href="/profile/favorites">
                  <Button variant="outline" size="sm">
                    <Waves className="h-4 w-4 mr-2" />
                    {tProfile('dashboard.actions.view_all_favorites')}
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <div className="relative">
                        <Bookmark className="h-16 w-16 text-muted-foreground mx-auto" />
                        <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">
                        {tProfile('dashboard.no_favorites')}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {tProfile('dashboard.no_favorites_desc')}
                      </p>
                      <div className="pt-4">
                        <Link href="/">
                          <Button>
                            <Compass className="h-4 w-4 mr-2" />
                            {tProfile('dashboard.actions.get_started')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((website) => (
                      <Card key={website.id} className="group hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Tool Image */}
                            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/5 to-magellan-teal/5 border border-primary/10 flex items-center justify-center overflow-hidden">
                              {website.thumbnail ? (
                                <img 
                                  src={website.thumbnail} 
                                  alt={website.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Map className="h-8 w-8 text-primary" />
                              )}
                            </div>

                            {/* Tool Info */}
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                  {website.title}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFavorite(website.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {website.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {website.category.name}
                                </Badge>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    {website._count.websiteLikes}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Bookmark className="h-3 w-3" />
                                    {website._count.websiteFavorites}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Link href={`/tools/${website.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {tProfile('dashboard.actions.browse')}
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className=""
                                onClick={() => window.open(website.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
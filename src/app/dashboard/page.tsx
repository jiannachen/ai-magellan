'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Upload, 
  Heart, 
  TrendingUp, 
  Plus,
  ExternalLink,
  Calendar,
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
        toast.success('已取消收藏')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('取消收藏失败')
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">欢迎回来！查看您的收藏和活动概览。</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">收藏工具</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalFavorites}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">快速操作</p>
                  <p className="text-sm font-medium text-muted-foreground">提交和管理工具</p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">发现工具</p>
                  <p className="text-sm font-medium text-muted-foreground">探索更多AI工具</p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/submit">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <Plus className="h-5 w-5" />
                  <span>提交新工具</span>
                </Button>
              </Link>
              <Link href="/profile/submissions">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <Upload className="h-5 w-5" />
                  <span>我的提交</span>
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <TrendingUp className="h-5 w-5" />
                  <span>发现工具</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 已保存的工具 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                已保存的工具
              </CardTitle>
              {favorites.length > 0 && (
                <Link href="/profile/favorites">
                  <Button variant="ghost" size="sm">
                    查看全部
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">还没有保存任何工具</h3>
                <p className="text-muted-foreground mb-4">
                  去发现一些优质的AI工具并收藏它们吧！
                </p>
                <Link href="/">
                  <Button>去发现工具</Button>
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
                              访问
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
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
      <div className="space-y-8">
        {/* 欢迎区域 - Apple简洁风格 */}
        <div className="py-8">
          <div className="flex items-center gap-4 mb-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-largeTitle font-semibold text-label-primary">
                你好，{user?.firstName || '用户'}!
              </h1>
              <p className="text-title3 text-label-secondary font-normal">
                欢迎回到你的AI工具中心
              </p>
            </div>
          </div>
        </div>

        {/* 统计卡片 - Apple简洁风格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="transition-apple hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-subhead font-medium text-primary mb-1">收藏工具</p>
                    <p className="text-title1 font-semibold text-label-primary">{stats.totalFavorites}</p>
                    <p className="text-caption1 text-label-tertiary mt-1">已保存的工具</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
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
            <Card className="transition-apple hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-subhead font-medium text-label-secondary mb-1">快速操作</p>
                    <p className="text-headline font-semibold text-label-primary">提交工具</p>
                    <p className="text-caption1 text-label-tertiary mt-1">分享新发现</p>
                  </div>
                  <div className="w-12 h-12 bg-fill-quaternary rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-label-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="transition-apple hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-subhead font-medium text-label-secondary mb-1">发现更多</p>
                    <p className="text-headline font-semibold text-label-primary">新工具</p>
                    <p className="text-caption1 text-label-tertiary mt-1">探索AI世界</p>
                  </div>
                  <div className="w-12 h-12 bg-fill-quaternary rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-label-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 快速操作 - Apple简洁风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-headline">
                <Target className="h-5 w-5 text-primary" />
                快速操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/submit">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="h-20 border-2 border-dashed border-fill-tertiary hover:border-primary hover:bg-primary/5 transition-apple cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <Plus className="h-5 w-5 text-primary transition-apple group-hover:scale-110" />
                        <span className="text-subhead font-medium text-label-primary">提交新工具</span>
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
                    <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-apple cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <Upload className="h-5 w-5 text-primary transition-apple group-hover:scale-110" />
                        <span className="text-subhead font-medium text-label-primary">我的提交</span>
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
                    <Card className="h-20 hover:border-primary/30 hover:bg-primary/5 transition-apple cursor-pointer">
                      <CardContent className="h-full flex flex-col items-center justify-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary transition-apple group-hover:scale-110" />
                        <span className="text-subhead font-medium text-label-primary">发现工具</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 最近收藏 - Apple简洁风格 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-headline">
                  <Bookmark className="h-5 w-5 text-primary" />
                  最近收藏
                </CardTitle>
                {favorites.length > 0 && (
                  <Link href="/profile/favorites">
                    <Button variant="ghost" size="sm" className="gap-2 text-primary">
                      查看全部
                      <ArrowUpRight className="h-3 w-3" />
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
                  <h3 className="text-title3 font-semibold mb-2 text-label-primary">还没有收藏任何工具</h3>
                  <p className="text-subhead text-label-secondary mb-6 max-w-md mx-auto">
                    去发现一些优质的AI工具并收藏它们吧！
                  </p>
                  <Link href="/">
                    <Button className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      去发现工具
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
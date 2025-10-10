'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Heart, Bookmark, Globe, Trash2, TrendingUp } from 'lucide-react'
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
  status: string
  visits: number
  likes: number
  quality_score: number
  is_featured: boolean
  created_at: string
  category: {
    id: number
    name: string
    slug: string
  }
  _count: {
    websiteLikes: number
    websiteFavorites: number
  }
}

interface FavoritesResponse {
  websites: Website[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MyFavoritesPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [favorites, setFavorites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFavorites()
    }
  }, [isLoaded, isSignedIn])

  const fetchFavorites = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/favorites?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data: FavoritesResponse = await response.json()
      setFavorites(data.websites)
      setPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        pages: data.pagination.pages
      })
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError('加载收藏失败')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (websiteId: number) => {
    try {
      const response = await fetch(`/api/user/favorites?websiteId=${websiteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      // 从列表中移除
      setFavorites(prev => prev.filter(website => website.id !== websiteId))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      
      toast.success('已取消收藏')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('取消收藏失败')
    }
  }

  if (!isLoaded) {
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

  if (!isSignedIn) {
    return (
      <ProfileLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>需要登录</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                请先登录以查看您的收藏。
              </p>
              <Link href="/auth/signin">
                <Button>立即登录</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="space-y-8">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              我的收藏
            </h1>
            <p className="text-muted-foreground text-lg">管理您收藏的AI工具，随时访问喜爱的资源</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
              <Globe className="h-4 w-4" />
              发现更多工具
            </Button>
          </Link>
        </div>

        {/* 统计信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-2">收藏工具</p>
                  <p className="text-4xl font-bold text-blue-700 mb-1">{pagination.total}</p>
                  <p className="text-muted-foreground">已保存到您的收藏库</p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg" />
                  <div className="relative h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bookmark className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
              {/* 装饰背景 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
            </CardContent>
          </Card>
        </motion.div>

        {/* 收藏列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive/20">
              <CardContent className="p-8 text-center">
                <div className="text-destructive mb-4 text-lg font-medium">{error}</div>
                <Button onClick={() => fetchFavorites()} variant="outline">
                  重试
                </Button>
              </CardContent>
            </Card>
          ) : favorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-muted/20 rounded-full blur-3xl" />
                  <Bookmark className="relative h-20 w-20 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">还没有收藏任何工具</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                  去发现一些优质的AI工具并收藏它们吧！探索无限可能，构建您的专属工具库。
                </p>
                <Link href="/">
                  <Button size="lg" className="gap-2">
                    <TrendingUp className="h-5 w-5" />
                    去发现工具
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {favorites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-5 flex-1">
                          {/* 缩略图 */}
                          {website.thumbnail ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                              <img 
                                src={website.thumbnail} 
                                alt={website.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                              <Globe className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* 内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors leading-tight">
                                {website.title}
                              </h3>
                              {website.is_featured && (
                                <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                                  ✨ 精选
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                              {website.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Heart className="h-4 w-4" />
                                <span className="font-medium">{website._count.websiteLikes}</span>
                                <span>点赞</span>
                              </span>
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Bookmark className="h-4 w-4" />
                                <span className="font-medium">{website._count.websiteFavorites}</span>
                                <span>收藏</span>
                              </span>
                              <Badge variant="outline" className="bg-background">
                                {website.category.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* 操作按钮 */}
                        <div className="flex items-center gap-3 ml-6 flex-shrink-0">
                          <Button 
                            size="default" 
                            asChild
                            className="gap-2 hover:bg-primary/90"
                          >
                            <a 
                              href={website.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              访问
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="default"
                            onClick={() => removeFavorite(website.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            取消收藏
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* 分页 */}
              {pagination.pages > 1 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center items-center gap-4 mt-12"
                >
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => fetchFavorites(pagination.page - 1)}
                    className="gap-2"
                  >
                    上一页
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      第 <span className="font-medium text-foreground">{pagination.page}</span> 页，
                      共 <span className="font-medium text-foreground">{pagination.pages}</span> 页
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => fetchFavorites(pagination.page + 1)}
                    className="gap-2"
                  >
                    下一页
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </ProfileLayout>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Plus, 
  Star, 
  DollarSign, 
  Shield, 
  Clock, 
  TrendingUp,
  ExternalLink,
  Heart,
  Bookmark,
  Globe,
  Award,
  Check,
  Minus
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { Separator } from '@/ui/common/separator'
import { cn } from '@/lib/utils/utils'
import Link from 'next/link'

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
  features: string[] | null
  pricing_model: string
  has_free_version: boolean
  base_price: string | null
  ssl_enabled: boolean
  response_time: number | null
  domain_authority: number | null
  created_at: string
  _count: {
    websiteLikes: number
    websiteFavorites: number
  }
}

interface CompareModalProps {
  isOpen: boolean
  onClose: () => void
  compareList: number[]
  onRemoveFromCompare: (id: number) => void
}

export function CompareModal({ isOpen, onClose, compareList, onRemoveFromCompare }: CompareModalProps) {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && compareList.length > 0) {
      fetchWebsites()
    }
  }, [isOpen, compareList])

  const fetchWebsites = async () => {
    if (compareList.length === 0) return

    try {
      setLoading(true)
      const promises = compareList.map(id => 
        fetch(`/api/websites/${id}`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setWebsites(results.filter(Boolean))
    } catch (error) {
      console.error('Error fetching websites for comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPricingDisplay = (website: Website) => {
    if (website.pricing_model === 'free') return '免费'
    if (website.has_free_version && website.base_price) return `免费试用 • ${website.base_price}`
    if (website.base_price) return website.base_price
    return website.pricing_model === 'paid' ? '付费' : '联系销售'
  }

  const getFeatureStatus = (website: Website, featureCheck: (w: Website) => boolean) => {
    return featureCheck(website)
  }

  const comparisonFeatures = [
    {
      label: '质量评分',
      key: 'quality_score',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{website.quality_score}/100</span>
        </div>
      )
    },
    {
      label: '定价',
      key: 'pricing',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span>{getPricingDisplay(website)}</span>
        </div>
      )
    },
    {
      label: '可信状态',
      key: 'is_trusted',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          {website.is_trusted ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600">可信</span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">普通</span>
            </>
          )}
        </div>
      )
    },
    {
      label: 'SSL安全',
      key: 'ssl_enabled',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          {website.ssl_enabled ? (
            <>
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-green-600">已启用</span>
            </>
          ) : (
            <>
              <Minus className="h-4 w-4 text-red-500" />
              <span className="text-red-600">未启用</span>
            </>
          )}
        </div>
      )
    },
    {
      label: '响应时间',
      key: 'response_time',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>{website.response_time ? `${website.response_time}ms` : '未知'}</span>
        </div>
      )
    },
    {
      label: '访问量',
      key: 'visits',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-500" />
          <span>{website.visits}</span>
        </div>
      )
    },
    {
      label: '点赞数',
      key: 'likes',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span>{website._count?.websiteLikes || 0}</span>
        </div>
      )
    },
    {
      label: '收藏数',
      key: 'favorites',
      render: (website: Website) => (
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-blue-500" />
          <span>{website._count?.websiteFavorites || 0}</span>
        </div>
      )
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">工具对比</h2>
              <p className="text-muted-foreground mt-1">
                比较 {websites.length} 个工具的详细信息
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载对比数据...</p>
            </div>
          ) : websites.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">请先选择要对比的工具</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground sticky left-0 bg-background">
                      对比项目
                    </th>
                    {websites.map((website) => (
                      <th key={website.id} className="p-4 min-w-[280px]">
                        <Card className="text-left">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              {website.thumbnail ? (
                                <img 
                                  src={website.thumbnail}
                                  alt={website.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  <Globe className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">{website.title}</h3>
                                  {website.is_featured && (
                                    <Award className="h-4 w-4 text-yellow-500" />
                                  )}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {website.category.name}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveFromCompare(website.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {website.description}
                            </p>
                            
                            <div className="flex items-center gap-2">
                              <Link href={`/tools/${website.id}`}>
                                <Button variant="outline" size="sm" className="flex-1 text-xs">
                                  查看详情
                                </Button>
                              </Link>
                              <Button size="sm" asChild className="flex-1 text-xs">
                                <a 
                                  href={website.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  访问
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={feature.key} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="p-4 font-medium sticky left-0 bg-background border-r border-border">
                        {feature.label}
                      </td>
                      {websites.map((website) => (
                        <td key={website.id} className="p-4 text-center">
                          {feature.render(website)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* 主要特点对比 */}
                  <tr>
                    <td className="p-4 font-medium sticky left-0 bg-background border-r border-border">
                      主要特点
                    </td>
                    {websites.map((website) => {
                      const features = website.features ? (Array.isArray(website.features) ? website.features : JSON.parse(website.features as string)) : []
                      return (
                        <td key={website.id} className="p-4">
                          <div className="space-y-2 text-left">
                            {features.length > 0 ? (
                              features.slice(0, 3).map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">暂无信息</span>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
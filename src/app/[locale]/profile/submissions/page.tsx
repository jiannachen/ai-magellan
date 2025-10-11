'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Edit, ExternalLink, Heart, Bookmark, Calendar, Globe, ArrowLeft, CheckCircle, Clock, Upload } from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { ProfileLayout } from '@/components/profile/profile-layout'

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

interface SubmissionsResponse {
  websites: Website[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MySubmissionsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [submissions, setSubmissions] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  })
  
  // Translation hooks
  const t = useTranslations('common')
  const tProfile = useTranslations('profile.submissions')
  const tWebsite = useTranslations('website')

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubmissions()
    }
  }, [isLoaded, isSignedIn])

  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/submissions?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data: SubmissionsResponse = await response.json()
      setSubmissions(data.websites)
      setPagination({
        page: data.pagination.page,
        total: data.pagination.total,
        pages: data.pagination.pages
      })
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError(tProfile('load_error'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: tProfile('status_pending'), variant: 'secondary' as const },
      approved: { label: tProfile('status_approved'), variant: 'default' as const },
      rejected: { label: tProfile('status_rejected'), variant: 'destructive' as const }
    }
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }
  }

  if (!isLoaded) {
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

  if (!isSignedIn) {
    return (
      <ProfileLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>{tProfile('login_required')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {tProfile('login_description')}
              </p>
              <Link href="/auth/signin">
                <Button>{tProfile('login_now')}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="p-6 space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{tProfile('title')}</h1>
            <p className="text-muted-foreground">{tProfile('description')}</p>
          </div>
          <Link href="/submit">
            <Button>
              <Globe className="h-4 w-4 mr-2" />
              {tProfile('submit_new_tool')}
            </Button>
          </Link>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{tProfile('total_submissions')}</p>
                  <p className="text-2xl font-bold text-primary">{pagination.total}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{tProfile('approved')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {submissions.filter(w => w.status === 'approved').length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{tProfile('pending_review')}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {submissions.filter(w => w.status === 'pending').length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 提交列表 */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => fetchSubmissions()}>{tProfile('retry')}</Button>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">{tProfile('no_submissions')}</h3>
              <p className="text-muted-foreground mb-4">
                {tProfile('no_submissions_desc')}
              </p>
              <Link href="/submit">
                <Button>{tProfile('submit_first_tool')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((website) => (
              <motion.div
                key={website.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                            {website.title}
                          </h3>
                          {website.is_featured && (
                            <Badge variant="default">{tWebsite('featured')}</Badge>
                          )}
                          <Badge {...getStatusBadge(website.status)}>
                            {getStatusBadge(website.status).label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {website.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(website.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {website._count.websiteLikes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {website._count.websiteFavorites}
                          </span>
                          <Badge variant="outline">{website.category.name}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={website.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/profile/submissions/${website.id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* 分页 */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => fetchSubmissions(pagination.page - 1)}
                >
                  {t('previous')}
                </Button>
                <span className="flex items-center px-4">
                  {tProfile('page_info', { current: pagination.page, total: pagination.pages })}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchSubmissions(pagination.page + 1)}
                >
                  {t('next')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}

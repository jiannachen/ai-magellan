'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GlobalLoading from '@/components/loading/global-loading'
import {
  Edit,
  ExternalLink,
  Heart,
  Bookmark,
  Calendar,
  CheckCircle,
  Clock,
  Upload,
  Map,
  Compass,
  Anchor,
  Ship,
  Crown,
  Telescope,
  Route,
  Eye,
  Star,
  Waves,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { StatCard } from '@/components/ui/stat-card'
import { WebsiteThumbnail } from '@/components/website/website-thumbnail'

interface Website {
  id: number
  title: string
  slug: string
  url: string
  description: string
  thumbnail?: string
  logoUrl?: string
  status: string
  visits: number
  likes: number
  qualityScore: number
  isFeatured?: boolean
  createdAt: string
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
  const tProfile = useTranslations('profile')
  const tWebsite = useTranslations('website')

  const fetchSubmissions = useCallback(async (page = 1) => {
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
      setError(tProfile('submissions.load_error'))
    } finally {
      setLoading(false)
    }
  }, [tProfile])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchSubmissions()
    }
  }, [isLoaded, isSignedIn, fetchSubmissions])

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { 
        label: `🟡 ${tProfile('submissions.status_pending')}`, 
        variant: 'secondary' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      },
      approved: { 
        label: `🟢 ${tProfile('submissions.status_approved')}`, 
        variant: 'default' as const,
        className: 'bg-green-50 text-green-700 border-green-200'
      },
      rejected: { 
        label: `🔴 ${tProfile('submissions.status_rejected')}`, 
        variant: 'destructive' as const,
        className: 'bg-red-50 text-red-700 border-red-200'
      }
    }
    
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const,
      className: ''
    }
  }

  if (!isLoaded) {
    return (
      <ProfileLayout>
        <GlobalLoading variant="default" />
      </ProfileLayout>
    )
  }

  if (!isSignedIn) {
    return (
      <ProfileLayout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                {tProfile('submissions.login_required')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {tProfile('submissions.login_description')}
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">
                  <Ship className="h-4 w-4 mr-2" />
                  {tProfile('submissions.login_now')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header - 移动端优化 */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                <Map className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">{tProfile('submissions.title')}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">{tProfile('submissions.description')}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/submit" className="block w-full sm:w-auto">
                <Button className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tProfile('dashboard.actions.submit_new_tool')}</span>
                  <span className="sm:hidden">Submit Tool</span>
                </Button>
              </Link>
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
                label={`⚓ ${tProfile('submissions.total_submissions')}`}
                value={pagination.total}
                description={tProfile('submissions.total_submissions')}
                icon={Map}
                variant="highlight"
              />
              <StatCard
                label={`✅ ${tProfile('submissions.approved')}`}
                value={submissions.filter(w => w.status === 'approved').length}
                description={tProfile('submissions.approved')}
                icon={CheckCircle}
                variant="highlight"
              />
              <StatCard
                label={`🟡 ${tProfile('submissions.pending_review')}`}
                value={submissions.filter(w => w.status === 'pending').length}
                description={tProfile('submissions.pending_review')}
                icon={Clock}
                variant="highlight"
              />
            </div>
          </motion.div>

          {/* Submissions List - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Ship className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {tProfile('submissions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                          <div className="w-16 h-16 bg-muted rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <Compass className="h-16 w-16 text-muted-foreground mx-auto" />
                      <h3 className="text-lg font-medium text-foreground">
                        {tProfile('submissions.load_error')}
                      </h3>
                      <p className="text-muted-foreground">{error}</p>
                      <Button onClick={() => fetchSubmissions()}>
                        <Route className="h-4 w-4 mr-2" />
                        {tProfile('submissions.retry')}
                      </Button>
                    </div>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="space-y-4">
                      <div className="relative">
                        <Map className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
                        <Waves className="h-6 w-6 sm:h-8 sm:w-8 text-primary absolute -bottom-2 -right-2" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-foreground">
                        {tProfile('submissions.no_submissions')}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                        {tProfile('submissions.no_submissions_desc')}
                      </p>
                      <Link href="/submit" className="mt-8 inline-block">
                        <Button className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white w-full sm:w-auto">
                          <Telescope className="h-4 w-4 mr-2" />
                          {tProfile('submissions.submit_first_tool')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {submissions.map((website, index) => (
                      <motion.div
                        key={website.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-200">
                          {/* Tool Image - 移动端优化 */}
                          <WebsiteThumbnail
                            url={website.url}
                            thumbnail={website.thumbnail}
                            logoUrl={website.logoUrl}
                            title={website.title}
                            className="w-full sm:w-16 h-32 sm:h-16 rounded-lg flex-shrink-0"
                          />

                          {/* Tool Info - 移动端优化 */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors truncate">
                                {website.title}
                              </h3>
                              {website.isFeatured && (
                                <Badge className="bg-magellan-gold/20 text-magellan-gold border-magellan-gold/30 text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  {tWebsite('featured')}
                                </Badge>
                              )}
                              <Badge className={getStatusBadge(website.status).className + " text-xs"}>
                                {getStatusBadge(website.status).label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                              {website.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="hidden sm:inline">{new Date(website.createdAt).toLocaleDateString()}</span>
                                <span className="sm:hidden">{new Date(website.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {website.visits}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {website._count.websiteLikes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bookmark className="h-3 w-3" />
                                {website._count.websiteFavorites}
                              </span>
                              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                {website.category.name}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs hidden sm:flex">
                                <Star className="h-3 w-3" />
                                {website.qualityScore}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons - 移动端优化 */}
                          <div className="flex sm:flex-col items-center gap-2 sm:ml-4 flex-shrink-0">
                            <Link href={`/tools/${website.slug}`} className="flex-1 sm:flex-none w-full sm:w-auto">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                <Eye className="h-3 w-3 mr-1" />
                                {t('view')}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => window.open(website.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                              <Link href={`/profile/submissions/${website.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Pagination - 移动端优化 */}
                    {pagination.pages > 1 && (
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-8 pt-6 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === 1}
                          onClick={() => fetchSubmissions(pagination.page - 1)}
                          className="w-full sm:w-auto"
                        >
                          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                          {t('previous')}
                        </Button>
                        <div className="flex items-center px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                          {tProfile('submissions.page_info', { current: pagination.page, total: pagination.pages })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.page === pagination.pages}
                          onClick={() => fetchSubmissions(pagination.page + 1)}
                          className="w-full sm:w-auto"
                        >
                          {t('next')}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
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
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{tProfile('submissions.title')}</h1>
                <p className="text-muted-foreground">{tProfile('submissions.description')}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link href="/submit">
                <Button className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  {tProfile('dashboard.actions.submit_new_tool')}
                </Button>
              </Link>
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

          {/* Submissions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
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
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <div className="relative">
                        <Map className="h-16 w-16 text-muted-foreground mx-auto" />
                        <Waves className="h-8 w-8 text-primary absolute -bottom-2 -right-2" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">
                        {tProfile('submissions.no_submissions')}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {tProfile('submissions.no_submissions_desc')}
                      </p>
                      <Link href="/submit" className="mt-8 inline-block">
                        <Button className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white">
                          <Telescope className="h-4 w-4 mr-2" />
                          {tProfile('submissions.submit_first_tool')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((website, index) => (
                      <motion.div
                        key={website.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all duration-200">
                          {/* Tool Image */}
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/5 to-magellan-teal/5 border border-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {website.thumbnail ? (
                              <img 
                                src={website.thumbnail} 
                                alt={website.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Map className="h-6 w-6 text-primary" />
                            )}
                          </div>

                          {/* Tool Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {website.title}
                              </h3>
                              {website.is_featured && (
                                <Badge className="bg-magellan-gold/20 text-magellan-gold border-magellan-gold/30">
                                  <Crown className="h-3 w-3 mr-1" />
                                  {tWebsite('featured')}
                                </Badge>
                              )}
                              <Badge className={getStatusBadge(website.status).className}>
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
                              <Badge variant="outline" className="text-xs">
                                {website.category.name}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="h-3 w-3" />
                                {website.quality_score}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <Link href={`/tools/${website.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                {t('view')}
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
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/profile/submissions/${website.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-border">
                        <Button
                          variant="outline"
                          disabled={pagination.page === 1}
                          onClick={() => fetchSubmissions(pagination.page - 1)}
                        >
                          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                          {t('previous')}
                        </Button>
                        <div className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                          {tProfile('submissions.page_info', { current: pagination.page, total: pagination.pages })}
                        </div>
                        <Button
                          variant="outline"
                          disabled={pagination.page === pagination.pages}
                          onClick={() => fetchSubmissions(pagination.page + 1)}
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
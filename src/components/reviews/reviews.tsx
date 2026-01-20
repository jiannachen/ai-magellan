'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  User, 
  MessageCircle, 
  ThumbsUp, 
  Flag,
  Trash2,
  Edit3,
  Send
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { Textarea } from '@/ui/common/textarea'
import { Separator } from '@/ui/common/separator'
import { toast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/utils'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface ReviewStats {
  avgRating: number
  totalReviews: number
}

interface ReviewsProps {
  websiteId: number
  websiteTitle: string
}

export function Reviews({ websiteId, websiteTitle }: ReviewsProps) {
  const { isSignedIn, user } = useUser()
  const t = useTranslations()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ avgRating: 0, totalReviews: 0 })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // 表单状态
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [websiteId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/websites/${websiteId}/reviews`)
      if (response.ok) {
        const data = await response.json() as { reviews: Review[]; stats: ReviewStats }
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error(t('reviews.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!isSignedIn) {
      toast.error(t('reviews.login_required'))
      return
    }

    if (!comment.trim()) {
      toast.error(t('reviews.content_required'))
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/websites/${websiteId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() })
      })

      if (response.ok) {
        const newReview = await response.json() as Review
        
        // 更新评论列表
        setReviews(prev => {
          const filtered = prev.filter(r => r.user.id !== user?.id)
          return [newReview, ...filtered]
        })
        
        // 重新计算统计
        await fetchReviews()
        
        // 重置表单
        setComment('')
        setRating(5)
        setShowForm(false)
        setEditingReview(null)
        
        toast.success(editingReview ? t('reviews.update_success') : t('reviews.submit_success'))
      } else {
        throw new Error('Submit failed')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(t('reviews.submit_error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setRating(review.rating)
    setComment(review.comment || '')
    setShowForm(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t('reviews.delete_confirmation'))) return

    try {
      // 后端删除接口为 DELETE /api/websites/[id]/reviews，基于 userId + websiteId
      const response = await fetch(`/api/websites/${websiteId}/reviews`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
        await fetchReviews()
        toast.success(t('reviews.delete_success'))
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error(t('reviews.delete_error'))
    }
  }

  const renderStars = (currentRating: number, interactive = false, size = 'default', showLabel = false) => {
    const starSize = size === 'small' ? 'h-4 w-4' : 'h-5 w-5'
    const currentHoverRating = interactive ? (hoveredStar || rating) : currentRating
    
    return (
      <div className="flex items-center gap-1">
        <div 
          className="flex items-center gap-1"
          onMouseLeave={() => interactive && setHoveredStar(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && setRating(star)}
              onMouseEnter={() => interactive && setHoveredStar(star)}
              className={cn(
                "transition-colors duration-200",
                interactive && "subtle-scale cursor-pointer hover:scale-110"
              )}
              title={interactive ? t(`reviews.rating_labels.${star}`) : undefined}
            >
              <Star
                className={cn(
                  starSize,
                  star <= currentHoverRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {showLabel && interactive && (hoveredStar || rating) && (
          <span className="text-sm text-muted-foreground ml-2">
            {t(`reviews.rating_labels.${hoveredStar || rating}`)}
          </span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('reviews.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t('reviews.title')}
          </CardTitle>
          {isSignedIn && !showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-2 w-fit self-start sm:self-auto"
            >
              <Edit3 className="h-4 w-4" />
              {t('reviews.write_review')}
            </Button>
          )}
        </div>
        
        {/* 评分统计 */}
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              {renderStars(stats.avgRating)}
              <span className="text-lg font-semibold">{stats.avgRating}</span>
              <span className="text-sm text-muted-foreground">
                {t('reviews.reviews_count', { count: stats.totalReviews })}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 评论表单 */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 p-4 border rounded-lg bg-muted/30"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('reviews.rate_tool', { tool: websiteTitle })}
                </label>
                {renderStars(rating, true, 'default', true)}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('reviews.comment_content')}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('reviews.placeholder')}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSubmitReview}
                  disabled={submitting || !comment.trim()}
                  className="gap-2"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {editingReview ? t('reviews.update_review') : t('reviews.submit_review')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingReview(null)
                    setComment('')
                    setRating(5)
                  }}
                >
                  {t('reviews.cancel')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 评论列表 */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('reviews.no_reviews')}</p>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user.image || ''} alt={review.user.name || ''} />
                  <AvatarFallback>
                    {review.user.name?.charAt(0) || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {review.user.name || t('reviews.anonymous_user')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating, false, 'small')}
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    {isSignedIn && user?.id === review.user.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

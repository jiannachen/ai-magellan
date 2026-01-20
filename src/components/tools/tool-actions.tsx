'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/ui/common/button'
import { toast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { cn, addRefParam } from '@/lib/utils/utils'

interface ToolActionsProps {
  websiteId: number
  websiteUrl: string
  initialLikesCount: number
}

export function ToolActions({ websiteId, websiteUrl, initialLikesCount }: ToolActionsProps) {
  const { isSignedIn } = useUser()
  const t = useTranslations()
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      checkUserInteractions()
    } else {
      setIsLoading(false)
    }
    // 记录访问
    recordVisit()
  }, [isSignedIn, websiteId])

  const recordVisit = async () => {
    try {
      await fetch(`/api/websites/${websiteId}/visit`, { method: 'POST' })
    } catch (error) {
      console.error('Error recording visit:', error)
    }
  }

  const checkUserInteractions = async () => {
    try {
      const [likesResponse, favoritesResponse] = await Promise.all([
        fetch(`/api/user/likes/check?websiteId=${websiteId}`),
        fetch(`/api/user/favorites/check?websiteId=${websiteId}`)
      ])

      if (likesResponse.ok) {
        const likesData = await likesResponse.json() as { isLiked?: boolean }
        setIsLiked(likesData.isLiked || false)
      }

      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json() as { isFavorited?: boolean }
        setIsFavorited(favoritesData.isFavorited || false)
      }
    } catch (error) {
      console.error('Error checking user interactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error(t('profile.tools.detail.messages.sign_in_to_like'))
      return
    }

    if (isLiked) return

    try {
      const response = await fetch(`/api/websites/${websiteId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
        toast.success(t('profile.tools.detail.messages.added_to_likes'))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(t('profile.tools.detail.messages.failed_to_update_like'))
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn) {
      toast.error(t('profile.tools.detail.messages.sign_in_to_bookmark'))
      return
    }

    try {
      const response = await fetch(`/api/user/favorites${isFavorited ? `?websiteId=${websiteId}` : ''}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isFavorited ? undefined : JSON.stringify({ websiteId })
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? t('profile.tools.detail.messages.removed_from_bookmarks') : t('profile.tools.detail.messages.added_to_bookmarks'))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error(t('profile.tools.detail.messages.failed_to_update_bookmark'))
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('common.copy_success'))
      return
    } catch (error) {
      console.warn('Modern clipboard failed:', error)
    }

    // 降级方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      textArea.setSelectionRange(0, 99999)

      const success = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (success) {
        toast.success(t('common.copy_success'))
      } else {
        toast.error(t('common.copy_failed') || `复制失败，请手动复制: ${shareUrl}`)
      }
    } catch (error) {
      console.error('All copy methods failed:', error)
      toast.error(t('common.copy_failed') || `复制失败，请手动复制: ${shareUrl}`)
    }
  }

  const handleVisit = () => {
    const urlWithRef = addRefParam(websiteUrl)
    window.open(urlWithRef, '_blank')
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleVisit}
        className="w-full bg-magellan-primary hover:bg-magellan-primary-hover text-white font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
        size="lg"
      >
        <ExternalLink className="h-5 w-5 mr-2" />
        {t('profile.tools.detail.actions.visit_tool')}
      </Button>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          onClick={handleLike}
          disabled={isLiked || isLoading}
          className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
        >
          <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-magellan-coral text-magellan-coral")} />
          {likesCount}
        </Button>
        <Button
          variant="outline"
          onClick={handleFavorite}
          disabled={isLoading}
          className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
        >
          <Bookmark className={cn("h-4 w-4 mr-2", isFavorited && "fill-magellan-gold text-magellan-gold")} />
          {t('profile.tools.detail.actions.bookmark')}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="border-magellan-primary/20 hover:bg-magellan-primary/5 hover:border-magellan-primary/30"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t('profile.tools.detail.actions.share')}
        </Button>
      </div>
    </div>
  )
}

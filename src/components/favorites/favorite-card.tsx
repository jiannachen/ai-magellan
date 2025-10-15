'use client'

import { Crown, ExternalLink, Trash2, Map, Eye, Star } from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { cn } from '@/lib/utils/utils'

interface Website {
  id: number
  title: string
  url: string
  description: string
  thumbnail: string | null
  status?: string
  visits?: number
  likes?: number
  quality_score?: number
  is_featured?: boolean
  created_at?: string
  category: {
    id?: number
    name: string
    slug?: string
  }
  _count?: {
    websiteLikes: number
    websiteFavorites: number
  }
}

interface FavoriteCardProps {
  website: Website
  onRemove?: (websiteId: number) => void
  onVisit?: (website: Website) => void
  viewMode?: 'grid' | 'list'
  visitLabel?: string
  removeLabel?: string
  showRemoveButton?: boolean
}

export function FavoriteCard({
  website,
  onRemove,
  onVisit,
  viewMode = 'grid',
  visitLabel = 'Visit',
  removeLabel = 'Remove',
  showRemoveButton = true
}: FavoriteCardProps) {
  const handleCardClick = () => {
    window.open(`/tools/${website.id}`, '_blank')
  }

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onVisit) {
      onVisit(website)
    } else {
      window.open(website.url, '_blank')
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(website.id)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          "group relative flex overflow-hidden cursor-pointer",
          "bg-background/95 backdrop-blur-sm border border-border/40",
          "rounded-xl shadow-sm",
          "transition-all duration-300 ease-out",
          "hover:shadow-lg hover:border-primary/30",
          "hover:bg-background/98"
        )}
        onClick={handleCardClick}
      >
        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

        <div className="relative p-3 flex gap-3 w-full items-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/5 to-magellan-teal/5 border border-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/40 transition-all duration-200 group-hover:shadow-md">
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

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                "text-base font-semibold text-foreground line-clamp-1 leading-normal",
                "group-hover:text-primary transition-colors duration-200"
              )}>
                {website.title}
              </h3>
              {website.is_featured && (
                <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 h-5 rounded font-medium"
              >
                {website.category.name}
              </Badge>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {website.visits !== undefined && (
                  <div className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    <span>{website.visits}</span>
                  </div>
                )}
                {website.quality_score !== undefined && (
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3" />
                    <span>{website.quality_score}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Right side */}
          <div className="flex gap-2 items-center flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisit}
              className={cn(
                "h-8 w-8 p-0 rounded-lg",
                "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
                "transition-colors duration-200"
              )}
              title={visitLabel}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            {showRemoveButton && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  "hover:bg-red-50 hover:text-red-500",
                  "transition-colors duration-200"
                )}
                title={removeLabel}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Grid View
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden cursor-pointer",
        "bg-background/95 backdrop-blur-sm border border-border/40",
        "rounded-xl shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-primary/30",
        "hover:bg-background/98",
        "md:hover:-translate-y-[2px]",
        "active:scale-[0.98] md:active:scale-100"
      )}
      onClick={handleCardClick}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>

      {/* Remove Button - Top Right */}
      {showRemoveButton && onRemove && (
        <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              "bg-background/90 hover:bg-red-50 backdrop-blur-sm",
              "text-muted-foreground hover:text-red-500",
              "shadow-sm hover:shadow-md",
              "transition-all duration-200",
              "border border-border/40 hover:border-red-200"
            )}
            title={removeLabel}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Card Content */}
      <div className="relative p-3 flex flex-col gap-2.5">
        {/* Logo and Info */}
        <div className="flex items-start gap-2.5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/5 to-magellan-teal/5 border border-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-primary/40 transition-all duration-200 group-hover:shadow-md">
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

          {/* Title and Description */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
            <h3 className={cn(
              "text-base font-semibold text-foreground line-clamp-1 leading-tight pr-6",
              "group-hover:text-primary transition-colors duration-200"
            )}>
              {website.title}
              {website.is_featured && (
                <Crown className="inline-block h-3.5 w-3.5 text-yellow-600 ml-1" />
              )}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-[1.4] flex-1 max-h-[2.8rem] overflow-hidden">
              {website.description}
            </p>
          </div>
        </div>

        {/* Tags and Stats */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0.5 h-5 rounded font-medium truncate max-w-[120px]"
          >
            {website.category.name}
          </Badge>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {website.visits !== undefined && (
              <div className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {website.visits}
              </div>
            )}
            {website.quality_score !== undefined && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3" />
                {website.quality_score}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full h-8 text-xs",
              "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
              "transition-colors duration-200"
            )}
            onClick={handleVisit}
            title={visitLabel}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            {visitLabel}
          </Button>
        </div>
      </div>
    </Card>
  )
}

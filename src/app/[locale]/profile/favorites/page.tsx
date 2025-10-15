'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bookmark,
  Compass,
  Star,
  Crown,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent } from '@/ui/common/card'
import { Input } from '@/ui/common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils/utils'
import { FavoriteCard } from '@/components/favorites/favorite-card'

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

export default function MyFavoritesPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [favorites, setFavorites] = useState<Website[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const t = useTranslations('common')
  const tProfile = useTranslations('profile')

  const fetchFavorites = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/favorites?page=${page}&limit=50`)

      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      const websites = data.data || data.websites || []
      setFavorites(websites)
    } catch (_error) {
      console.error('Error fetching favorites:', _error)
      toast.error(tProfile('favorites.load_error'))
    } finally {
      setLoading(false)
    }
  }, [tProfile])

  const filterAndSortFavorites = useCallback(() => {
    let filtered = [...favorites]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(website =>
        website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        website.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
          return bTime - aTime
        })
        break
      case 'popular':
        filtered.sort((a, b) => (b.visits || 0) - (a.visits || 0))
        break
      case 'quality':
        filtered.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredFavorites(filtered)
  }, [favorites, searchQuery, sortBy])

  const removeFavorite = async (websiteId: number) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      })

      if (!response.ok) {
        throw new Error('Failed to remove favorite')
      }

      setFavorites(prev => prev.filter(website => website.id !== websiteId))
      toast.success(tProfile('favorites.remove_success'))
    } catch (_error) {
      console.error('Error removing favorite:', _error)
      toast.error(tProfile('favorites.remove_error'))
    }
  }

  const handleVisit = (website: Website) => {
    // Track visit
    fetch(`/api/websites/${website.id}/visit`, { method: 'POST' }).catch(console.error)
    window.open(website.url, '_blank')
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFavorites()
    }
  }, [isLoaded, isSignedIn, fetchFavorites])

  useEffect(() => {
    filterAndSortFavorites()
  }, [favorites, searchQuery, sortBy, filterAndSortFavorites])

  if (!isLoaded || !isSignedIn) {
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

  if (loading) {
    return (
      <ProfileLayout>
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-muted rounded-xl"></div>
            <div className="h-24 bg-muted rounded-xl"></div>
            <div className="h-24 bg-muted rounded-xl"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {tProfile('favorites.title')}
              </h1>
              <p className="text-muted-foreground">{tProfile('favorites.description')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Stats Overview - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                <Bookmark className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <div className="text-lg font-semibold">{favorites.length}</div>
                  <div className="text-xs text-muted-foreground">{tProfile('favorites.stats.total_bookmarks')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                <Crown className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <div>
                  <div className="text-lg font-semibold">{favorites.filter(w => w.is_featured === true).length}</div>
                  <div className="text-xs text-muted-foreground">{tProfile('favorites.stats.featured_tools')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
                <Star className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <div className="text-lg font-semibold">{favorites.filter(w => (w.quality_score || 0) >= 80).length}</div>
                  <div className="text-xs text-muted-foreground">{tProfile('favorites.stats.high_quality')}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row gap-2 items-center bg-card border border-border rounded-lg p-3">
              {/* Search */}
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={tProfile('favorites.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-52 h-9 text-sm">
                  <SortAsc className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder={tProfile('favorites.sort.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{tProfile('favorites.sort.recent')}</SelectItem>
                  <SelectItem value="popular">{tProfile('favorites.sort.popular')}</SelectItem>
                  <SelectItem value="quality">{tProfile('favorites.sort.quality')}</SelectItem>
                  <SelectItem value="alphabetical">{tProfile('favorites.sort.alphabetical')}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredFavorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    <div className="relative">
                      <Bookmark className="h-16 w-16 text-muted-foreground mx-auto" />
                      <Search className="h-6 w-6 text-primary absolute -top-1 -right-1" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      {searchQuery ? tProfile('favorites.empty.no_matching') : tProfile('favorites.empty.no_bookmarks')}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {searchQuery 
                        ? tProfile('favorites.empty.try_different_search', { query: searchQuery })
                        : tProfile('favorites.empty.start_exploring')
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery('')}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {tProfile('favorites.actions.clear_search')}
                        </Button>
                      )}
                      <Link href="/">
                        <Button>
                          <Compass className="h-4 w-4 mr-2" />
                          {tProfile('favorites.empty.start_button')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <div className={cn(
              "grid gap-3",
              viewMode === 'grid'
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}>
              {filteredFavorites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <FavoriteCard
                    website={website}
                    onRemove={removeFavorite}
                    onVisit={handleVisit}
                    viewMode={viewMode}
                    visitLabel={tProfile('favorites.actions.visit')}
                    removeLabel={tProfile('favorites.actions.remove')}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Results Summary */}
        {filteredFavorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>
              {searchQuery 
                ? tProfile('favorites.results.showing_search', { 
                  current: filteredFavorites.length, 
                  total: favorites.length 
                })
                : tProfile('favorites.results.showing_total', { 
                  count: filteredFavorites.length 
                })
              }
            </p>
          </motion.div>
        )}
        </div>
      </div>
    </ProfileLayout>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Heart, 
  Bookmark, 
  Globe, 
  Trash2, 
  TrendingUp,
  Map,
  Compass,
  Star,
  Eye,
  Route,
  Crown,
  Search,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  MoreHorizontal,
  Home,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Badge } from '@/ui/common/badge'
import { Input } from '@/ui/common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/ui/common/dropdown-menu'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { toast } from '@/hooks/use-toast'
import { StatCard } from '@/components/ui/stat-card'
import { cn } from '@/lib/utils/utils'

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
  const [filteredFavorites, setFilteredFavorites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  })
  
  const t = useTranslations('common')
  const tProfile = useTranslations('profile')

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchFavorites()
    }
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    filterAndSortFavorites()
  }, [favorites, searchQuery, sortBy])

  const fetchFavorites = async (page = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/favorites?page=${page}&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      const websites = data.data || data.websites || []
      setFavorites(websites)
      setPagination({
        page: data.pagination?.page || 1,
        total: data.pagination?.total || websites.length,
        pages: data.pagination?.pages || 1
      })
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError(tProfile('favorites.load_error'))
      toast.error(tProfile('favorites.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortFavorites = () => {
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
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.visits - a.visits)
        break
      case 'quality':
        filtered.sort((a, b) => b.quality_score - a.quality_score)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredFavorites(filtered)
  }

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
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error(tProfile('favorites.remove_error'))
    }
  }

  const handleVisit = (website: Website) => {
    // Track visit
    fetch(`/api/websites/${website.id}/visit`, { method: 'POST' }).catch(console.error)
    window.open(website.url, '_blank')
  }

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

        <div className="space-y-8">
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label={tProfile('favorites.stats.total_bookmarks')}
                value={favorites.length}
                description={tProfile('favorites.stats.tools_in_collection')}
                icon={Bookmark}
                variant="highlight"
              />
              <StatCard
                label={tProfile('favorites.stats.featured_tools')}
                value={favorites.filter(w => w.is_featured).length}
                description={tProfile('favorites.stats.premium_tools')}
                icon={Crown}
                variant="highlight"
              />
              <StatCard
                label={tProfile('favorites.stats.high_quality')}
                value={favorites.filter(w => w.quality_score >= 80).length}
                description={tProfile('favorites.stats.high_score_tools')}
                icon={Star}
                variant="highlight"
              />
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  {tProfile('favorites.search.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={tProfile('favorites.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48">
                      <SortAsc className="h-4 w-4 mr-2" />
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
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {filteredFavorites.map((website, index) => (
                <motion.div
                  key={website.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <Card className="group h-full hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Tool Image */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
                            {website.thumbnail ? (
                              <img 
                                src={website.thumbnail} 
                                alt={website.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Map className="h-8 w-8 text-primary" />
                              </div>
                            )}
                            
                            {/* Status Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                              {website.is_featured && (
                                <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  {tProfile('favorites.badge.featured')}
                                </Badge>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="absolute top-3 right-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleVisit(website)}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {tProfile('favorites.actions.visit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/tools/${website.id}`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      {tProfile('favorites.actions.details')}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => removeFavorite(website.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {tProfile('favorites.actions.remove')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Tool Info */}
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                {website.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {website.description}
                              </p>
                            </div>

                            {/* Category and Stats */}
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {website.category.name}
                              </Badge>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {website.visits}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {website.quality_score}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleVisit(website)}
                              >
                                <ExternalLink className="h-3 w-3 mr-2" />
                                {tProfile('favorites.actions.visit')}
                              </Button>
                              <Link href={`/tools/${website.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                  <Eye className="h-3 w-3 mr-2" />
                                  {tProfile('favorites.actions.details')}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // List View
                    <Card className="group hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0">
                            {website.thumbnail ? (
                              <img 
                                src={website.thumbnail} 
                                alt={website.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Map className="h-8 w-8 text-primary" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                                    {website.title}
                                  </h3>
                                  {website.is_featured && (
                                    <Crown className="h-4 w-4 text-yellow-600" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {website.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFavorite(website.id)}
                                className="text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="text-xs">
                                  {website.category.name}
                                </Badge>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {website.visits}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {website.quality_score}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVisit(website)}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Link href={`/tools/${website.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
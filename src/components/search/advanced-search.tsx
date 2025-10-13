'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Star,
  DollarSign,
  Shield,
  Clock,
  TrendingUp,
  Calendar,
  Tag
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Input } from '@/ui/common/input'
import { Badge } from '@/ui/common/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Separator } from '@/ui/common/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { Slider } from '@/ui/common/slider'
import { cn } from '@/lib/utils/utils'

interface AdvancedSearchProps {
  value: string
  onChange: (value: string) => void
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

export interface SearchFilters {
  query: string
  category?: string
  pricingModel?: string[]
  minQualityScore?: number
  isTrusted?: boolean
  isFeatured?: boolean
  hasFreePlan?: boolean
  sslEnabled?: boolean
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function AdvancedSearch({ value, onChange, onFiltersChange, className }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: value,
    pricingModel: [],
    minQualityScore: 0,
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // 翻译hooks
  const t = useTranslations('search')
  
  // 获取翻译后的选项
  const PRICING_OPTIONS = [
    { value: 'free', label: t('filters.pricing_free') },
    { value: 'freemium', label: t('filters.pricing_freemium') },
    { value: 'paid', label: t('filters.pricing_paid') },
    { value: 'enterprise', label: t('filters.pricing_enterprise') }
  ]

  const SORT_OPTIONS = [
    { value: 'relevance', label: t('filters.sort_relevance') },
    { value: 'created_at', label: t('filters.sort_newest') },
    { value: 'visits', label: t('filters.sort_visits') },
    { value: 'likes', label: t('filters.sort_likes') },
    { value: 'quality_score', label: t('filters.sort_quality') },
    { value: 'title', label: t('filters.sort_name') }
  ]


  useEffect(() => {
    // 只同步值，不触发搜索
    setFilters(prev => ({ ...prev, query: value }))
  }, [value])

  // 移除自动触发搜索的 useEffect
  // useEffect(() => {
  //   onFiltersChange(filters)
  // }, [filters, onFiltersChange])


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 增加空值检查
      if (searchRef.current && event.target && event.target instanceof Node) {
        if (!searchRef.current.contains(event.target)) {
          setSearchFocused(false)
        }
      }
    }

    // 只在组件挂载时添加监听器
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      // 确保清理时移除监听器
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleSearch = () => {
    if (value.trim()) {
      const searchFilters: SearchFilters = {
        ...filters,
        query: value.trim()
      }
      onFiltersChange(searchFilters)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // 立即触发搜索（除了查询词变化）
    if (key !== 'query') {
      onFiltersChange(newFilters)
    }
  }

  const handlePricingToggle = (pricing: string) => {
    const newPricingModel = filters.pricingModel?.includes(pricing)
      ? filters.pricingModel.filter(p => p !== pricing)
      : [...(filters.pricingModel || []), pricing]
    
    const newFilters = {
      ...filters,
      pricingModel: newPricingModel
    }
    
    setFilters(newFilters)
    // 立即触发搜索
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      pricingModel: [],
      minQualityScore: 0,
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc' as 'desc'
    }
    setFilters(clearedFilters)
    onChange('')
    // 立即触发搜索以清除结果
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = !!(
    filters.pricingModel?.length ||
    filters.minQualityScore ||
    filters.isTrusted ||
    filters.isFeatured ||
    filters.hasFreePlan ||
    filters.sslEnabled ||
    filters.tags?.length ||
    (filters.sortBy && filters.sortBy !== 'relevance')
  )

  return (
    <div className={cn("relative w-full max-w-2xl mx-auto", className)}>
      {/* 搜索框 */}
      <div ref={searchRef} className="relative">
        <div className={cn(
          "relative flex items-center",
          "bg-background border border-border rounded-xl",
          "transition-all duration-200",
          searchFocused && "ring-2 ring-primary/20 border-primary/30"
        )}>
          <Input
            ref={inputRef}
            type="text"
            placeholder={t('placeholder')}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setSearchFocused(true)
            }}
            className={cn(
              "flex-1 pl-4 pr-24 sm:pr-28 py-2.5 sm:py-3 border-0 bg-transparent",
              "placeholder:text-muted-foreground text-sm sm:text-base",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />
          
          {/* 清除、搜索和过滤按钮 - 移动端优化 */}
          <div className="absolute right-2 flex items-center gap-0.5 sm:gap-1">
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange('')
                  // 安全地处理输入框焦点
                  if (inputRef.current && inputRef.current.focus) {
                    try {
                      inputRef.current.focus()
                    } catch (e) {
                      console.warn('Failed to focus input:', e)
                    }
                  }
                }}
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {/* 搜索按钮 */}
            <Button
              size="sm"
              onClick={handleSearch}
              className="h-6 sm:h-7 px-1 sm:px-2 gap-0.5 sm:gap-1"
              disabled={!value.trim()}
            >
              <Search className="h-3 w-3" />
              <span className="hidden sm:inline text-xs">{t('search_button')}</span>
            </Button>
            
            <Button
              variant={showFilters ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-6 sm:h-7 px-1 sm:px-2 gap-0.5 sm:gap-1",
                hasActiveFilters && !showFilters && "border-primary/30 bg-primary/5 text-primary"
              )}
            >
              <SlidersHorizontal className="h-3 w-3" />
              {hasActiveFilters && !showFilters && (
                <span className="text-xs hidden xs:inline">({Object.values(filters).filter(Boolean).length})</span>
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* 高级过滤面板 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    {t('advanced_filters')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        {t('clear_filters')}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 定价模型 */}
                <div>
                  <label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t('filters.pricing_model')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRICING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handlePricingToggle(option.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-sm transition-colors",
                          filters.pricingModel?.includes(option.value)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/30 hover:bg-muted"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 质量评分 */}
                <div>
                  <label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {t('filters.quality_score', { score: filters.minQualityScore })}
                  </label>
                  <Slider
                    value={[filters.minQualityScore || 0]}
                    onValueChange={([value]) => handleFilterChange('minQualityScore', value)}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <Separator />

                {/* 特性筛选 */}
                <div>
                  <label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('filters.features')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trusted"
                        checked={filters.isTrusted}
                        onCheckedChange={(checked) => handleFilterChange('isTrusted', checked)}
                      />
                      <label htmlFor="trusted" className="text-sm">{t('filters.trusted_tools')}</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.isFeatured}
                        onCheckedChange={(checked) => handleFilterChange('isFeatured', checked)}
                      />
                      <label htmlFor="featured" className="text-sm">{t('filters.featured_tools')}</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="freePlan"
                        checked={filters.hasFreePlan}
                        onCheckedChange={(checked) => handleFilterChange('hasFreePlan', checked)}
                      />
                      <label htmlFor="freePlan" className="text-sm">{t('filters.free_version')}</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ssl"
                        checked={filters.sslEnabled}
                        onCheckedChange={(checked) => handleFilterChange('sslEnabled', checked)}
                      />
                      <label htmlFor="ssl" className="text-sm">{t('filters.ssl_security')}</label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 排序方式 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {t('filters.sort_by')}
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('filters.sort_direction')}</label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">{t('filters.sort_desc')}</SelectItem>
                        <SelectItem value="asc">{t('filters.sort_asc')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 当前筛选标签 */}
      {hasActiveFilters && !showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {filters.pricingModel?.map((pricing) => (
            <Badge key={pricing} variant="secondary" className="gap-1">
              {PRICING_OPTIONS.find(p => p.value === pricing)?.label}
              <button
                onClick={() => handlePricingToggle(pricing)}
                className="ml-1 hover:bg-muted-foreground/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.minQualityScore && filters.minQualityScore > 0 && (
            <Badge variant="secondary">
              {t('filters.quality_score', { score: filters.minQualityScore })}
            </Badge>
          )}
          
          {filters.isTrusted && <Badge variant="secondary">{t('filters.trusted_tools')}</Badge>}
          {filters.isFeatured && <Badge variant="secondary">{t('filters.featured_tools')}</Badge>}
          {filters.hasFreePlan && <Badge variant="secondary">{t('filters.free_version')}</Badge>}
          {filters.sslEnabled && <Badge variant="secondary">{t('filters.ssl_security')}</Badge>}
        </motion.div>
      )}
    </div>
  )
}
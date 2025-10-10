'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const PRICING_OPTIONS = [
  { value: 'free', label: '免费' },
  { value: 'freemium', label: '免费增值' },
  { value: 'paid', label: '付费' },
  { value: 'enterprise', label: '企业版' }
]

const SORT_OPTIONS = [
  { value: 'relevance', label: '相关度' },
  { value: 'created_at', label: '最新添加' },
  { value: 'visits', label: '访问量' },
  { value: 'likes', label: '点赞数' },
  { value: 'quality_score', label: '质量评分' },
  { value: 'title', label: '名称' }
]

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
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 模拟搜索建议
  const searchSuggestions = [
    'AI写作工具', 'AI图像生成', 'AI视频编辑', 'AI代码助手', 
    'AI聊天机器人', 'AI翻译工具', 'AI数据分析', 'AI设计工具',
    'AI音频处理', 'AI项目管理', 'AI营销工具', 'AI学习平台'
  ]

  useEffect(() => {
    setFilters(prev => ({ ...prev, query: value }))
  }, [value])

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  useEffect(() => {
    if (value) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion !== value
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(newValue.length > 0)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePricingToggle = (pricing: string) => {
    setFilters(prev => ({
      ...prev,
      pricingModel: prev.pricingModel?.includes(pricing)
        ? prev.pricingModel.filter(p => p !== pricing)
        : [...(prev.pricingModel || []), pricing]
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      pricingModel: [],
      minQualityScore: 0,
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
    onChange('')
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
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="搜索AI工具... (例如: AI写作、图像生成)"
            value={value}
            onChange={handleInputChange}
            onFocus={() => {
              setSearchFocused(true)
              setShowSuggestions(value.length > 0)
            }}
            className={cn(
              "flex-1 pl-10 pr-20 py-3 border-0 bg-transparent",
              "placeholder:text-muted-foreground",
              "focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
          />
          
          {/* 清除和过滤按钮 */}
          <div className="absolute right-2 flex items-center gap-1">
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange('')
                  inputRef.current?.focus()
                }}
                className="h-7 w-7 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              variant={showFilters ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-7 px-2 gap-1",
                hasActiveFilters && !showFilters && "border-primary/30 bg-primary/5 text-primary"
              )}
            >
              <SlidersHorizontal className="h-3 w-3" />
              {hasActiveFilters && !showFilters && (
                <span className="text-xs">({Object.values(filters).filter(Boolean).length})</span>
              )}
            </Button>
          </div>
        </div>

        {/* 搜索建议 */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 z-50 mt-1"
            >
              <Card className="shadow-lg border-border/50">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onChange(suggestion)
                        setShowSuggestions(false)
                        inputRef.current?.focus()
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
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
                    高级筛选
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        清除筛选
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
                    定价模型
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
                    最低质量评分: {filters.minQualityScore}
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
                    特性筛选
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trusted"
                        checked={filters.isTrusted}
                        onCheckedChange={(checked) => handleFilterChange('isTrusted', checked)}
                      />
                      <label htmlFor="trusted" className="text-sm">可信工具</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={filters.isFeatured}
                        onCheckedChange={(checked) => handleFilterChange('isFeatured', checked)}
                      />
                      <label htmlFor="featured" className="text-sm">精选工具</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="freePlan"
                        checked={filters.hasFreePlan}
                        onCheckedChange={(checked) => handleFilterChange('hasFreePlan', checked)}
                      />
                      <label htmlFor="freePlan" className="text-sm">有免费版本</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ssl"
                        checked={filters.sslEnabled}
                        onCheckedChange={(checked) => handleFilterChange('sslEnabled', checked)}
                      />
                      <label htmlFor="ssl" className="text-sm">SSL安全</label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 排序方式 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      排序方式
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
                    <label className="text-sm font-medium mb-2 block">排序方向</label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">降序</SelectItem>
                        <SelectItem value="asc">升序</SelectItem>
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
              质量评分 ≥ {filters.minQualityScore}
            </Badge>
          )}
          
          {filters.isTrusted && <Badge variant="secondary">可信工具</Badge>}
          {filters.isFeatured && <Badge variant="secondary">精选工具</Badge>}
          {filters.hasFreePlan && <Badge variant="secondary">免费版本</Badge>}
          {filters.sslEnabled && <Badge variant="secondary">SSL安全</Badge>}
        </motion.div>
      )}
    </div>
  )
}
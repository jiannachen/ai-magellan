'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdvancedSearch, type SearchFilters } from '@/components/search/advanced-search'
import CategoryFilter from '@/components/category-filter'
import type { Website, Category } from '@/lib/types'

interface SearchManagerProps {
  websites: Website[]
  categories: Category[]
  searchQuery: string
  selectedCategory: string
  onSearchChange: (query: string) => void
  onResultsChange: (results: Website[]) => void
}

export function SearchManager({ 
  websites, 
  categories, 
  searchQuery, 
  selectedCategory,
  onSearchChange, 
  onResultsChange 
}: SearchManagerProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchQuery,
    pricingModel: [],
    minQualityScore: 0,
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  })

  // 高级搜索和过滤逻辑
  const filteredAndSortedWebsites = useMemo(() => {
    if (!websites) return []

    let results = [...websites]

    // 基础搜索过滤
    if (filters.query || searchQuery) {
      const query = (filters.query || searchQuery).toLowerCase()
      results = results.filter(website =>
        website.title.toLowerCase().includes(query) ||
        website.description.toLowerCase().includes(query) ||
        (website.tags && website.tags.toLowerCase().includes(query))
      )
    }

    // 分类过滤
    if (selectedCategory) {
      results = results.filter(website => 
        website.category_id === Number(selectedCategory)
      )
    }

    // 高级过滤
    if (filters.pricingModel && filters.pricingModel.length > 0) {
      results = results.filter(website => 
        filters.pricingModel!.includes(website.pricing_model)
      )
    }

    if (filters.minQualityScore && filters.minQualityScore > 0) {
      results = results.filter(website => 
        (website.quality_score || 0) >= filters.minQualityScore!
      )
    }

    if (filters.isTrusted) {
      results = results.filter(website => website.is_trusted)
    }

    if (filters.isFeatured) {
      results = results.filter(website => website.is_featured)
    }

    if (filters.hasFreePlan) {
      results = results.filter(website => website.has_free_version)
    }

    if (filters.sslEnabled) {
      results = results.filter(website => website.ssl_enabled)
    }

    // 排序
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      results.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (filters.sortBy) {
          case 'created_at':
            aValue = new Date(a.created_at || 0).getTime()
            bValue = new Date(b.created_at || 0).getTime()
            break
          case 'visits':
            aValue = a.visits || 0
            bValue = b.visits || 0
            break
          case 'likes':
            aValue = a.likes || 0
            bValue = b.likes || 0
            break
          case 'quality_score':
            aValue = a.quality_score || 0
            bValue = b.quality_score || 0
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          default:
            return 0
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    } else if (filters.sortBy === 'relevance' && (filters.query || searchQuery)) {
      // 相关度排序：标题匹配优先于描述匹配
      const query = (filters.query || searchQuery).toLowerCase()
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(query)
        const bTitle = b.title.toLowerCase().includes(query)
        
        if (aTitle && !bTitle) return -1
        if (!aTitle && bTitle) return 1
        
        // 如果都匹配标题或都不匹配，按质量评分排序
        return (b.quality_score || 0) - (a.quality_score || 0)
      })
    } else {
      // 默认排序：精选工具优先，然后按质量评分
      results.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        return (b.quality_score || 0) - (a.quality_score || 0)
      })
    }

    return results
  }, [websites, filters, searchQuery, selectedCategory])

  // 当过滤结果变化时通知父组件
  useEffect(() => {
    onResultsChange(filteredAndSortedWebsites)
  }, [filteredAndSortedWebsites, onResultsChange])

  // 同步搜索查询
  useEffect(() => {
    setFilters(prev => ({ ...prev, query: searchQuery }))
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* 高级搜索 */}
      <AdvancedSearch
        value={searchQuery}
        onChange={onSearchChange}
        onFiltersChange={setFilters}
      />
      
      {/* 分类过滤器 */}
      <div className="max-w-2xl mx-auto">
        <CategoryFilter categories={categories} />
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { categoriesAtom } from '@/lib/atoms'
import { toast } from '@/hooks/use-toast'

interface Category {
  id: number
  name: string
  slug: string
  parent_id?: number | null
  children?: Category[]
}

interface WebsiteData {
  category_id?: number
  [key: string]: any
}

export function useCategories(websiteData?: WebsiteData) {
  const [categories, setCategories] = useAtom(categoriesAtom)
  const [selectedParentCategory, setSelectedParentCategory] = useState<number | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])

  // Load categories with hierarchy support
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories?includeSubcategories=true')
        if (!response.ok) throw new Error('Failed to load categories')
        const data = await response.json()

        // API returns parent categories with children populated by Prisma
        // Filter to ensure we only have parent categories (parent_id is null or undefined)
        // Use strict comparison to avoid filtering errors
        const allCategories = Array.isArray(data.data) ? data.data : []
        const parentCategories = allCategories.filter(
          (cat: Category) => cat.parent_id === null || cat.parent_id === undefined
        )

        setCategories(parentCategories)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        })
      }
    }

    if (categories.length === 0) {
      loadCategories()
    }
  }, [categories.length, setCategories, toast])

  // Update subcategories when parent category changes
  useEffect(() => {
    if (!selectedParentCategory) {
      setSubcategories([])
      return
    }

    // Find parent category and get its children
    const parentCategory = categories.find(cat => cat.id === selectedParentCategory)
    if (parentCategory?.children && Array.isArray(parentCategory.children)) {
      setSubcategories(parentCategory.children)
    } else {
      setSubcategories([])
    }
  }, [selectedParentCategory, categories])

  // Set parent category when website data is loaded
  useEffect(() => {
    if (!websiteData?.category_id || categories.length === 0) {
      return
    }

    // Flatten all categories (parents and children) for searching
    const allCategories = categories.flatMap(cat => [
      cat,
      ...(Array.isArray(cat.children) ? cat.children : [])
    ])

    const currentCategory = allCategories.find(cat => cat.id === websiteData.category_id)

    if (currentCategory) {
      // If it's a subcategory, set its parent as selected
      if (currentCategory.parent_id) {
        setSelectedParentCategory(currentCategory.parent_id)
      } else {
        // If it's a parent category, set itself as selected
        setSelectedParentCategory(currentCategory.id)
      }
    }
  }, [websiteData?.category_id, categories])

  return {
    categories,
    selectedParentCategory,
    setSelectedParentCategory,
    subcategories
  }
}

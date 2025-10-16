'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, UseFormClearErrors } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/utils'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Label } from '@/ui/common/label'
import { Badge } from '@/ui/common/badge'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { toast } from '@/hooks/use-toast'
import { WebsiteEditData } from '@/lib/validations/website'
import { fetchMetadata } from '@/lib/utils'
import GlobalLoading from '@/components/loading/global-loading'
import {
  Map,
  MapPin,
  Ship,
  Flag,
  Compass,
  FileText,
  Star,
  Plus,
  X,
  Telescope,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  children?: Category[]
}

interface BasicInfoWithTagsSectionProps {
  register: UseFormRegister<WebsiteEditData>
  watch: UseFormWatch<WebsiteEditData>
  setValue: UseFormSetValue<WebsiteEditData>
  clearErrors: UseFormClearErrors<WebsiteEditData>
  errors: FieldErrors<WebsiteEditData>
  categories: Category[]
  selectedParentCategory: number | null
  setSelectedParentCategory: (id: number | null) => void
  subcategories: Category[]
  websiteId?: string // 编辑模式下传入当前网站 ID
}

export function BasicInfoWithTagsSection({
  register,
  watch,
  setValue,
  clearErrors,
  errors,
  categories,
  selectedParentCategory,
  setSelectedParentCategory,
  subcategories,
  websiteId
}: BasicInfoWithTagsSectionProps) {
  const [isFetching, setIsFetching] = useState(false)
  const [currentTagInput, setCurrentTagInput] = useState('')
  const [isCheckingUrl, setIsCheckingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  const tSubmit = useTranslations('profile.submit')
  const tForm = useTranslations('form')
  const tMessages = useTranslations('profile.submit.messages')

  // Check if URL already exists
  const checkUrlAvailability = useCallback(async (url: string) => {
    if (!url || !url.startsWith('http')) {
      setUrlError(null)
      return
    }

    setIsCheckingUrl(true)
    setUrlError(null)

    try {
      // 编辑模式下，排除当前网站 ID
      const apiUrl = websiteId
        ? `/api/websites/check-url?url=${encodeURIComponent(url)}&excludeId=${websiteId}`
        : `/api/websites/check-url?url=${encodeURIComponent(url)}`

      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.data?.exists) {
        const existingWebsite = data.data.website
        let errorMsg = tMessages('url_already_exists')

        if (existingWebsite?.title) {
          errorMsg += ` (${existingWebsite.title})`
        }

        if (existingWebsite?.status === 'pending') {
          errorMsg += ` - ${tMessages('url_exists_pending')}`
        } else if (existingWebsite?.status === 'approved') {
          errorMsg += ` - ${tMessages('url_exists_approved')}`
        }

        setUrlError(errorMsg)
      } else {
        setUrlError(null)
      }
    } catch (error) {
      console.error('Error checking URL:', error)
    } finally {
      setIsCheckingUrl(false)
    }
  }, [tMessages, websiteId])

  // Debounced URL check
  useEffect(() => {
    const url = watch('url')
    if (!url) {
      setUrlError(null)
      return
    }

    const timer = setTimeout(() => {
      checkUrlAvailability(url)
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [watch('url'), checkUrlAvailability, watch])

  // Auto fetch website info
  const fetchWebsiteInfo = useCallback(async () => {
    const url = watch('url')
    if (!url || !url.startsWith('http')) return

    setIsFetching(true)
    try {
      const metadata = await fetchMetadata(url)

      // 填充表单字段（不填充 title，由用户自己填写）
      // if (metadata.title) setValue('title', metadata.title)
      if (metadata.tagline) setValue('tagline', metadata.tagline)
      if (metadata.description) setValue('description', metadata.description)
      if (metadata.logo) setValue('logo_url', metadata.logo)
      if (metadata.thumbnail) setValue('thumbnail', metadata.thumbnail)

      toast.success(tMessages('auto_fill_success'))
    } catch (error) {
      // This is an expected error when metadata cannot be fetched
      // Just show user-friendly message without logging to console
      toast.error(tMessages('auto_fill_error'))
    } finally {
      setIsFetching(false)
    }
  }, [watch, setValue, tMessages])

  // Tag handling functions
  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim()
    const currentTags = watch('tags') || []

    if (!trimmedTag) return

    if (currentTags.length >= 5) {
      toast.error(tForm('tags_limit_reached'))
      return
    }

    if (currentTags.includes(trimmedTag)) {
      toast.error(tForm('tag_already_exists'))
      return
    }

    const newTags = [...currentTags, trimmedTag]
    setValue('tags', newTags)
    setCurrentTagInput('')
  }, [watch, setValue, tForm])

  const removeTag = useCallback((tagToRemove: string) => {
    setValue('tags', (watch('tags') || []).filter(tag => tag !== tagToRemove))
  }, [watch, setValue])

  const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(currentTagInput)
    } else if (e.key === 'Backspace' && currentTagInput === '' && (watch('tags') || []).length > 0) {
      const tags = watch('tags') || []
      setValue('tags', tags.slice(0, -1))
    }
  }, [addTag, currentTagInput, watch, setValue])

  return (
    <Card id="basic" className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          {tSubmit('basic_info')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Tool URL */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.tool_url_required')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                id="url"
                placeholder={tSubmit('simple_form.tool_url_placeholder')}
                {...register('url')}
                className={cn(
                  "pr-10",
                  urlError && "border-destructive focus-visible:ring-destructive",
                  !urlError && watch('url') && watch('url').startsWith('http') && !isCheckingUrl && "border-green-500"
                )}
              />
              {/* URL validation status icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUrl && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isCheckingUrl && urlError && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {!isCheckingUrl && !urlError && watch('url') && watch('url').startsWith('http') && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchWebsiteInfo}
              disabled={isFetching || isCheckingUrl || !!urlError}
            >
              <Telescope className="h-4 w-4 mr-2" />
              {isFetching ? (
                <GlobalLoading variant="inline" size="sm" />
              ) : (
                tSubmit('simple_form.auto_fill')
              )}
            </Button>
          </div>
          {/* Show URL availability error first, then validation errors */}
          {urlError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{urlError}</p>
            </div>
          )}
          {!urlError && errors.url && (
            <p className="text-sm text-destructive">
              {errors.url.message}
            </p>
          )}
        </div>

        {/* Business Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.business_email_required')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={tSubmit('simple_form.business_email_placeholder')}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Tool Name */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.tool_name_required')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="title"
            placeholder={tSubmit('simple_form.tool_name_placeholder')}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.category_required')}
            <span className="text-destructive ml-1">*</span>
          </Label>

          {/* Parent Category Buttons */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              {tForm('parent_category')}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={selectedParentCategory === category.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedParentCategory(category.id)
                    // If no subcategories, auto-select parent as category
                    if (!category.children || category.children.length === 0) {
                      setValue('category_id', category.id.toString())
                      clearErrors('category_id')
                    } else {
                      setValue('category_id', '')
                      clearErrors('category_id')
                    }
                  }}
                  className={cn(
                    "h-auto py-2 px-3 justify-start text-left font-normal transition-all",
                    selectedParentCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full flex-shrink-0",
                      selectedParentCategory === category.id ? "bg-primary-foreground" : "bg-primary"
                    )} />
                    <span className="flex-1 text-sm truncate">{category.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Subcategory Buttons - Always show when parent is selected */}
          {selectedParentCategory && (
            <div className="pt-1">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {tForm('subcategory')}
              </Label>
              {subcategories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {subcategories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      type="button"
                      variant={watch('category_id') === subcategory.id.toString() ? "default" : "outline"}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setValue('category_id', subcategory.id.toString(), { shouldValidate: true })
                        clearErrors('category_id')
                      }}
                      className={cn(
                        "h-auto py-2 px-3 justify-start text-left font-normal transition-all cursor-pointer",
                        watch('category_id') === subcategory.id.toString()
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted"
                      )}
                    >
                      <span className="text-sm truncate">{subcategory.name}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/50 rounded-md border border-dashed">
                  {tForm('no_subcategories_found')}
                </div>
              )}
            </div>
          )}

          {!selectedParentCategory && (
            <p className="text-sm text-muted-foreground">
              {tForm('select_parent_category_first')}
            </p>
          )}

          {errors.category_id && (
            <p className="text-sm text-destructive">
              {errors.category_id.message}
            </p>
          )}
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-sm font-medium flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.tagline')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="tagline"
            placeholder={tSubmit('simple_form.tagline_placeholder')}
            {...register('tagline')}
          />
          {errors.tagline && (
            <p className="text-sm text-destructive">
              {errors.tagline.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.description_required')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder={tSubmit('simple_form.description_placeholder')}
            rows={5}
            {...register('description')}
            className="resize-none"
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Logo URL输入和预览 */}
        <div className="space-y-3">
          <Label htmlFor="logo_url" className="text-sm font-medium flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            Logo URL (Optional)
          </Label>
          <Input
            id="logo_url"
            placeholder="https://example.com/logo.png"
            {...register('logo_url')}
          />
          {watch('logo_url') && (
            <div className="p-3 rounded-lg bg-muted/30 border border-magellan-primary/10">
              <Label className="text-xs text-muted-foreground mb-2 block">Logo Preview</Label>
              <div className="relative aspect-square max-w-[150px] rounded-lg overflow-hidden bg-white border border-border">
                <img
                  src={watch('logo_url') || ''}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            The logo will be automatically extracted when you click "Auto Fill", or you can enter it manually
          </p>
        </div>

        {/* Thumbnail URL输入和预览 */}
        <div className="space-y-3">
          <Label htmlFor="thumbnail" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Preview Image URL (Optional)
          </Label>
          <Input
            id="thumbnail"
            placeholder="https://example.com/preview.jpg"
            {...register('thumbnail')}
          />
          {watch('thumbnail') && (
            <div className="p-3 rounded-lg bg-muted/30 border border-magellan-primary/10">
              <Label className="text-xs text-muted-foreground mb-2 block">Preview Image</Label>
              <div className="relative aspect-video max-w-[300px] rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={watch('thumbnail') || ''}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            The preview image will be automatically extracted when you click "Auto Fill", or you can enter it manually
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            {tSubmit('simple_form.tags')}
          </Label>
          
          <div className="space-y-3">
            {/* Current Tags */}
            {watch('tags')?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watch('tags')?.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary/70 hover:text-primary transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Tag Input */}
            <div className="relative">
              <Input
                id="tags"
                value={currentTagInput}
                onChange={(e) => setCurrentTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder={tForm('tags_input_placeholder')}
                className="pr-10"
              />
              {currentTagInput.trim() && (
                <button
                  type="button"
                  onClick={() => addTag(currentTagInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-hover transition-colors"
                  aria-label="Add tag"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {tForm('tags_input_placeholder')} ({watch('tags')?.length || 0}/5)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
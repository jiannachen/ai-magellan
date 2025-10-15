import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { UseFormReset } from 'react-hook-form'
import { WebsiteEditData } from '@/lib/validations/website'

interface Website {
  id: number
  title: string
  url: string
  description: string
  category_id: number
  thumbnail: string | null
  status: string
  submittedBy: string
  tagline: string | null
  email: string | null
  features: any
  use_cases: string[] | null
  target_audience: string[] | null
  faq: Array<{question: string, answer: string}> | null
  pricing_model: string
  has_free_version: boolean
  api_available: boolean
  tags: string[] | null
  twitter_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  discord_url: string | null
  integrations: string[] | null
  ios_app_url: string | null
  android_app_url: string | null
  web_app_url: string | null
  desktop_platforms: string[] | null
  pricing_plans: Array<{name: string, billing_cycle: string, price: string, features: string[]}> | null
}

export function useWebsiteData(websiteId: string | undefined, reset: UseFormReset<WebsiteEditData>) {
  const { isLoaded, isSignedIn, user } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [website, setWebsite] = useState<Website | null>(null)
  const tEdit = useTranslations('profile.edit')

  const fetchWebsite = useCallback(async () => {
    if (!websiteId) return

    try {
      const response = await fetch(`/api/websites/${websiteId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError(tEdit('errors.website_not_found'))
          return
        }
        if (response.status === 403) {
          setError(tEdit('errors.permission_denied'))
          return
        }
        throw new Error(tEdit('errors.fetch_failed'))
      }

      const data = await response.json()
      const websiteData = data.data || data

      // Check if current user owns the website
      if (websiteData.submittedBy !== user?.id) {
        setError(tEdit('errors.only_own_websites'))
        return
      }

      setWebsite(websiteData)

      // Process features data
      const processFeatures = (features: any) => {
        if (!features) return [{ name: '', description: '' }]
        try {
          const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features
          if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
            if (typeof parsedFeatures[0] === 'object' && parsedFeatures[0].name) {
              return parsedFeatures
            }
            return parsedFeatures.map((f: string) => ({ name: f, description: '' }))
          }
          return [{ name: '', description: '' }]
        } catch {
          return [{ name: '', description: '' }]
        }
      }

      // Reset form with fetched data
      reset({
        title: websiteData.title,
        url: websiteData.url,
        email: websiteData.email || '',
        description: websiteData.description,
        category_id: websiteData.category_id.toString(),
        tagline: websiteData.tagline || '',
        tags: websiteData.tags ?
          (typeof websiteData.tags === 'string' ?
            websiteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) :
            websiteData.tags
          ) : [],
        features: processFeatures(websiteData.features),
        use_cases: websiteData.use_cases || [],
        target_audience: websiteData.target_audience || [],
        faq: websiteData.faq || [],
        pricing_model: websiteData.pricing_model || '',
        pricing_plans: websiteData.pricing_plans || [],
        has_free_version: websiteData.has_free_version || false,
        api_available: websiteData.api_available || false,
        twitter_url: websiteData.twitter_url || '',
        linkedin_url: websiteData.linkedin_url || '',
        facebook_url: websiteData.facebook_url || '',
        instagram_url: websiteData.instagram_url || '',
        youtube_url: websiteData.youtube_url || '',
        discord_url: websiteData.discord_url || '',
        integrations: websiteData.integrations || [],
        ios_app_url: websiteData.ios_app_url || '',
        android_app_url: websiteData.android_app_url || '',
        web_app_url: websiteData.web_app_url || '',
        desktop_platforms: websiteData.desktop_platforms || []
      })
    } catch (error) {
      console.error('Error fetching website:', error)
      setError(tEdit('errors.fetch_failed'))
    } finally {
      setLoading(false)
    }
  }, [websiteId, user?.id, reset, tEdit])

  useEffect(() => {
    if (isLoaded && isSignedIn && websiteId) {
      fetchWebsite()
    }
  }, [isLoaded, isSignedIn, websiteId, fetchWebsite])

  return {
    isLoaded,
    isSignedIn,
    loading,
    error,
    website
  }
}

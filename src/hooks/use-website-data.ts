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
  categoryId: number
  thumbnail: string | null
  logoUrl: string | null
  status: string
  submittedBy: string
  tagline: string | null
  email: string | null
  features: any
  useCases: string[] | null
  targetAudience: string[] | null
  faq: Array<{question: string, answer: string}> | null
  pricingModel: string
  hasFreeVersion: boolean
  apiAvailable: boolean
  tags: string[] | null
  twitterUrl: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  discordUrl: string | null
  integrations: string[] | null
  iosAppUrl: string | null
  androidAppUrl: string | null
  webAppUrl: string | null
  desktopPlatforms: string[] | null
  pricingPlans: Array<{name: string, billing_cycle: string, price: string, features: string[]}> | null
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
        categoryId: websiteData.categoryId.toString(),
        tagline: websiteData.tagline || '',
        thumbnail: websiteData.thumbnail || '',
        logoUrl: websiteData.logoUrl || '',
        tags: websiteData.tags || [],
        features: processFeatures(websiteData.features),
        useCases: websiteData.useCases || [],
        targetAudience: websiteData.targetAudience || [],
        faq: websiteData.faq || [],
        pricingModel: websiteData.pricingModel || '',
        pricingPlans: websiteData.pricingPlans || [],
        hasFreeVersion: websiteData.hasFreeVersion || false,
        apiAvailable: websiteData.apiAvailable || false,
        twitterUrl: websiteData.twitterUrl || '',
        linkedinUrl: websiteData.linkedinUrl || '',
        facebookUrl: websiteData.facebookUrl || '',
        instagramUrl: websiteData.instagramUrl || '',
        youtubeUrl: websiteData.youtubeUrl || '',
        discordUrl: websiteData.discordUrl || '',
        integrations: websiteData.integrations || [],
        iosAppUrl: websiteData.iosAppUrl || '',
        androidAppUrl: websiteData.androidAppUrl || '',
        webAppUrl: websiteData.webAppUrl || '',
        desktopPlatforms: websiteData.desktopPlatforms || []
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

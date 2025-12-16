import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from '@/hooks/use-toast'
import { websiteEditSchema, type WebsiteEditData } from '@/lib/validations/website'

interface UseWebsiteFormProps {
  websiteId?: string
  isEdit?: boolean
}

export function useWebsiteForm({ websiteId, isEdit = false }: UseWebsiteFormProps = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tEdit = useTranslations('profile.edit')
  const tMessages = useTranslations('profile.submit.messages')

  const form = useForm<WebsiteEditData>({
    resolver: zodResolver(websiteEditSchema),
    defaultValues: {
      url: '',
      email: '',
      title: '',
      categoryId: '',
      tags: [] as string[],
      tagline: '',
      description: '',
      features: [{ name: '', description: '' }],
      useCases: [] as string[],
      targetAudience: [] as string[],
      faq: [],
      pricingModel: '',
      hasFreeVersion: false,
      apiAvailable: false,
      pricingPlans: [],
      twitterUrl: '',
      linkedinUrl: '',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      discordUrl: '',
      integrations: [] as string[],
      iosAppUrl: '',
      androidAppUrl: '',
      webAppUrl: '',
      desktopPlatforms: []
    }
  })

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature
  } = useFieldArray({
    control: form.control,
    name: "features"
  })

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq
  } = useFieldArray({
    control: form.control,
    name: "faq"
  })

  const {
    fields: pricingPlansFields,
    append: appendPricingPlan,
    remove: removePricingPlan
  } = useFieldArray({
    control: form.control,
    name: "pricingPlans"
  })

  // Array manipulation helpers
  const addToArray = useCallback((fieldName: keyof WebsiteEditData, value: string) => {
    const current = form.getValues(fieldName) as string[]
    if (!current.includes(value)) {
      form.setValue(fieldName, [...current, value] as any)
    }
  }, [form])

  const removeFromArray = useCallback((fieldName: keyof WebsiteEditData, value: string) => {
    const current = form.getValues(fieldName) as string[]
    form.setValue(fieldName, current.filter(item => item !== value) as any)
  }, [form])

  // Scroll to first error field
  const scrollToFirstError = useCallback((fieldName: string) => {
    const fieldToSectionMap: Record<string, string> = {
      url: 'basic',
      email: 'basic',
      title: 'basic',
      categoryId: 'basic',
      tagline: 'basic',
      description: 'basic',
      features: 'features',
      pricingModel: 'pricing'
    }

    const sectionId = fieldToSectionMap[fieldName] || 'basic'
    const element = document.getElementById(sectionId)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [])

  // Form submission
  const onSubmit = useCallback(async (data: WebsiteEditData) => {
    setIsSubmitting(true)
    form.clearErrors()

    try {
      const submissionData = {
        ...data
      }

      const url = isEdit && websiteId ? `/api/websites/${websiteId}` : '/api/websites'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      const responseText = await response.text()

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          throw new Error(`Server returned ${response.status}: ${responseText.substring(0, 200)}...`)
        }

        if (errorData.data?.errors) {
          const firstErrorField = errorData.data.errors[0]?.field

          errorData.data.errors.forEach((error: { field: string, message: string }) => {
            form.setError(error.field as any, { message: error.message })
          })

          if (firstErrorField) {
            scrollToFirstError(firstErrorField)
          }

          toast.error(tMessages('fix_form_errors'))
        } else {
          throw new Error(errorData.message || 'Submission failed')
        }
        return
      }

      // Parse response for logging (optional)
      JSON.parse(responseText)

      toast.success(isEdit ? tEdit('success.updated') : 'Tool submitted successfully!')
      router.push('/profile/submissions')
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : (isEdit ? tEdit('errors.update_failed') : 'Submission failed'))
    } finally {
      setIsSubmitting(false)
    }
  }, [isEdit, websiteId, form, tEdit, tMessages, scrollToFirstError, router])

  // Handle form submission with validation
  const handleFormSubmit = useCallback(async () => {
    form.clearErrors()

    const isValid = await form.trigger()

    if (!isValid) {
      const errors = form.formState.errors
      const firstErrorField = Object.keys(errors)[0]

      if (firstErrorField) {
        scrollToFirstError(firstErrorField)
      }

      // Get the first error message with more detailed info
      let errorMessage = tMessages('fill_required_fields')
      let errorDetails: string[] = []

      // Helper function to extract error message from nested errors (without path prefix)
      const getErrorMessage = (error: any): string | null => {
        if (error?.message) {
          return error.message
        }
        if (Array.isArray(error)) {
          for (let i = 0; i < error.length; i++) {
            const msg = getErrorMessage(error[i])
            if (msg) return msg
          }
        }
        if (typeof error === 'object' && error !== null) {
          for (const key in error) {
            const msg = getErrorMessage(error[key])
            if (msg) return msg
          }
        }
        return null
      }

      // Collect all error messages
      for (const [field, error] of Object.entries(errors)) {
        const msg = getErrorMessage(error)
        if (msg) {
          errorDetails.push(msg)
        }
      }

      if (errorDetails.length > 0) {
        errorMessage = errorDetails[0]
      }

      toast.error(errorMessage)
      return
    }

    const data = form.getValues()
    await onSubmit(data)
  }, [form, onSubmit, scrollToFirstError, tMessages])

  return {
    form,
    isSubmitting,
    featureFields,
    appendFeature,
    removeFeature,
    faqFields,
    appendFaq,
    removeFaq,
    pricingPlansFields,
    appendPricingPlan,
    removePricingPlan,
    addToArray,
    removeFromArray,
    handleFormSubmit
  }
}

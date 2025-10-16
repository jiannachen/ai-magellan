'use client'

import React from 'react'
import Link from 'next/link'
import { RedirectToSignIn } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Button } from '@/ui/common/button'
import GlobalLoading from '@/components/loading/global-loading'
import { BasicInfoWithTagsSection } from '@/components/forms/BasicInfoWithTagsSection'
import { FeaturesSection } from '@/components/forms/FeaturesSection'
import { AudienceUseCasesSection } from '@/components/forms/AudienceUseCasesSection'
import { PricingSection } from '@/components/forms/PricingSection'
import { SocialPlatformsSection } from '@/components/forms/SocialPlatformsSection'
import { FormNavigationSidebar } from '@/components/forms/FormNavigationSidebar'
import { useWebsiteForm } from '@/hooks/use-website-form'
import { useCategories } from '@/hooks/use-categories'
import {
  Map,
  Compass,
  Send,
  ArrowRight
} from 'lucide-react'

export default function SubmitPage() {
  const { isSignedIn, isLoaded } = useUser()

  // Translation hooks
  const t = useTranslations()
  const tSubmit = useTranslations('profile.submit')

  // Custom hooks for form management
  const {
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
  } = useWebsiteForm({ isEdit: false })

  // Load categories
  const { categories, selectedParentCategory, setSelectedParentCategory, subcategories } = useCategories()

  // Early returns
  if (!isLoaded) {
    return <GlobalLoading variant="fullscreen" />
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tSubmit('page_title')}</h1>
              <p className="text-muted-foreground">{tSubmit('page_description')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <FormNavigationSidebar
            title={tSubmit('submit_tool')}
            subtitle={tSubmit('fill_information')}
          />

          {/* Right Form Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              <BasicInfoWithTagsSection
                register={form.register}
                watch={form.watch}
                setValue={form.setValue}
                clearErrors={form.clearErrors}
                errors={form.formState.errors}
                categories={categories}
                selectedParentCategory={selectedParentCategory}
                setSelectedParentCategory={setSelectedParentCategory}
                subcategories={subcategories}
              />

              <FeaturesSection
                register={form.register}
                control={form.control}
                errors={form.formState.errors}
                featureFields={featureFields}
                appendFeature={appendFeature}
                removeFeature={removeFeature}
              />

              <AudienceUseCasesSection
                register={form.register}
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                errors={form.formState.errors}
                faqFields={faqFields}
                appendFaq={appendFaq}
                removeFaq={removeFaq}
              />

              <PricingSection
                register={form.register}
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                clearErrors={form.clearErrors}
                errors={form.formState.errors}
                pricingPlansFields={pricingPlansFields}
                appendPricingPlan={appendPricingPlan}
                removePricingPlan={removePricingPlan}
              />

              <SocialPlatformsSection
                register={form.register}
                watch={form.watch}
                setValue={form.setValue}
                errors={form.formState.errors}
                addToArray={addToArray}
                removeFromArray={removeFromArray}
              />

              {/* Add padding at bottom to prevent content from being hidden by fixed action bar and bottom nav */}
              {/* Mobile: Action bar (56px) + Bottom nav (80px) + safe area = ~152px */}
              {/* Desktop: Action bar (64px) + spacing = ~80px */}
              <div className="h-40 md:h-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar at Bottom */}
      {/* Mobile: Position above bottom nav (80px) */}
      {/* Desktop: Position at bottom with no offset */}
      <div className="fixed left-0 right-0 z-[60] bg-background/95 backdrop-blur-sm border-t border-border shadow-lg bottom-[80px] md:bottom-0">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Back Button */}
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-1 sm:gap-2 hover:bg-primary/10 h-9 sm:h-10 px-3 sm:px-4">
                <ArrowRight className="h-4 w-4 rotate-180" />
                <span className="hidden sm:inline">{t('common.back')}</span>
                <span className="sm:hidden">{t('common.back')}</span>
              </Button>
            </Link>

            {/* Right: Submit Button */}
            <Button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-magellan-teal hover:from-primary/90 hover:to-magellan-teal/90 !text-white [&_*]:!text-white flex-1 sm:flex-none sm:min-w-[200px] h-9 sm:h-10"
            >
              {isSubmitting ? (
                <GlobalLoading variant="inline" size="sm" message={t('feedback.dialog.submitting')} />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {tSubmit('submit_button')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

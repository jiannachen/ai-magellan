'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/ui/common/card'
import { Map, Compass } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface FormSection {
  id: string
  title: string
  icon: LucideIcon
  description: string
}

interface FormNavigationSidebarProps {
  title: string
  subtitle: string
}

/**
 * Form Navigation Sidebar Component
 * Displays navigation for multi-section forms (Submit & Edit pages)
 */
export function FormNavigationSidebar({ title, subtitle }: FormNavigationSidebarProps) {
  const tSubmit = useTranslations('profile.submit')

  // Form navigation sections configuration (using translations)
  const FORM_SECTIONS: FormSection[] = [
    { id: 'basic', title: tSubmit('basic_info'), icon: Map, description: tSubmit('basic_info_desc') },
    { id: 'features', title: tSubmit('key_features'), icon: Map, description: tSubmit('features_desc') },
    { id: 'audience', title: tSubmit('use_cases_audience'), icon: Map, description: tSubmit('audience_desc') },
    { id: 'pricing', title: tSubmit('pricing_info'), icon: Map, description: tSubmit('pricing_desc') },
    { id: 'social', title: tSubmit('social_integrations'), icon: Map, description: tSubmit('social_desc') },
    { id: 'platforms', title: tSubmit('platform_support'), icon: Map, description: tSubmit('platforms_desc') }
  ]

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="lg:col-span-1 min-h-screen">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <Card className="p-6">
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <nav className="space-y-2">
            {FORM_SECTIONS.map((section) => {
              const SectionIcon = section.icon

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionClick(section.id)}
                  className="w-full text-left p-3 rounded-lg transition-all duration-200 border hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {section.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </Card>
      </div>
    </div>
  )
}

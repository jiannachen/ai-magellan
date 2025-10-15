'use client'

import React, { memo, useCallback } from 'react'
import { Control, UseFormRegister, FieldErrors } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/ui/common/input'
import { Label } from '@/ui/common/label'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { WebsiteEditData } from '@/lib/validations/website'
import { Plus, X, Zap, Lightbulb } from 'lucide-react'

interface FeaturesSectionProps {
  register: UseFormRegister<WebsiteEditData>
  control: Control<WebsiteEditData>
  errors: FieldErrors<WebsiteEditData>
  featureFields: any[]
  appendFeature: (feature: { name: string; description: string }) => void
  removeFeature: (index: number) => void
}

export const FeaturesSection = memo(function FeaturesSection({
  register,
  errors,
  featureFields,
  appendFeature,
  removeFeature
}: FeaturesSectionProps) {
  const tSubmit = useTranslations('profile.submit')
  const tForm = useTranslations('form')

  const handleAppendFeature = useCallback(() => {
    appendFeature({ name: '', description: '' })
  }, [appendFeature])

  const handleRemoveFeature = useCallback((index: number) => {
    removeFeature(index)
  }, [removeFeature])

  return (
    <Card id="features" className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {tSubmit('key_features')}
          <span className="text-destructive ml-2">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        {errors.features && (
          <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
            {errors.features.message}
          </p>
        )}
        <div className="space-y-3">
          {featureFields.map((field, index) => (
            <div key={field.id} className="border border-border/60 rounded-lg p-4 hover:border-border transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFeature(index)}
                  disabled={featureFields.length === 1}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Input
                    placeholder={tForm('feature_name_placeholder')}
                    {...register(`features.${index}.name`)}
                    className="text-sm"
                  />
                  {errors.features?.[index]?.name && (
                    <p className="text-xs text-destructive">
                      {errors.features[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Input
                    placeholder={tForm('feature_description_placeholder')}
                    {...register(`features.${index}.description`)}
                    className="text-sm"
                  />
                  {errors.features?.[index]?.description && (
                    <p className="text-xs text-destructive">
                      {errors.features[index]?.description?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAppendFeature}
            className="w-full border-dashed h-9"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {tForm('add_feature')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
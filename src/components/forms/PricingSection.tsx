'use client'

import React, { useCallback } from 'react'
import { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/utils'
import { Input } from '@/ui/common/input'
import { Label } from '@/ui/common/label'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/common/select'
import { Checkbox } from '@/ui/common/checkbox'
import { WebsiteEditData } from '@/lib/validations/website'
import { Plus, X, Coins, Star, Code } from 'lucide-react'

const PRICING_MODEL_VALUES = [
  'free', 'freemium', 'subscription', 'tiered', 'custom', 
  'one_time', 'tiered_subscription', 'usage_based', 'pay_as_you_go', 'open_source'
]

interface PricingSectionProps {
  register: UseFormRegister<WebsiteEditData>
  control: Control<WebsiteEditData>
  watch: UseFormWatch<WebsiteEditData>
  setValue: UseFormSetValue<WebsiteEditData>
  clearErrors: (field?: any) => void
  errors: FieldErrors<WebsiteEditData>
  pricingPlansFields: any[]
  appendPricingPlan: (plan: { name: string; billing_cycle: string; price: string; features: string[] }) => void
  removePricingPlan: (index: number) => void
}

export function PricingSection({
  register,
  watch,
  setValue,
  clearErrors,
  errors,
  pricingPlansFields,
  appendPricingPlan,
  removePricingPlan
}: PricingSectionProps) {
  const tSubmit = useTranslations('profile.submit')
  const tForm = useTranslations('form')
  const tPricing = useTranslations('pricing_models')

  const handleAppendPricingPlan = useCallback(() => {
    appendPricingPlan({
      name: '',
      billing_cycle: '',
      price: '',
      features: ['']
    })
  }, [appendPricingPlan])

  const handleRemovePricingPlan = useCallback((index: number) => {
    removePricingPlan(index)
  }, [removePricingPlan])

  return (
    <Card id="pricing" className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          {tSubmit('pricing_info')}
          <span className="text-destructive ml-2">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {/* Pricing Model - Button Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            {tForm('pricing_model')}
            <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {PRICING_MODEL_VALUES.map((model) => (
              <Button
                key={model}
                type="button"
                variant={watch('pricing_model') === model ? "default" : "outline"}
                onClick={() => {
                  setValue('pricing_model', model as any)
                  clearErrors('pricing_model')
                }}
                className={cn(
                  "h-auto py-2 px-3 justify-center text-center font-normal transition-all",
                  watch('pricing_model') === model
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted"
                )}
              >
                <span className="text-sm">{tPricing(model)}</span>
              </Button>
            ))}
          </div>
          {errors.pricing_model && (
            <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
              {errors.pricing_model.message}
            </p>
          )}
        </div>

        {/* Free Version & API Available */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Version */}
          <label htmlFor="has_free_version" className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-magellan-primary/30 hover:bg-magellan-primary/5 transition-all duration-200 group cursor-pointer">
            <Checkbox
              id="has_free_version"
              checked={watch('has_free_version') || false}
              onCheckedChange={(checked) => {
                setValue('has_free_version', !!checked, { shouldValidate: true, shouldDirty: true })
              }}
              className="w-5 h-5 border-2 border-border group-hover:border-magellan-primary/50 data-[state=checked]:bg-magellan-primary data-[state=checked]:border-magellan-primary data-[state=checked]:text-white"
            />
            <span className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1 group-hover:text-magellan-primary transition-colors">
              <Star className="h-4 w-4 text-magellan-primary" />
              <span className="font-medium">{tForm('has_free_version')}</span>
            </span>
          </label>

          {/* API Available */}
          <label htmlFor="api_available" className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group cursor-pointer">
            <Checkbox
              id="api_available"
              checked={watch('api_available') || false}
              onCheckedChange={(checked) => {
                setValue('api_available', !!checked, { shouldValidate: true, shouldDirty: true })
              }}
              className="w-5 h-5 border-2 border-border group-hover:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
            />
            <span className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1 group-hover:text-primary transition-colors">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-medium">{tForm('api_available')}</span>
            </span>
          </label>
        </div>

        {/* Pricing Plans Section */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('pricing_plans')}</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAppendPricingPlan}
              disabled={pricingPlansFields.length >= 6}
            >
              <Plus className="h-4 w-4 mr-2" />
              {tForm('add_pricing_plan')}
            </Button>
          </div>

          {pricingPlansFields.length > 0 && (
            <div className="space-y-4">
              {pricingPlansFields.map((field, index) => (
                <div key={field.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {tForm('pricing_plan')} {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePricingPlan(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {tForm('plan_name')}
                      </Label>
                      <Input
                        placeholder={tForm('plan_name_placeholder')}
                        {...register(`pricing_plans.${index}.name` as const)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {tForm('billing_cycle')}
                      </Label>
                      <Select
                        value={watch(`pricing_plans.${index}.billing_cycle`) || ''}
                        onValueChange={(value) => setValue(`pricing_plans.${index}.billing_cycle`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tForm('please_select')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">{tForm('monthly')}</SelectItem>
                          <SelectItem value="yearly">{tForm('yearly')}</SelectItem>
                          <SelectItem value="one_time">{tForm('one_time')}</SelectItem>
                          <SelectItem value="usage_based">{tForm('usage_based')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {tForm('price')}
                      </Label>
                      <Input
                        placeholder={tForm('price_placeholder')}
                        {...register(`pricing_plans.${index}.price` as const)}
                      />
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {tForm('plan_features')}
                    </Label>
                    <div className="space-y-2">
                      {(watch(`pricing_plans.${index}.features`) || ['']).map((_, featureIndex) => (
                        <div key={featureIndex} className="flex gap-2">
                          <Input
                            placeholder={tForm('plan_feature_placeholder')}
                            {...register(`pricing_plans.${index}.features.${featureIndex}` as const)}
                          />
                          {featureIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentFeatures = watch(`pricing_plans.${index}.features`) || []
                                const newFeatures = currentFeatures.filter((_, i) => i !== featureIndex)
                                setValue(`pricing_plans.${index}.features`, newFeatures)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {(watch(`pricing_plans.${index}.features`) || []).length < 5 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentFeatures = watch(`pricing_plans.${index}.features`) || ['']
                            setValue(`pricing_plans.${index}.features`, [...currentFeatures, ''])
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {tForm('add_feature')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-2">
            {tSubmit('pricing_plans_help')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import React, { useCallback } from 'react'
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/ui/common/input'
import { Label } from '@/ui/common/label'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Checkbox } from '@/ui/common/checkbox'
import { WebsiteEditData } from '@/lib/validations/website'
import { Plus, X, Waves, Anchor, Globe, MessageSquare, Smartphone, Monitor, Laptop } from 'lucide-react'

const SOCIAL_PLATFORMS = [
  { key: 'twitter_url', labelKey: 'twitter', icon: MessageSquare, placeholderKey: 'twitter_placeholder' },
  { key: 'linkedin_url', labelKey: 'linkedin', icon: MessageSquare, placeholderKey: 'linkedin_placeholder' },
  { key: 'facebook_url', labelKey: 'facebook', icon: Globe, placeholderKey: 'facebook_placeholder' },
  { key: 'instagram_url', labelKey: 'instagram', icon: Globe, placeholderKey: 'instagram_placeholder' },
  { key: 'youtube_url', labelKey: 'youtube', icon: MessageSquare, placeholderKey: 'youtube_placeholder' },
  { key: 'discord_url', labelKey: 'discord', icon: MessageSquare, placeholderKey: 'discord_placeholder' }
]

const COMMON_INTEGRATIONS = [
  'Slack', 'Discord', 'Telegram', 'Zapier', 'API', 'Webhook',
  'Google Sheets', 'Notion', 'Trello', 'Asana', 'GitHub',
  'OpenAI', 'Anthropic', 'HuggingFace', 'AWS', 'Azure', 'Stripe',
  'PayPal', 'Shopify', 'WordPress', 'Salesforce'
]

const DESKTOP_PLATFORMS = [
  { value: 'mac', key: 'macos', icon: Laptop },
  { value: 'windows', key: 'windows', icon: Monitor },
  { value: 'linux', key: 'linux', icon: Monitor }
]

interface SocialPlatformsSectionProps {
  register: UseFormRegister<WebsiteEditData>
  watch: UseFormWatch<WebsiteEditData>
  setValue: UseFormSetValue<WebsiteEditData>
  errors: FieldErrors<WebsiteEditData>
  addToArray: (fieldName: keyof WebsiteEditData, value: string) => void
  removeFromArray: (fieldName: keyof WebsiteEditData, value: string) => void
}

export function SocialPlatformsSection({
  register,
  watch,
  setValue,
  errors,
  addToArray,
  removeFromArray
}: SocialPlatformsSectionProps) {
  const tSubmit = useTranslations('profile.submit')
  const tForm = useTranslations('form')

  const integrations = watch('integrations') || []
  const desktopPlatforms = watch('desktop_platforms') || []

  const handleAddIntegration = useCallback(() => {
    const current = watch('integrations') || []
    setValue('integrations', [...current, ''], { shouldValidate: true, shouldDirty: true })
  }, [watch, setValue])

  const handleToggleIntegration = useCallback((integration: string) => {
    const current = watch('integrations') || []
    if (current.includes(integration)) {
      removeFromArray('integrations', integration)
    } else {
      addToArray('integrations', integration)
    }
  }, [watch, addToArray, removeFromArray])

  const handleIntegrationChange = useCallback((oldValue: string, newValue: string) => {
    const current = watch('integrations') || []
    const updated = [...current]
    const index = updated.indexOf(oldValue)
    if (index !== -1) {
      updated[index] = newValue
      setValue('integrations', updated, { shouldValidate: true, shouldDirty: true })
    }
  }, [watch, setValue])

  return (
    <>
      {/* Social Media */}
      <Card id="social" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            {tSubmit('social_integrations')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const IconComponent = platform.icon
              return (
                <div key={platform.key} className="space-y-2">
                  <Label htmlFor={platform.key} className="text-sm font-medium flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    {tForm(platform.labelKey)}
                  </Label>
                  <Input
                    id={platform.key}
                    placeholder={tForm(platform.placeholderKey)}
                    {...register(platform.key as any)}
                  />
                  {errors[platform.key as keyof typeof errors] && (
                    <p className="text-sm text-destructive">
                      {errors[platform.key as keyof typeof errors]?.message === 'Please enter a valid URL' 
                        ? tSubmit('validation.valid_url')
                        : errors[platform.key as keyof typeof errors]?.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <Anchor className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('integrations')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{tSubmit('integrations_help')}</p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_INTEGRATIONS.map((integration) => (
                  <Button
                    key={integration}
                    type="button"
                    variant={integrations.includes(integration) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleIntegration(integration)}
                  >
                    {integration}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                {integrations.filter(integration => !COMMON_INTEGRATIONS.includes(integration)).map((integration, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={integration}
                      onChange={(e) => handleIntegrationChange(integration, e.target.value)}
                      placeholder={tForm('integration_name_placeholder')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromArray('integrations', integration)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddIntegration}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tForm('add_integration')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Support */}
      <Card id="platforms" className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5 text-primary" />
            {tSubmit('platform_support')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          {/* Mobile Apps */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('mobile_apps')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ios_app_url" className="text-sm font-medium">{tForm('ios_app_url')}</Label>
                <Input
                  id="ios_app_url"
                  placeholder={tForm('ios_placeholder')}
                  {...register('ios_app_url')}
                />
                {errors.ios_app_url && (
                  <p className="text-sm text-destructive">
                    {errors.ios_app_url.message === 'Please enter a valid URL'
                      ? tSubmit('validation.valid_url')
                      : errors.ios_app_url.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="android_app_url" className="text-sm font-medium">{tForm('android_app_url')}</Label>
                <Input
                  id="android_app_url"
                  placeholder={tForm('android_placeholder')}
                  {...register('android_app_url')}
                />
                {errors.android_app_url && (
                  <p className="text-sm text-destructive">
                    {errors.android_app_url.message === 'Please enter a valid URL'
                      ? tSubmit('validation.valid_url')
                      : errors.android_app_url.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Web App */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('web_app')}</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="web_app_url" className="text-sm font-medium">{tForm('web_app_url')}</Label>
              <Input
                id="web_app_url"
                placeholder={tForm('web_app_placeholder')}
                {...register('web_app_url')}
              />
              {errors.web_app_url && (
                <p className="text-sm text-destructive">
                  {errors.web_app_url.message === 'Please enter a valid URL'
                    ? tSubmit('validation.valid_url')
                    : errors.web_app_url.message}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Platforms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('desktop_apps')}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DESKTOP_PLATFORMS.map((platform) => {
                const PlatformIcon = platform.icon
                const isChecked = desktopPlatforms.includes(platform.value as any)
                return (
                  <label
                    key={platform.value}
                    htmlFor={platform.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group cursor-pointer"
                  >
                    <Checkbox
                      id={platform.value}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addToArray('desktop_platforms', platform.value)
                        } else {
                          removeFromArray('desktop_platforms', platform.value)
                        }
                      }}
                      className="w-5 h-5 border-2 border-border group-hover:border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1 group-hover:text-primary transition-colors">
                      <PlatformIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{tForm(platform.key)}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
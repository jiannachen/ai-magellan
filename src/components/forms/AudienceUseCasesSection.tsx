'use client'

import React from 'react'
import { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Input } from '@/ui/common/input'
import { Textarea } from '@/ui/common/textarea'
import { Button } from '@/ui/common/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { WebsiteEditData } from '@/lib/validations/website'
import { Plus, X, Users, Target, HelpCircle } from 'lucide-react'

interface AudienceUseCasesSectionProps {
  register: UseFormRegister<WebsiteEditData>
  control: Control<WebsiteEditData>
  watch: UseFormWatch<WebsiteEditData>
  setValue: UseFormSetValue<WebsiteEditData>
  errors: FieldErrors<WebsiteEditData>
  faqFields: any[]
  appendFaq: (faq: { question: string; answer: string }) => void
  removeFaq: (index: number) => void
}

export function AudienceUseCasesSection({
  register,
  watch,
  setValue,
  faqFields,
  appendFaq,
  removeFaq
}: AudienceUseCasesSectionProps) {
  const tSubmit = useTranslations('profile.submit')
  const tForm = useTranslations('form')

  // 直接从表单获取数组值
  const useCases = watch('useCases') || []
  const targetAudience = watch('targetAudience') || []

  // 添加用例
  const addUseCase = () => {
    setValue('useCases', [...useCases, ''])
  }

  // 删除用例
  const removeUseCase = (index: number) => {
    setValue('useCases', useCases.filter((_, i) => i !== index))
  }

  // 添加目标受众
  const addTargetAudience = () => {
    setValue('targetAudience', [...targetAudience, ''])
  }

  // 删除目标受众
  const removeTargetAudience = (index: number) => {
    setValue('targetAudience', targetAudience.filter((_, i) => i !== index))
  }

  return (
    <Card id="audience" className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {tSubmit('use_cases_audience')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Use Cases */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('useCases')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{tSubmit('use_cases_help')}</p>
            <div className="space-y-3">
              {useCases.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUseCase}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tForm('add_use_case')}
                </Button>
              ) : (
                <>
                  {useCases.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={tForm('use_case_placeholder')}
                        {...register(`useCases.${index}` as const)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeUseCase(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addUseCase}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tForm('add_use_case')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{tForm('targetAudience')}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{tSubmit('target_audience_help')}</p>
            <div className="space-y-3">
              {targetAudience.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTargetAudience}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {tForm('add_target_audience')}
                </Button>
              ) : (
                <>
                  {targetAudience.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={tForm('target_audience_placeholder')}
                        {...register(`targetAudience.${index}` as const)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTargetAudience(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTargetAudience}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {tForm('add_target_audience')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{tForm('faq')}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{tForm('faq_description')}</p>
          <div className="space-y-3">
            {faqFields.map((field, index) => (
              <div key={field.id} className="border border-border/60 rounded-lg p-4 hover:border-border transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">FAQ #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaq(index)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder={tForm('question_placeholder')}
                    {...register(`faq.${index}.question`)}
                    className="text-sm"
                  />
                  <Textarea
                    placeholder={tForm('answer_placeholder')}
                    rows={2}
                    {...register(`faq.${index}.answer`)}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendFaq({ question: '', answer: '' })}
              className="w-full border-dashed h-9"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {tForm('add_faq')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
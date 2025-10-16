'use client'

import { SignIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/common/card'
import { Compass, Anchor, MapPin, Navigation, Ship } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function SignInPage() {
  const t = useTranslations()

  return (
    <div className="relative min-h-[100dvh]">
      {/* 背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B4F8C] via-[#1E3A8A] to-[#0F766E]">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/20 to-transparent -skew-y-1"></div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white/15 to-transparent skew-y-1"></div>
          <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2">
            <Compass className="h-28 w-28 text-white/30 animate-[professional-compass-rotate_20s_linear_infinite]" />
          </div>
          <div className="absolute top-3/4 left-1/4 -translate-x-1/2 translate-y-1/2">
            <Ship className="h-20 w-20 text-white/20" />
          </div>
        </div>
      </div>

      {/* 内容层：单一响应式布局 */}
      <div className="relative z-10 container mx-auto max-w-screen-lg grid grid-cols-1 lg:grid-cols-2 gap-6 items-center px-4 py-8 sm:py-12 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {/* 品牌区 */}
        <section className="text-center lg:text-left max-w-md mx-auto lg:mx-0">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <Compass className="h-16 w-16 text-[#0B4F8C]" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            {t('header.title')}
          </h1>
          <p className="text-white/90 text-lg lg:text-xl font-medium mb-2">
            {t('header.subtitle')}
          </p>
          <p className="text-white/80 text-base leading-relaxed">
            {t('header.description')}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 text-white/85">
              <MapPin className="h-5 w-5 text-[#10B981]" />
              <span className="text-sm">{t('auth.harbor.feature_1')}</span>
            </div>
            <div className="flex items-center gap-3 text-white/85">
              <Anchor className="h-5 w-5 text-[#0F766E]" />
              <span className="text-sm">{t('auth.harbor.feature_2')}</span>
            </div>
            <div className="flex items-center gap-3 text-white/85">
              <Navigation className="h-5 w-5 text-[#F97316]" />
              <span className="text-sm">{t('auth.harbor.feature_3')}</span>
            </div>
          </div>
        </section>

        {/* 表单区 */}
        <section className="w-full max-w-sm sm:max-w-md mx-auto">
          <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center relative pb-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-[#0B4F8C] rounded-full p-2 shadow-lg">
                  <Anchor className="h-4 w-4 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-[#0B4F8C] pt-4">
                {t('auth.harbor.title')}
              </CardTitle>
              <CardDescription className="text-[#374151]">
                {t('auth.harbor.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-4">
              <SignIn 
                appearance={{
                  elements: {
                    formButtonPrimary: 'h-11 text-base bg-[#0B4F8C] hover:bg-[#083A6B] text-white font-medium transition-all duration-200',
                    card: 'shadow-none border-0 bg-transparent',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formFieldInput: 'h-11 text-base border-gray-200 focus:border-[#0B4F8C] focus:ring-[#0B4F8C]/20',
                    footerActionLink: 'text-[#0B4F8C] hover:text-[#083A6B]',
                    dividerLine: 'bg-gray-200',
                    dividerText: 'text-gray-500',
                    socialButtonsBlockButton: 'h-11 border-gray-200 hover:bg-gray-50 text-gray-700',
                    socialButtonsBlockButtonText: 'font-medium',
                  }
                }}
              />
            </CardContent>
            <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <div className="text-center">
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  <Compass className="h-3 w-3" />
                  {t('auth.harbor.return_to_base')}
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}


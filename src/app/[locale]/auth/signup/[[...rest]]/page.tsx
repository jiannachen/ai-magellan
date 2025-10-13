'use client'

import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/common/card'
import { Compass, Anchor, MapPin, Star, Navigation } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function SignUpPage() {
  const t = useTranslations()

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* 航海主题背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B4F8C] via-[#1E3A8A] to-[#0F766E]">
        {/* 专业级背景装饰 - 降低透明度 */}
        <div className="absolute inset-0 opacity-[0.08]">
          {/* 波浪纹理 */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent transform -skew-y-1"></div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/15 to-transparent transform skew-y-1"></div>
          
          {/* 航海装饰元素 */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
            <div className="professional-compass">
              <Compass className="h-32 w-32 text-white/30" />
            </div>
          </div>
          <div className="absolute top-3/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
            <Anchor className="h-24 w-24 text-white/20" />
          </div>
        </div>
      </div>

      {/* 左侧：品牌展示区域 */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <div className="relative bg-white rounded-full p-4 shadow-lg">
                <Compass className="h-16 w-16 text-[#0B4F8C] professional-compass" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            {t('header.title')}
          </h1>
          <p className="text-white/90 text-xl font-medium mb-2">
            {t('header.subtitle')}
          </p>
          <p className="text-white/70 text-base leading-relaxed">
            {t('header.description')}
          </p>
          
          {/* 探险福利预览 */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 text-white/80">
              <MapPin className="h-5 w-5 text-[#10B981]" />
              <span className="text-sm">{t('auth.expedition.benefit_1')}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Anchor className="h-5 w-5 text-[#0F766E]" />
              <span className="text-sm">{t('auth.expedition.benefit_2')}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Navigation className="h-5 w-5 text-[#F97316]" />
              <span className="text-sm">{t('auth.expedition.benefit_3')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：注册表单区域 */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 text-center relative pb-4">
              {/* 航海装饰 */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#0B4F8C] rounded-full p-2 shadow-lg">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <CardTitle className="text-2xl text-[#0B4F8C] pt-4">
                {t('auth.expedition.title')}
              </CardTitle>
              <CardDescription className="text-[#374151]">
                {t('auth.expedition.subtitle')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex justify-center pb-4">
              <SignUp 
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-[#0B4F8C] hover:bg-[#083A6B] text-white font-medium transition-all duration-200',
                    card: 'shadow-none border-0 bg-transparent',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    formFieldInput: 'border-gray-200 focus:border-[#0B4F8C] focus:ring-[#0B4F8C]/20',
                    footerActionLink: 'text-[#0B4F8C] hover:text-[#083A6B]',
                    dividerLine: 'bg-gray-200',
                    dividerText: 'text-gray-500',
                    socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 text-gray-700',
                    socialButtonsBlockButtonText: 'font-medium',
                  }
                }}
              />
            </CardContent>
            
            {/* 导航链接 */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t('auth.expedition.already_member')}{' '}
                  <Link 
                    href="/auth/signin" 
                    className="font-medium text-[#0B4F8C] hover:text-[#083A6B] transition-colors"
                  >
                    {t('auth.expedition.login_here')}
                  </Link>
                </p>
                <Link 
                  href="/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-xs mt-2"
                >
                  <Compass className="h-3 w-3" />
                  {t('auth.expedition.return_to_base')}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 移动端响应式布局 */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-[#0B4F8C] via-[#1E3A8A] to-[#0F766E] z-5">
        <div className="h-full flex flex-col justify-center items-center p-4">
          {/* 移动端品牌区域 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white rounded-full p-3 shadow-lg">
                  <Compass className="h-12 w-12 text-[#0B4F8C] professional-compass" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {t('header.title')}
            </h1>
            <p className="text-white/90 text-lg font-medium mb-1">
              {t('header.subtitle')}
            </p>
            <p className="text-white/70 text-sm">
              {t('header.description')}
            </p>
          </div>

          {/* 移动端表单 */}
          <div className="w-full max-w-sm">
            <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
              <CardHeader className="space-y-1 text-center relative pb-4">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#0B4F8C] rounded-full p-2 shadow-lg">
                    <Navigation className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <CardTitle className="text-xl text-[#0B4F8C] pt-4">
                  {t('auth.expedition.title')}
                </CardTitle>
                <CardDescription className="text-[#374151] text-sm">
                  {t('auth.expedition.subtitle')}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex justify-center pb-4">
                <SignUp 
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-[#0B4F8C] hover:bg-[#083A6B] text-white font-medium transition-all duration-200',
                      card: 'shadow-none border-0 bg-transparent',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      formFieldInput: 'border-gray-200 focus:border-[#0B4F8C] focus:ring-[#0B4F8C]/20',
                      footerActionLink: 'text-[#0B4F8C] hover:text-[#083A6B]',
                      dividerLine: 'bg-gray-200',
                      dividerText: 'text-gray-500',
                      socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 text-gray-700',
                      socialButtonsBlockButtonText: 'font-medium',
                    }
                  }}
                />
              </CardContent>
              
              <div className="border-t border-gray-100 px-6 py-4 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
                <div className="text-center">
                  <p className="text-xs text-gray-600">
                    {t('auth.expedition.already_member')}{' '}
                    <Link 
                      href="/auth/signin" 
                      className="font-medium text-[#0B4F8C] hover:text-[#083A6B] transition-colors"
                    >
                      {t('auth.expedition.login_here')}
                    </Link>
                  </p>
                  <Link 
                    href="/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-xs mt-2"
                  >
                    <Compass className="h-3 w-3" />
                    {t('auth.expedition.return_to_base')}
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* 专业级动画样式 */}
      <style jsx>{`
        .professional-compass {
          animation: professional-compass-rotate 20s linear infinite;
        }
        @keyframes professional-compass-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* 桌面端隐藏移动端布局 */
        @media (min-width: 1024px) {
          .lg\\:hidden {
            display: none !important;
          }
        }
        
        /* 移动端隐藏桌面端布局 */
        @media (max-width: 1023px) {
          .flex-1:not(.lg\\:hidden .flex-1) {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
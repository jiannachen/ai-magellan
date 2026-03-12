'use client'

import { signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/common/card'
import { Button } from '@/ui/common/button'
import { Compass, Anchor, MapPin, Navigation, Ship } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

export default function SignInPage() {
  const t = useTranslations()

  return (
    <div className="relative min-h-[100dvh]">
      {/* Background */}
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

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-screen-lg grid grid-cols-1 lg:grid-cols-2 gap-6 items-center px-4 py-8 sm:py-12 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        {/* Brand section */}
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

        {/* Login form */}
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
            <CardContent className="space-y-3 pb-6">
              <Button
                variant="outline"
                className="w-full h-12 text-base border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                <GoogleIcon className="h-5 w-5 mr-3" />
                {t('auth.continue_with_google')}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                onClick={() => signIn('github', { callbackUrl: '/' })}
              >
                <GitHubIcon className="h-5 w-5 mr-3" />
                {t('auth.continue_with_github')}
              </Button>
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

'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useTransition } from 'react'
import { Button } from '@/ui/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu'
import { Languages } from 'lucide-react'
import type { Locale } from '@/i18n'

const locales = [
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸' },
  { code: 'tw' as Locale, name: '繁體中文', flag: '🇹🇼' },
]

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  const currentLocale = locales.find(loc => loc.code === locale) || locales[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 h-9"
          disabled={isPending}
          aria-label="Select language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden lg:inline">
            {currentLocale.flag} {currentLocale.name}
          </span>
          <span className="lg:hidden">
            {currentLocale.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              locale === loc.code ? 'bg-accent' : ''
            }`}
          >
            <span>{loc.flag}</span>
            <span>{loc.name}</span>
            {locale === loc.code && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
import { Globe, MapPin, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import type { Locale } from '@/i18n'

const locales = [
  { 
    code: 'en' as Locale, 
    name: 'English', 
    flag: '🇺🇸',
    region: 'Americas',
    nativeName: 'English'
  },
  { 
    code: 'tw' as Locale, 
    name: '繁體中文', 
    flag: '🇹🇼',
    region: 'Asia Pacific',
    nativeName: '繁體中文'
  },
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
          className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-lg",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring",
            "transition-colors duration-200",
            isPending && "opacity-50 cursor-wait"
          )}
          disabled={isPending}
          aria-label="选择语言"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden lg:inline text-sm">
            {currentLocale.flag} {currentLocale.nativeName}
          </span>
          <span className="lg:hidden text-sm">
            {currentLocale.flag}
          </span>
          
          {isPending && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="min-w-[180px]"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              locale === loc.code && "bg-accent"
            )}
          >
            <span>{loc.flag}</span>
            <span>{loc.nativeName}</span>
            {locale === loc.code && (
              <CheckCircle className="h-3 w-3 ml-auto text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

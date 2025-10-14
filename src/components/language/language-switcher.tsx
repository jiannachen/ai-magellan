'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname, Link } from '@/i18n/navigation'
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
    if (newLocale === locale) return;
    
    console.log('Language switch:', { from: locale, to: newLocale, pathname });
    
    startTransition(() => {
      router.push(pathname, { locale: newLocale });
    });
  };

  const currentLocale = locales.find(loc => loc.code === locale) || locales[0]
  const otherLocale = locales.find(loc => loc.code !== locale) || locales[1]

  return (
    <>
      {/* 桌面端：保持下拉菜单 */}
      <div className="hidden lg:block">
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
                "min-w-[44px] shrink-0",
                isPending && "opacity-50 cursor-wait"
              )}
              disabled={isPending}
              aria-label="选择语言"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">
                {currentLocale.flag} {currentLocale.nativeName}
              </span>
              {isPending && (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />
              )}
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="start" 
            sideOffset={8}
            className="min-w-[140px] max-w-[160px] z-[100]"
            avoidCollisions={true}
            collisionPadding={16}
            side="bottom"
          >
            {locales.map((loc) => (
              <DropdownMenuItem asChild key={loc.code}>
                <Link
                  href={pathname}
                  locale={loc.code}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded text-sm",
                    "truncate max-w-full overflow-hidden",
                    locale === loc.code && "bg-accent"
                  )}
                  onClick={(e) => {
                    if (loc.code === locale) return;
                    startTransition(() => router.push(pathname, { locale: loc.code }));
                  }}
                >
                  <span className="shrink-0">{loc.flag}</span>
                  <span className="truncate flex-1">{loc.nativeName}</span>
                  {locale === loc.code && (
                    <CheckCircle className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 移动端：两按钮切换 */}
      <div className="flex lg:hidden items-center gap-1 bg-muted/50 rounded-lg p-1">
        {/* 当前选中的语言按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 rounded-md bg-background shadow-sm",
            "text-xs font-medium text-foreground",
            "pointer-events-none"
          )}
        >
          <span>{currentLocale.flag}</span>
        </Button>
        
        {/* 可切换到的其他语言按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 rounded-md",
            "text-xs font-medium text-muted-foreground",
            "hover:text-foreground hover:bg-background/50",
            "transition-all duration-200",
            "active:scale-95",
            isPending && "opacity-50 cursor-wait"
          )}
          onClick={() => handleLocaleChange(otherLocale.code)}
          disabled={isPending}
          aria-label={`切换到${otherLocale.nativeName}`}
        >
          <span>{otherLocale.flag}</span>
          {isPending && (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1" />
          )}
        </Button>
      </div>
    </>
  )
}

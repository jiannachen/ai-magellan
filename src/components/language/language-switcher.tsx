'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/ui/common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu'
import { Languages } from 'lucide-react'

const locales = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // 设置新的语言Cookie，设置过期时间为1年
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=lax`
      
      // 如果切换到默认语言，删除Cookie让系统使用默认值
      if (newLocale === 'en') {
        document.cookie = `NEXT_LOCALE=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
      
      window.location.reload()
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
      <DropdownMenuContent align="end">
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
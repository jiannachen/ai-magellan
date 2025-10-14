'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 将 /[locale]/profile 重定向到 /[locale]/profile/dashboard，保留当前语言
    const segments = pathname.split('/')
    const locale = segments[1] || ''
    const target = `/${locale}/profile/dashboard`
    router.replace(target)
  }, [router, pathname])

  return null
}

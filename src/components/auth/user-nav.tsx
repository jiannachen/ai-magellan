'use client'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, Link } from '@/i18n/navigation'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu'
import {
  LogIn,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { profileNavigationConfig } from '@/lib/config/profile-navigation'
import { UserNavDropdownWrapper } from './user-nav-dropdown-wrapper'

export function UserNav() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const tProfile = useTranslations('profile.navigation')

  // 头像弹窗简化版导航项 - 只保留核心功能
  const simpleNavItems = [
    {
      name: 'Dashboard',
      label: tProfile('dashboard'),
      href: '/profile/dashboard',
      icon: profileNavigationConfig.find(item => item.name === 'Dashboard')!.icon
    },
    {
      name: 'Submissions',
      label: tProfile('submissions'),
      href: '/profile/submissions',
      icon: profileNavigationConfig.find(item => item.name === 'Submissions')!.icon
    }
  ]

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    )
  }

  if (!isSignedIn) {
    return (
      <Link href="/auth/signin">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          {t('signin')}
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full"
        >
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
            <AvatarFallback className="text-sm font-medium">
              {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <UserNavDropdownWrapper className="w-[calc(100vw-40px)] sm:w-60 max-w-[260px]">
        {/* 用户信息头部 */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
              <AvatarFallback className="text-sm">
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">
                {user?.fullName || user?.firstName || 'user'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* 简化版导航菜单 */}
        {simpleNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <DropdownMenuItem key={item.name} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer",
                  isActive && "bg-primary text-white hover:bg-primary/90"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {item.label}
                </span>
              </Link>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator />

        {/* 退出登录按钮 */}
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          {t('signout')}
        </DropdownMenuItem>
      </UserNavDropdownWrapper>
    </DropdownMenu>
  )
}

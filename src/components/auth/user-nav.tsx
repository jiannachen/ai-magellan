'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, Link } from '@/i18n/navigation'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/common/dropdown-menu'
import { 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  LayoutDashboard, 
  Bookmark, 
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'

export function UserNav() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const tProfile = useTranslations('profile.navigation')

  // 个人中心导航项
  const profileNavItems = [
    {
      name: 'Dashboard',
      label: tProfile('dashboard'),
      href: '/profile/dashboard',
      icon: LayoutDashboard,
      description: tProfile('dashboard_desc')
    },
    {
      name: 'Favorites',
      label: tProfile('favorites'),
      href: '/profile/favorites',
      icon: Bookmark,
      description: tProfile('favorites_desc')
    },
    {
      name: 'Submissions',
      label: tProfile('submissions'),
      href: '/profile/submissions',
      icon: Upload,
      description: tProfile('submissions_desc')
    },
    {
      name: 'Settings',
      label: tProfile('settings'),
      href: '/profile/info',
      icon: Settings,
      description: tProfile('settings_desc')
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
    <>
      {/* 桌面端：标准下拉菜单 */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                <AvatarFallback className="text-sm font-medium">
                  {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-80" 
            align="end" 
            forceMount
            sideOffset={8}
          >
            {/* 用户信息头部 */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                  <AvatarFallback className="text-sm">
                    {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-base truncate">
                    {user?.fullName || user?.firstName || '用户'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />

            {/* 个人中心导航 */}
            {profileNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <DropdownMenuItem key={item.name} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 cursor-pointer",
                      isActive && "bg-primary text-white hover:bg-primary/90"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-foreground"
                    )} />
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-medium text-sm",
                        isActive ? "text-white" : "text-foreground"
                      )}>
                        {item.label}
                      </span>
                      <span className={cn(
                        "text-xs leading-tight",
                        isActive ? "text-white/80" : "text-muted-foreground"
                      )}>
                        {item.description}
                      </span>
                    </div>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 移动端：直接跳转到个人中心 */}
      <div className="md:hidden">
        <Link href="/profile/dashboard">
          <Button 
            variant="ghost" 
            className="relative h-11 w-11 rounded-full"
          >
            <Avatar className="h-11 w-11">
              <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
              <AvatarFallback className="text-sm font-medium">
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link>
      </div>
    </>
  )
}
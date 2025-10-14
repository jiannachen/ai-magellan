'use client'

import React from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Bookmark, 
  Upload,
  LogOut, 
  Settings,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { cn } from '@/lib/utils/utils'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const router = useRouter()
  // Translation hooks
  const tProfile = useTranslations('profile.navigation')
  const tAuth = useTranslations('auth')

  const navigation = [
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

  return (
    <div className="min-h-screen bg-background">
      {/* 主要内容区域 - 在版心内 */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-6 items-start"> {/* 移除强制最小高度 */}
          {/* 左侧导航栏（桌面端可见） */}
          <motion.aside
            className={cn(
              "hidden lg:block bg-background border border-border rounded-lg shadow-atlassian-200 transition-all duration-200",
              "w-60 lg:sticky lg:top-[5.5rem] lg:h-fit lg:self-start"
            )}
          >
            <div className="flex flex-col h-full">
              {/* 用户信息区域 */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border shadow-atlassian-100">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                    <AvatarFallback className="bg-muted text-foreground font-medium text-base">
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-atlassian-body font-medium truncate text-foreground">
                      {user?.fullName || user?.firstName || tProfile('default_user')}
                    </p>
                    <p className="text-atlassian-body-small text-muted-foreground truncate">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="p-4 space-y-1 flex-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/profile'))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block"
                    >
                      <motion.div
                        className={cn(
                          "group flex items-center px-3 py-2 text-atlassian-body font-medium rounded-[4px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] relative cursor-pointer",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isActive
                            ? "bg-primary text-white"
                            : "text-foreground hover:text-foreground hover:bg-muted"
                        )}
                        role="menuitem"
                        tabIndex={0}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-[4px]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        <div className="relative flex items-center w-full">
                          <item.icon className={cn(
                            "mr-3 h-4 w-4 flex-shrink-0 transition-colors duration-200",
                            isActive ? "text-white" : "text-foreground group-hover:text-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-atlassian-body truncate",
                              isActive ? "text-white" : "text-foreground group-hover:text-foreground"
                            )}>
                              {item.label}
                            </div>
                            <div className={cn(
                              "text-atlassian-body-small mt-0.5 leading-tight truncate",
                              isActive ? "text-white/80" : "text-muted-foreground group-hover:text-muted-foreground"
                            )}>
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className="h-4 w-4 ml-2 text-white flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>

              {/* 退出按钮 */}
              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-foreground hover:text-foreground hover:bg-muted rounded-[4px] transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  {tAuth('signout')}
                </Button>
              </div>
            </div>
          </motion.aside>



            {/* 页面内容 */}
            <main className="w-full px-2 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
  )
}

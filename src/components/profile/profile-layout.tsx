'use client'

import React, { useRef, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { usePathname, useRouter, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  LogOut,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { cn } from '@/lib/utils/utils'
import { profileNavigationConfig } from '@/lib/config/profile-navigation'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLAnchorElement>(null)

  // Translation hooks
  const tProfile = useTranslations('profile.navigation')
  const tAuth = useTranslations('auth')

  // 使用共享的导航配置
  const navigation = profileNavigationConfig.map(item => ({
    ...item,
    label: tProfile(item.labelKey),
    description: tProfile(item.descriptionKey)
  }))

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  // 自动滚动到活跃标签
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const activeItem = activeItemRef.current

      // 获取容器和元素的位置信息
      const containerRect = container.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()

      // 计算元素相对于容器的位置
      const itemLeft = itemRect.left - containerRect.left + container.scrollLeft
      const itemRight = itemLeft + itemRect.width

      // 计算需要滚动的位置，确保元素在可视区域内
      const scrollLeft = container.scrollLeft
      const containerWidth = containerRect.width

      // 如果元素在右侧不可见，滚动到让元素显示在右侧（留一些边距）
      if (itemRight > scrollLeft + containerWidth) {
        container.scrollTo({
          left: itemRight - containerWidth + 32, // 32px 右侧边距
          behavior: 'smooth'
        })
      }
      // 如果元素在左侧不可见，滚动到让元素显示在左侧（留一些边距）
      else if (itemLeft < scrollLeft) {
        container.scrollTo({
          left: itemLeft - 32, // 32px 左侧边距
          behavior: 'smooth'
        })
      }
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端顶部导航标签栏 - 现代简约风格 */}
      <div className="lg:hidden sticky top-[3.5rem] z-40 backdrop-blur-xl bg-background/95 border-b border-border shadow-sm">
        {/* 滚动容器 */}
        <div className="relative">
          {/* 左侧渐变遮罩 */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background/95 to-transparent z-10 pointer-events-none" />

          {/* 右侧渐变遮罩 */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background/95 to-transparent z-10 pointer-events-none" />

          {/* 滚动区域 */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto hide-scrollbar scroll-smooth"
          >
            <div className="flex gap-1 px-3 py-2 min-w-max">
              {navigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/profile'))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    ref={isActive ? activeItemRef : null}
                  >
                    <div
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-all duration-200",
                        "touch-manipulation active:scale-95",
                        "min-h-[40px]",
                        isActive
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {/* 图标 */}
                      <item.icon className="h-4 w-4 flex-shrink-0" />

                      {/* 标签文字 */}
                      <span>{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 在版心内 */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-6 items-start">
          {/* 左侧导航栏（桌面端可见） */}
          <motion.aside
            className={cn(
              "hidden lg:block bg-background border border-border rounded-lg shadow-atlassian-200 transition-all duration-200",
              "w-60 lg:sticky lg:top-[5.5rem] lg:h-fit lg:self-start"
            )}
          >
            <div className="flex flex-col h-full">
              {/* 用户信息区域 */}
              <div className="p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-border shadow-atlassian-100">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                    <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {user?.fullName || user?.firstName || tProfile('default_user')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="p-3 space-y-0.5 flex-1">
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
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-[4px] transition-all duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] relative cursor-pointer",
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
                            "mr-2.5 h-4 w-4 flex-shrink-0 transition-colors duration-200",
                            isActive ? "text-white" : "text-foreground group-hover:text-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-sm truncate",
                              isActive ? "text-white" : "text-foreground group-hover:text-foreground"
                            )}>
                              {item.label}
                            </div>
                            <div className={cn(
                              "text-xs mt-0.5 leading-tight truncate",
                              isActive ? "text-white/75" : "text-muted-foreground group-hover:text-muted-foreground"
                            )}>
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className="h-3.5 w-3.5 ml-2 text-white flex-shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>

              {/* 退出按钮 */}
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-sm text-foreground hover:text-foreground hover:bg-muted rounded-[4px] transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2.5" />
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

'use client'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Home, Map, Trophy, User } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils/utils'

const NAVIGATION_HEIGHT = 80 // 导航栏高度

interface NavItem {
  href: string
  labelKey: string
  icon: typeof Home
  isActive: (pathname: string) => boolean
}

export default function BottomNavigation() {
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const { isSignedIn } = useUser()

  const navItems: NavItem[] = [
    {
      href: '/',
      labelKey: 'home',
      icon: Home,
      isActive: (path) => path === '/'
    },
    {
      href: '/categories',
      labelKey: 'categories',
      icon: Map,
      isActive: (path) => path.startsWith('/categories')
    },
    {
      href: '/rankings',
      labelKey: 'rankings',
      icon: Trophy,
      isActive: (path) => path.startsWith('/rankings')
    },
    {
      href: isSignedIn ? '/profile/dashboard' : '/auth/signin',
      labelKey: 'profile',
      icon: User,
      isActive: (path) => path.startsWith('/profile') || path.startsWith('/dashboard')
    }
  ]

  return (
    <>
      {/* 底部导航栏 - 现代简约风格 */}
      <nav
        className={cn(
          // 固定定位
          "fixed bottom-0 left-0 right-0 z-[9999]",
          // 背景和边框 - 简约风格
          "bg-background border-t border-border",
          // 仅在移动端显示
          "block md:hidden",
          // 确保不会横向溢出
          "w-full",
          // 添加阴影
          "shadow-sm",
          // 应用移动端修复类
          "mobile-fixed-bottom"
        )}
        style={{
          // 使用CSS变量和计算确保稳定定位
          height: `${NAVIGATION_HEIGHT}px`,
          // 关键修复：确保始终贴在底部
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
        role="navigation"
        aria-label="主导航"
      >
        {/* 内部容器 - 优化触摸目标和间距 */}
        <div className="flex items-center justify-around h-full px-2 sm:px-4 w-full max-w-full">
          {navItems.map((item) => {
            const isActive = item.isActive(pathname)
            const IconComponent = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  // 基础样式
                  "flex flex-col items-center justify-center relative",
                  "min-w-0 flex-1 px-1 sm:px-2 py-2 rounded-lg",
                  // 确保最小触摸目标 44px
                  "min-h-[44px] min-w-[44px]",
                  // 交互样式
                  "transition-all duration-200 ease-out",
                  "active:scale-95 touch-manipulation",
                  "hover:bg-secondary active:bg-secondary",
                  // 状态样式
                  isActive
                    ? "text-primary bg-secondary/50"
                    : "text-muted-foreground hover:text-foreground active:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* 图标 - 优化尺寸和可见性 */}
                <IconComponent 
                  className={cn(
                    "mb-1 shrink-0 transition-transform duration-200",
                    // 响应式图标尺寸
                    "w-5 h-5 sm:w-6 sm:h-6",
                    // 活跃状态稍微放大
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* 标签 - 优化字体大小和可读性 */}
                <span className={cn(
                  "leading-none truncate w-full text-center transition-all duration-200",
                  // 响应式字体大小
                  "text-[10px] sm:text-xs",
                  // 字重处理
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {t(item.labelKey)}
                </span>
                
                {/* 活跃指示器 */}
                {isActive && (
                  <div
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* 为底部导航预留空间，防止内容被遮挡 */}
      <div 
        className="block md:hidden"
        style={{ 
          height: `calc(${NAVIGATION_HEIGHT}px + max(env(safe-area-inset-bottom, 0px), 8px))`,
          minHeight: `${NAVIGATION_HEIGHT + 16}px`
        }}
        aria-hidden="true"
      />
    </>
  )
}

// 导出常量供其他组件使用
export { NAVIGATION_HEIGHT }
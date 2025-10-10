'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Bookmark, 
  Upload,
  LogOut, 
  Settings,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { cn } from '@/lib/utils/utils'

interface ProfileLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    label: '概览',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: '数据概览和快速操作'
  },
  {
    name: '我的收藏',
    label: '收藏',
    href: '/profile/favorites',
    icon: Bookmark,
    description: '已收藏的AI工具'
  },
  {
    name: '我的提交',
    label: '提交',
    href: '/profile/submissions',
    icon: Upload,
    description: '提交的工具管理'
  },
  {
    name: '个人设置',
    label: '设置',
    href: '/profile/info',
    icon: Settings,
    description: '账户和个人信息'
  }
]

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 主要内容区域 - 在版心内 */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 items-start min-h-[calc(100vh-3rem)]">
          {/* 移动端遮罩 */}
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* 左侧导航栏 - 在版心内的固定定位，考虑顶部Header */}
          <motion.aside
            className={cn(
              "bg-card border border-border rounded-xl transition-apple",
              "w-72 lg:w-64 xl:w-72",
              // 桌面端在版心内的固定定位，考虑顶部Header高度(64px) + 间距(24px) = 88px
              "lg:sticky lg:top-[5.5rem] lg:h-fit lg:self-start",
              // 移动端固定定位
              "fixed top-4 left-4 z-40 h-[calc(100vh-2rem)]",
              // 移动端隐藏，桌面端显示
              sidebarOpen ? "translate-x-0 lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="flex flex-col">
              {/* 用户信息区域 */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                    <AvatarFallback className="bg-fill-quaternary text-label-primary font-semibold">
                      {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-subhead font-semibold truncate text-label-primary">
                      {user?.fullName || user?.firstName || '用户'}
                    </p>
                    <p className="text-caption1 text-label-secondary truncate">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/profile'))
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "group flex items-center px-3 py-3 text-subhead font-medium rounded-lg transition-apple relative overflow-hidden",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-label-secondary hover:text-label-primary hover:bg-fill-quaternary"
                        )}
                      >
                        {/* 活跃状态背景 */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        <div className="relative flex items-center w-full">
                          <item.icon className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0 transition-apple",
                            isActive ? "text-primary-foreground" : "text-label-tertiary group-hover:text-label-primary"
                          )} />
                          <div className="flex-1">
                            <div className={cn(
                              "font-medium",
                              isActive ? "text-primary-foreground" : "group-hover:text-label-primary"
                            )}>
                              {item.label}
                            </div>
                            <div className={cn(
                              "text-caption1 mt-0.5",
                              isActive ? "text-primary-foreground/80" : "text-label-tertiary"
                            )}>
                              {item.description}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className="h-4 w-4 ml-auto text-primary-foreground" />
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </motion.aside>

          {/* 主内容区域 */}
          <div className="flex-1 min-h-screen">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden fixed top-4 right-4 z-50 bg-background border border-border rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* 页面内容 */}
            <main className="w-full">
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
    </div>
  )
}
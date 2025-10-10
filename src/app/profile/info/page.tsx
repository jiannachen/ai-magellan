'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { Badge } from '@/ui/common/badge'
import { Separator } from '@/ui/common/separator'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { 
  User, 
  Mail, 
  Calendar,
  Shield
} from 'lucide-react'
import { format } from 'date-fns'

export default function ProfileInfoPage() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  if (!isSignedIn || !user) {
    return (
      <ProfileLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>未登录</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                请先登录以查看个人资料。
              </p>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold mb-2">个人信息</h1>
          <p className="text-muted-foreground">管理您的个人资料和账户设置。</p>
        </div>

        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 头像和基本信息 */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.imageUrl || ''} alt={user.fullName || ''} />
                <AvatarFallback className="text-2xl">
                  {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {user.fullName || user.firstName || '用户'}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.emailAddresses?.[0]?.emailAddress}
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Shield className="h-3 w-3" />
                  普通用户
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 详细信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">姓名</label>
                  <p className="mt-1 text-sm">{user.fullName || user.firstName || '未设置'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">邮箱地址</label>
                  <p className="mt-1 text-sm">{user.emailAddresses?.[0]?.emailAddress}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">用户ID</label>
                  <p className="mt-1 text-sm font-mono text-xs break-all">{user.id}</p>
                </div>

                {user.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(user.createdAt), 'yyyy年MM月dd日')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账户设置 */}
        <Card>
          <CardHeader>
            <CardTitle>账户设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">邮箱验证状态</h4>
                  <p className="text-sm text-muted-foreground">您的邮箱地址验证状态</p>
                </div>
                <Badge variant={user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'default' : 'secondary'}>
                  {user.emailAddresses?.[0]?.verification?.status === 'verified' ? '已验证' : '未验证'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">双重认证</h4>
                  <p className="text-sm text-muted-foreground">增强账户安全性</p>
                </div>
                <Badge variant="secondary">未启用</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用提示 */}
        <Card>
          <CardHeader>
            <CardTitle>使用提示</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 个人信息由 Clerk 安全管理，如需修改请点击右上角用户头像进入设置</p>
              <p>• 您的邮箱地址用于接收重要通知和密码重置</p>
              <p>• 建议启用双重认证以保护账户安全</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}
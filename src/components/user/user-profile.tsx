'use client'

import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Button } from '@/ui/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { Badge } from '@/ui/common/badge'
import { Separator } from '@/ui/common/separator'
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Bookmark, 
  Upload, 
  Settings 
} from 'lucide-react'
import { format } from 'date-fns'

export function UserProfile() {
  const { isLoaded, isSignedIn, user } = useUser()
  const t = useTranslations()

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSignedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('auth.profile')}</h1>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          {t('auth.settings')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.imageUrl || ''} alt={user.fullName || ''} />
                <AvatarFallback className="text-lg">
                  {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{user.fullName || user.firstName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">角色</span>
                <Badge variant="secondary">
                  用户
                </Badge>
              </div>

              {user.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">注册时间</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/profile/submissions" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                我的提交
              </Button>
            </Link>
            <Link href="/profile/favorites" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Bookmark className="mr-2 h-4 w-4" />
                我的收藏
              </Button>
            </Link>
            <Link href="/submit" className="block">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                提交工具
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>活动统计</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">点赞数</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Bookmark className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">收藏数</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Upload className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">提交数</div>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <User className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">新手</div>
                <div className="text-sm text-muted-foreground">等级</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无活动记录
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { SignUp } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/common/card'
import { Brain } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function SignUpPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* 网站Logo和品牌 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Navigation</h1>
          <p className="text-muted-foreground">{t('header.description')}</p>
        </div>

        <Card className="border-border/40 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">注册账号</CardTitle>
            <CardDescription>
              创建新账号开始使用
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  card: 'shadow-none border-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                }
              }}
            />
          </CardContent>
          
          {/* 注册说明 */}
          <div className="border-t border-border pt-4 px-6 pb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                注册后您将获得：
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  个人化AI工具推荐
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  收藏和管理工具
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  提交优质工具分享
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
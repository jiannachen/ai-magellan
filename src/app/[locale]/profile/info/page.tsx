'use client'

import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
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
  
  // Translation hooks
  const t = useTranslations('common')
  const tProfile = useTranslations('profile.info')

  if (!isLoaded) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
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
              <CardTitle>{tProfile('login_required')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {tProfile('login_description')}
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
          <h1 className="text-2xl font-bold mb-2">{tProfile('title')}</h1>
          <p className="text-muted-foreground">{tProfile('description')}</p>
        </div>

        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {tProfile('basic_info')}
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
                  {user.fullName || user.firstName || tProfile('default_user')}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.emailAddresses?.[0]?.emailAddress}
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                  <Shield className="h-3 w-3" />
                  {tProfile('general_user')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* 详细信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{tProfile('name_label')}</label>
                  <p className="mt-1 text-sm">{user.fullName || user.firstName || tProfile('not_set')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{tProfile('email_label')}</label>
                  <p className="mt-1 text-sm">{user.emailAddresses?.[0]?.emailAddress}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{tProfile('user_id_label')}</label>
                  <p className="mt-1 text-sm font-mono text-xs break-all">{user.id}</p>
                </div>

                {user.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{tProfile('registration_date')}</label>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(user.createdAt), 'yyyy-MM-dd')}
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
              <CardTitle>{tProfile('account_settings')}</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{tProfile('email_verification')}</h4>
                  <p className="text-sm text-muted-foreground">{tProfile('email_verification_desc')}</p>
                </div>
                <Badge variant={user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'default' : 'secondary'}>
                  {user.emailAddresses?.[0]?.verification?.status === 'verified' ? tProfile('verified') : tProfile('unverified')}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{tProfile('two_factor_auth')}</h4>
                  <p className="text-sm text-muted-foreground">{tProfile('two_factor_desc')}</p>
                </div>
                <Badge variant="secondary">{tProfile('not_enabled')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用提示 */}
        <Card>
          <CardHeader>
            <CardTitle>{tProfile('usage_tips')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• {tProfile('tip_1')}</p>
              <p>• {tProfile('tip_2')}</p>
              <p>• {tProfile('tip_3')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  )
}

'use client'

import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { Badge } from '@/ui/common/badge'
import { Separator } from '@/ui/common/separator'
import { ProfileLayout } from '@/components/profile/profile-layout'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Anchor,
  Ship,
  Crown,
  Star,
  Eye,
  Waves,
  Flag
} from 'lucide-react'
import { format } from 'date-fns'

export default function ProfileInfoPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  
  // Translation hooks
  const t = useTranslations('common')
  const tProfile = useTranslations('profile')

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
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Anchor className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {tProfile('info.login_required')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {tProfile('info.login_description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </ProfileLayout>
    )
  }

  const getRankBadge = () => {
    // This would normally come from user stats, but for now we'll use a simple rank
    return {
      name: tProfile('info.title'),
      icon: Crown,
      color: 'text-magellan-gold'
    }
  }

  const rank = getRankBadge()
  const RankIcon = rank.icon

  return (
    <ProfileLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header - 移动端优化 */}
        <div>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">{tProfile('info.title')}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{tProfile('info.description')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Captain Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-magellan-teal/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  {tProfile('info.basic_info')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 md:p-8">
                {/* Captain Avatar and Basic Info - 移动端优化 */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 mb-6 sm:mb-8">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                      <AvatarImage src={user.imageUrl || ''} alt={user.fullName || ''} />
                      <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-primary/10 to-magellan-teal/10">
                        {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-1.5 sm:p-2 rounded-full bg-primary/10 border border-primary/20">
                      <RankIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${rank.color}`} />
                    </div>
                  </div>
                  <div className="space-y-3 text-center sm:text-left w-full sm:w-auto">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                        {user.fullName || user.firstName || tProfile('info.default_user')}
                      </h2>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mt-1 text-sm sm:text-base">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-none">{user.emailAddresses?.[0]?.emailAddress}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                      <Badge className="bg-magellan-gold/20 text-magellan-gold border-magellan-gold/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                        <RankIcon className="h-3 w-3 mr-1" />
                        {rank.name}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                        <Shield className="h-3 w-3" />
                        {tProfile('info.regular_user')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Captain Details - 移动端优化 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                        <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        {tProfile('info.basic_info')}
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30">
                          <span className="text-xs sm:text-sm font-medium">{tProfile('info.name_label')}</span>
                          <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                            {user.fullName || user.firstName || tProfile('info.not_set')}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30 gap-1 sm:gap-0">
                          <span className="text-xs sm:text-sm font-medium">{tProfile('info.email_label')}</span>
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">
                            {user.emailAddresses?.[0]?.emailAddress}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30 gap-1 sm:gap-0">
                          <span className="text-xs sm:text-sm font-medium">{tProfile('info.user_id_label')}</span>
                          <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                        <Waves className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        {tProfile('info.account_settings')}
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {user.createdAt && (
                          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30">
                            <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                              {tProfile('info.registration_date')}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/30">
                          <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                            {tProfile('info.email_verification_status')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tProfile('info.verified')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ship Security & Navigation - 移动端优化 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {tProfile('info.account_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">{tProfile('info.email_verification')}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{tProfile('info.email_verification_desc')}</p>
                      </div>
                    </div>
                    <Badge variant={user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'default' : 'secondary'}
                           className={`${user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : ''} text-xs whitespace-nowrap flex-shrink-0 self-start sm:self-center`}>
                      {user.emailAddresses?.[0]?.verification?.status === 'verified' ?
                        `✅ ${tProfile('info.verified')}` :
                        `🟡 ${tProfile('info.unverified')}`}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
                        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">{tProfile('info.two_factor_auth')}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{tProfile('info.two_factor_desc')}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs whitespace-nowrap flex-shrink-0 self-start sm:self-center">
                      🔒 {tProfile('info.not_enabled')}
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 text-purple-700 flex-shrink-0">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">{tProfile('info.usage_tips')}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{tProfile('info.tip_1')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs whitespace-nowrap flex-shrink-0 self-start sm:self-center">
                      🛡️ {tProfile('info.verified')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </ProfileLayout>
  )
}
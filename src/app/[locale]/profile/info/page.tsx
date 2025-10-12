'use client'

import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/common/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/common/avatar'
import { Badge } from '@/ui/common/badge'
import { Button } from '@/ui/common/button'
import { Separator } from '@/ui/common/separator'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  Map,
  Compass,
  Anchor,
  Ship,
  Crown,
  Star,
  Eye,
  Telescope,
  Route,
  Flag,
  Waves,
  Home,
  ArrowRight
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-5 w-5 text-primary" />
                {tProfile('info.login_required')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tProfile('info.title')}</h1>
              <p className="text-muted-foreground">{tProfile('info.description')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
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
              <CardContent className="p-8">
                {/* Captain Avatar and Basic Info */}
                <div className="flex items-center gap-8 mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user.imageUrl || ''} alt={user.fullName || ''} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/10 to-magellan-teal/10">
                        {user.firstName?.charAt(0) || user.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary/10 border border-primary/20">
                      <RankIcon className={`h-4 w-4 ${rank.color}`} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {user.fullName || user.firstName || tProfile('info.default_user')}
                      </h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Mail className="h-4 w-4" />
                        {user.emailAddresses?.[0]?.emailAddress}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-magellan-gold/20 text-magellan-gold border-magellan-gold/30 px-3 py-1">
                        <RankIcon className="h-3 w-3 mr-1" />
                        {rank.name}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {tProfile('info.regular_user')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Captain Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Flag className="h-4 w-4 text-primary" />
                        {tProfile('info.basic_info')}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium">{tProfile('info.name_label')}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.fullName || user.firstName || tProfile('info.not_set')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium">{tProfile('info.email_label')}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.emailAddresses?.[0]?.emailAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium">{tProfile('info.user_id_label')}</span>
                          <span className="text-sm font-mono text-xs text-muted-foreground">
                            {user.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Waves className="h-4 w-4 text-primary" />
                        {tProfile('info.account_settings')}
                      </h3>
                      <div className="space-y-3">
                        {user.createdAt && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              {tProfile('info.registration_date')}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(user.createdAt), 'yyyy-MM-dd')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Star className="h-4 w-4 text-primary" />
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

          {/* Ship Security & Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {tProfile('info.account_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-700">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{tProfile('info.email_verification')}</h4>
                        <p className="text-sm text-muted-foreground">{tProfile('info.email_verification_desc')}</p>
                      </div>
                    </div>
                    <Badge variant={user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'default' : 'secondary'} 
                           className={user.emailAddresses?.[0]?.verification?.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                      {user.emailAddresses?.[0]?.verification?.status === 'verified' ? 
                        `✅ ${tProfile('info.verified')}` : 
                        `🟡 ${tProfile('info.unverified')}`}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{tProfile('info.two_factor_auth')}</h4>
                        <p className="text-sm text-muted-foreground">{tProfile('info.two_factor_desc')}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      🔒 {tProfile('info.not_enabled')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                        <Eye className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{tProfile('info.usage_tips')}</h4>
                        <p className="text-sm text-muted-foreground">{tProfile('info.tip_1')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      🛡️ {tProfile('info.verified')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigator Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {tProfile('info.usage_tips')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-magellan-teal/5 border border-primary/10">
                    <Telescope className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">{tProfile('info.tip_1')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tProfile('info.tip_1')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-magellan-teal/5 border border-primary/10">
                    <Route className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">{tProfile('info.tip_2')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tProfile('info.tip_2')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-magellan-teal/5 border border-primary/10">
                    <Map className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">{tProfile('info.tip_3')}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{tProfile('info.tip_3')}</p>
                    </div>
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
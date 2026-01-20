'use client'

import { useState, useEffect } from 'react'
import { Eye, Heart, Award } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { useTranslations } from 'next-intl'

interface ToolStatsProps {
  websiteId: number
  initialVisits: number
  initialLikes: number
  qualityScore: number
}

export function ToolStats({ websiteId, initialVisits, initialLikes, qualityScore }: ToolStatsProps) {
  const t = useTranslations()
  const [visits, setVisits] = useState(initialVisits)
  const [likes, setLikes] = useState(initialLikes)

  // 可选: 定期刷新统计数据
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     // 获取最新统计
  //   }, 60000)
  //   return () => clearInterval(interval)
  // }, [websiteId])

  return (
    <div className="space-y-3">
      <StatCard
        label={t('profile.tools.detail.stats.visits')}
        value={visits.toLocaleString()}
        icon={Eye}
        variant="highlight"
      />
      <StatCard
        label={t('profile.tools.detail.stats.likes')}
        value={likes}
        icon={Heart}
        variant="success"
      />
      <StatCard
        label={t('profile.tools.detail.stats.quality_score')}
        value={`${qualityScore}/100`}
        icon={Award}
        variant={qualityScore >= 80 ? "success" : qualityScore >= 60 ? "warning" : "default"}
      />
    </div>
  )
}

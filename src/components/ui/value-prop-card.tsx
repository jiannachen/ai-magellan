'use client'

import { motion } from "framer-motion"
import { Card, CardContent } from "@/ui/common/card"
import { cn } from "@/lib/utils/utils"
import { LucideIcon } from "lucide-react"

interface ValuePropCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

export function ValuePropCard({ icon: Icon, title, description, index }: ValuePropCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.15, 1, 0.3, 1]
      }}
    >
      <Card className={cn(
        "group h-full text-center relative overflow-hidden",
        "bg-card/95 backdrop-blur-sm border border-primary/10",
        "rounded-2xl shadow-lg hover:shadow-2xl",
        "transition-all duration-500 ease-out",
        "subtle-hover",
        "hover:border-primary/30"
      )}>
        {/* 背景海洋效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-magellan-coral/3 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        <CardContent className="p-8 relative z-10 flex flex-col h-full">
          {/* 图标容器 - 罗盘风格 */}
          <div className="mb-6 flex justify-center">
            <div className={cn(
              "relative p-4 rounded-2xl",
              "bg-gradient-to-br from-primary/15 to-magellan-teal/10",
              "border border-primary/20 shadow-lg",
              "subtle-scale",
              "transition-all duration-500"
            )}>
              <Icon className="h-8 w-8 text-primary group-hover:text-magellan-teal transition-colors duration-300" />
              {/* 发光环效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed flex-1">
            {description}
          </p>
          
          {/* 底部装饰线 - 绝对定位到卡片底部 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
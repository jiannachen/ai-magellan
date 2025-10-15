'use client'

import { cn } from "@/lib/utils/utils"
import { LucideIcon } from "lucide-react"
import { Anchor, Waves } from "lucide-react"

interface ValuePropCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function ValuePropCard({ icon: Icon, title, description }: ValuePropCardProps) {
  return (
    <div className="group h-full">
      {/* AM.md 航海探索卡片容器 */}
      <div 
        className={cn(
          "relative h-full text-center overflow-hidden",
          "bg-magellan-depth-50 hover:bg-white",
          "border border-magellan-primary/15 hover:border-magellan-primary/30",
          "rounded-xl shadow-sm hover:shadow-lg",
          "transition-all duration-300 cursor-pointer",
          "professional-glow"
        )}
      >
        {/* AM.md 航海背景装饰 */}
        <div className="absolute inset-0 opacity-4 pointer-events-none professional-decoration">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-magellan-teal/8 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-magellan-primary/6 to-transparent rounded-full blur-lg"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-6">
          {/* AM.md 航海图标容器 - 罗盘风格 */}
          <div className="mb-6 flex justify-center">
            <div 
              className={cn(
                "relative p-4 rounded-xl transition-all duration-300",
                "bg-gradient-to-br from-magellan-primary/10 to-magellan-teal/10",
                "border border-magellan-primary/20 group-hover:border-magellan-primary/40",
                "group-hover:bg-gradient-to-br group-hover:from-magellan-primary/15 group-hover:to-magellan-teal/15",
                "professional-glow"
              )}
            >
              {/* 罗盘外环装饰 */}
              <div className="absolute inset-0 rounded-xl border border-magellan-teal/10 group-hover:border-magellan-teal/20 transition-colors duration-300"></div>
              
              <Icon 
                className="h-8 w-8 text-magellan-primary group-hover:text-magellan-teal transition-colors duration-300" 
              />
              
              {/* 航海指针装饰 */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-magellan-coral rounded-full opacity-60"></div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-magellan-mint rounded-full opacity-60"></div>
            </div>
          </div>
          
          {/* AM.md 航海标题 */}
          <h3 className={cn(
            "mb-4 font-semibold leading-tight",
            "text-lg text-magellan-depth-900",
            "group-hover:text-magellan-primary transition-colors duration-300"
          )}>
            <span className="inline-flex items-center gap-2">
              <Anchor className="h-4 w-4 text-magellan-teal" />
              {title}
            </span>
          </h3>
          
          {/* AM.md 航海描述 */}
          <p className="flex-1 text-sm text-magellan-depth-600 leading-relaxed">
            {description}
          </p>
          
          {/* AM.md 底部航海装饰线 */}
          <div className="mt-4 h-0.5 w-16 mx-auto rounded-full bg-gradient-to-r from-magellan-primary/30 via-magellan-teal/50 to-magellan-primary/30"></div>
        </div>
        
        {/* AM.md 航海悬停波纹效果 */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl">
            <Waves className="absolute top-2 right-2 h-4 w-4 text-magellan-teal/20 professional-float" />
            <Waves className="absolute bottom-2 left-2 h-3 w-3 text-magellan-mint/20 professional-float" style={{animationDelay: '1s'}} />
          </div>
        </div>
      </div>
    </div>
  )
}
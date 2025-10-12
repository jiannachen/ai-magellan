"use client";

import { ReactNode } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/ui/common/button";
import { cn } from "@/lib/utils/utils";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  badge,
  backHref,
  backLabel = "Back",
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* 返回导航 */}
      {backHref && (
        <Link href={backHref}>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 group subtle-hover"
          >
            <div className="p-1 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ArrowLeft className="h-4 w-4 text-primary" />
            </div>
            <Compass className="h-4 w-4 subtle-rotate" />
            {backLabel}
          </Button>
        </Link>
      )}

      {/* 页面标题区域 */}
      <div className="space-y-4">
        {/* 徽章 */}
        {badge && (
          <div className="flex justify-center md:justify-start">
            {badge}
          </div>
        )}

        {/* 标题和图标 */}
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/15 to-magellan-teal/10 border border-primary/20 shadow-lg">
              {icon}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        {actions && (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
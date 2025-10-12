"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/utils";

interface FallbackProps {
  className?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "fullscreen" | "inline";
}

export default function Fallback({ 
  className = "", 
  message, 
  size = "md", 
  variant = "default" 
}: FallbackProps) {
  // 尝试使用国际化，如果失败则使用默认文本
  let t: (key: string) => string;
  try {
    t = useTranslations('common');
  } catch {
    // 如果没有国际化上下文，使用默认文本
    t = (key: string) => key === 'loading' ? 'Loading...' : key;
  }
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const containerClasses = {
    default: "flex flex-col items-center justify-center min-h-[200px]",
    fullscreen: "flex flex-col items-center justify-center min-h-screen",
    inline: "flex items-center gap-2"
  };

  const defaultMessage = message || t('loading');

  if (variant === "inline") {
    return (
      <div className={cn(containerClasses.inline, className)}>
        <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground")} />
        <span className="text-sm text-muted-foreground">{defaultMessage}</span>
      </div>
    );
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-muted-foreground")} />
      <p className="mt-4 text-sm text-muted-foreground">{defaultMessage}</p>
    </div>
  );
}

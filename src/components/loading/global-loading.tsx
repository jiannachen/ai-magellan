"use client";

import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/utils";

interface GlobalLoadingProps {
  className?: string;
  message?: string;
  variant?: "default" | "fullscreen" | "inline" | "page";
  size?: "sm" | "md" | "lg";
}

export default function GlobalLoading({
  className = "",
  message,
  variant = "default",
  size = "md"
}: GlobalLoadingProps) {
  // 尝试获取翻译，如果失败则使用默认值
  let t: any;
  try {
    t = useTranslations('common');
  } catch {
    // 如果没有 NextIntlClientProvider 上下文，使用默认翻译
    t = (key: string) => {
      const defaults: Record<string, string> = {
        'loading': 'Loading...',
        'loading_content': 'Loading content...'
      };
      return defaults[key] || 'Loading...';
    };
  }

  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2"
  };

  const containerClasses = {
    default: "flex items-center justify-center min-h-[200px]",
    fullscreen: "flex items-center justify-center min-h-screen bg-background/95 backdrop-blur-xl",
    inline: "flex items-center gap-2",
    page: "flex items-center justify-center min-h-[calc(100vh-4rem)]"
  };

  const defaultMessage = message || t('loading');

  const spinner = (
    <div className={cn(
      sizeClasses[size],
      "border-primary border-t-transparent rounded-full animate-spin"
    )} />
  );

  if (variant === "inline") {
    return (
      <div className={cn(containerClasses.inline, className)}>
        {spinner}
        <span className="text-sm text-muted-foreground">{defaultMessage}</span>
      </div>
    );
  }

  return (
    <div className={cn(containerClasses[variant], className)}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {spinner}
        </div>
        <p className="text-sm text-muted-foreground">{defaultMessage}</p>
      </div>
    </div>
  );
}
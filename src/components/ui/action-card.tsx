"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/ui/common/card";
import { cn } from "@/lib/utils/utils";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "dashed" | "primary";
  disabled?: boolean;
}

const variantStyles = {
  default: {
    card: "bg-card border-border hover:border-border/80 hover:shadow-sm",
    icon: "text-primary"
  },
  dashed: {
    card: "border-2 border-dashed border-border hover:border-primary/60 hover:bg-secondary/50",
    icon: "text-primary"
  },
  primary: {
    card: "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30",
    icon: "text-primary"
  }
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  children,
  onClick,
  className,
  variant = "default",
  disabled = false
}: ActionCardProps) {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        styles.card,
        isClickable && !disabled && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="p-5">
        <div className="space-y-3">
          {/* 图标和标题 */}
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 transition-colors">
                <Icon className={cn("h-4 w-4", styles.icon)} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground leading-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* 子内容 */}
          {children && (
            <div className="space-y-2">
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

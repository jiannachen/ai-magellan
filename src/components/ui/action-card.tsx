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
    card: "bg-card border-border hover:border-primary/30 hover:bg-primary/5",
    icon: "text-primary"
  },
  dashed: {
    card: "border-2 border-dashed border-border hover:border-primary hover:bg-primary/5",
    icon: "text-primary"
  },
  primary: {
    card: "bg-gradient-to-br from-primary/10 to-magellan-teal/5 border-primary/20 hover:from-primary/15 hover:to-magellan-teal/10",
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
        isClickable && !disabled && "cursor-pointer subtle-hover",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* 图标和标题 */}
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Icon className={cn("h-5 w-5", styles.icon)} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
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
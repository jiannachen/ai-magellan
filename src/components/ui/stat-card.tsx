"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/ui/common/card";
import { cn } from "@/lib/utils/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: "default" | "highlight" | "success" | "warning";
}

const variantStyles = {
  default: {
    card: "bg-card border-border",
    icon: "text-muted-foreground bg-muted",
    value: "text-foreground"
  },
  highlight: {
    card: "bg-gradient-to-br from-primary/5 to-magellan-teal/5 border-primary/20",
    icon: "text-primary bg-primary/10",
    value: "text-primary"
  },
  success: {
    card: "bg-gradient-to-br from-magellan-mint/5 to-magellan-teal/5 border-magellan-mint/20",
    icon: "text-magellan-mint bg-magellan-mint/10",
    value: "text-magellan-mint"
  },
  warning: {
    card: "bg-gradient-to-br from-magellan-coral/5 to-magellan-gold/5 border-magellan-coral/20",
    icon: "text-magellan-coral bg-magellan-coral/10",
    value: "text-magellan-coral"
  }
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default"
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "relative overflow-hidden subtle-hover",
      styles.card,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className={cn(
              "text-2xl font-bold",
              styles.value
            )}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn(
                  "font-medium",
                  trend.isPositive ? "text-magellan-mint" : "text-magellan-coral"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              styles.icon
            )}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
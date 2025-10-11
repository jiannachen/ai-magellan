import * as React from "react";

import { cn } from "@/lib/utils/utils";

/**
 * Atlassian Card Components
 * 
 * 完全符合 Atlassian Design System 规范的卡片组件套件
 * 
 * 设计规范：
 * - 8px 圆角 (rounded-lg) - 符合Atlassian中等元素标准
 * - 24px 内边距 (p-6) - 符合Atlassian 3倍8px网格间距
 * - elevation-100 基础阴影，hover时提升至elevation-300
 * - 微妙的hover动画：-1px位移 + 阴影提升
 * 
 * 交互状态：
 * - 默认：elevation-100阴影
 * - Hover：向上1px位移 + elevation-300阴影
 * - Active：回到原位
 * - 200ms过渡动画，符合Atlassian标准交互时长
 * 
 * 可访问性：
 * - 语义化HTML结构
 * - 适当的颜色对比度
 * - 支持键盘导航
 * 
 * 参考：https://atlassian.design/components/card
 */

// Atlassian Card Component - 8px border radius, standard elevation, 24px padding
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-card text-card-foreground border border-border shadow-atlassian-100 transition-all duration-200 hover:shadow-atlassian-300 hover:translate-y-[-1px] active:translate-y-0",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Atlassian Card Header - 24px padding, proper spacing
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Atlassian Card Title - 20px font size, 500 weight, proper line height
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-atlassian-h4 font-medium leading-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Atlassian Card Description - body text styling
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-atlassian-body text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Atlassian Card Content - consistent padding
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Atlassian Card Footer - consistent spacing
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 gap-3", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

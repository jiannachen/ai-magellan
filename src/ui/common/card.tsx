import * as React from "react";
import { cn } from "@/lib/utils/utils";

/**
 * AI Magellan 海洋主题卡片组件
 *
 * 设计规范：
 * - 统一8px圆角 (rounded-lg)
 * - 简化的hover效果：边框颜色变化 + 微妙阴影
 * - 200ms快速过渡动画
 * - 16px标准内边距
 *
 * 使用示例：
 * <Card className="p-4">
 *   <CardHeader>
 *     <CardTitle>标题</CardTitle>
 *     <CardDescription>描述</CardDescription>
 *   </CardHeader>
 *   <CardContent>内容</CardContent>
 *   <CardFooter>底部操作</CardFooter>
 * </Card>
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 基础样式 - 统一8px圆角
      "rounded-lg bg-card text-card-foreground",
      // 边框
      "border border-border/40",
      // 简化的hover效果 - 仅边框和阴影
      "hover:border-ocean-primary/30 hover:shadow-ocean-md",
      // 快速过渡
      "transition-all duration-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0 gap-3", className)}
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

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

/**
 * Atlassian Button Component
 * 
 * 完全符合 Atlassian Design System 规范的按钮组件
 * 
 * 设计原则：
 * - Bold, Optimistic, and Practical（大胆、乐观、实用）
 * - 遵循44px移动端最小触摸目标，40px桌面端标准高度
 * - 4px圆角，符合Atlassian品牌圆角系统
 * - 使用官方Atlassian颜色和交互状态
 * 
 * 可访问性：
 * - WCAG 2.1 AA标准合规
 * - 键盘导航支持
 * - 屏幕阅读器兼容
 * - 明确的focus状态指示
 * 
 * 参考：https://atlassian.design/components/button
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-atlassian-body font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Atlassian Primary Button - 完全符合规范
        default: "bg-primary !text-white hover:bg-primary/90 active:bg-primary/80 border-none rounded-[4px] min-h-[40px] hover:!text-white active:!text-white focus:!text-white",
        
        // Atlassian Secondary Button - 完全符合规范  
        secondary: "bg-card text-card-foreground border border-border hover:bg-muted hover:border-border rounded-[4px] min-h-[40px]",
        
        // Atlassian Ghost Button - 完全符合规范
        ghost: "text-foreground hover:bg-muted hover:text-foreground border-none shadow-none rounded-[4px] min-h-[40px]",
        
        // Atlassian Destructive Button - 完全符合规范
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 border-none rounded-[4px] min-h-[40px]",
        
        // Atlassian Outline Button - 完全符合规范
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground rounded-[4px] min-h-[40px]",
        
        // Link style - 保持现有样式
        link: "text-primary underline-offset-4 hover:underline hover:opacity-80 shadow-none border-none",
      },
      size: {
        // Atlassian 标准按钮尺寸 - 完全符合规范，针对移动端优化
        default: "h-11 md:h-10 px-4 py-2 text-atlassian-body min-w-[88px] md:min-w-[80px]",     /* 44px mobile, 40px desktop */
        sm: "h-11 md:h-8 px-3 py-1 min-w-[72px] md:min-w-[64px]",     /* 44px mobile, 32px desktop - removed text class to inherit from variant */
        lg: "h-12 px-6 py-3 text-atlassian-body-large min-w-[96px]",    /* 48px height, 12px+24px padding */
        icon: "h-11 w-11 md:h-10 md:w-10 min-w-[44px] md:min-w-[40px] p-0",                   /* 44x44px mobile, 40x40px desktop */
        "icon-sm": "h-11 w-11 md:h-8 md:w-8 min-w-[44px] md:min-w-[32px] p-0",               /* 44x44px mobile, 32x32px desktop */
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

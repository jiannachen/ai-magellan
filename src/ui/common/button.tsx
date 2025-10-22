import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

/**
 * AI Magellan 海洋主题按钮组件
 *
 * 设计规范：
 * - 统一8px圆角 (rounded-lg)
 * - 移动端44px最小触摸目标，桌面端40px
 * - 200ms快速过渡
 * - 海洋主题配色
 *
 * 使用示例：
 * <Button variant="default" size="default">主按钮</Button>
 * <Button variant="outline" size="sm">次要按钮</Button>
 * <Button variant="ghost" size="icon"><Icon /></Button>
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg",
  {
    variants: {
      variant: {
        // 主按钮 - 海洋蓝
        default: "bg-ocean-primary text-white hover:bg-ocean-primary-hover shadow-sm",

        // 次要按钮
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        // 轮廓按钮
        outline: "border border-border bg-background hover:bg-muted hover:border-ocean-primary/30",

        // 幽灵按钮
        ghost: "hover:bg-muted hover:text-foreground",

        // 危险按钮
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",

        // 链接按钮
        link: "text-ocean-primary underline-offset-4 hover:underline",
      },
      size: {
        // 移动端优先，44px触摸目标
        default: "h-11 md:h-10 px-4 py-2 text-sm min-w-[88px] md:min-w-[80px]",
        sm: "h-11 md:h-9 px-3 py-1 text-sm min-w-[72px] md:min-w-[64px]",
        lg: "h-12 px-6 py-3 text-base min-w-[96px]",
        icon: "h-11 w-11 md:h-10 md:w-10 min-w-[44px] md:min-w-[40px] p-0",
        "icon-sm": "h-11 w-11 md:h-8 md:w-8 min-w-[44px] md:min-w-[32px] p-0",
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

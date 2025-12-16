import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";

/**
 * Modern Button Component - 现代简约按钮
 *
 * 设计规范:
 * - 8px圆角 (rounded-lg)
 * - 移动端44px最小触摸目标
 * - 200ms快速过渡
 * - 简约配色,遵循现代SaaS设计
 *
 * 使用示例:
 * <Button variant="default">主按钮</Button>
 * <Button variant="outline">次要按钮</Button>
 * <Button variant="ghost">幽灵按钮</Button>
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-lg active:scale-[0.98]",
  {
    variants: {
      variant: {
        // 主按钮 - 紫色实心
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",

        // 次要按钮 - 灰色浅背景
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        // 轮廓按钮 - 边框样式
        outline: "border border-border bg-background hover:bg-secondary hover:text-accent-foreground",

        // 幽灵按钮 - 透明背景
        ghost: "hover:bg-secondary hover:text-accent-foreground",

        // 危险按钮
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",

        // 链接按钮
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // 移动端44px触摸目标
        default: "h-10 px-4 py-2 text-sm min-w-[80px]",
        sm: "h-9 px-3 py-1.5 text-sm min-w-[64px]",
        lg: "h-11 px-6 py-2.5 text-base min-w-[96px]",
        icon: "h-10 w-10 min-w-[40px] p-0",
        "icon-sm": "h-8 w-8 min-w-[32px] p-0",
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

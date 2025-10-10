import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-body font-medium transition-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-95",
  {
    variants: {
      variant: {
        // Apple主要按钮：蓝色背景，白色文字
        default: "bg-primary text-primary-foreground hover:opacity-80 shadow-apple-1 hover:shadow-apple-2",
        
        // Apple次要按钮：透明背景，蓝色边框和文字
        secondary: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        
        // Apple文本按钮：纯文本，无边框
        ghost: "text-primary hover:bg-fill-quaternary",
        
        // Apple危险按钮：红色
        destructive: "bg-destructive text-destructive-foreground hover:opacity-80 shadow-apple-1",
        
        // Apple轮廓按钮：灰色边框
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-apple-1",
        
        // 链接样式
        link: "text-primary underline-offset-4 hover:underline hover:opacity-80",
      },
      size: {
        // Apple标准最小触摸区域44pt
        default: "h-11 px-6 py-3 text-body min-w-[44px]",        /* 44px height */
        sm: "h-9 px-4 py-2 text-subhead min-w-[36px]",           /* 36px height */
        lg: "h-14 px-8 py-4 text-headline min-w-[56px]",         /* 56px height */
        icon: "h-11 w-11 min-w-[44px]",                          /* 44x44px square */
        "icon-sm": "h-9 w-9 min-w-[36px]",                      /* 36x36px square */
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

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-body font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        // Atlassian Primary Button
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-elevation-100 hover:shadow-elevation-200 border-none",
        
        // Atlassian Secondary Button  
        secondary: "bg-card text-card-foreground border border-border hover:bg-muted hover:border-border/60 shadow-elevation-100",
        
        // Atlassian Ghost Button
        ghost: "text-foreground hover:bg-muted hover:text-foreground border-none shadow-none",
        
        // Atlassian Destructive Button
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-elevation-100 hover:shadow-elevation-200 border-none",
        
        // Atlassian Outline Button
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground shadow-elevation-100",
        
        // Link style
        link: "text-primary underline-offset-4 hover:underline hover:opacity-80 shadow-none border-none",
      },
      size: {
        // Atlassian standard button sizes
        default: "h-10 px-4 py-2 text-body min-w-[80px] rounded",     /* 40px height, 4px border radius */
        sm: "h-8 px-3 py-1 text-body-small min-w-[64px] rounded",     /* 32px height */
        lg: "h-12 px-6 py-3 text-body-large min-w-[96px] rounded",    /* 48px height */
        icon: "h-10 w-10 min-w-[40px] rounded",                       /* 40x40px square */
        "icon-sm": "h-8 w-8 min-w-[32px] rounded",                   /* 32x32px square */
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

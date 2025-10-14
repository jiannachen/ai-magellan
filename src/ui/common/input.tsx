import * as React from "react";

import { cn } from "@/lib/utils/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Atlassian Input Field - 40px height, 4px border radius, proper padding and focus states
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 sm:h-10 w-full rounded border-2 border-border bg-background px-3 py-2 text-body ring-offset-background file:border-0 file:bg-transparent file:text-body file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          // 移动端优化
          "touch-manipulation", // 改善触摸响应
          "text-base", // 防止iOS自动缩放
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

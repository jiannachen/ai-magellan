"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Magellan Toast Configuration - 航海主题通知系统
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          success:
            "!bg-[hsl(var(--magellan-mint)/0.1)] !border-[hsl(var(--magellan-mint))] !text-[hsl(var(--magellan-mint))] dark:!bg-[hsl(var(--magellan-mint)/0.2)] dark:!border-[hsl(var(--magellan-mint))] dark:!text-[hsl(var(--magellan-mint))]",
          error:
            "!bg-red-50 !border-red-500 !text-red-700 dark:!bg-red-900/20 dark:!border-red-500 dark:!text-red-100",
          warning:
            "!bg-orange-50 !border-orange-500 !text-orange-700 dark:!bg-orange-900/20 dark:!border-orange-500 dark:!text-orange-100",
          info:
            "!bg-blue-50 !border-blue-500 !text-blue-700 dark:!bg-blue-900/20 dark:!border-blue-500 dark:!text-blue-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

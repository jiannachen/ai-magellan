"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Atlassian Toast Configuration
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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-atlassian-300 group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          success:
            "group-[.toast]:bg-atlassian-success-50 group-[.toast]:border-atlassian-success-500 group-[.toast]:text-atlassian-success-700 dark:group-[.toast]:bg-atlassian-success-900 dark:group-[.toast]:text-atlassian-success-100",
          error:
            "group-[.toast]:bg-atlassian-error-50 group-[.toast]:border-atlassian-error-500 group-[.toast]:text-atlassian-error-700 dark:group-[.toast]:bg-atlassian-error-900 dark:group-[.toast]:text-atlassian-error-100",
          warning:
            "group-[.toast]:bg-atlassian-warning-50 group-[.toast]:border-atlassian-warning-500 group-[.toast]:text-atlassian-warning-700 dark:group-[.toast]:bg-atlassian-warning-900 dark:group-[.toast]:text-atlassian-warning-100",
          info:
            "group-[.toast]:bg-atlassian-blue-50 group-[.toast]:border-atlassian-blue-500 group-[.toast]:text-atlassian-blue-700 dark:group-[.toast]:bg-atlassian-blue-900 dark:group-[.toast]:text-atlassian-blue-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

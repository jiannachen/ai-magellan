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
            "group-[.toast]:bg-atlassian-green-500/10 group-[.toast]:border-atlassian-green-500/20 group-[.toast]:text-atlassian-green-600",
          error:
            "group-[.toast]:bg-atlassian-red-300/10 group-[.toast]:border-atlassian-red-300/20 group-[.toast]:text-atlassian-red-400",
          warning:
            "group-[.toast]:bg-atlassian-yellow-300/10 group-[.toast]:border-atlassian-yellow-300/20 group-[.toast]:text-atlassian-yellow-600",
          info:
            "group-[.toast]:bg-atlassian-blue-400/10 group-[.toast]:border-atlassian-blue-400/20 group-[.toast]:text-atlassian-blue-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

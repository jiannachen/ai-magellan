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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-elevation-300 group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-2",
          success:
            "group-[.toast]:bg-success/10 group-[.toast]:border-success/20 group-[.toast]:text-success",
          error:
            "group-[.toast]:bg-destructive/10 group-[.toast]:border-destructive/20 group-[.toast]:text-destructive",
          warning:
            "group-[.toast]:bg-warning/10 group-[.toast]:border-warning/20 group-[.toast]:text-warning",
          info:
            "group-[.toast]:bg-primary/10 group-[.toast]:border-primary/20 group-[.toast]:text-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

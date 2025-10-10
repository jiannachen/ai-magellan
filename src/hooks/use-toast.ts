"use client";

import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

// Atlassian Toast Function with proper semantic variants
function toast({ title, description, variant = "default" }: ToastProps) {
  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, {
        description,
        className: "bg-destructive/10 border-destructive/20 text-destructive",
      });
    case "success":
      return sonnerToast.success(title, {
        description,
        className: "bg-success/10 border-success/20 text-success",
      });
    case "warning":
      return sonnerToast.warning(title, {
        description,
        className: "bg-warning/10 border-warning/20 text-warning",
      });
    default:
      return sonnerToast(title, {
        description,
        className: "bg-primary/10 border-primary/20 text-primary",
      });
  }
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };

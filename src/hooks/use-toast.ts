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

// 兼容方法，支持 toast.success() 和 toast.error() 调用
const toastWithMethods = Object.assign(toast, {
  success: (title: string, description?: string) => 
    toast({ title, description, variant: "success" }),
  error: (title: string, description?: string) => 
    toast({ title, description, variant: "destructive" }),
  warning: (title: string, description?: string) => 
    toast({ title, description, variant: "warning" }),
});

function useToast() {
  return {
    toast: toastWithMethods,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toastWithMethods as toast };

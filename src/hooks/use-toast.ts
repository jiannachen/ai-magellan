"use client";

import { toast as sonnerToast } from "sonner";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

// Magellan Toast Function - 航海主题通知系统
function toast({ title, description, variant = "default" }: ToastProps) {
  switch (variant) {
    case "destructive":
      // 危险信号 - 红色警报
      return sonnerToast.error(title, {
        description,
        className: "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-100",
      });
    case "success":
      // 安全到港 - 薄荷绿成功色
      return sonnerToast.success(title, {
        description,
        className: "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-100",
      });
    case "warning":
      // 注意信号 - 珊瑚橙警告色
      return sonnerToast.warning(title, {
        description,
        className: "bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-100",
      });
    default:
      // 信息浮标 - 深海蓝信息色
      return sonnerToast(title, {
        description,
        className: "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-100",
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

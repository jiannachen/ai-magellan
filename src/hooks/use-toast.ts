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
      });
    case "success":
      // 安全到港 - 薄荷绿成功色
      return sonnerToast.success(title, {
        description,
      });
    case "warning":
      // 注意信号 - 珊瑚橙警告色
      return sonnerToast.warning(title, {
        description,
      });
    default:
      // 信息浮标 - 深海蓝信息色
      return sonnerToast.info(title, {
        description,
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

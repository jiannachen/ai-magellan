"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/utils";
import FeedbackDialog from "./feedback-dialog";

export default function FloatingFeedbackButton() {
  const t = useTranslations();

  return (
    <FeedbackDialog
      trigger={
        <button
          className={cn(
            "group fixed z-40",
            // PC端位置
            "right-6 bottom-6",
            // 移动端位置 - 向上移动避开底部导航栏 (80px + 间距)
            "md:right-6 md:bottom-6",
            "max-md:right-4 max-md:bottom-[100px]",
            "flex items-center justify-center",
            "text-white font-medium",
            "w-14 h-14",
            "rounded-full",
            "shadow-lg hover:shadow-xl",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            // 添加边框增强视觉效果
            "border-2 border-white/20"
          )}
          style={{
            background: "linear-gradient(to right, #F97316, #D97706)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(to right, #ea6a0f, #c96f06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(to right, #F97316, #D97706)";
          }}
          aria-label={t('feedback.trigger')}
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300 drop-shadow-md" />
        </button>
      }
    />
  );
}

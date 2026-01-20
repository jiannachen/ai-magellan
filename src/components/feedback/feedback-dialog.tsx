"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/ui/common/dialog";
import { Button } from "@/ui/common/button";
import { Textarea } from "@/ui/common/textarea";
import { Input } from "@/ui/common/input";
import { Send, MessageSquare, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils/utils";
import { useToast } from "@/hooks/use-toast";

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export default function FeedbackDialog({ trigger, triggerClassName }: FeedbackDialogProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    feedback: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackData.feedback.trim()) {
      toast({
        title: t('common.error'),
        description: t('feedback.messages.feedback_required'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedbackData.name,
          feedback: feedbackData.feedback,
          source: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      });

      const data = await res.json().catch(() => null) as { success?: boolean; message?: string } | null;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Submit failed');
      }

      toast({
        title: t('common.success'),
        description: t('feedback.messages.submit_success'),
      });

      setFeedbackData({ name: "", feedback: "" });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('feedback.messages.submit_error'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFeedbackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className={cn(
        "group border-magellan-coral/30 hover:border-magellan-coral",
        "hover:bg-magellan-coral/5 transition-all duration-300",
        triggerClassName
      )}
      onClick={() => setIsOpen(true)}
    >
      <MessageSquare className="h-4 w-4 mr-2 text-magellan-coral" />
      {t('feedback.trigger')}
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            // 基础样式
            "!bg-background !border !border-border !shadow-xl",
            // PC端样式
            "sm:!rounded-2xl sm:!max-w-[480px]",
            // 移动端样式 - 居中显示
            "!rounded-2xl",
            "!w-[calc(100%-2rem)] sm:!w-full",
            "!max-h-[85vh]",
            // 定位 - 移动端和PC端都居中
            "!fixed !left-[50%] !top-[50%]",
            "!-translate-x-1/2 !-translate-y-1/2",
            // 内边距和滚动
            "!p-6 !overflow-y-auto",
            // z-index 确保在最上层
            "!z-50"
          )}
        >
          {/* 自定义关闭按钮 */}
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              "absolute right-4 top-4 z-20",
              "rounded-lg bg-background/80 backdrop-blur-sm",
              "border border-border/50",
              "hover:bg-accent hover:border-border",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "p-1.5 sm:p-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Close</span>
          </button>

          {/* 标题区域 - 使用 DialogTitle 和 DialogDescription 以提供无障碍访问 */}
          <div className="mb-5 sm:mb-6 pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">
              <MessageSquare className="h-5 w-5 text-magellan-coral flex-shrink-0" />
              <span className="truncate">{t('feedback.dialog.title')}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('feedback.dialog.description')}
            </DialogDescription>
          </div>

          {/* 表单区域 */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-4">
              {/* 姓名输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span>{t('feedback.dialog.name_label')}</span>
                </label>
                <Input
                  value={feedbackData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('feedback.dialog.name_placeholder')}
                  className={cn(
                    "rounded-lg border-border",
                    "focus:border-primary focus:ring-primary/20",
                    "transition-colors duration-200",
                    "text-sm sm:text-base"
                  )}
                  disabled={isSubmitting}
                />
              </div>

              {/* 反馈内容输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-magellan-coral flex-shrink-0" />
                  <span>{t('feedback.dialog.feedback_label')}</span>
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <Textarea
                  value={feedbackData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  placeholder={t('feedback.dialog.feedback_placeholder')}
                  className={cn(
                    "rounded-lg border-border",
                    "focus:border-primary focus:ring-primary/20",
                    "transition-colors duration-200",
                    "min-h-[120px] sm:min-h-[140px]",
                    "resize-none",
                    "text-sm sm:text-base"
                  )}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className={cn(
              "flex gap-3 pt-4 sm:pt-5",
              "border-t border-border",
              // 移动端按钮堆叠,PC端水平排列
              "flex-col-reverse sm:flex-row sm:justify-end"
            )}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "border-border hover:bg-accent rounded-lg",
                  "transition-all duration-200",
                  "w-full sm:w-auto sm:min-w-[100px]",
                  "h-10 sm:h-auto"
                )}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !feedbackData.feedback.trim()}
                className={cn(
                  "bg-gradient-to-r from-magellan-coral to-magellan-gold",
                  "hover:from-magellan-coral/90 hover:to-magellan-gold/90",
                  "disabled:from-gray-400 disabled:to-gray-500",
                  "text-white rounded-lg",
                  "transition-all duration-200",
                  "shadow-md hover:shadow-lg",
                  "w-full sm:w-auto sm:min-w-[140px]",
                  "h-10 sm:h-auto"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{t('feedback.dialog.submitting')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>{t('feedback.dialog.submit_button')}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

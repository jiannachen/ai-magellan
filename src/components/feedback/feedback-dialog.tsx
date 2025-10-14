"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
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

      const data = await res.json().catch(() => null);

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
        <DialogContent className={cn(
          // 参照提交页面的卡片样式
          "bg-background border border-border rounded-2xl shadow-lg max-w-md",
          // 确保居中和合适的尺寸
          "!fixed !left-[50%] !top-[50%] !transform !-translate-x-1/2 !-translate-y-1/2",
          "w-full max-h-[90vh] overflow-y-auto relative p-6"
        )}>
          {/* 自定义关闭按钮 - 参照提交页面按钮样式 */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-20 rounded-sm bg-background border border-border hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 text-foreground" />
            <span className="sr-only">Close</span>
          </button>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xl font-semibold mb-2">
              <MessageSquare className="h-5 w-5 text-magellan-coral" />
              {t('feedback.dialog.title')}
            </div>
            <div className="text-sm text-muted-foreground pl-7">
              {t('feedback.dialog.description')}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  {t('feedback.dialog.name_label')}
                </label>
                <Input
                  value={feedbackData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('feedback.dialog.name_placeholder')}
                  className="border-border focus:border-primary rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-magellan-coral" />
                  {t('feedback.dialog.feedback_label')}
                  <span className="text-destructive ml-1">*</span>
                </label>
                <Textarea
                  value={feedbackData.feedback}
                  onChange={(e) => handleInputChange('feedback', e.target.value)}
                  placeholder={t('feedback.dialog.feedback_placeholder')}
                  className="border-border focus:border-primary rounded-lg min-h-[120px] resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-border hover:bg-accent rounded-lg"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "bg-gradient-to-r from-magellan-coral to-magellan-gold",
                  "hover:from-magellan-coral/90 hover:to-magellan-gold/90",
                  "text-white rounded-lg min-w-[120px]"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {t('feedback.dialog.submitting')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {t('feedback.dialog.submit_button')}
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

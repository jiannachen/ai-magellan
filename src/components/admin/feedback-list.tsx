"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/ui/common/table";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { MessageSquare } from "lucide-react";

export interface FeedbackItem {
  id: string;
  name: string | null;
  content: string;
  source: string | null;
  status: string;
  createdAt: string | Date;
}

interface FeedbackListProps {
  items?: FeedbackItem[];
}

export function FeedbackList({ items: initialItems }: FeedbackListProps) {
  const [items, setItems] = useState<FeedbackItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(!initialItems || initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialItems || initialItems.length === 0) {
      fetchFeedbacks();
    }
  }, []);

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/feedbacks');
      const result = await response.json() as { success: boolean; data?: FeedbackItem[]; message?: string };

      if (result.success && result.data) {
        setItems(result.data);
      } else {
        setError(result.message || '获取反馈列表失败');
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 border border-border/40 bg-background/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" />
        <h2 className="text-lg font-semibold">反馈列表</h2>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载反馈列表...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchFeedbacks} variant="outline">
            重试
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 bg-background/20">
              <TableHead>时间</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>内容</TableHead>
              <TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((f) => (
              <TableRow key={f.id} className="border-b border-border/30">
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(f.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">{f.name || '-'}</TableCell>
                <TableCell className="text-sm">{f.source || '-'}</TableCell>
                <TableCell className="text-sm max-w-[600px] whitespace-pre-wrap break-words">
                  {f.content}
                </TableCell>
                <TableCell className="text-sm">{f.status}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  暂无反馈
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

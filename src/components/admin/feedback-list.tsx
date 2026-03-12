"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/ui/common/table";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/common/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/common/pagination";
import { MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface FeedbackItem {
  id: string;
  name: string | null;
  content: string;
  source: string | null;
  status: string;
  createdAt: string | Date;
}

export function FeedbackList() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/admin/feedbacks?${params}`);
      const result = await response.json() as {
        success: boolean;
        data?: {
          feedbacks: FeedbackItem[];
          pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
        };
        message?: string;
      };

      if (result.success && result.data) {
        setItems(result.data.feedbacks);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
      } else {
        setError(result.message || '获取反馈列表失败');
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  return (
    <Card className="p-4 border border-border/40 bg-background/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="text-lg font-semibold">反馈列表</h2>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">共 {totalCount} 条</span>
          )}
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(parseInt(value))}
        >
          <SelectTrigger className="w-[100px] bg-background/40 border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="20">20 / 页</SelectItem>
            <SelectItem value="30">30 / 页</SelectItem>
            <SelectItem value="50">50 / 页</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
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
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} 条，
                共 {totalCount} 条
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ))
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center">
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </div>
                      );
                    })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

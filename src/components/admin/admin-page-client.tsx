"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WebsiteList } from "@/components/admin/website-list";
import { Button } from "@/ui/common/button";
import { Badge } from "@/ui/common/badge";
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
import type { Website } from "@/lib/types";
import { motion } from "framer-motion";
import { ListFilter, Users, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export function AdminPageClient({
  initialWebsites,
  initialCategories,
}: {
  initialWebsites: Website[];
  initialCategories: any[];
}) {
  const [activeStatus, setActiveStatus] =
    useState<Website["status"]>("pending");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Fetch categories on mount if not provided
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json() as { success: boolean; data: any[] };
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch websites data
  const fetchWebsites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        status: activeStatus,
        categoryId: selectedCategory,
      });

      const response = await fetch(`/api/admin/websites?${params}`);
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to fetch websites');
      }

      const data = await response.json() as {
        websites: Website[];
        pagination: {
          page: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
        };
      };
      setWebsites(data.websites);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setError(error instanceof Error ? error.message : '获取网站列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch status counts
  const fetchStatusCounts = async () => {
    try {
      const statuses = ['pending', 'approved', 'rejected'];
      const counts = await Promise.all(
        statuses.map(async (status) => {
          const response = await fetch(
            `/api/admin/websites?status=${status}&page=1&pageSize=1`
          );
          const data = await response.json() as {
            pagination: { totalCount: number };
          };
          return { status, count: data.pagination.totalCount };
        })
      );

      const newCounts: any = {};
      counts.forEach(({ status, count }) => {
        newCounts[status] = count;
      });
      setStatusCounts(newCounts);
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchWebsites();
  }, [currentPage, pageSize, activeStatus, selectedCategory]);

  // Fetch categories and status counts on mount
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      fetchCategories();
    }
    fetchStatusCounts();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, selectedCategory, pageSize]);

  const getStatusColor = (status: Website["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-[calc(100vh-4rem)] space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background/30 backdrop-blur-sm p-6 rounded-xl border border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            网站管理
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            审核和管理用户提交的网站内容
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <div className="grid w-full sm:w-auto grid-cols-3 bg-background/50 rounded-lg p-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-background/60 text-foreground">
              <ListFilter className="w-4 h-4" />
              网站管理
            </div>
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-background/60"
            >
              <Users className="w-4 h-4" />
              用户管理
            </Link>
            <Link
              href="/admin/feedback"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-background/60"
            >
              <MessageSquare className="w-4 h-4" />
              反馈管理
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-xl border border-border/40 bg-background/30 shadow-sm overflow-hidden backdrop-blur-sm">
        {/* Filter Section */}
        <div className="border-b border-border/40 bg-background/20 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-2 flex-1">
              {["pending", "approved", "rejected"].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveStatus(status as Website["status"])}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                    ${
                      activeStatus === status
                        ? "bg-background/40 border-primary/30 shadow-sm " +
                          getStatusColor(status as Website["status"])
                        : "bg-background/20 border-border/40 hover:border-border/60 text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <span className="text-sm font-medium">
                    {status === "pending"
                      ? "待审核"
                      : status === "approved"
                      ? "已通过"
                      : "已拒绝"}
                  </span>
                  <Badge
                    variant={activeStatus === status ? "secondary" : "outline"}
                    className={cn(
                      "ml-1 bg-background/50",
                      activeStatus === status &&
                        getStatusColor(status as Website["status"])
                    )}
                  >
                    {statusCounts[status as keyof typeof statusCounts]}
                  </Badge>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-background/40 border-border/40">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className="bg-background/95 backdrop-blur-sm"
                >
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
          </div>
        </div>

        {/* Website List */}
        <div className="bg-background/20 relative min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchWebsites} variant="outline">
                重试
              </Button>
            </div>
          ) : (
            <WebsiteList
              key={`${activeStatus}-${selectedCategory}-${currentPage}`}
              websites={websites}
              categories={categories}
              showActions={true}
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="border-t border-border/40 bg-background/20 p-4">
            <div className="flex items-center justify-between">
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

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page and adjacent pages
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
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
          </div>
        )}
      </div>
    </motion.div>
  );
}

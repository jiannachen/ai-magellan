"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/utils';
import { ChevronDown, Compass, X, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/ui/common/button';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/common/dialog';

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  children?: Category[];
}

interface MobileCategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function MobileCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange
}: MobileCategoryFilterProps) {
  const tRanking = useTranslations('pages.rankings');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // 获取一级分类
  const parentCategories = categories.filter(cat => !cat.parentId);

  // 切换分类展开/收起
  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // 选择分类
  const handleCategoryClick = (slug: string, categoryId: number, hasChildren: boolean) => {
    // 如果是"全部"分类，只更新筛选状态并关闭弹框
    if (slug === 'all') {
      onCategoryChange(slug);
      setIsOpen(false);
      return;
    }

    // 对于一级分类，如果有子分类，展开/收起
    if (hasChildren) {
      toggleCategory(categoryId);
      // 同时也允许筛选该分类
      onCategoryChange(slug);
    } else {
      // 对于没有子分类的分类或二级分类，跳转到分类页面并关闭弹框
      setIsOpen(false);
      router.push(`/categories/${slug}`);
    }
  };

  // 获取当前选中的分类名称
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') {
      return tRanking('filters.category_all');
    }
    const allCategories = categories.flatMap(cat =>
      cat.children ? [cat, ...cat.children] : [cat]
    );
    const selected = allCategories.find(cat => cat.slug === selectedCategory);
    return selected?.name || tRanking('filters.category_all');
  };

  // 渲染分类项
  const renderCategoryItem = (
    category: Category,
    isChild: boolean = false,
    isSelected: boolean = false
  ) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    const handleClick = () => {
      // 对于一级分类，如果有子分类，展开/收起
      if (hasChildren) {
        toggleCategory(category.id);
        // 同时也允许筛选该分类
        onCategoryChange(category.slug);
      } else {
        // 对于没有子分类的分类或二级分类，跳转到分类页面并关闭弹框
        setIsOpen(false);
        router.push(`/categories/${category.slug}`);
      }
    };

    return (
      <div key={category.id}>
        <button
          onClick={handleClick}
          className={cn(
            "w-full text-left rounded-xl transition-all duration-200",
            "border-2",
            isChild ? "pl-8 pr-4 py-2.5" : "px-4 py-3",
            isSelected
              ? "bg-magellan-primary text-white border-magellan-primary"
              : "bg-white hover:bg-magellan-primary/5 border-magellan-primary/20 hover:border-magellan-primary/40"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "flex-shrink-0 rounded-full",
                isChild ? "w-2 h-2" : "w-2.5 h-2.5",
                isSelected ? "bg-white" : "bg-magellan-primary"
              )} />
              <span className={cn(
                "font-medium truncate",
                isChild ? "text-sm" : "text-base"
              )}>
                {category.name}
              </span>
            </div>

            {hasChildren && (
              <div className={cn(
                "flex-shrink-0 p-1 transition-transform duration-200",
                isExpanded ? "rotate-180" : "rotate-0"
              )}>
                <ChevronDown className={cn(
                  "h-4 w-4",
                  isSelected ? "text-white" : "text-magellan-primary"
                )} />
              </div>
            )}
          </div>
        </button>

        {/* 子分类列表 */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2 ml-3 pl-3 border-l-2 border-magellan-primary/20">
                {category.children?.map(child =>
                  renderCategoryItem(child, true, selectedCategory === child.slug)
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="lg:hidden p-4 bg-white border-b border-magellan-primary/20">
      <div className="space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-magellan-depth-600" />
          <input
            type="text"
            placeholder={tRanking('search_placeholder')}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl",
              "border border-magellan-primary/20 focus:border-magellan-primary",
              "text-sm text-magellan-depth-900 placeholder:text-magellan-depth-500",
              "focus:outline-none focus:ring-2 focus:ring-magellan-primary/20"
            )}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* 分类筛选按钮 - 使用Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between h-11",
                "border-magellan-primary/20 hover:border-magellan-primary",
                "bg-white hover:bg-magellan-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="truncate">{getSelectedCategoryName()}</span>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </Button>
          </DialogTrigger>

          <DialogContent
            className={cn(
              "max-w-lg w-[90vw] max-h-[80vh] p-0 gap-0",
              "!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2",
              "sm:max-w-md"
            )}
          >
            <DialogHeader className="px-6 py-4 border-b border-magellan-primary/10 text-left">
              <DialogTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-magellan-primary/10">
                  <Filter className="h-5 w-5 text-magellan-primary" />
                </div>
                <span>{tRanking('sidebar.navigation_title')}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-4 pb-6">
              <div className="space-y-2">
                {/* 全部分类 */}
                <button
                  onClick={() => {
                    handleCategoryClick('all', 0, false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl transition-all duration-200",
                    "border-2",
                    selectedCategory === 'all'
                      ? "bg-magellan-primary text-white border-magellan-primary"
                      : "bg-white hover:bg-magellan-primary/5 border-magellan-primary/20 hover:border-magellan-primary/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      selectedCategory === 'all' ? "bg-white" : "bg-magellan-primary"
                    )} />
                    <span className="text-base font-medium">
                      🌊 {tRanking('filters.category_all')}
                    </span>
                  </div>
                </button>

                {/* 分类列表 */}
                <div className="pt-2 space-y-2">
                  {parentCategories.map(category =>
                    renderCategoryItem(category, false, selectedCategory === category.slug)
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/utils';
import { ChevronDown, ChevronRight, Compass, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: Category[];
}

interface CategoryFilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CategoryFilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange
}: CategoryFilterSidebarProps) {
  const tRanking = useTranslations('pages.rankings');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // 获取一级分类（parent_id为null或未定义）
  const parentCategories = categories.filter(cat => !cat.parent_id);

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

  // 选择分类（一级或二级）
  const handleCategoryClick = (slug: string, categoryId: number, hasChildren: boolean) => {
    onCategoryChange(slug);
    // 如果有子分类，切换展开/收起状态
    if (hasChildren) {
      toggleCategory(categoryId);
    }
  };

  // 渲染分类项
  const renderCategoryItem = (
    category: Category,
    isChild: boolean = false,
    isSelected: boolean = false
  ) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    // 检查是否是选中项的父分类
    const isParentOfSelected = !isChild && hasChildren && category.children?.some(
      child => selectedCategory === child.slug
    );

    return (
      <div key={category.id}>
        <button
          onClick={() => handleCategoryClick(category.slug, category.id, !!hasChildren)}
          className={cn(
            "w-full text-left rounded-lg transition-all duration-200 group",
            "border border-transparent hover:border-magellan-primary/30",
            isChild ? "pl-6 pr-3 py-2" : "px-3 py-2.5",
            isSelected
              ? "bg-gradient-to-r from-magellan-primary/15 to-magellan-teal/10 border-magellan-primary/40 shadow-sm"
              : isParentOfSelected
              ? "bg-gradient-to-r from-magellan-primary/8 to-magellan-teal/5 border-magellan-primary/20"
              : "hover:bg-magellan-primary/5"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* 分类指示器 */}
              <div className={cn(
                "flex-shrink-0 rounded-full transition-all duration-200",
                isChild ? "w-1.5 h-1.5" : "w-2 h-2",
                isSelected
                  ? "bg-magellan-primary ring-2 ring-magellan-primary/30"
                  : isParentOfSelected
                  ? "bg-magellan-primary/60 ring-2 ring-magellan-primary/20"
                  : "bg-magellan-depth-300 group-hover:bg-magellan-primary/60"
              )} />

              {/* 分类名称 */}
              <span className={cn(
                "font-medium transition-colors duration-200 truncate",
                isChild ? "text-sm" : "text-sm",
                isSelected
                  ? "text-magellan-primary font-semibold"
                  : isParentOfSelected
                  ? "text-magellan-primary/80 font-medium"
                  : "text-magellan-depth-700 group-hover:text-magellan-primary"
              )}>
                {category.name}
              </span>
            </div>

            {/* 展开/收起图标 */}
            {hasChildren && (
              <div className={cn(
                "flex-shrink-0 p-0.5 rounded transition-transform duration-200",
                isExpanded ? "rotate-0" : ""
              )}>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-magellan-depth-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-magellan-depth-600" />
                )}
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
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1 ml-2 pl-2 border-l-2 border-magellan-primary/10">
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
    <aside className="hidden lg:flex w-80 bg-white/95 backdrop-blur-sm border-r border-magellan-primary/20 sticky top-4 self-start h-[calc(100vh-2rem)] flex-col shadow-lg">
      {/* Fixed Navigation Header */}
      <div className="p-6 pb-4 border-b border-magellan-primary/10 bg-gradient-to-br from-magellan-primary/5 to-transparent">
        <h3 className="text-lg font-semibold text-magellan-depth-900 mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-magellan-primary professional-compass" />
          {tRanking('sidebar.navigation_title')}
        </h3>

        {/* Professional Compass Search */}
        <div className="relative">
          <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-magellan-depth-600 professional-compass" />
          <input
            type="text"
            placeholder={tRanking('search_placeholder')}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl",
              "border border-magellan-primary/20 focus:border-magellan-primary",
              "bg-white/80 focus:bg-white",
              "text-sm text-magellan-depth-900 placeholder:text-magellan-depth-500",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-magellan-primary/20"
            )}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable categories */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* 全部分类选项 */}
          <button
            onClick={() => onCategoryChange('all')}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group",
              "border border-transparent hover:border-magellan-primary/30",
              selectedCategory === 'all'
                ? "bg-gradient-to-r from-magellan-primary/15 to-magellan-teal/10 border-magellan-primary/40 shadow-sm"
                : "hover:bg-magellan-primary/5"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                selectedCategory === 'all'
                  ? "bg-magellan-primary ring-2 ring-magellan-primary/30"
                  : "bg-magellan-depth-300 group-hover:bg-magellan-primary/60"
              )} />
              <span className={cn(
                "text-sm font-medium transition-colors duration-200",
                selectedCategory === 'all'
                  ? "text-magellan-primary font-semibold"
                  : "text-magellan-depth-700 group-hover:text-magellan-primary"
              )}>
                🌊 {tRanking('filters.category_all')}
              </span>
            </div>
          </button>

          {/* 一级分类列表 */}
          <div className="pt-2 space-y-1">
            {parentCategories.map(category =>
              renderCategoryItem(category, false, selectedCategory === category.slug)
            )}
          </div>
        </div>
      </div>

      {/* 底部统计信息 */}
      <div className="p-4 border-t border-magellan-primary/10 bg-gradient-to-br from-magellan-primary/5 to-transparent">
        <div className="space-y-3">
          {/* 总分类数和重置按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-magellan-depth-600">{tRanking('sidebar.total_categories')}</span>
              <span className="text-sm font-semibold text-magellan-primary">{categories.length}</span>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => onCategoryChange('all')}
                className={cn(
                  "text-xs font-medium text-magellan-primary hover:text-magellan-primary/80",
                  "transition-colors duration-200",
                  "px-2 py-1 rounded-md hover:bg-magellan-primary/10"
                )}
              >
                {tRanking('filters.reset')}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/ui/common/card';
import { Badge } from '@/ui/common/badge';
import { Button } from '@/ui/common/button';
import { cn } from '@/lib/utils/utils';
import { useTranslations } from 'next-intl';
import {
  Compass,
  Code,
  Image,
  PenTool,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Star,
  Map,
  Brain,
  Anchor,
  Ship,
  Navigation,
  Telescope,
  Crown,
  Globe,
  ChevronRight,
  Grid,
  Layers
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  toolCount: number;
  subcategories?: Array<{
    id: number;
    name: string;
    slug: string;
    toolCount: number;
    description?: string;
  }>;
}

interface CategoriesListPageProps {
  categories: Category[];
}

// 商业化图标映射
const categoryIcons: Record<string, any> = {
  'ai-chat': MessageSquare,
  'ai-art': Image,
  'ai-writing': PenTool,
  'ai-coding': Code,
  'ai-tools': Brain,
  'llm': Sparkles,
  'machine-learning': Brain,
  'data-science': Brain,
  'automation': Sparkles,
  'productivity': Compass,
  'design': Image,
  'marketing': Globe,
  'education': Brain,
  'business': Ship,
  'research': Telescope,
  'entertainment': Star,
  'finance': Anchor,
  'healthcare': Crown,
  'development': Code,
  'analytics': Navigation,
};

// 可复用的子分类卡片组件 - 小巧版
const SubcategoryCard = ({ subcategory }: { 
  subcategory: NonNullable<Category['subcategories']>[0] 
}) => {
  const IconComponent = categoryIcons[subcategory.slug] || Brain;
  const tCategories = useTranslations('pages.categories_list');
  
  return (
    <Link href={`/categories/${subcategory.slug}`}>
      <Card className={cn(
        "group cursor-pointer transition-all duration-300",
        "bg-background border border-border hover:border-primary/30",
        "rounded-lg shadow-sm hover:shadow-md",
        "md:hover:transform md:hover:-translate-y-1", // 只在桌面端有hover效果
        "active:scale-[0.98] md:active:scale-100" // 移动端按压效果
      )}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {subcategory.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {subcategory.toolCount} {tCategories('tools_unit')}
              </p>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function CategoriesListPage({ categories }: CategoriesListPageProps) {
  const tCategories = useTranslations('pages.categories_list');
  const [activeCategory, setActiveCategory] = useState(categories[0]?.slug || '');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const getIconComponent = (slug: string) => {
    return categoryIcons[slug] || Brain;
  };

  const totalTools = categories.reduce((sum, cat) => sum + cat.toolCount, 0);

  // 处理锚点滚动
  const scrollToCategory = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      setActiveCategory(slug);
      // 更新URL锚点
      window.history.replaceState(null, '', `#${slug}`);
    }
  };

  // 初始化时检查URL锚点
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && categories.find(cat => cat.slug === hash)) {
      setActiveCategory(hash);
      setTimeout(() => scrollToCategory(hash), 100);
    }
  }, [categories]);

  // 监听滚动以更新活跃分类
  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map(cat => ({
        slug: cat.slug,
        element: document.getElementById(cat.slug)
      })).filter(item => item.element);

      for (const { slug, element } of categoryElements) {
        const rect = element!.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          if (activeCategory !== slug) {
            setActiveCategory(slug);
            window.history.replaceState(null, '', `#${slug}`);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8"> {/* 移动端底部留空间 */}
      {/* 简化的头部 */}
      <section className="bg-background border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {tCategories('main_categories')}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {tCategories('browse_all_tools', { count: totalTools })}
            </p>
          </div>
        </div>
      </section>

      {/* 主要内容区域 - 响应式布局 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧固定分类导航 - 移动端隐藏，桌面端显示 */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-background rounded-lg border border-border sticky top-[73px]">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  {tCategories('main_categories')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tCategories('territories_count', { count: categories.length })}
                </p>
              </div>
              
              {/* 计算最大高度：屏幕高度 - header高度 - 上边距 - 标题区域 */}
              <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 73px - 24px - 80px)' }}>
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.slug);
                  const isActive = activeCategory === category.slug;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.slug)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all duration-200 group mb-1",
                        isActive 
                          ? "bg-primary/10 border border-primary/20 text-primary"
                          : "hover:bg-muted text-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className={cn(
                              "text-sm transition-colors",
                              isActive ? "text-primary/70" : "text-muted-foreground"
                            )}>
                              {category.toolCount} {tCategories('tools_unit')}
                              {category.subcategories && category.subcategories.length > 0 && (
                                <span className="ml-1">• {category.subcategories.length} {tCategories('subcategories_unit')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* 移动端快速导航 - 只在移动端显示 */}
          <div className="lg:hidden mb-6">
            <div className="bg-background rounded-lg border border-border p-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-primary" />
                {tCategories('main_categories')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(showAllCategories ? categories : categories.slice(0, 6)).map((category) => {
                  const IconComponent = getIconComponent(category.slug);
                  const isActive = activeCategory === category.slug;

                  return (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.slug)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
                {categories.length > 6 && !showAllCategories && (
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
                  >
                    <span>+{categories.length - 6}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧滚动内容区域 - 显示所有分类 */}
          <main className="flex-1 space-y-6 lg:space-y-8">
            {categories.map((category, categoryIndex) => {
              const IconComponent = getIconComponent(category.slug);
              
              return (
                <section key={category.id} id={category.slug} className="scroll-mt-20">
                  {/* 分类标题 */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">
                          {category.name}
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Grid className="h-4 w-4" />
                            {category.toolCount} {tCategories('tools_unit')}
                          </span>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Layers className="h-4 w-4" />
                              {category.subcategories.length} {tCategories('subcategories_unit')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 子分类展示或直接跳转 */}
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {category.subcategories.map((subcategory, index) => (
                        <motion.div
                          key={subcategory.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                        >
                          <SubcategoryCard 
                            subcategory={subcategory}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-sm">
                      <Link href={`/categories/${category.slug}`}>
                        <Card className="group cursor-pointer transition-all duration-300 bg-background border border-border hover:border-primary/30 rounded-lg shadow-sm hover:shadow-md md:hover:transform md:hover:-translate-y-1 active:scale-[0.98] md:active:scale-100">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <IconComponent className="h-6 w-6 text-primary" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate mb-1">
                                  {tCategories('explore_category', { category: category.name })}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {tCategories('tools_available', { count: category.toolCount })}
                                </p>
                              </div>
                              
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1 flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
}
'use client'

import Link from "next/link";
import { Trophy, Plus, Compass, ChevronDown, Star, TrendingUp, CheckCircle, Map, Anchor, Code, Palette, Brain, Zap, Monitor, Shield, Users, Camera, Music, Gamepad2, Briefcase, Heart, GraduationCap, ShoppingCart, Wrench } from "lucide-react";
import { Button } from "@/ui/common/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/common/dropdown-menu";
import MobileMenu from "./mobile-menu";
import { UserNav } from "@/components/auth/user-nav";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai';
import { categoriesAtom } from '@/lib/atoms';
import { useEffect } from 'react';
import { cn } from "@/lib/utils/utils";
import { useContainerCollisionPadding } from "@/lib/hooks/useContainerCollisionPadding";

export default function Header() {
  const t = useTranslations();
  const tRank = useTranslations('pages.rankings');
  const tCat = useTranslations('pages.categories');
  const [categories, setCategories] = useAtom(categoriesAtom);
  const collisionPadding = useContainerCollisionPadding(8);

  // 分类图标映射 - 根据slug选择合适的图标
  const getCategoryIcon = (slug: string) => {
    const iconMap: { [key: string]: any } = {
      'developer-tools': Code,
      'design': Palette,
      'ai-tools': Brain,
      'productivity': Zap,
      'web-apps': Monitor,
      'security': Shield,
      'social': Users,
      'photography': Camera,
      'music': Music,
      'games': Gamepad2,
      'business': Briefcase,
      'health': Heart,
      'education': GraduationCap,
      'ecommerce': ShoppingCart,
      'utilities': Wrench,
      'default': Map
    };
    const IconComponent = iconMap[slug] || iconMap['default'];
    return <IconComponent className="h-4 w-4 text-muted-foreground" />;
  };

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      if (categories.length === 0) {
        try {
          const response = await fetch('/api/categories');
          if (response.ok) {
            const data = await response.json();
            setCategories(data.data || []);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      }
    };
    loadCategories();
  }, [categories.length, setCategories]);
  
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "bg-background/95 backdrop-blur-xl",
      "border-b border-border",
      "shadow-sm",
      "overflow-visible"
    )}>
      <nav className="container mx-auto px-4 h-[60px] sm:h-[65px] overflow-visible">
        <div className="flex h-full items-center justify-between overflow-visible">
          {/* Logo and Title - 船舵风格 */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 group",
              "subtle-hover",
              "p-2 rounded-lg hover:bg-muted/50"
            )}
          >
            <img src="/logo.png" alt="AI Magellan Logo" className="h-7 w-7 rounded-lg" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">
                AI Magellan
              </span>
              <span className="text-xs text-muted-foreground hidden lg:block">
                {t('header.subtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - 航海仪表板风格 */}
          <div className="hidden md:flex items-center gap-4 flex-1 ml-6">
            {/* Categories Dropdown - 海域地图 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className={cn(
                    "flex items-center gap-2 h-10 px-3 rounded-lg",
                    "hover:bg-muted",
                    "subtle-hover"
                  )}
                >
                  <Map className="h-4 w-4" />
                  <span className="font-medium">{t('navigation.categories')}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 p-1 rounded-lg border bg-background border-opacity-100 shadow-lg z-[9999]"
                avoidCollisions
                collisionPadding={collisionPadding}
              >
                <DropdownMenuItem asChild>
                  <Link 
                    href="/categories"
                    className="flex items-center gap-3 cursor-pointer font-medium p-2 rounded-md hover:bg-accent"
                  >
                    <Map className="h-4 w-4 text-primary" />
                    <span>{t('filters.all_categories')}</span>
                  </Link>
                </DropdownMenuItem>
                {categories.slice(0, 6).map((category: { id: number; name: string; slug: string }) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link 
                      href={`/categories#${category.slug}`}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent"
                    >
                      {getCategoryIcon(category.slug)}
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Rankings Dropdown - 排行榜航线 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className={cn(
                    "flex items-center gap-2 h-10 px-3 rounded-lg",
                    "hover:bg-muted",
                    "subtle-hover"
                  )}
                >
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium">{t('navigation.rankings')}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-52 p-1 rounded-lg border bg-background border-opacity-100 shadow-lg z-[9999]"
                avoidCollisions
                collisionPadding={collisionPadding}
              >
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings"
                    className="flex items-center gap-3 cursor-pointer font-medium p-2 rounded-md hover:bg-accent"
                  >
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>{tRank('view_all')}</span>
                  </Link>
                </DropdownMenuItem>
                
                {/* 排行榜选项 - 航海主题图标 */}
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/popular"
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{tRank('types.popular.title')}</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/top-rated"
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>{tRank('types.top-rated.title')}</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/free"
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{tRank('types.free.title')}</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/new"
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-accent"
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span>{tRank('types.new.title')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side controls - 船长控制台 */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <UserNav />
          </div>

          {/* Mobile Menu - 移动端舵盘 */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </nav>
      
      {/* 底部航海线条装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </header>
  );
}

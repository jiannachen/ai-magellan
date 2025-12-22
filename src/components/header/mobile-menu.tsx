"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavigationLink from "@/components/navigation/navigation-link";
import { 
  Trophy, 
  Plus, 
  Menu, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Star, 
  CheckCircle,
  Map,
  Code,
  Palette,
  Brain,
  Zap,
  Monitor,
  Shield,
  Users,
  Camera,
  Music,
  Gamepad2,
  Briefcase,
  Heart,
  GraduationCap,
  ShoppingCart,
  Wrench
} from "lucide-react";
import { Button } from "@/ui/common/button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { useUser } from '@clerk/nextjs'
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai';
import { categoriesAtom } from '@/lib/atoms';
import { cn } from "@/lib/utils/utils";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const t = useTranslations();
  const tRank = useTranslations('pages.rankings');
  const tCat = useTranslations('pages.categories');
  const [categories, setCategories] = useAtom(categoriesAtom);
  const { isSignedIn } = useUser();

  // 分类图标映射 - 与桌面版保持一致
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

  // 加载分类数据 - 与桌面版保持一致
  useEffect(() => {
    const loadCategories = async () => {
      if (categories.length === 0) {
        try {
          const response = await fetch('/api/categories?includeSubcategories=true');
          if (response.ok) {
            const data = await response.json();
            // Filter to ensure we only have parent categories
            const allCategories = Array.isArray(data.data) ? data.data : [];
            const parentCategories = allCategories.filter(
              (cat: any) => cat.parentId === null || cat.parentId === undefined
            );
            setCategories(parentCategories);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
      }
    };
    loadCategories();
  }, [categories.length, setCategories]);

  // Rankings 与桌面版保持一致
  const rankingLinks = [
    { href: "/rankings/popular", title: tRank('types.popular.title'), icon: TrendingUp },
    { href: "/rankings/top-rated", title: tRank('types.top-rated.title'), icon: Star },
    { href: "/rankings/free", title: tRank('types.free.title'), icon: CheckCircle },
    { href: "/rankings/new", title: tRank('types.new.title'), icon: Plus },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-secondary transition-all active:scale-95"
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-label="关闭菜单"
          />

          {/* 菜单内容 - 现代简约风格 */}
          <div className="absolute top-full left-1 right-1 sm:left-4 sm:right-4 mt-2 z-50">
            <div className="bg-background border border-border rounded-lg shadow-lg p-3 sm:p-4 max-w-full overflow-hidden mx-auto" style={{ maxWidth: '420px' }}>
              <div className="flex flex-col space-y-4">
                
                {/* Categories Section - 海域地图 */}
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="w-full justify-between hover:bg-secondary font-medium text-sm sm:text-base rounded-lg h-11 sm:h-12 px-3 sm:px-4 min-h-[44px]"
                  >
                    <div className="flex items-center">
                      <Map className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                      {t('navigation.categories')}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      categoriesOpen && "rotate-180"
                    )} />
                  </Button>
                  
                  {categoriesOpen && (
                    <div className="mt-2 pl-6 sm:pl-8 space-y-1">
                      <NavigationLink href="/categories" className="block">
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-secondary text-sm rounded-lg h-10 min-h-[40px] px-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <Map className="h-4 w-4 mr-2 text-primary" />
                          {t('filters.all_categories')}
                        </Button>
                      </NavigationLink>
                      {categories.slice(0, 6).map((category: { id: number; name: string; slug: string }) => (
                        <NavigationLink
                          key={category.id}
                          href={`/categories#${category.slug}`}
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-secondary text-sm rounded-lg h-9"
                            onClick={() => setIsOpen(false)}
                          >
                            {getCategoryIcon(category.slug)}
                            <span className="ml-2">
                              {category.name}
                            </span>
                          </Button>
                        </NavigationLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rankings Section - 排行榜航线 */}
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setRankingsOpen(!rankingsOpen)}
                    className="w-full justify-between hover:bg-secondary font-medium text-sm sm:text-base rounded-lg h-11 sm:h-12 px-3 sm:px-4 min-h-[44px]"
                  >
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                      {t('navigation.rankings')}
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      rankingsOpen && "rotate-180"
                    )} />
                  </Button>
                  
                  {rankingsOpen && (
                    <div className="mt-2 pl-6 sm:pl-8 space-y-1">
                      <NavigationLink href="/rankings" className="block">
                        <Button
                          variant="ghost"
                          className="w-full justify-start hover:bg-secondary text-sm rounded-lg h-10 min-h-[40px] px-3"
                          onClick={() => setIsOpen(false)}
                        >
                          <Trophy className="h-4 w-4 mr-2 text-primary" />
                          {tRank('view_all')}
                        </Button>
                      </NavigationLink>
                      {rankingLinks.map((link) => (
                        <NavigationLink
                          key={link.href}
                          href={link.href}
                          className="block"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start hover:bg-secondary text-sm rounded-lg h-9"
                            onClick={() => setIsOpen(false)}
                          >
                            <link.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                            {link.title}
                          </Button>
                        </NavigationLink>
                      ))}
                    </div>
                  )}
                </div>

                {/* 分隔线 */}
                <div className="h-px bg-border/50" />

                {/* 用户导航区域（仅未登录时显示） */}
                {!isSignedIn && (
                  <>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground font-medium">
                        {t('auth.account')}
                      </span>
                      <div className="flex-shrink-0">
                        <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                          <Button size="sm" variant="outline" className="min-w-[96px]">
                            {t('auth.signin')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                    {/* 分隔线 */}
                    <div className="h-px bg-border/50" />
                  </>
                )}

                {/* 控制面板 - 追随桌面版风格 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {t('common.settings')}
                  </span>
                  <div className="flex-shrink-0">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client'

import Link from "next/link";
import { Trophy, Plus, Brain, Grid3X3, ChevronDown, Search, Star, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/ui/common/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/common/dropdown-menu";
import ThemeSwitch from "@/components/theme-switcher/theme-switch";
import MobileMenu from "./mobile-menu";
import { UserNav } from "@/components/auth/user-nav";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { useTranslations } from 'next-intl';
import { useAtom } from 'jotai';
import { categoriesAtom } from '@/lib/atoms';
import { useEffect } from 'react';

export default function Header() {
  const t = useTranslations();
  const [categories, setCategories] = useAtom(categoriesAtom);

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 h-16">
        <div className="flex h-full items-center gap-6">
          {/* Logo and Title */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Brain className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg lg:text-xl">AI Navigation</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="flex items-center gap-2 h-10"
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/categories"
                    className="flex items-center gap-2 cursor-pointer font-semibold border-b pb-2 mb-2"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span>Browse All Categories</span>
                  </Link>
                </DropdownMenuItem>
                {categories.map((category: { id: number; name: string; slug: string }) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link 
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>


            {/* Rankings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="flex items-center gap-2 h-10"
                >
                  <Trophy className="h-4 w-4" />
                  <span>{t('navigation.rankings')}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings"
                    className="flex items-center gap-2 cursor-pointer font-semibold border-b pb-2 mb-2"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>All Rankings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/popular"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Most Popular</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/top-rated"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Star className="h-4 w-4" />
                    <span>Top Rated</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/trending"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Trending Now</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/free"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Best Free Tools</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/new"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Recently Added</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/rankings/monthly-hot"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Monthly Hot</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitch />
            <LanguageSwitcher />
            <UserNav />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
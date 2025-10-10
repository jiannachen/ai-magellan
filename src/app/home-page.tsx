"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { websitesAtom } from "@/lib/atoms";
import {
  categoriesAtom,
  searchQueryAtom,
  selectedCategoryAtom,
  compareListAtom,
  compareModalOpenAtom,
} from "@/lib/atoms";
import WebsiteGrid from "@/components/website/website-grid";
import { SearchManager } from "@/components/search/search-manager";
import { CompareModal } from "@/components/compare/compare-modal";
import { Typewriter } from "@/ui/animation/typewriter";
import { Brain, Cpu, Sparkles, Zap, BarChart3 } from "lucide-react";
import type { Website, Category } from "@/lib/types";
import { useTheme } from "next-themes";
import { WaveText } from "@/ui/animation/wave-text";
import { useTranslations } from 'next-intl';

interface HomePageProps {
  initialWebsites: Website[];
  initialCategories: Category[];
}

export default function HomePage({
  initialWebsites,
  initialCategories,
}: HomePageProps) {
  const t = useTranslations();
  const [websites, setWebsites] = useAtom(websitesAtom);
  // console.log("🚀 ~ websites:", websites);
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [compareList, setCompareList] = useAtom(compareListAtom);
  const [compareModalOpen, setCompareModalOpen] = useAtom(compareModalOpenAtom);
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  // Enhanced scroll-based animations
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
  const heroTranslateY = useTransform(scrollY, [0, 400], [0, -100]);
  const isScrolled = useTransform(scrollY, (value) => value > 300);
  const [filteredWebsites, setFilteredWebsites] = useState<Website[]>([]);

  // 初始化数据
  useEffect(() => {
    setWebsites(initialWebsites);
    setCategories(initialCategories);
  }, [initialWebsites, initialCategories, setWebsites, setCategories]);

  // 处理主题切换
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // const handleVisit = (website: Website) => {
  //   fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
  //   window.open(website.url, "_blank");
  // };

  const handleRemoveFromCompare = (id: number) => {
    setCompareList(prev => prev.filter(webId => webId !== id));
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <motion.div
        className="fixed inset-0 -z-10 overflow-hidden"
        initial={false}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <motion.div
          initial={false}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </motion.div>

      {/* Search and Filter Section */}
      <div className="sticky top-14 z-40 w-full transition-[background,border] duration-100 md:duration-300">
        <div className="w-full px-2 py-3 sm:py-2 md:px-4 md:py-4">
          <SearchManager
            websites={websites}
            categories={categories}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchQuery}
            onResultsChange={setFilteredWebsites}
          />
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Hero Section */}
        <motion.div
          className="relative py-16"
          style={{
            opacity: heroOpacity,
            scale: heroScale,
            y: heroTranslateY,
          }}
        >
          {/* Floating Icons */}
          <AnimatePresence mode="popLayout">
            {[
              {
                Icon: Brain,
                position: "left-1/4 top-1/4",
                size: "w-12 h-12",
              },
              { Icon: Cpu, position: "right-1/4 top-1/3", size: "w-10 h-10" },
              {
                Icon: Sparkles,
                position: "left-1/3 bottom-1/4",
                size: "w-8 h-8",
              },
              {
                Icon: Zap,
                position: "right-1/3 bottom-1/3",
                size: "w-9 h-9",
              },
            ].map(({ Icon, position, size }, index) => (
              <motion.div
                key={index}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${position}`}
                initial={false}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: index * 0.1,
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <Icon className={`${size} text-primary/20`} />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="container mx-auto text-center space-y-6 sm:space-y-8 px-4">
            {/* Title */}
            <motion.div className="space-y-3 sm:space-y-4">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight sm:leading-normal">
                <WaveText className="text-primary">
                  {t('pages.home.hero_title')}
                </WaveText>
              </div>
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="container mx-auto text-base sm:text-lg md:text-xl text-muted-foreground/90"
              >
                <Typewriter
                  text={t('pages.home.hero_subtitle')}
                  speed={80}
                  delay={500}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Website Grid */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="container mx-auto px-4 pb-24"
        >
          <WebsiteGrid
            websites={filteredWebsites}
            categories={categories}
            // onVisit={handleVisit}
          />
        </motion.div>
      </motion.div>

      {/* Floating Compare Button */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={() => setCompareModalOpen(true)}
              className="group relative bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="h-6 w-6" />
              
              {/* Badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                {compareList.length}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                对比 {compareList.length} 个工具
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <CompareModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
      />
    </div>
  );
}

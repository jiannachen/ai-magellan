"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { Input } from "@/ui/common/input";
import { Button } from "@/ui/common/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * Hero Search - Client Component
 * 搜索框,需要客户端交互
 */
export function HeroSearch() {
  const tLanding = useTranslations('landing');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative group professional-compass-search">
        {/* 专业级罗盘外环装饰 */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/8 via-magellan-coral/8 to-magellan-teal/8 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500"></div>

        <div className="relative">
          <Input
            placeholder={tLanding('hero.search_placeholder')}
            className={cn(
              "pl-6 pr-6 h-14 text-lg",
              "rounded-xl border border-primary/15",
              "bg-background/90 backdrop-blur-sm",
              "focus:border-primary focus:bg-background",
              "shadow-sm hover:shadow-md transition-all duration-300",
              "placeholder:text-muted-foreground/70"
            )}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                handleSearch(searchQuery);
              }
            }}
          />

          {/* 搜索按钮 */}
          <Button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg"
            onClick={() => handleSearch(searchQuery)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

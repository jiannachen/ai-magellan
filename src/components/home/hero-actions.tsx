"use client";

import { useTranslations } from 'next-intl';
import Link from "next/link";
import { Button } from "@/ui/common/button";
import { Map, Compass } from "lucide-react";
import { cn } from "@/lib/utils/utils";

/**
 * Hero Actions - Client Component
 * 行动按钮,带有客户端动画效果
 */
export function HeroActions() {
  const tLanding = useTranslations('landing');

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/categories">
        <Button
          size="lg"
          className={cn(
            "w-full sm:w-auto",
            "bg-primary hover:bg-primary/90 text-white",
            "rounded-xl px-8 py-4 text-base font-semibold",
            "shadow-lg hover:shadow-xl transition-shadow duration-200",
            "subtle-scale"
          )}
        >
          <Map className="h-5 w-5 mr-2" />
          🗺️ {tLanding('hero.buttons.explore_territories')}
        </Button>
      </Link>
      <Link href="/submit">
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "w-full sm:w-auto",
            "border-primary/30 hover:border-primary hover:bg-primary/5",
            "rounded-xl px-8 py-4 text-base font-semibold",
            "transition-colors duration-200 subtle-hover"
          )}
        >
          <Compass className="h-5 w-5 mr-2" />
          ⚓ {tLanding('hero.buttons.mark_discovery')}
        </Button>
      </Link>
    </div>
  );
}

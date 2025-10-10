"use client";

import { motion } from "framer-motion";
import { Card } from "@/ui/common/card";
import { Button } from "@/ui/common/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import {
  cardHoverVariants,
  sharedLayoutTransition,
} from "@/ui/animation/variants/animations";
import type { Website } from "@/lib/types";
import { WebsiteThumbnail } from "./website-thumbnail";
import { useCardTilt } from "@/hooks/use-card-tilt";
import Link from "next/link";

interface CompactCardProps {
  website: Website;
  onVisit: (website: Website) => void;
}

export function CompactCard({ website, onVisit }: CompactCardProps) {
  const { cardRef, tiltProps } = useCardTilt({
    maxTiltDegree: 10,
    scale: 1.02,
    transitionZ: 10,
  });

  return (
    <div
      ref={cardRef}
      {...tiltProps}
      className="card-container"
      style={{ cursor: "pointer" }}
    >
      <motion.div
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        layoutId={`website-${website.id}`}
        transition={sharedLayoutTransition}
      >
        <Card
          className={cn(
            "group relative flex flex-col overflow-hidden",
            "bg-card border-border hover:border-primary/20",
            "transition-all card-hover",
            "rounded-xl shadow-sm hover:shadow-md"
          )}
        >
          {/* 整个卡片的点击区域 - 跳转到详情页 */}
          <Link href={`/tools/${website.id}`} className="absolute inset-0 z-[1]" />

          {/* 访问按钮 - 右上角 */}
          <div className="absolute top-3 right-3 z-[2]">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onVisit(website);
              }}
              className="h-8 w-8 p-0 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-all"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* 卡片内容 */}
          <div className="relative z-[1] p-4 flex items-center gap-3">
            <WebsiteThumbnail
              url={website.url}
              thumbnail={website.thumbnail}
              title={website.title}
              className="w-10 h-10 rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-all">
                {website.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {website.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>{website.visits} 访问</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

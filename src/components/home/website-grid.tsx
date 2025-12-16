"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { websitesAtom } from "@/lib/atoms";
import { CompactCard } from "@/components/website/compact-card";
import type { Website } from "@/lib/types";

interface WebsiteGridProps {
  websites: Website[];
}

/**
 * Website Grid - Client Component
 * 网站卡片网格,需要客户端交互(访问统计)
 */
export function WebsiteGrid({ websites: initialWebsites }: WebsiteGridProps) {
  const [websites, setWebsites] = useAtom(websitesAtom);

  // 使用全局状态中的网站数据,如果不存在则使用传入的初始数据
  const displayWebsites = websites.length > 0 ?
    initialWebsites.map(w => websites.find(gw => gw.id === w.id) || w) :
    initialWebsites;

  const handleVisit = async (website: Website) => {
    try {
      await fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
      setWebsites(prev => prev.map(w =>
        w.id === website.id ? { ...w, visits: w.visits + 1 } : w
      ));
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
    window.open(website.url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayWebsites.map((website) => (
        <div key={website.id} className="group">
          <CompactCard website={website} onVisit={handleVisit} />
        </div>
      ))}
    </div>
  );
}

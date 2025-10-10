"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAtomValue, useAtom } from "jotai";
import { isAdminModeAtom, isCompactModeAtom, websitesAtom } from "@/lib/atoms";
import { useToast } from "@/hooks/use-toast";
import { WebsiteCard } from "./website-card";
import { CompactCard } from "./compact-card";
import { ModernWebsiteCard } from "./modern-website-card";
import { ViewModeToggle } from "./view-mode-toggle";
import { cn } from "@/lib/utils/utils";
import type { Website, Category } from "@/lib/types";
import { Globe } from "lucide-react";

interface WebsiteGridProps {
  websites: Website[];
  categories: Category[];
  // onVisit: (website: Website) => void;
  className?: string;
}

export default function WebsiteGrid({
  websites,
  categories,
  className,
}: WebsiteGridProps) {
  const isAdmin = useAtomValue(isAdminModeAtom);
  const { toast } = useToast();
  const [isCompact, setIsCompact] = useAtom(isCompactModeAtom);
  const [, setWebsites] = useAtom(websitesAtom);

  const handleVisit = async (website: Website) => {
    fetch(`/api/websites/${website.id}/visit`, { method: "POST" });
    fetch(`/api/websites/active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: website.url, id: website.id }),
    });

    window.open(website.url, "_blank");
  };

  const handleStatusUpdate = async (id: number, status: Website["status"]) => {
    fetch(`/api/websites/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    setWebsites(
      websites.map((website) =>
        website.id === id ? { ...website, status } : website
      )
    );
    toast({
      title: "状态已更新",
      description: status === "approved" ? "网站已通过审核" : "网站已被拒绝",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("relative min-h-[500px]", className)}
      layout
    >
      <ViewModeToggle isCompact={isCompact} onChange={setIsCompact} />

      <motion.div
        layout
        className={cn(
          "grid gap-3 sm:gap-4",
          isCompact
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4"
        )}
      >
        <AnimatePresence mode="popLayout">
          {!websites || websites.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                  <Globe className="w-10 h-10 text-primary/40" />
                </div>
                <div>
                  <p className="text-lg font-medium text-foreground/80">
                    暂无网站
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    当前分类下还没有添加任何网站
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            websites.map((website, index) => (
              <motion.div
                key={website.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: index * 0.05,
                }}
              >
                {isCompact ? (
                  <CompactCard website={website} onVisit={handleVisit} />
                ) : (
                  <ModernWebsiteCard
                    website={website}
                    category={categories.find(
                      (c) => c.id === website.category_id
                    )}
                    isAdmin={isAdmin}
                    onVisit={handleVisit}
                    onStatusUpdate={handleStatusUpdate}
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { websitesAtom } from "@/lib/atoms";
import { CompactCard } from "./compact-card";
import { cn, addRefParam } from "@/lib/utils/utils";
import type { Website } from "@/lib/types";
import { Globe } from "lucide-react";

interface WebsiteGridProps {
  websites: Website[];
  // onVisit: (website: Website) => void;
  className?: string;
}

export default function WebsiteGrid({
  websites,
  className,
}: WebsiteGridProps) {
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

    // 添加ref参数用于追踪来源
    const urlWithRef = addRefParam(website.url);
    window.open(urlWithRef, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("relative min-h-[500px]", className)}
      layout
    >
      <motion.div
        layout
        className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8"
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
                <CompactCard website={website} onVisit={handleVisit} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

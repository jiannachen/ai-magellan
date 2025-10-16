"use client";

import { Rankings } from "@/components/website/rankings";
import { Website } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

export function RankingsClient({ websites }: { websites: Website[] }) {
  const t = useTranslations();

  const handleVisit = async (website: Website) => {
    try {
      fetch(`/api/websites/${website.id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      window.open(website.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to record visit:", error);
      toast({
        title: t('common.error'),
        description: t('messages.network_error'),
        variant: "destructive",
      });
    }
  };

  return <Rankings websites={websites} onVisit={handleVisit} />;
}

"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";

interface WebsiteThumbnailProps {
  url: string;
  thumbnail: string | null;
  title: string;
  className?: string;
}

export function WebsiteThumbnail({
  url,
  thumbnail,
  title,
  className,
}: WebsiteThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const hostname = new URL(url).hostname;
  const faviconUrl = `https://icon.horse/icon/${hostname}`;
  const thumbnailSrc = thumbnail || "";

  if (!thumbnail || imageError) {
    return (
      <div
        className={cn(
          "relative w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center",
          "group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300",
          className
        )}
      >
        <Image
          src={faviconUrl}
          alt={title}
          width={32}
          height={32}
          className="w-8 h-8"
          unoptimized
          onError={(e) => {
            // @ts-ignore - nextjs Image 组件的 error 事件类型定义问题
            e.target.style.display = "none";
            // @ts-ignore
            e.target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <Globe className="h-8 w-8 text-gray-500 dark:text-gray-400 hidden" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-10 h-10 rounded-lg overflow-hidden",
        "group-hover:ring-2 ring-primary/20 transition-all duration-300",
        className
      )}
    >
      <Image
        src={thumbnailSrc}
        alt={title}
        fill
        sizes="56px"
        className="object-cover"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}

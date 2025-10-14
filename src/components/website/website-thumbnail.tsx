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
          "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center", // 响应式尺寸
          "group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300",
          className
        )}
      >
        <Image
          src={faviconUrl}
          alt={title}
          width={32}
          height={32}
          className="w-6 h-6 sm:w-8 sm:h-8" // 响应式图标尺寸
          unoptimized
          onError={(e) => {
            // @ts-ignore - nextjs Image 组件的 error 事件类型定义问题
            e.target.style.display = "none";
            // @ts-ignore
            e.target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400 hidden" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden", // 响应式尺寸
        "group-hover:ring-2 ring-primary/20 transition-all duration-300",
        className
      )}
    >
      <Image
        src={thumbnailSrc}
        alt={title}
        fill
        sizes="(max-width: 640px) 40px, 48px" // 响应式sizes
        className="object-cover"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}

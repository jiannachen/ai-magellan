"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";

interface WebsiteThumbnailProps {
  url: string;
  thumbnail: string | null | undefined;
  title: string;
  className?: string;
  logoUrl?: string | null;
}

export function WebsiteThumbnail({
  url,
  thumbnail,
  title,
  className,
  logoUrl,
}: WebsiteThumbnailProps) {
  const [logoError, setLogoError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const hostname = new URL(url).hostname;
  const faviconUrl = `https://icon.horse/icon/${hostname}`;

  // 优先级：logo_url > favicon > thumbnail
  // 如果 logo 存在且未出错，显示 logo
  if (logoUrl && !logoError) {
    return (
      <div
        className={cn(
          "rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-2",
          "group-hover:ring-2 ring-primary/20 transition-all duration-300",
          className
        )}
      >
        <div className="relative w-full h-full">
          <Image
            src={logoUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 64px, (max-width: 768px) 72px, 80px"
            className="object-contain"
            unoptimized
            onError={() => setLogoError(true)}
          />
        </div>
      </div>
    );
  }

  // 如果 logo 不存在或出错，尝试 favicon
  if (!faviconError) {
    return (
      <div
        className={cn(
          "relative rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center",
          "group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300",
          className
        )}
      >
        <Image
          src={faviconUrl}
          alt={title}
          width={64}
          height={64}
          className="w-full h-full object-contain p-2"
          unoptimized
          onError={(e) => {
            setFaviconError(true);
            // @ts-ignore
            e.target.style.display = "none";
            // @ts-ignore
            e.target.nextElementSibling?.classList.remove("hidden");
          }}
        />
        <Globe className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400 hidden" />
      </div>
    );
  }

  // 最后才使用 thumbnail（如果有的话）
  if (thumbnail) {
    return (
      <div
        className={cn(
          "relative rounded-lg overflow-hidden",
          "group-hover:ring-2 ring-primary/20 transition-all duration-300",
          className
        )}
      >
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 640px) 64px, (max-width: 768px) 72px, 80px"
          className="object-cover"
          unoptimized
          onError={() => {}}
        />
      </div>
    );
  }

  // 如果什么都没有，显示 Globe 图标
  return (
    <div
      className={cn(
        "relative rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center",
        "group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-300",
        className
      )}
    >
      <Globe className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400" />
    </div>
  );
}

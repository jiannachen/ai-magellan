'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc = '/images/placeholder.png',
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // 生成模糊占位符
  const generateBlurDataURL = (w: number = 10, h: number = 10) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'; // 灰色背景
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const imageProps = {
    src: imgSrc,
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-all duration-300',
      isLoading && 'opacity-0 scale-95',
      !isLoading && 'opacity-100 scale-100',
      hasError && 'grayscale',
      className
    ),
    quality,
    priority,
    loading: priority ? ('eager' as const) : loading,
    placeholder: (placeholder === 'blur' ? 'blur' : 'empty') as 'blur' | 'empty',
    ...(placeholder === 'blur' && {
      blurDataURL: blurDataURL || generateBlurDataURL(width, height)
    }),
    ...(sizes && { sizes }),
    ...props
  };

  if (fill) {
    return (
      <div className="relative overflow-hidden">
        <Image
          {...imageProps}
          fill
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        width={width}
        height={height}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

// 预加载关键图像的工具函数
export const preloadImage = (src: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
};

// 批量预加载图像
export const preloadImages = (srcs: string[]) => {
  if (typeof window !== 'undefined') {
    srcs.forEach(preloadImage);
  }
};
'use client';

import { useEffect } from 'react';

interface CriticalResourcesProps {
  images?: string[];
  fonts?: string[];
  scripts?: string[];
  stylesheets?: string[];
}

export function CriticalResources({ 
  images = [], 
  fonts = [], 
  scripts = [], 
  stylesheets = [] 
}: CriticalResourcesProps) {
  useEffect(() => {
    // 预加载关键图像
    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // 预加载字体
    fonts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // 预加载脚本
    scripts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });

    // 预加载样式表
    stylesheets.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = src;
      document.head.appendChild(link);
    });

    // DNS预解析和预连接
    const domains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.google-analytics.com'
    
    ];

    domains.forEach(domain => {
      // DNS预解析
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = `//${domain}`;
      document.head.appendChild(dnsPrefetch);

      // 预连接
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = `https://${domain}`;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    });

  }, [images, fonts, scripts, stylesheets]);

  return null;
}

// Hook for monitoring Core Web Vitals
export function useCoreWebVitals() {
  useEffect(() => {
    if ('web-vital' in window) return;

    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(console.log);
      onINP(console.log);
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    });
  }, []);
}
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useNavigation } from '@/contexts/navigation-context';
import GlobalLoading from './global-loading';

/**
 * 全局导航加载状态组件
 * 监听路由变化和导航状态，在页面导航时显示加载状态
 */
export default function NavigationLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isNavigating, endNavigation } = useNavigation();
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams?.toString());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = pathname;
    const currentSearch = searchParams?.toString();

    // 检查是否真的发生了变化
    const pathChanged = prevPathRef.current !== currentPath;
    const searchChanged = prevSearchRef.current !== currentSearch;

    if (pathChanged || searchChanged) {
      // 路由变化完成，设置一个最小显示时间后结束加载状态
      // 确保加载动画至少显示一段时间，提供更好的用户体验
      const minLoadingTime = pathChanged ? 300 : 200;

      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        endNavigation();
        timerRef.current = null;
      }, minLoadingTime);

      // 更新引用
      prevPathRef.current = currentPath;
      prevSearchRef.current = currentSearch;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, searchParams, endNavigation]);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm">
      <GlobalLoading variant="fullscreen" size="lg" />
    </div>
  );
}

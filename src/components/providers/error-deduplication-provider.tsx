'use client';

import { useEffect } from 'react';

export function ErrorDeduplicationProvider() {
  useEffect(() => {
    // 动态导入错误去重工具
    import('@/lib/utils/error-deduplication').catch(console.warn);
  }, []);

  return null; // 这个组件不渲染任何内容
}

export default ErrorDeduplicationProvider;
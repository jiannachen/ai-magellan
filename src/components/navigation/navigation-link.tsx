'use client';

import Link from 'next/link';
import { useNavigation } from '@/contexts/navigation-context';
import { usePathname } from 'next/navigation';
import { ComponentProps, MouseEvent } from 'react';

interface NavigationLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * 自定义 Link 组件，在点击时触发全局导航加载状态
 */
export default function NavigationLink({ href, onClick, ...props }: NavigationLinkProps) {
  const { startNavigation } = useNavigation();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // 如果是外部链接或带有 target 属性，不触发加载状态
    const isExternal = typeof href === 'string' && (href.startsWith('http') || href.startsWith('//'));
    const hasTarget = props.target && props.target !== '_self';

    // 如果点击的是当前页面，不触发加载状态
    const isSamePage = typeof href === 'string' && (
      href === pathname ||
      href.split('#')[0] === pathname.split('#')[0]
    );

    if (!isExternal && !hasTarget && !isSamePage) {
      startNavigation();
    }

    // 调用传入的 onClick 处理函数
    onClick?.(e);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}

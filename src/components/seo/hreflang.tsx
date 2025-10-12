'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

interface HrefLangProps {
  locales?: string[];
}

const defaultLocales = ['zh', 'en', 'tw'];

export function HrefLang({ locales = defaultLocales }: HrefLangProps) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aimagellan.com';
  
  // 获取当前路径，去除语言前缀
  const getPathWithoutLocale = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    // 如果第一个段是语言代码，则去除它
    if (segments.length > 0 && locales.includes(segments[0])) {
      return '/' + segments.slice(1).join('/');
    }
    return path;
  };

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  return (
    <>
      {locales.map((locale) => {
        let href;
        
        if (locale === 'zh') {
          // 默认语言 (中文) 不需要语言前缀
          href = pathWithoutLocale === '/' ? baseUrl : `${baseUrl}${pathWithoutLocale}`;
        } else {
          // 其他语言需要语言前缀
          href = pathWithoutLocale === '/' 
            ? `${baseUrl}/${locale}` 
            : `${baseUrl}/${locale}${pathWithoutLocale}`;
        }

        return (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={href}
          />
        );
      })}
      
      {/* x-default 指向默认语言版本 */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={pathWithoutLocale === '/' ? baseUrl : `${baseUrl}${pathWithoutLocale}`}
      />
    </>
  );
}
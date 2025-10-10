import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

// 支持的语言列表
export const locales = ['zh', 'en', 'ja'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({locale}) => {
  // 如果没有提供 locale，从 cookie 中获取或使用默认语言
  let requestLocale = locale;
  
  if (!requestLocale) {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE');
    
    if (localeCookie && locales.includes(localeCookie.value as any)) {
      requestLocale = localeCookie.value;
    } else {
      requestLocale = defaultLocale;
    }
  }
  
  // 确保 locale 有效，如果无效则使用默认语言
  const validLocale = requestLocale && locales.includes(requestLocale as any) ? requestLocale : defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`./i18n/messages/${validLocale}.json`)).default
  };
});
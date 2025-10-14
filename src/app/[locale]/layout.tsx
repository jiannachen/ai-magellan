import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Header from "@/components/header/header";
import Footer from "@/components/footer/index";
import BottomNavigation from "@/components/navigation/bottom-nav";
import { HrefLang } from "@/components/seo/hreflang";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }
  
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen flex flex-col">
        <HrefLang />
        <Header />
        {/* 主内容区域 - 在移动端为底部导航预留足够空间 */}
        <main className="flex-1 relative">
          <div className="pb-20 md:pb-0 min-h-full">
            {children}
          </div>
        </main>
        {/* Footer 在移动端隐藏，避免与底部导航冲突 */}
        <div className="hidden md:block">
          <Footer />
        </div>
        {/* 底部导航 - 固定在底部，仅移动端显示 */}
        <BottomNavigation />
      </div>
    </NextIntlClientProvider>
  );
}

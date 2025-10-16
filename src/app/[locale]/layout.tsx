import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Header from "@/components/header/header";
import Footer from "@/components/footer/index";
import BottomNavigation from "@/components/navigation/bottom-nav";
import { HrefLang } from "@/components/seo/hreflang";
import FloatingFeedbackButton from "@/components/feedback/floating-feedback-button";
import { Metadata } from 'next';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

// 动态生成 metadata 根据语言
export async function generateMetadata({
  params
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aimagellan.com";
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return {
    title: {
      default: t('metadata.title'),
      template: `%s | ${t('metadata.site_name')}`
    },
    description: t('metadata.description'),
    authors: [{ name: t('metadata.author') }],
    creator: t('metadata.site_name'),
    publisher: t('metadata.site_name'),

    openGraph: {
      type: "website",
      locale: locale === 'tw' ? 'zh_TW' : 'en_US',
      url: `${baseUrl}${localePrefix}`,
      siteName: t('metadata.site_name'),
      title: t('metadata.og_title'),
      description: t('metadata.og_description'),
      images: [
        {
          url: "/images/og-image.avif",
          width: 1200,
          height: 630,
          alt: t('metadata.og_image_alt')
        }
      ]
    },

    twitter: {
      card: "summary_large_image",
      title: t('metadata.twitter_title'),
      description: t('metadata.twitter_description'),
      images: ["/images/twitter-image.avif"],
      creator: "@aimagellan"
    },

    alternates: {
      canonical: `${baseUrl}${localePrefix}`,
      languages: {
        'en': `${baseUrl}`,
        'zh-TW': `${baseUrl}/tw`
      }
    },

    category: "Technology",
  };
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
        {/* 浮动反馈按钮 */}
        <FloatingFeedbackButton />
      </div>
    </NextIntlClientProvider>
  );
}

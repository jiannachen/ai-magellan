import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Header from "@/components/header/header";
import Footer from "@/components/footer/index";
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
      <HrefLang />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
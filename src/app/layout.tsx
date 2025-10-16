import "./globals.css";
import { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import ThemeProvider from "@/components/providers/theme-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { Toaster } from "@/ui/common/sonner";
import SWRProvider from "@/components/providers/swr-provider";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Analytics as OtherAnalytics } from "@/components/analytics";
import { getLocale } from 'next-intl/server';
import { CriticalResources } from "@/components/performance/critical-resources";
import ErrorDeduplicationProvider from "@/components/providers/error-deduplication-provider";

// 全局配置 - 仅保留与语言无关的设置
export const metadata: Metadata = {
  // 验证标签
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION
  },

  // 爬虫规则
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  category: "Technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // 移动端优化：防止地址栏影响布局
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" }
  ]
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 移动端优化meta标签 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Magellan" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* 防止移动端viewport跳动 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        
        {/* 网站图标 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.clarity.ms" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-background"
      >
        <CriticalResources
          images={[
            '/images/og-image.avif',
            '/logo.png'
          ]}
        />
        <ClerkProvider>
          <ErrorDeduplicationProvider />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>
              <SWRProvider>
                {children}
                <Toaster />
              </SWRProvider>
            </StoreProvider>
          </ThemeProvider>
        </ClerkProvider>
        <VercelAnalytics />
        <OtherAnalytics 
          googleAnalyticsId="G-9MNGY82H1J"
          clarityProjectId={process.env.CLARITY_PROJECT_ID}
        />
      </body>
    </html>
  );
}

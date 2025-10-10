import "./globals.css";
import { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { ClerkProvider } from '@clerk/nextjs';
import ThemeProvider from "@/components/providers/theme-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { Toaster } from "@/ui/common/sonner";
import Header from "@/components/header/header";
import Footer from "@/components/footer/index";
import SWRProvider from "@/components/providers/swr-provider";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Analytics as OtherAnalytics } from "@/components/analytics";

// 全局SEO配置
export const metadata: Metadata = {
  title: {
    default: "AI导航 - 发现优质AI工具与资源",
    template: "%s | AI导航"
  },
  description: "AI导航是一个专业的AI工具导航站，精选优质的人工智能工具和资源，帮助用户发现、分享和收藏最新最好用的AI产品。包含ChatGPT、MidJourney、Stable Diffusion等热门AI工具。",
  keywords: ["AI导航", "人工智能工具", "AI工具", "ChatGPT", "AI资源", "机器学习", "深度学习", "AI产品"],
  authors: [{ name: "AI导航团队" }],
  creator: "AI导航",
  publisher: "AI导航",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "zh",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com",
    siteName: "AI导航",
    title: "AI导航 - 发现优质AI工具与资源",
    description: "专业的AI工具导航站，精选优质的人工智能工具和资源",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI导航 - 发现优质AI工具与资源"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI导航 - 发现优质AI工具与资源",
    description: "专业的AI工具导航站，精选优质的人工智能工具和资源",
    images: ["/images/twitter-image.png"],
    creator: "@ai_nav"
  },
  
  // 验证标签
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      "baidu-site-verification": process.env.BAIDU_SITE_VERIFICATION || ""
    }
  },
  
  // 其他元数据
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
  
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com",
  },
  
  category: "Technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
  // 使用默认语言作为回退
  const locale = 'en';
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 额外的meta标签 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI导航" />
        
        {/* 网站图标 */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-background"
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ClerkProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <StoreProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </StoreProvider>
            </ThemeProvider>
          </ClerkProvider>
        </NextIntlClientProvider>
        <VercelAnalytics />
        <OtherAnalytics googleAnalyticsId="G-9MNGY82H1J" />
      </body>
    </html>
  );
}

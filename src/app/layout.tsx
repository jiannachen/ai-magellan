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

// 全局SEO配置
export const metadata: Metadata = {
  title: {
    default: "AI Magellan - 探索发现优质AI工具的导航专家",
    template: "%s | AI Magellan"
  },
  description: "AI Magellan 是您的AI工具探索伙伴，如同麦哲伦开启环球航海一样，我们为您开启AI工具的发现之旅。精选验证优质的人工智能工具和资源，帮助专业人士发现、评估和使用最适合的AI产品。",
  keywords: ["AI Magellan", "AI工具导航", "人工智能工具", "AI工具发现", "AI资源探索", "专业AI工具", "ChatGPT", "AI产品评测"],
  authors: [{ name: "AI Magellan 团队" }],
  creator: "AI Magellan",
  publisher: "AI Magellan",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "zh",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://aimagellan.com",
    siteName: "AI Magellan",
    title: "AI Magellan - 探索发现优质AI工具的导航专家",
    description: "AI Magellan 是您的AI工具探索伙伴，精选验证优质的人工智能工具和资源",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Magellan - 探索发现优质AI工具的导航专家"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI Magellan - 探索发现优质AI工具的导航专家",
    description: "AI Magellan 是您的AI工具探索伙伴，精选验证优质的人工智能工具和资源",
    images: ["/images/twitter-image.png"],
    creator: "@aimagellan"
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
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://aimagellan.com",
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
  const locale = await getLocale();
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 额外的meta标签 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Magellan" />
        
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
        <ClerkProvider>
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
        <OtherAnalytics googleAnalyticsId="G-9MNGY82H1J" />
      </body>
    </html>
  );
}

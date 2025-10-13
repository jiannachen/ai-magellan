import type { Metadata } from "next";

export interface SiteSettings {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  url: string;
  logo: string;
  themeColor: {
    light: string;
    dark: string;
  };
}

const defaultSettings: SiteSettings = {
  title: "AI导航 - 发现优质AI工具与资源",
  description: "发现、分享和收藏优质AI工具与资源，让你的人工智能生活更美好",
  keywords: ["AI导航", "AI工具", "人工智能", "AI资源", "AI网站导航"],
  author: "AI导航",
  url: "https://ai-nav.cn",
  logo: "/logo.png",
  themeColor: {
    light: "white",
    dark: "#020817"
  }
};

export async function getSettings(): Promise<SiteSettings> {
  return defaultSettings;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    metadataBase: new URL(settings.url),
    title: settings.title,
    description: settings.description,
    keywords: settings.keywords,
    authors: [{ name: settings.author }],
    creator: settings.author,
    publisher: settings.author,
    robots: "index, follow",
    icons: {
      icon: settings.logo,
      apple: settings.logo,
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: settings.url,
      title: settings.title,
      description: settings.description,
      siteName: settings.author,
      images: [{
        url: settings.logo,
        width: 512,
        height: 512,
        alt: settings.author,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.title,
      description: settings.description,
      images: [settings.logo],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.author,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export async function generateManifest() {
  const settings = await getSettings();
  
  return {
    name: settings.author,
    short_name: settings.author,
    description: settings.description,
    start_url: "/",
    display: "standalone",
    background_color: settings.themeColor.light,
    theme_color: settings.themeColor.light,
    orientation: "portrait",
    icons: [
      {
        src: settings.logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
} 
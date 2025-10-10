import Script from 'next/script';

export function PWAManifest() {
  return (
    <Script
      id="pwa-manifest"
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          name: "AI导航 - 发现优质AI工具与资源",
          short_name: "AI导航",
          description: "专业的AI工具导航站，精选优质的人工智能工具和资源",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#3b82f6",
          orientation: "portrait-primary",
          icons: [
            {
              src: "/icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png"
            },
            {
              src: "/icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png"
            },
            {
              src: "/icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png"
            },
            {
              src: "/icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png"
            },
            {
              src: "/icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png"
            },
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable"
            },
            {
              src: "/icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png"
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ],
          categories: ["productivity", "utilities", "education"],
          lang: "zh-CN",
          dir: "ltr",
          scope: "/",
          shortcuts: [
            {
              name: "提交网站",
              short_name: "提交",
              description: "快速提交AI工具网站",
              url: "/submit",
              icons: [{ src: "/icons/shortcut-submit.png", sizes: "96x96" }]
            },
            {
              name: "排行榜",
              short_name: "排行",
              description: "查看热门AI工具排行榜",
              url: "/rankings",
              icons: [{ src: "/icons/shortcut-rankings.png", sizes: "96x96" }]
            }
          ]
        })
      }}
    />
  );
}
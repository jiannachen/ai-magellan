import { prisma } from "@/lib/db/db";
import FooterContent from "./footer-content";
import type { FooterSettings } from "@/lib/types";
import { cachedPrismaQuery } from "@/lib/db/cache";

export async function Footer() {
  // 在服务端获取数据
  const footerLinks = await cachedPrismaQuery(
    "footer-links",
    () =>
      prisma.footerLink.findMany({
        select: {
          title: true,
          url: true,
        },
        orderBy: {
          created_at: "asc",
        },
      }),
    { ttl: 86400 } // 1天缓存
  );

  const footerSettings: FooterSettings = {
    links: footerLinks,
    copyright: "© 2024 AI Magellan - Chart Your AI Journey",
    icpBeian: "",
    customHtml: "",
  };

  return <FooterContent initialSettings={footerSettings} />;
}

export default Footer;

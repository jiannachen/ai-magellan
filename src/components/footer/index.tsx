import { getDB } from "@/lib/db";
import { footerLinks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import FooterContent from "./footer-content";
import type { FooterSettings } from "@/lib/types";
import { cachedPrismaQuery } from "@/lib/db/cache";

export async function Footer() {
  // 在服务端获取数据
  const footerLinksList = await cachedPrismaQuery(
    "footer-links",
    async () => {
      const db = getDB();
      const result = await db.query.footerLinks.findMany({
        columns: {
          title: true,
          url: true,
        },
        orderBy: (footerLinks, { asc }) => [asc(footerLinks.createdAt)],
      });
      return result;
    },
    { ttl: 86400 } // 1天缓存
  );

  const footerSettings: FooterSettings = {
    links: footerLinksList,
    copyright: "© 2024 AI Magellan - Chart Your AI Journey",
    icpBeian: "",
    customHtml: "",
  };

  return <FooterContent initialSettings={footerSettings} />;
}

export default Footer;

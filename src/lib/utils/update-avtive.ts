import { getDB } from '@/lib/db';
import { websites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function updateWebsiteActive() {
  try {
    const db = getDB();
    // 获取所有需要检查的网站
    const websitesList = await db.query.websites.findMany({
      where: eq(websites.status, "approved"),
      columns: {
        id: true,
        url: true,
        title: true,
      },
    });

    console.log(`开始检查 ${websitesList.length} 个网站的可访问性`);

    // 逐个检查网站
    for (const website of websitesList) {
      try {
        await fetch(`/api/websites/active`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: website.url, id: website.id }),
        }).then((res) => res.json());
      } catch (error) {
        if (error instanceof Error) {
          console.log(
            `检查网站 [${website.title}] (ID: ${website.id}) 失败: ${error.message}`
          );
        } else {
          console.log(
            `检查网站 [${website.title}] (ID: ${website.id}) 失败: 未知错误`
          );
        }
      }

      // 添加延迟，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("所有网站检查完成");
  } catch (error) {
    if (error instanceof Error) {
      console.log("检查网站过程中发生错误:", error.message);
    } else {
      console.log("检查网站过程中发生未知错误");
    }
  }
}

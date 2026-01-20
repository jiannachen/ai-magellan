import { getDB } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { ne } from "drizzle-orm";

// 支持的图片类型
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

// 规范化内容类型
function normalizeContentType(contentType: string | null): string {
  if (!contentType) return "image/jpeg";

  // 处理特殊情况
  if (
    contentType === "image/x-icon" ||
    contentType === "image/vnd.microsoft.icon"
  ) {
    return "image/x-icon";
  }

  return SUPPORTED_IMAGE_TYPES.has(contentType) ? contentType : "image/jpeg";
}

export async function updateWebsiteThumbnails() {
  try {
    const db = getDB();
    // 获取所有需要更新的网站
    const websitesList = await db.query.websites.findMany({
      where: ne(websites.thumbnail, ""),
      columns: {
        id: true,
        thumbnail: true,
      },
    });

    console.log(`开始更新 ${websitesList.length} 个网站的缩略图`);

    // 逐个更新网站缩略图
    for (const website of websitesList) {
      try {
        if (!website.thumbnail) continue;

        // 检查缩略图是否可访问
        const response = await fetch(website.thumbnail, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (response.ok) {
          const contentType = normalizeContentType(
            response.headers.get("content-type")
          );

          // 如果是图片类型，保持不变
          if (SUPPORTED_IMAGE_TYPES.has(contentType)) {
            console.log(`网站 ID ${website.id} 的缩略图有效`);
          }
        } else {
          console.log(`网站 ID ${website.id} 的缩略图无法访问`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(
            `更新网站 ID ${website.id} 的缩略图失败: ${error.message}`
          );
        } else {
          console.log(`更新网站 ID ${website.id} 的缩略图失败: 未知错误`);
        }
      }

      // 添加延迟，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("所有缩略图更新完成");
  } catch (error) {
    if (error instanceof Error) {
      console.log("更新缩略图过程中发生错误:", error.message);
    } else {
      console.log("更新缩略图过程中发生未知错误");
    }
  }
}

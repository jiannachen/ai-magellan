import { CronJob } from "cron";
import { updateWebsiteThumbnails } from "../utils/update-thumbnails";
import { updateWebsiteActive } from "../utils/update-avtive";
import { runHealthCheckProcess } from "../services/health-check";

// 每天凌晨3点执行缩略图更新
export const thumbnailUpdateJob = new CronJob(
  "0 3 * * *",
  async () => {
    console.log("开始执行缩略图更新任务");
    await updateWebsiteThumbnails();
    console.log("缩略图更新任务完成");
  },
  null,
  false,
  "Asia/Shanghai"
);

// 每天凌晨4点执行网站可访问性检查
export const websiteCheckJob = new CronJob(
  "0 4 * * *",
  async () => {
    console.log("开始检查网站可访问性");
    await updateWebsiteActive();
    console.log("网站检查任务完成");
  },
  null,
  false,
  "Asia/Shanghai"
);

// 每6小时执行一次健康检查（更频繁的检查）
export const healthCheckJob = new CronJob(
  "0 */6 * * *",
  async () => {
    console.log("开始执行网站健康检查");
    try {
      await runHealthCheckProcess(50); // 每次检查50个网站
      console.log("网站健康检查任务完成");
    } catch (error) {
      console.error("网站健康检查任务失败:", error);
    }
  },
  null,
  false,
  "Asia/Shanghai"
);

// 每周日凌晨执行死链清理
export const deadLinkCleanupJob = new CronJob(
  "0 2 * * 0", // 每周日凌晨2点
  async () => {
    console.log("开始执行死链清理任务");
    try {
      const { prisma } = await import("@/lib/db/db");
      
      // 查找连续7天都无法访问的网站
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const suspiciousWebsites = await prisma.website.findMany({
        where: {
          active: 0,
          last_checked: { lt: sevenDaysAgo },
          status: 'approved'
        },
        select: { id: true, url: true, title: true }
      });
      
      if (suspiciousWebsites.length > 0) {
        // 降低质量分数，但不直接删除
        await prisma.website.updateMany({
          where: {
            id: { in: suspiciousWebsites.map(w => w.id) }
          },
          data: {
            quality_score: { decrement: 20 }, // 大幅降低质量分数
            is_trusted: false, // 取消可信标记
          }
        });
        
        console.log(`已降低 ${suspiciousWebsites.length} 个长期无法访问网站的质量分数`);
      }
      
      console.log("死链清理任务完成");
    } catch (error) {
      console.error("死链清理任务失败:", error);
    }
  },
  null,
  false,
  "Asia/Shanghai"
);

import { NextResponse } from "next/server";

// POST /api/cron/start
// 启动所有定时任务
export async function POST() {
  try {
    // 只在生产环境中启动定时任务
    if (process.env.NODE_ENV === "production") {
      // 使用动态导入避免在开发环境加载 cron 模块
      const { thumbnailUpdateJob, websiteCheckJob, healthCheckJob, deadLinkCleanupJob } = await import("@/lib/tasks/cron");

      thumbnailUpdateJob?.start();
      websiteCheckJob?.start();
      healthCheckJob?.start();
      deadLinkCleanupJob?.start();

      return NextResponse.json({
        success: true,
        message: "All cron jobs started successfully"
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Cron jobs are only started in production environment"
      });
    }
  } catch (error) {
    console.error("Failed to start cron jobs:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to start cron jobs"
    }, { status: 500 });
  }
}
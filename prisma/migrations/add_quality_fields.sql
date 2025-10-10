-- 添加网站质量评估字段的迁移
-- 这是对现有websites表的扩展

-- 添加质量评估相关字段
ALTER TABLE "websites" ADD COLUMN "quality_score" INTEGER DEFAULT 50;
ALTER TABLE "websites" ADD COLUMN "is_trusted" BOOLEAN DEFAULT false;
ALTER TABLE "websites" ADD COLUMN "is_featured" BOOLEAN DEFAULT false;
ALTER TABLE "websites" ADD COLUMN "weight" INTEGER DEFAULT 1;
ALTER TABLE "websites" ADD COLUMN "tags" TEXT;

-- 添加SEO相关字段
ALTER TABLE "websites" ADD COLUMN "domain_authority" INTEGER;
ALTER TABLE "websites" ADD COLUMN "last_checked" TIMESTAMP;
ALTER TABLE "websites" ADD COLUMN "response_time" INTEGER;
ALTER TABLE "websites" ADD COLUMN "ssl_enabled" BOOLEAN DEFAULT true;

-- 创建索引以提高查询性能
CREATE INDEX "websites_quality_score_idx" ON "websites"("quality_score");
CREATE INDEX "websites_is_trusted_idx" ON "websites"("is_trusted");
CREATE INDEX "websites_is_featured_idx" ON "websites"("is_featured");

-- 更新现有数据
-- 将已通过审核的活跃网站设置为更高的质量分数
UPDATE "websites" 
SET "quality_score" = 75 
WHERE "status" = 'approved' AND "active" = 1;

-- 将高访问量的网站设置为精选
UPDATE "websites" 
SET "is_featured" = true 
WHERE "visits" > 100 AND "status" = 'approved';

-- 将受欢迎的网站标记为可信
UPDATE "websites" 
SET "is_trusted" = true 
WHERE "likes" > 50 AND "status" = 'approved';
-- Migration: Add Multi-Category Support
-- Description: 添加网站多分类功能，允许一个网站属于多个分类
-- Date: 2025-10-19

-- 1. 创建网站分类中间表
CREATE TABLE IF NOT EXISTS "website_categories" (
  "id" SERIAL PRIMARY KEY,
  "websiteId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "website_categories_websiteId_categoryId_key" UNIQUE ("websiteId", "categoryId")
);

-- 2. 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS "website_categories_websiteId_idx" ON "website_categories"("websiteId");
CREATE INDEX IF NOT EXISTS "website_categories_categoryId_idx" ON "website_categories"("categoryId");
CREATE INDEX IF NOT EXISTS "website_categories_isPrimary_idx" ON "website_categories"("isPrimary");

-- 3. 添加外键约束
ALTER TABLE "website_categories"
  ADD CONSTRAINT "website_categories_websiteId_fkey"
  FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "website_categories"
  ADD CONSTRAINT "website_categories_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. 将现有的单分类数据迁移到新的多分类表
-- 为每个网站的 category_id 创建一个主分类关系
INSERT INTO "website_categories" ("websiteId", "categoryId", "isPrimary", "createdAt")
SELECT
  id,
  category_id,
  true,  -- 标记为主分类
  CURRENT_TIMESTAMP
FROM "websites"
WHERE category_id IS NOT NULL
ON CONFLICT ("websiteId", "categoryId") DO NOTHING;

-- 5. 修改 websites 表，将 category_id 设为可选（暂时保留用于向后兼容）
ALTER TABLE "websites" ALTER COLUMN "category_id" DROP NOT NULL;

-- 迁移完成后，可以选择性地删除 category_id 列
-- 注意：暂时不删除，保留用于回滚和调试
-- ALTER TABLE "websites" DROP COLUMN "category_id";

-- 6. 验证迁移
-- 检查是否所有网站都有至少一个分类
SELECT
  COUNT(*) as total_websites,
  COUNT(DISTINCT wc."websiteId") as websites_with_categories,
  COUNT(*) - COUNT(DISTINCT wc."websiteId") as websites_without_categories
FROM "websites" w
LEFT JOIN "website_categories" wc ON w.id = wc."websiteId";

COMMENT ON TABLE "website_categories" IS '网站分类关联表 - 支持多对多关系';
COMMENT ON COLUMN "website_categories"."isPrimary" IS '是否为主分类 - 用于默认展示';
